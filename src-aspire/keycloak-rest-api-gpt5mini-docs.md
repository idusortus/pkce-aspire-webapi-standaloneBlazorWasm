# Keycloak Admin REST API — Quick Reference

This document summarizes general usage and authentication for the Keycloak Admin REST API (reference: https://www.keycloak.org/docs-api/latest/rest-api/index.html). It provides a short how-to for obtaining access tokens, common endpoint examples, a parameter table, and a Postman request sample.

## Checklist
- [x] Describe general API usage and authentication
- [x] Include a table with endpoints and parameter details
- [x] Add a Postman example request
- [x] Save document as `keycloak-rest-api-docs.md` in project root

## Overview
- Base admin API base path: `{base-url}/admin/realms`
  - Example base: `http://localhost:8080/admin/realms`
- The Admin REST API is protected. Each request must be authenticated with an access token (Bearer).
- OpenAPI definitions (JSON/YAML):
  - `https://www.keycloak.org/docs-api/latest/rest-api/openapi.json`
  - `https://www.keycloak.org/docs-api/latest/rest-api/openapi.yaml`

## Authentication (how to obtain an access token)
Keycloak issues OAuth2 access tokens from the token endpoint. Common approaches:

1) Resource Owner Password / Direct Grant (for testing only):
- POST to: `https://{host}/realms/{realm}/protocol/openid-connect/token`
- Content-Type: `application/x-www-form-urlencoded`
- Body (form): `grant_type=password&client_id={client_id}&username={user}&password={pass}`
- Response contains `access_token` (use in Authorization header).

2) Client Credentials (recommended for server-to-server admin calls):
- Enable `serviceAccountsEnabled` on the client in the realm.
- POST to: `https://{host}/realms/{realm}/protocol/openid-connect/token`
- Body (form): `grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}`

3) Admin user via browser/CLI: use `admin-cli` or the Admin Console to create tokens. Tokens must have appropriate realm-management roles (e.g., `realm-admin`) to call Admin REST endpoints.

Include token in requests:
- HTTP header: `Authorization: Bearer {access_token}`

Example token request (curl) using client credentials:

```bash
curl -X POST "https://keycloak.example.com/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=admin-cli&client_secret=SECRET"
```

The response will include `access_token`, `expires_in`, etc.

## Common endpoints (short table)
Below are a handful of frequently used Admin endpoints with parameters. This is a condensed sample — the API reference contains many more endpoints.

| Purpose | Method | Path | Path Params | Query Params | Body | Common Responses |
|---|---:|---|---|---|---|---:|
| List realms accessible | GET | `/admin/realms` | — | `briefRepresentation` (optional) | — | `200` List[RealmRepresentation] |
| Get realm details | GET | `/admin/realms/{realm}` | `realm` (name) | — | — | `200` RealmRepresentation, `403` |
| List users in realm | GET | `/admin/realms/{realm}/users` | `realm` | `first`, `max`, `search`, `username`, `email`, `enabled` etc. | — | `200` List[UserRepresentation] |
| Create user | POST | `/admin/realms/{realm}/users` | `realm` | — | `UserRepresentation` JSON | `201` Created, `400` Bad Request |
| Get user by id | GET | `/admin/realms/{realm}/users/{user-id}` | `realm`, `user-id` | `userProfileMetadata` (optional) | — | `200` UserRepresentation |
| List clients | GET | `/admin/realms/{realm}/clients` | `realm` | `clientId`, `first`, `max` | — | `200` List[ClientRepresentation] |
| Get client secret | GET | `/admin/realms/{realm}/clients/{client-uuid}/client-secret` | `realm`, `client-uuid` | — | — | `200` CredentialRepresentation |
| Generate client secret | POST | `/admin/realms/{realm}/clients/{client-uuid}/client-secret` | `realm`, `client-uuid` | — | — | `200` CredentialRepresentation |
| Get users count | GET | `/admin/realms/{realm}/users/count` | `realm` | `search`, `email`, `username`, `enabled` etc. | — | `200` Integer |

Notes on parameters:
- Path params are required and typically include `realm` (realm name, not id) and resource ids (user-id, client-uuid).
- Query params vary: commonly `first` (offset), `max` (limit), `briefRepresentation` (boolean), and filters like `username`, `email`, `search`.
- POST/PUT endpoints normally accept representations defined in OpenAPI (UserRepresentation, ClientRepresentation, etc.).

## Example Postman request — List users in a realm
This example shows how to configure a Postman request to GET users. It assumes you already obtained an access token (see Authentication section).

1) Create a new request in Postman:
- Method: GET
- URL: `https://{KEYCLOAK_HOST}/admin/realms/{realm}/users`

2) Authorization tab:
- Type: `Bearer Token`
- Token: paste `{access_token}` (obtained from token endpoint)

3) Params tab (optional):
- `first` = 0
- `max` = 50
- `search` = `alice` (example)

4) Headers (Postman will add Authorization automatically when using the Authorization tab). Optionally add:
- `Accept: application/json`

5) Example response (200):
- Array of user objects (UserRepresentation), each containing `id`, `username`, `email`, `firstName`, `lastName`, `enabled`, etc.

### Postman raw example (useful as a quick import for a single request):

```json
{
  "info": {
    "name": "Keycloak - Get users example",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "List users",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Accept", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{access_token}}" }
        ],
        "url": {
          "raw": "https://{{keycloak_host}}/admin/realms/{{realm}}/users?first=0&max=50",
          "host": ["https://{{keycloak_host}}"],
          "path": ["admin","realms","{{realm}}","users"],
          "query": [
            { "key": "first", "value": "0" },
            { "key": "max", "value": "50" }
          ]
        }
      }
    }
  ]
}
```

To use, replace `{{keycloak_host}}`, `{{realm}}`, and set the `{{access_token}}` variable in Postman (or configure the Authorization tab to use Bearer token).

## Tips and best practices
- Use the OpenAPI spec (JSON/YAML) to generate client code or import into Postman / Swagger UI.
- Prefer client credentials for automation/service accounts; ensure the client has the appropriate realm-management roles.
- Beware of token expiration: refresh tokens or re-fetch tokens as needed.
- For destructive operations (delete user, change secrets), follow the usual safety precautions and use limited-scope service accounts where possible.

## Where to find full reference
- Full API reference: https://www.keycloak.org/docs-api/latest/rest-api/index.html
- OpenAPI (machine readable): https://www.keycloak.org/docs-api/latest/rest-api/openapi.json

---
Generated: 2025-08-15
