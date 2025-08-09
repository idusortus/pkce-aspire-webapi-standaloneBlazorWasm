using System.Security.Cryptography.Xml;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace Api.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddOpenApiExtensions(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.AddProblemDetails();
        // --- SCALAR / OPENAPI CONFIGURATION FOR AUTHENTICATION ---
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer<OidcSecuritySchemeTransformer>();
        });
        return services;
    }
}

// Surfaces Keycloak Auth option in Scalar (OIDC w/PKCE)
internal sealed class OidcSecuritySchemeTransformer(IConfiguration configuration) : Microsoft.AspNetCore.OpenApi.IOpenApiDocumentTransformer
{   
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        // Read the OIDC configuration from appsettings.json
        var oidcConfig = configuration.GetSection("KeycloakConfig");
        var authority = oidcConfig["Authority"];
        var clientId = oidcConfig["ClientId"];
        var realm = oidcConfig["Realm"];
        var scopesConfig = oidcConfig["Scopes"];

        if (string.IsNullOrEmpty(authority) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(scopesConfig))
        {
            return Task.CompletedTask; // No config? Add nothing.
        }

        var scopes = scopesConfig.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                 .ToDictionary(scope => scope, scope => $"Request {scope} scope");
        
        // Define the OAuth2 Security Scheme
        var securityScheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.OAuth2,
            Flows = new OpenApiOAuthFlows
            {
                //PKCE
                AuthorizationCode = new OpenApiOAuthFlow
                {
                    // URL to redirect the user to for login
                    AuthorizationUrl = new Uri($"{authority}/realms/{realm}/protocol/openid-connect/auth"),
                    // URL for the backend to exchange the code for a token
                    TokenUrl = new Uri($"{authority}/realms/{realm}/protocol/openid-connect/token"),                   
                    // Define the scopes the client can request
                    Scopes = scopes
                }
            }
        };

        document.Components ??= new OpenApiComponents();
        
        const string schemeName = "Keycloak";
        document.Components.SecuritySchemes = new Dictionary<string, OpenApiSecurityScheme>
        {
            [schemeName] = securityScheme
        };

        // 2. Apply this scheme to all operations that require authorization
        var securityRequirement = new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    // Reference the scheme we just defined
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = schemeName }
                },
                // List the scopes required for this operation.
                // An empty list means any scope defined in the scheme is valid.
                new List<string>() 
            }
        };

        foreach (var operation in document.Paths.Values.SelectMany(path => path.Operations.Values))
        {
            // Here you could add logic to only apply security to endpoints with an [Authorize] attribute
            // For simplicity, we are applying it to all.
            operation.Security.Add(securityRequirement);
        }

        return Task.CompletedTask;
    }
}