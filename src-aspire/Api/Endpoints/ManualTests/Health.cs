namespace Api.Endpoints.ManualTests;

internal sealed class HealthEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("health", () =>
        {
            return Results.Ok($"{nameof(HealthEndpoint)} is OK.");
        })
        .WithTags(Tags.Test);
    }
}