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
    options.AddPolicy("TheirMonkeysTheirCircus", policy => policy.RequireClaim("CEO", "true"));
    options.AddPolicy("AbleToEndWar", policy => policy.RequireClaim("CanCreateWhirledPeas", "true"));
}); // Endpoint policies

builder.Services.AddCors(options =>
{
    options.AddPolicy("BlazorSpaPolicy", policy =>
    {
        policy
            .WithOrigins("https://localhost:7059")
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
app.UseCors("BlazorSpaPolicy");
app.MapEndpoints(); // Map implementors of IEndpoint
app.MapScalarApiReference(); // Enable Scalar UI @ ../scalar/v1

app.Run();