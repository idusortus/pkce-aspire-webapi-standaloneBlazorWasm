# Keycloak Angular Client

This Angular application integrates with Keycloak for authentication and communicates with a .NET Web API backend.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Angular CLI (`npm install -g @angular/cli`)
- Running Keycloak server
- Running .NET Web API backend

## Keycloak Configuration

1. Create a new client in your Keycloak realm (wiscodev):
   - Client ID: `wiscodev-angular`
   - Root URL: `https://localhost:4200/`
   - Valid Redirect URIs: `https://localhost:4200/*`
   - Web Origins: `https://localhost:4200` (or `+` for all)
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `ON` (for development)
   - Implicit Flow Enabled: `OFF`
   - Service Accounts Enabled: `OFF`
   - Enable PKCE with `S256` (set in Advanced Settings)

2. Create the required roles for testing:
   - `systemadmin` role
   
3. Create a user for testing and assign the roles:
   - User with `systemadmin` role
   - User with `CanCreateWhirledPeas: true` claim (add this as an attribute)
   - Regular user with no special roles or claims

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Update environment configuration if needed:
   - Edit `src/environments/environment.ts` to set your Keycloak and API URLs

## Development Server

Run the application:
```
npm start
```

The application will be available at `https://localhost:4200/`.

## Testing API Endpoints

The application includes a page for testing different API endpoints with various authorization requirements:

1. **Health Endpoint**: No authentication required
2. **Employment Status**: Any authenticated user can access
3. **Extend PTO**: Requires the `systemadmin` role
4. **End War**: Requires the `CanCreateWhirledPeas: true` claim

## Building for Production

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## CORS Configuration

Ensure your .NET API has CORS configured to allow requests from the Angular application:

Note: this repo runs Keycloak on port 8081 (not 8080). Make sure the Keycloak server URL in `src/environments/environment.ts` points to `http://localhost:8081`.

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularSpaPolicy", policy =>
    {
        policy
            .WithOrigins("https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// In the Configure method:
app.UseCors("AngularSpaPolicy");
```
