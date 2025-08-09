
namespace Api.Endpoints.ManualTests;

internal sealed class PolicyTestsEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("politics/global/endwar", () =>
        {
            return Results.Ok("War. Ended.");
        })
        .WithTags(Tags.Test)
        .RequireAuthorization("AbleToEndWar")
        .WithDescription("Are you the hero the world needs? Requires CanVisualizeWhirledPeas=true");

        app.MapGet("corporate/pto/extend/{bonusDays:int}", (int bonusDays) =>
        {
            return Results.Ok($"Employees are grateful for the additional {bonusDays} of PTO!");
        })
        .WithTags(Tags.Test)
        .RequireAuthorization("TheirMonkeysTheirCircus")
        .WithDescription("Only the big cheese can hit this endpoint. Requires CEO=true");

        app.MapGet("hr/employed", () =>
        {
            return Results.Ok("Yep!");
        })
        .RequireAuthorization()
        .WithTags(Tags.Test)
        .WithDescription("Any autheNticated user can access this endpoint.");
    }
}
