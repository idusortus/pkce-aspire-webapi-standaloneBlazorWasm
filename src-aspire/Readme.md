# Aspire API + Keycloak 

## Prepare environment
*Reminder: Launch from Host/AppHost.cs*

- Set up solutions
```bash
mkdir aspire-api-keycloak
mkdir src-aspire
mkdir src-blazorwasm
dotnet add webapi -o src-aspire/Api
dotnet add aspire-apphost -o src-aspire/Host
dotnet add aspire-servicedefaults -o src-aspire/ServiceDefaults
dotnet new blazorwasm -au Individual -o src-blazorwasm/Spa
```

- Packages & References
```bash
## src-aspire
dotnet add Host/ package Aspire.Hosting.Keycloak --version 9.4.0-preview.1.25378.8
dotnet add Api/ package Scalar.AspNetCore
dotnet add Api/ package Aspire.Keycloak.Authentication --version 9.4.0-preview.1.25378.8 
dotnet add Host/ reference Api/
dotnet add Api/ reference ServiceDefaults/

## src-blazorwasm
dotnet add Spa/ package microsoft.extensions.http
```  

#### Add Keycloak to Aspire (Host/AppHost.cs)
```csharp
var keycloak = builder.AddKeycloak("keycloak", 8081) // <-- This is usually 8080
    .WithDataVolume()
    .WithExternalHttpEndpoints();
```

<details><summary>Basic Keycloak Configuration</summary>  

## Configure Keycloak Instance 
- Ensure Docker is running
- Launch Aspire project
- View keycloak details, scroll down to get default Keycloak credentials
  - KC_BOOTSTRAP_ADMIN_USERNAME : admin
  - KC_BOOTSTRAP_ADMIN_PASSWORD : `QtScMU_s6K7UBfv}KT0N*d`
- Login with admin credentials
- Create new realm `wiscodev` 

###  Keycloak API Client (resource server)
- Create Client
  - General Settings
    - client type: OpenID Connect
    - clientID: `wiscodev-api` 
    - *Remaining fields are optional*
  - Capability Config *(Note: if client authentication is off, it is a public client)*
    - Client authentication & authorization: both off
    - Authentication flow: **un**check all boxes
  - Login Settings
    - All blank
- Client Scopes (from left hand side bar, below clients)
  - Create client scopes (noun:verb || resource:action || namespace:resource:action)
    - **Note:** *The generated `-dedicated` scope is more appropriate for service accounts or rudimentary single-client setups.
    - *Reminder:* Ensure 'include in token scope' is **on**
      - `wiscodev:tests:read`
      - `wiscodev:tests:write`
    - For each scope, click on 'Mappers' tab > 'Configure a new mapper' > select 'Audience'
      - Type: Audience
      - Name `Wiscodev API Developers`
      - Included Client Audience: `wiscodev-api`
      - Leave the rest as default
        - Add to ID token: off
        - Add to access token: ON
        - add to lightweight access token: off
        - Add to token introspection: ON


### Keycloak Blazor SPA Client (resource consumer)
- Create Client
  - General Settings
    - client type: OpenID Connect
    - clientID: `wiscodev-spa`
    - *Remaining fields are optional*
  - Compatibility Config
    - Client authentication & authorization: both off
    - *Check* the box for `Standard flow`, all the others are **un**checked
  - Login Settings
    - Valid redirect URIs: `https://localhost:7059/authentication/login-callback`
    - Valid post logout redirect URIs: `https://localhost:7059/authentication/logout-callback`
    - The rest can be left blank, 'Web origins' will be automatically populated later.
    - click `Client scopes` tab
      - Check the boxes for the two scopes defined earlier and click [Add] > Optional

</details>  


#### Configure Keycloak for use in Api/Program.cs
```csharp
builder.Services.AddAuthentication().AddKeycloakJwtBearer("keycloak", realm: "wiscodev", options =>
{
    options.RequireHttpsMetadata = false; // Set to true in PROD
    options.Audience = "wiscodev-api";
}); // KeyCloak (Aspire.Keycloak.Authentication)
```

#### Configure Keycloak for use in Blazor/Program.cs
- You'll have to inspect the browser console for Tokens. 
- AppConfig or WWWRoot/appsettings.Development.json or env client secrets would be better than constants.
```csharp
const string WEBAPI_HTTPS_URL = "https://localhost:7044";
const string KEYCLOAK_EXPOSED_PORT = "http://localhost:8081";

// Define API & Handle Requests
builder.Services.AddHttpClient("WiscodevAPI", client => client.BaseAddress = new Uri(WEBAPI_HTTPS_URL))
    .AddHttpMessageHandler(sp =>
    {
        var handler = sp.GetRequiredService<AuthorizationMessageHandler>()
            .ConfigureHandler(authorizedUrls: [WEBAPI_HTTPS_URL]); 
        return handler;
    });
// configure Keycloak IdP
builder.Services.AddOidcAuthentication(options =>
{
    options.ProviderOptions.Authority = KEYCLOAK_EXPOSED_PORT + "/realms/wiscodev";
    options.ProviderOptions.ClientId = "wiscodev-spa";
    options.ProviderOptions.ResponseType = "code";
});
```

## Set Audience for Client(s) !
- Clients > client details > dedicated scopes > Mapper details > choose wiscodev-api

# Claims Based Authorization (using Keycloak Attributes)



## Example Endpoint Policiy Definitions
```csharp
// Api/Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("admin"));
    options.AddPolicy("AbleToEndWar", policy => policy.RequireClaim("CanCreateWhirledPeas", "true"));
}); // Endpoint policies

// Api/Endpoints/ManualTests/PolicyTests.cs

```


<details>
  <summary><strong>Postman: Authorization Code Flow with PKCE</strong></summary>

  **Notes:**
  - Configure web origins in Keycloak to prevent CORS issues with tools like Scalar. Ex: `https://localhost:7114`

  #### Step 1: Configure Your Keycloak Client for Postman

  First, you need to tell Keycloak about Postman by configuring a client that is allowed to use this flow.

  1.  **Navigate to your Keycloak Realm** and go to **Clients**.
  2.  Create a new client (e.g., `wiscodev-postman`).
  3.  **Ensure Client authentication is OFF**. This configures it as a `public` client, which is correct for a tool like Postman.
  4.  In the client settings, ensure:
      *   **Standard flow:** Must be **ON** / checked.
  5.  **Set the Valid redirect URI:** This is the most critical step. Add the official Postman callback URL:
      *   `https://oauth.pstmn.io/v1/callback`
  6.  **Enable PKCE:** From client details, click **Advanced** tab, scroll down to *Advanced settings* and set **PKCE Code Challenge Method** to **S256**.
  7.  **Save** your client configuration.

  #### Step 2: Configure Authorization in Postman

  Now, configure the authorization settings for your Postman request or collection.

  1.  Go to the **Authorization** tab.
  2.  Select **Type:** **OAuth 2.0**.
  3.  Under **Configure New Token**, fill out the form:
      *   **Grant Type:** **Authorization Code (With PKCE)**.
      *   **Callback URL:** Postman populates this automatically. Check "Authorize using browser". It must match the URL you entered in Keycloak.
      *   **Auth URL:** `https://YOUR_KEYCLOAK_DOMAIN/realms/YOUR_REALM/protocol/openid-connect/auth`
      *   **Access Token URL:** `https://YOUR_KEYCLOAK_DOMAIN/realms/YOUR_REALM/protocol/openid-connect/token`
      *   **Client ID:** The Client ID you set in Keycloak (e.g., `wiscodev-postman`).
      *   **Client Secret:** **Leave this blank.**
      *   **Code Challenge Method:** **SHA-256**.
      *   **Scope:** `openid profile email`
      *   **State:** Leave blank (Postman will generate one).

  #### Step 3: Get the Token

  1.  Click the **Get New Access Token** button.
  2.  A browser window will open to your Keycloak login page. Log in with a user's credentials.
  3.  After login, Keycloak redirects back to Postman, which automatically completes the flow.
  4.  A new window will show the `Access Token`. Click **Use Token**.

  Postman will now automatically add the JWT to the `Authorization` header of your requests as a Bearer token.

```bash
# Get a realm's users:
{{keycloakHostUrl}}/admin/realms/{{realm}}/users
```

</details>

<details><summary><strong>Complete Keycloak 26.2 Configuration Guide for a .NET API and Blazor SPA</strong></summary>


## Complete Keycloak 26.2 Configuration Guide for a .NET API and Blazor SPA

This guide walks through the entire process of setting up a new Keycloak realm to provide authentication and authorization for a distributed system consisting of:
*   A **.NET 9 Web API** (the Resource Server).
*   A **standalone Blazor WebAssembly App** (the SPA Client).

We will use a placeholder name of **"wiscodev"** for the project.

### Section 1: Create the New Realm

This is the top-level container for all your users, clients, and roles.

1.  Log in to your Keycloak Admin Console.
2.  Hover over the realm name in the top-left corner (initially "master") and click **Create Realm**.
3.  **Realm name:** `wiscodev`.
4.  Click **Create**. You will be automatically switched into the new `wiscodev` realm.

### Section 2: Create Hierarchical Realm Roles

These are the business-level roles. We will create them with inheritance (composition) so that higher roles automatically get the permissions of lower ones.

1.  From the left menu, select **Realm Roles**.
2.  Click **Create role**.
    *   **Role name:** `guest`. Click **Save**.
3.  Click **Create role** again.
    *   **Role name:** `user`. Click **Save**.
4.  Click on the newly created `user` role.
    *   Go to the **Associated roles** tab.
    *   In the "Filter by realm roles" box, find and select `guest`.
    *   Click **Add selected**. The `user` role now inherits from `guest`.
5.  Repeat this process for `admin` (inheriting from `user`) and `systemadmin` (inheriting from `admin`).

**Result:** You have a role hierarchy: `guest` -> `user` -> `admin` -> `systemadmin`.

### Section 3: Create Nested Groups and Map Roles

Groups are used to manage users. The group hierarchy will mirror the role hierarchy to enable attribute inheritance.

1.  From the left menu, select **Groups**.
2.  Click **Create group**.
    *   **Name:** `guests`. Click **Create**.
3.  Click on the new `guests` group, go to the **Role Mappings** tab, and assign the `guest` realm role.
4.  Go back to the main **Groups** page. **Select the `guests` group** from the list.
5.  With `guests` selected, click **Create group** to create a child group.
    *   **Name:** `users`. Click **Create**.
6.  Click on the new `users` child group, go to **Role Mappings**, and assign the `user` realm role.
7.  Repeat this process, always selecting the parent group first before creating the child:
    *   Create `admins` as a child of `users` and map the `admin` role to it.
    *   Create `systemadmins` as a child of `admins` and map the `systemadmin` role to it.

**Result:** You have a group hierarchy that mirrors your role hierarchy.

### Section 4: Assign Granular Permissions as Group Attributes

This is the source of truth for your fine-grained claims.

1.  Navigate to **Groups**.
2.  Select the **`guests`** group, go to the **Attributes** tab, and add:
    *   **Key:** `CanReadQuote`
    *   **Value:** `true`
    *   Click **Save**.
3.  Select the **`users`** group, go to the **Attributes** tab, and add:
    *   **Key:** `CanCreateQuote`
    *   **Value:** `true`
    *   Click **Save**.
4.  Select the **`admins`** group, go to the **Attributes** tab, and add:
    *   **Key:** `CanDeleteQuote`
    *   **Value:** `true`
    *   Click **Save**.

**Result:** A user placed in the `admins` group will now inherit all three attributes from its parent chain.

### Section 5: Configure the Clients

You need two separate clients: one to represent the API and one for the Blazor app.

#### A. The Web API Client (`wiscodev-api`)

This client exists almost exclusively to be an **audience**. It is a passive resource server.

1.  Navigate to **Clients** and click **Create client**.
2.  **Client ID:** `wiscodev-api`. Click **Next**.
3.  On the "Capability config" screen, **leave all toggles OFF**.
    *   `Client authentication`: **OFF**.
    *   All authorization flows should be disabled.
4.  Click **Save**. That's it. This client is done.

#### B. The Blazor SPA Client (`wiscodev-spa`)

This is the active public client that will initiate logins.

1.  Navigate to **Clients** and click **Create client**.
2.  **Client ID:** `wiscodev-spa`. Click **Next**.
3.  **Capability config:**
    *   `Client authentication`: **OFF** (This makes it a public client).
    *   `Standard flow`: **ON** (This enables the OIDC Authorization Code Flow).
    *   Leave all other flows disabled.
4.  Click **Next**.
5.  **Login settings:**
    *   **Valid redirect URIs:** `http://localhost:5000/authentication/login-callback` (Replace port if necessary). Add any other production URLs later.
    *   **Web origins:** `http://localhost:5000`. This is crucial for preventing CORS errors.
6.  Click **Save**.
7.  After saving, go to the **Advanced** tab of the `wiscodev-spa` client.
8.  Set **PKCE Code Challenge Method** to `S256`.
9.  Click **Save**.

### Section 6: Configure Mappers (The Bridge)

This is the final and most important step, where you configure what goes inside the JWT.

#### A. Flatten Realm Roles for .NET Compatibility

1.  From the main menu, go to **Client Scopes**.
2.  Click on the built-in scope named **`roles`**.
3.  Go to the **Mappers** tab.
4.  Click on the mapper named `realm roles`.
5.  Change the **Token Claim Name** from `realm_access.roles` to simply **`roles`**.
6.  Turn **Add to ID token** to **ON**. (The Blazor app needs this to see roles).
7.  Ensure **Add to access token** is also **ON**.
8.  Click **Save**.

#### B. Configure Mappers for the SPA Client

These mappers will be added to the SPA's dedicated scope to ensure they only apply when logging in through this client.

1.  Navigate to **Clients** -> **`wiscodev-spa`** -> **Client Scopes** tab.
2.  Click on the scope named **`wiscodev-spa-dedicated`**.
3.  Click the **Add Mapper** button.

**Mapper 1: Add API Audience (`aud`)**
1.  Click **Add mapper** -> **By configuration** -> **Audience**.
2.  **Name:** `api-audience`.
3.  **Included Client Audience:** Select `wiscodev-api` from the dropdown.
4.  **Add to access token:** **ON**.
5.  Click **Save**.

**Mapper 2: Map Group Attributes to Claims**
You must create one mapper for each permission attribute.

1.  Click **Add mapper** -> **By configuration** -> **User Attribute**.
2.  Configure for `CanReadQuote`:
    *   **Name:** `CanReadQuote`
    *   **User Attribute:** `CanReadQuote`
    *   **Token Claim Name:** `CanReadQuote`
    *   **Claim JSON Type:** `boolean`
    *   **Add to access token:** **ON**
3.  Click **Save**.
4.  **Repeat this process**, creating two more `User Attribute` mappers for `CanCreateQuote` and `CanDeleteQuote`.

---

### Verification

Your Keycloak realm is now fully configured. To verify, create a test user and add them to the `admins` group. Use the Postman or Scalar flow for the `wiscodev-spa` client to get an access token. Decode the JWT using a tool like [jwt.io](https://jwt.io).

The decoded payload should contain:

```json
{
  ...
  "aud": [
    "wiscodev-api",
    "account"
  ],
  "roles": [
    "guest",
    "user",
    "admin"
  ],
  "CanReadQuote": true,
  "CanCreateQuote": true,
  "CanDeleteQuote": true,
  ...
}
```

This token is now perfectly formed for consumption by both your Blazor SPA (which will use the `roles` claim) and your .NET API (which will use the `aud` and granular `Can...` claims).

</details>




---
<details>
  <summary>Configure Keycloak v26.2 Attributes (~Custom Claims)</summary>

  ### 1. Define the Attribute in the User Profile Schema
  This makes the attribute available across the realm.

  1.  Go to **Realm Settings** -> **User profile** tab.
  2.  Click **Create attribute**.
  3.  Fill out the form:
      *   **Attribute[Name]:** `CanCreateWhirledPeas` (Machine-readable name for your API/mappers).
      *   **Display name:** `Can create whirled peas` (Friendly label for the UI).
      *   **Enabled when:** `Always`.
      *   **Required:** `off`.
      *   **Permissions -> Who can view?:** `Admin only`.
      *   **Permissions -> Who can edit?:** `Admin only`.
  4.  Click **Save**. Repeat for other custom claims.

  ### 2. Map User Attribute to the Token
  This ensures the attribute is included in the JWT when a user logs in.

  > **TLDR;** @ Keycloak > Realm > Clients >  Client Scopes > *profile* > Mappers > Add Mapper > User Attribute


  1.  Click the **Client Scopes** tab.
  2.  Click the **`profile`** scope in the list. (will be hyperlinked, if not you're in the wrong view)
  3.  On the `profile` scope's page, click its **Mappers** tab.
  4.  Click **Add mapper** {by configuration / configure a new mapper... depends on prior config}.
  > Steps won't be a 100% match if you have a `-dedicated` client, they're similar though :exclamation: TODO: *clean-up docs*
  5.  Select **By configuration** -> **User Attribute** : *Map a custom user attribute to a token claim*.
  6.  Fill out the form:
      *   **Name:** `CanCreateWhirledPeas` (A descriptive name for this mapper).
      *   **User Attribute:** `CanCreateWhirledPeas` (dropdown to the key from the user profile schema).
      *   **Token Claim Name:** `CanCreateWhirledPeas` (The name of the claim in the JWT).
      *   **Claim JSON Type:** `boolean`
      *   **Add to access token, add to ID token, add to userinfo, add to token introspection:** **ON**
        - The rest are off
  7.  Click **Save**.

  ### 3. Edit the Attribute for a Specific User
  Now you can grant the permission to a user.

  1.  Go to **Users** and select the user to edit.
  2.  On the user's **Details** tab, you will see a new field with the display name you created (e.g., "Can Delete Quote").
  3.  Enter the value (e.g., `true`) and click **Save**.

</details>  

<details><summary>Proper Keycloak Realm Roles to .Net ROLES Mapping</summary>

Correct Keycloak UI Path for Realm Roles → Top-Level role Claim
1. You want your realm roles to appear as a top-level claim (role) in the JWT.
2. Realm roles are defined at the realm level (not client roles).
(Can also map roles to clients, but that's not the focus here.)

You add mappers to a Client Scope (usually the -dedicated scope for your client).
You do NOT add mappers to the client itself, but to the client’s assigned scope.
Step-by-Step: Add Mapper for Realm Roles in wiscodev-api
Clients → Select wiscodev-api

Client Scopes tab → Find or select wiscodev-api-dedicated

Click on wiscodev-api-dedicated to edit it.
Mappers tab (within the client scope) → Add Mapper

Click Add Mapper.
You will see:
From predefined mappers
By configuration
Best Practice: Use “By configuration”

“Predefined mappers” is for built-in defaults, but for custom flattening of realm roles, choose By configuration.
Mapper Settings
Mapper Type: User Realm Role
Name: role (or roles)
Token Claim Name: role
Claim JSON Type: String
Add to ID token: ON (for SPA clients)
Add to Access token: ON (for API clients)
Multivalued: ON
Repeat for wiscodev-spa
Do the same for the wiscodev-spa-dedicated client scope.
This ensures your SPA and API tokens both have top-level role claims.
Summary Table
Step	Action
Clients → Select client	wiscodev-api
Client Scopes → Select client scope (dedicated)	wiscodev-api-dedicated
Client Scope → Mappers tab → Add Mapper	By configuration
Mapper Type	User Realm Role
Token Claim Name	role
Multivalued	ON
Add to Access/ID token	ON
Result
Your JWT will now include:
JSON
"role": [
  "SystemAdmin",
  "Admin",
  ...
]
.NET 9 will recognize these as role claims, enabling [Authorize(Roles="SystemAdmin")] and .RequireRole("SystemAdmin").
References

Use the Client Scope → Mappers → Add Mapper (By configuration) path.
Select User Realm Role as the type.
Repeat for SPA and API client scopes.
</details>  