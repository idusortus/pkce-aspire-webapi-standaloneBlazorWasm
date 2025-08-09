using System.Reflection;
using Api.Endpoints;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Api.Extensions;

/// <summary>
/// Provides extension methods for discovering and mapping endpoints automatically.
/// This helps in keeping the main Program.cs file clean and organized by decoupling endpoint registration.
/// </summary>
public static class EndpointExtensions
{
    /// <summary>
    /// Scans the specified assembly for types that implement the <see cref="IEndpoint"/> interface
    /// and registers them in the dependency injection container.
    /// </summary>
    /// <param name="services">The <see cref="IServiceCollection"/> to add services to.</param>
    /// <param name="assembly">The assembly to scan for endpoint implementations.</param>
    /// <returns>The <see cref="IServiceCollection"/> so that additional calls can be chained.</returns>
    public static IServiceCollection AddEndpoints(this IServiceCollection services, Assembly assembly)
    {
        // Use reflection to find all endpoint types in the given assembly.
        ServiceDescriptor[] serviceDescriptors = assembly
            .DefinedTypes
            // Filter to find only types that are concrete classes (not abstract or interfaces).
            .Where(type => type is { IsAbstract: false, IsInterface: false } &&
                           // And that implement the IEndpoint interface. This is our marker for an endpoint handler.
                           type.IsAssignableTo(typeof(IEndpoint)))
            // For each found type, create a new transient service descriptor.
            // This means every time an IEndpoint is requested, a new instance of the concrete type is created.
            .Select(type => ServiceDescriptor.Transient(typeof(IEndpoint), type))
            .ToArray();

        // Use TryAddEnumerable to register all the found endpoint services.
        // This allows resolving `IEnumerable<IEndpoint>` to get a collection of all registered endpoints.
        // 'Try' ensures that we don't add duplicates if they were somehow registered before.
        services.TryAddEnumerable(serviceDescriptors);

        return services;
    }

    /// <summary>
    /// Retrieves all registered <see cref="IEndpoint"/> services from the DI container and
    /// calls their <see cref="IEndpoint.MapEndpoint"/> method to map them to the application's routes.
    /// </summary>
    /// <param name="app">The <see cref="WebApplication"/> instance.</param>
    /// <param name="routeGroupBuilder">An optional <see cref="RouteGroupBuilder"/> to map the endpoints under a common route prefix.</param>
    /// <returns>The <see cref="IApplicationBuilder"/> so that middleware calls can be chained.</returns>
    public static IApplicationBuilder MapEndpoints(
        this WebApplication app,
        RouteGroupBuilder? routeGroupBuilder = null)
    {
        // Resolve all services that were registered as IEndpoint implementations from the DI container.
        IEnumerable<IEndpoint> endpoints = app.Services.GetRequiredService<IEnumerable<IEndpoint>>();

        // Determine the routing target. If a route group is provided, use it; otherwise, use the main application builder.
        // This allows flexibility in defining endpoint prefixes (e.g., for versioning like "/api/v1").
        IEndpointRouteBuilder builder = routeGroupBuilder is null ? app : routeGroupBuilder;

        // Iterate through each discovered endpoint handler.
        foreach (IEndpoint endpoint in endpoints)
        {
            // Delegate the actual route mapping (e.g., app.MapGet, app.MapPost) to the endpoint instance itself.
            // This adheres to the Single Responsibility Principle, where each endpoint defines its own route.
            endpoint.MapEndpoint(builder);
        }

        return app;
    }
    
    /// <summary>
    /// A semantic helper method to apply a permission-based authorization policy to an endpoint.
    /// </summary>
    /// <param name="builder">The <see cref="RouteHandlerBuilder"/> to configure.</param>
    /// <param name="permission">The name of the permission/policy to require for this endpoint.</param>
    /// <returns>The <see cref="RouteHandlerBuilder"/> so that additional calls can be chained.</returns>
    public static RouteHandlerBuilder HasPermission(this RouteHandlerBuilder builder, string permission)
    {
        // This is a convenience wrapper around the built-in `RequireAuthorization` method.
        // It provides more domain-specific language for a permission-based authorization scheme,
        // making the endpoint definition more readable (e.g., .HasPermission("quotes:read")).
        return builder.RequireAuthorization(permission);
    }
}