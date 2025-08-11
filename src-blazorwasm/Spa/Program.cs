using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Spa;
using Microsoft.Extensions.Http;
using Microsoft.AspNetCore.Components.WebAssembly.Authentication;
using Spa.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

const string WEBAPI_HTTPS_URL = "https://localhost:7044";
const string KEYCLOAK_EXPOSED_PORT = "http://localhost:8081";

// Define API & Handle Requests via typed client
builder.Services.AddHttpClient<IWiscodevApiClient, WiscodevApiClient>(client => client.BaseAddress = new Uri(WEBAPI_HTTPS_URL))
    .AddHttpMessageHandler(sp =>
    {
        var handler = sp.GetRequiredService<AuthorizationMessageHandler>()
            .ConfigureHandler(authorizedUrls: [WEBAPI_HTTPS_URL]);
        return handler;
    });
// configure Keycloak IdP
builder.Services.AddOidcAuthentication(options =>
{
    options.ProviderOptions.Authority = KEYCLOAK_EXPOSED_PORT + "/realms/wiscodev";
    options.ProviderOptions.ClientId = "wiscodev-spa";
    options.ProviderOptions.ResponseType = "code";
    options.ProviderOptions.DefaultScopes.Add("wiscodev:tests:read");//
    options.ProviderOptions.DefaultScopes.Add("wiscodev:tests:write");//
});

await builder.Build().RunAsync();
