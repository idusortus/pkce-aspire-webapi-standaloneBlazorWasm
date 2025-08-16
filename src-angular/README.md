# Keycloak Angular Client

This Angular application integrates with Keycloak for authentication and communicates with a .NET Web API backend.

## Prerequisites
## Keycloak Angular Client (updated)

This Angular SPA integrates with Keycloak for authentication and communicates with the local .NET Aspire API.

This README was updated to document recent work: CORS and proxy configuration, an HTTP interceptor that forwards the Keycloak token (Authorization: Bearer ...), a token-debugging helper, and confirmation the app builds successfully.

## Quick checklist (what was done)
- Proxy configured (`proxy.conf.json`) to forward SPA requests to the API during development
- API CORS validated to allow `https://localhost:4200` (see `Api/Program.cs`)
- Auth interceptor added to attach `Authorization: Bearer <token>` and send credentials
- `TokenDebugService` added for inspecting token payload and roles in the browser console
- Deprecated `util._extend` usage was removed/replaced (use `Object.assign`)
- Verified: `npm run build` completed successfully on 2025-08-16

## Prerequisites

- Node.js (recommended v14+)
- npm
- Keycloak server with realm `wiscodev` running and reachable
- .NET Aspire API running locally at `https://localhost:7044`

## Keycloak notes

- Realm: `wiscodev`
- SPA client: `wiscodev-angular`
   - Root URL / Redirect URIs: `https://localhost:4200/` and `https://localhost:4200/*`
   - Access Type: `public` (PKCE enabled for SPA)
- API (resource) is expected to use audience `wiscodev-api` (the backend is configured to expect this audience)

Create roles and test users as needed (for example `SystemAdmin`) and assign them to your test users in Keycloak.

## Development server (how to run)

1. Install dependencies:

```bash
npm install
```

2. Start the dev server (the project uses the Angular CLI proxy to avoid CORS in development):

```bash
npm start
```

Notes:
- The Angular dev server uses `proxy.conf.json` to forward requests matching `/hr`, `/health`, `/corporate`, and `/politics` to `https://localhost:7044`.
- If port 4200 is already in use, choose a different port or stop the process occupying it.

## proxy.conf.json

During development requests are proxied to the API. Example entries in `proxy.conf.json` (already present in this project):

```json
{
   "/hr": { "target": "https://localhost:7044", "secure": false, "changeOrigin": true, "withCredentials": true, "headers": { "Origin": "https://localhost:4200" } },
   "/health": { "target": "https://localhost:7044", "secure": false, "changeOrigin": true },
   "/corporate": { "target": "https://localhost:7044", "secure": false, "changeOrigin": true, "withCredentials": true, "headers": { "Origin": "https://localhost:4200" } },
   "/politics": { "target": "https://localhost:7044", "secure": false, "changeOrigin": true, "withCredentials": true, "headers": { "Origin": "https://localhost:4200" } }
}
```

This ensures the browser sees responses as if they came from the SPA origin and helps avoid CORS preflight failures while developing locally.

## API / Server configuration (what to verify)

- The Aspire API expects Keycloak JWTs and is configured in `Api/Program.cs` with:

   - Realm: `wiscodev`
   - Audience: `wiscodev-api`
   - CORS policy with origins including `https://localhost:4200` and `https://localhost:7059` (the app applies `app.UseCors("AllowSpaOrigins")` before authentication)

- Endpoints provided by the sample API used for testing:
   - `GET /health` — public
   - `GET /hr/employed` — requires a valid authenticated user
   - `GET /corporate/pto/extend/{bonusDays}` — requires `SystemAdmin` role
   - `GET /politics/global/endwar` — requires specific claim evaluated by the API (example: `CanCreateWhirledPeas`)

Ensure the API is running at `https://localhost:7044` when using the SPA in development.

## What the SPA does re: authentication

- The `AuthClassInterceptor` attaches `Authorization: Bearer <token>` to outgoing requests (except excluded public endpoints like `/health`). It also sets `withCredentials: true` for requests forwarded through the proxy where needed.
- `ApiService` uses relative URLs (e.g. `/hr/employed`) so that the dev proxy can forward requests to the API.
- `TokenDebugService` prints safe token metadata to the console (issuer, sub, exp, realm roles, resource access roles) to help debug role/claim issues.

## Troubleshooting & common responses

- 401 Unauthorized: your token was missing or invalid. Confirm Keycloak login and check console token logs (TokenDebugService).
- 403 Forbidden: authenticated but missing required role/claim. Check token payload for roles in `realm_access` or `resource_access`.
- Status 0 / Network error: likely CORS/network problem or API not reachable. Verify the API is running at `https://localhost:7044` and the dev proxy is active.

## Build (production)

```bash
npm run build
```

Build verification: a successful build was completed locally on 2025-08-16.

## Files of interest

- `src/app/auth/auth.service.ts` — role normalization and helpers
- `src/app/interceptors/auth-class.interceptor.ts` — attaches the bearer token and optional debug logging
- `src/app/services/token-debug.service.ts` — token payload inspection helper
- `src/app/services/api.service.ts` — uses relative API URLs and authenticated headers
- `proxy.conf.json` — dev proxy configuration

## Next steps (suggested)

- Run the API locally and test the SPA flows end-to-end using the built-in API test page (the app contains an API test component that exercises all endpoints).
- Add a small set of unit tests for `AuthService.hasRole()` to lock in role parsing behavior.
- If you plan to deploy the SPA and API to different hosts, update server-side CORS and Keycloak client origin settings accordingly.

If you'd like, I can open a PR with these README updates and small unit tests.
