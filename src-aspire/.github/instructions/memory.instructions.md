---
applyTo: '**'
---

# Project Pause Summary (Aug 2025)

- Project: .NET Aspire API with Keycloak authentication
- Structure: Modular (Api, Host, ServiceDefaults), but not full Clean/Vertical Slice Architecture
- Design Patterns: Dependency Injection, Extension Methods, Configuration Pattern, Interface Abstraction, Modularization, Middleware Pipeline
- Architecture: Not professional Clean or Vertical Slice; modular but organized by technical concern
- Refactoring Suggestions:
  - Organize endpoints/features by domain/vertical slice
  - Centralize and strongly-type configuration
  - Group service registration logic
  - Isolate authentication/authorization logic
  - Use interfaces consistently
  - Move manual tests to automated test project
  - Group extension methods by target/feature
  - Consider further modularization for Clean Architecture
- No major tasks in progress; last action was architectural/code review and refactoring advice

Resume here for next steps or further refactoring!

## Recent work & learnings (Aug 2025)

- Authentication and API wiring
  - The API is configured with Keycloak JWT validation using realm `wiscodev` and audience `wiscodev-api`.
  - Authentication is registered via an AddKeycloakJwtBearer extension in `Api/Program.cs`.
  - Authorization policies present: `SystemAdminOnly`, `TheirMonkeysTheirCircus` (maps to `SystemAdmin`), and `AbleToEndWar` (requires claim `CanCreateWhirledPeas` = `true`).

- CORS and development proxy
  - API CORS policy `AllowSpaOrigins` explicitly allows `https://localhost:7059` and `https://localhost:4200` and is applied before authentication so browsers receive Access-Control-* headers correctly.
  - The Angular dev server uses `proxy.conf.json` to forward SPA calls to `https://localhost:7044` for paths `/hr`, `/health`, `/corporate`, and `/politics`.
  - The proxy includes `withCredentials: true` and sets an `Origin: https://localhost:4200` header where appropriate to mirror the SPA origin and avoid CORS preflights while developing locally.

- Endpoints used for manual testing
  - `GET /health` — public
  - `GET /hr/employed` — requires authentication
  - `GET /corporate/pto/extend/{bonusDays}` — requires `SystemAdmin` role
  - `GET /politics/global/endwar` — requires `AbleToEndWar` policy (claim `CanCreateWhirledPeas=true`)

- Angular client changes (what was implemented)
  - `ApiService` now uses relative URLs (e.g. `/hr/employed`) so the dev proxy handles routing to the API.
  - `AuthClassInterceptor` added: attaches `Authorization: Bearer <token>` header to outgoing requests (exempts public endpoints like `/health`), sets `withCredentials: true` where appropriate, and logs masked token info for debugging.
  - `AuthService` improved role extraction: normalizes roles (lowercase/trim), reads roles from `realm_access`, `resource_access`, and other token shapes; adds `hasRole()` and `isSystemAdmin()` helpers.
  - `TokenDebugService` added to safely inspect JWT payload in the browser console (issuer, sub, exp, realm roles, resource access roles) to help diagnose auth/role issues.
  - Deprecated `util._extend` usage was removed and replaced with standard JS (`Object.assign`) where applicable.

- Diagnostics & verification
  - `ng build` completed successfully locally (build verified 2025-08-16). This confirms no compile-time regressions from the changes.
  - Token inspection revealed roles may appear under `realm_access.roles` or `resource_access[client].roles`; client-side role checks normalize and search both locations.

## Small operational notes

- When testing locally, ensure both the API (`https://localhost:7044`) and Keycloak are running and reachable from the SPA environment.
- If the browser reports status 0 / network error: verify the dev proxy is active and the API is accepting TLS connections; check console for CORS errors.

## Next suggested steps

- Add unit tests for `AuthService.hasRole()` and role normalization (happy-path + missing/alternate token shapes).
- Add a small end-to-end test that exercises login → token acquisition → request to `/hr/employed` and asserts a 200 response when authenticated.
- Consider centralizing Keycloak config into a strongly-typed options object and documenting the expected token shape (realm_access, resource_access) in developer docs.

## Memory/Resume point

Pick up here to continue: implement unit tests for role parsing and an e2e smoke test for auth flows; optionally produce a PR with these small follow-ups.

