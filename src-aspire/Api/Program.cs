using System.Reflection;
using Api.Extensions;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults(); //Aspire
builder.Services.AddOpenApiExtensions(); // Surface auth option @ Scalar UI
builder.Services.AddEndpoints(Assembly.GetExecutingAssembly());// Add implementors of IEndpoint
builder.Services.AddAuthentication().AddKeycloakJwtBearer("keycloak", realm: "wiscodev", options =>
{
    options.RequireHttpsMetadata = false;
    options.Audience = "wiscodev-api";
}); // KeyCloak (Aspire.Keycloak.Authentication)

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemAdminOnly", policy => policy.RequireRole("SystemAdmin"));
    options.AddPolicy("TheirMonkeysTheirCircus", policy => policy.RequireRole("SystemAdmin"));
    options.AddPolicy("AbleToEndWar", policy => policy.RequireClaim("CanCreateWhirledPeas", "true"));
}); // Endpoint policies

builder.Services.AddCors(options =>
{
    // Single CORS policy for SPAs (explicit origins only). Keep this strict
    // and list each allowed origin explicitly since these are external apps.
    options.AddPolicy("AllowSpaOrigins", policy =>
    {
        policy
            .WithOrigins("https://localhost:7059", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
// Apply CORS before authentication/authorization and endpoint mapping so the
// browser receives the appropriate Access-Control-Allow-* headers for SPA requests.
app.UseCors("AllowSpaOrigins");
app.MapEndpoints(); // Map implementors of IEndpoint
app.MapScalarApiReference(); // Enable Scalar UI @ ../scalar/v1

app.Run();