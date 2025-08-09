var builder = DistributedApplication.CreateBuilder(args);

var keycloak = builder.AddKeycloak("keycloak", 8081)
    .WithDataVolume()
    .WithExternalHttpEndpoints();

builder.AddProject<Projects.Api>("wiscodev-api")
    .WithReference(keycloak)
    .WaitFor(keycloak);

builder.Build().Run();