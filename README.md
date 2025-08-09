⚠️ Work in Progress as of 08/08/25
> Demonstrates basic OIdC / OAuth2 + PKCE flow
- single project webapi with VSA tendancies as server
- blazor wasm as external client

# Aspire (webapi + keycloak) solution
- dotnet new webapi
- dotnet new aspire-apphost
- dotnet new aspire-servicedefaults

# Blazor solution
- dotnet new blazorwasm -au Individual

[Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html)
---
TODO:
- [x] Scalar UI + Imbedded Scalar Auth to IdP
- [x] Postman PKCE Config Documentation 
- [x] Example Claim-Based Policies
- [ ] Process Documentation (WiP)
- [ ] Example Role-Based Policies
- [ ] Surface Manual Test APIs @ Blazor
- [ ] xUnit
- [ ] Tidy Docs
- [ ] Tidy Code
- [ ] KeycloakAdminService

NEXT: 
- [ ] Mobile App
- [ ] Clean & VSA Refactoring
- [ ] Basic Plumbing (EFCore, MediatR, Validation, Logging, Error handling, etc.)  
