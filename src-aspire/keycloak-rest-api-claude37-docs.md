# Keycloak Admin REST API Documentation

This document provides a comprehensive overview of the Keycloak Admin REST API, including authentication methods, common endpoints, parameter details, and practical examples for integration.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
   - [Client Credentials Flow](#1-client-credentials-flow-recommended-for-server-to-server)
   - [Password Credentials Flow](#2-resource-owner-password-credentials-for-testing-only)
   - [Authorization Code with PKCE Flow](#3-authorization-code-with-pkce-flow-for-browser-based-applications)
   - [Admin Console/CLI](#4-using-admin-consolecli)
3. [Common Endpoints](#common-endpoints)
4. [Parameter Reference](#parameter-reference)
5. [Postman Example](#postman-example)
   - [PKCE Flow Example](#step-6-authorization-code-with-pkce-flow-example)
6. [Usage Best Practices](#usage-best-practices)
7. [Common Error Codes](#common-error-codes)
8. [References](#references)

## Overview

The Keycloak Admin REST API provides programmatic access to manage Keycloak's authentication and authorization services. Through this API, you can automate user management, client configuration, role assignments, and various other administrative tasks.

**Base URL Format**: `{keycloak-server-url}/admin/realms`

For example: `http://localhost:8080/admin/realms`

**API Version**: 1.0

**OpenAPI Definitions**:
- JSON: `https://www.keycloak.org/docs-api/latest/rest-api/openapi.json`
- YAML: `https://www.keycloak.org/docs-api/latest/rest-api/openapi.yaml`

## Authentication

All Admin REST API requests must be authenticated. Keycloak uses OAuth 2.0 for authentication, and you need to obtain an access token before making any API calls.

### Obtaining Access Tokens

There are four main approaches to obtaining access tokens:

#### 1. Client Credentials Flow (Recommended for Server-to-Server)

```
POST {keycloak-url}/realms/{realm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={client-id}
&client_secret={client-secret}
```

Requirements:
- Client must have Service Accounts enabled
- Client must have appropriate realm-management roles

#### 2. Resource Owner Password Credentials (For Testing Only)

```
POST {keycloak-url}/realms/{realm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id={client-id}
&username={admin-username}
&password={admin-password}
```

Requirements:
- Direct Access Grants enabled on the client
- Admin user credentials

#### 3. Authorization Code with PKCE Flow (For Browser-Based Applications)

This flow is recommended for browser-based applications and mobile apps where client secrets cannot be securely stored.

**Step 1: Generate a Code Verifier and Challenge**

```javascript
// Generate a random code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Create a code challenge from the verifier
function generateCodeChallenge(codeVerifier) {
  return base64URLEncode(
    sha256(codeVerifier)
  );
}

// Base64URL encoding function
function base64URLEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
```

**Step 2: Authorization Request**

```
GET {keycloak-url}/realms/{realm}/protocol/openid-connect/auth
?response_type=code
&client_id={client-id}
&redirect_uri={redirect-uri}
&scope=openid profile email
&state={random-state-string}
&code_challenge={code-challenge}
&code_challenge_method=S256
```

**Step 3: Exchange Code for Tokens**

After the user authenticates, Keycloak redirects to your redirect_uri with a code. Exchange this code for tokens:

```
POST {keycloak-url}/realms/{realm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id={client-id}
&code={authorization-code}
&redirect_uri={redirect-uri}
&code_verifier={code-verifier}
```

Requirements:
- Standard Flow enabled on the client
- Valid redirect URIs configured
- PKCE enabled in client attributes

#### 4. Using Admin Console/CLI

The Keycloak Admin Console can generate tokens for testing.

### Using Access Tokens

Include the access token in all API requests:

```
GET {keycloak-url}/admin/realms/{realm}/users
Authorization: Bearer {access-token}
```

### Example Token Request (cURL)

```bash
curl -X POST "https://keycloak.example.com/realms/master/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials&client_id=admin-cli&client_secret=your-client-secret"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "not-before-policy": 0,
  "session_state": "a856fb91-eabc-4168-bae9-0d63c628541d",
  "scope": "email profile"
}
```

## Common Endpoints

Below are some of the most frequently used endpoints in the Keycloak Admin API.

### Realm Management

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List realms | GET | `/admin/realms` | Retrieve all realms accessible to the authenticated user |
| Get realm details | GET | `/admin/realms/{realm}` | Get detailed configuration for a specific realm |
| Create realm | POST | `/admin/realms` | Create a new realm |
| Update realm | PUT | `/admin/realms/{realm}` | Update an existing realm's configuration |
| Delete realm | DELETE | `/admin/realms/{realm}` | Delete a realm |

### User Management

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List users | GET | `/admin/realms/{realm}/users` | Get users with optional filtering |
| Count users | GET | `/admin/realms/{realm}/users/count` | Count users matching criteria |
| Get user | GET | `/admin/realms/{realm}/users/{user-id}` | Get a specific user's details |
| Create user | POST | `/admin/realms/{realm}/users` | Create a new user |
| Update user | PUT | `/admin/realms/{realm}/users/{user-id}` | Update user details |
| Delete user | DELETE | `/admin/realms/{realm}/users/{user-id}` | Delete a user |
| Reset password | PUT | `/admin/realms/{realm}/users/{user-id}/reset-password` | Reset a user's password |
| Send verification email | PUT | `/admin/realms/{realm}/users/{user-id}/send-verify-email` | Send email verification |
| Get user groups | GET | `/admin/realms/{realm}/users/{user-id}/groups` | Get groups a user belongs to |
| Get user sessions | GET | `/admin/realms/{realm}/users/{user-id}/sessions` | Get user sessions |
| Logout user | POST | `/admin/realms/{realm}/users/{user-id}/logout` | Logout all sessions for a user |

### Client Management

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List clients | GET | `/admin/realms/{realm}/clients` | Get clients in the realm |
| Get client | GET | `/admin/realms/{realm}/clients/{client-uuid}` | Get client details |
| Create client | POST | `/admin/realms/{realm}/clients` | Create a new client |
| Update client | PUT | `/admin/realms/{realm}/clients/{client-uuid}` | Update client configuration |
| Delete client | DELETE | `/admin/realms/{realm}/clients/{client-uuid}` | Delete a client |
| Get client secret | GET | `/admin/realms/{realm}/clients/{client-uuid}/client-secret` | Get client secret |
| Generate new secret | POST | `/admin/realms/{realm}/clients/{client-uuid}/client-secret` | Generate new client secret |

### Role Management

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List realm roles | GET | `/admin/realms/{realm}/roles` | Get all realm roles |
| Create realm role | POST | `/admin/realms/{realm}/roles` | Create a new realm role |
| Get role | GET | `/admin/realms/{realm}/roles/{role-name}` | Get role details |
| Update role | PUT | `/admin/realms/{realm}/roles/{role-name}` | Update role details |
| Delete role | DELETE | `/admin/realms/{realm}/roles/{role-name}` | Delete a role |
| List client roles | GET | `/admin/realms/{realm}/clients/{client-uuid}/roles` | Get roles for a client |
| Create client role | POST | `/admin/realms/{realm}/clients/{client-uuid}/roles` | Create a client role |

### Group Management

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List groups | GET | `/admin/realms/{realm}/groups` | Get all groups |
| Count groups | GET | `/admin/realms/{realm}/groups/count` | Count groups |
| Create group | POST | `/admin/realms/{realm}/groups` | Create a new group |
| Get group | GET | `/admin/realms/{realm}/groups/{group-id}` | Get group details |
| Update group | PUT | `/admin/realms/{realm}/groups/{group-id}` | Update group |
| Delete group | DELETE | `/admin/realms/{realm}/groups/{group-id}` | Delete a group |
| List group members | GET | `/admin/realms/{realm}/groups/{group-id}/members` | Get members of a group |

## Parameter Reference

### Common Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `first` | Integer | Pagination offset (0-based) | `first=0` |
| `max` | Integer | Maximum number of results to return | `max=20` |
| `search` | String | Search text | `search=john` |
| `exact` | Boolean | Whether to search for exact matches | `exact=true` |
| `briefRepresentation` | Boolean | Return minimal information | `briefRepresentation=true` |

### User Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `username` | String | Filter by username | `username=john` |
| `email` | String | Filter by email | `email=john@example.com` |
| `firstName` | String | Filter by first name | `firstName=John` |
| `lastName` | String | Filter by last name | `lastName=Smith` |
| `emailVerified` | Boolean | Filter by email verification status | `emailVerified=true` |
| `enabled` | Boolean | Filter by enabled status | `enabled=true` |

### Common Body Parameters

#### UserRepresentation (Create/Update User)

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true,
  "emailVerified": false,
  "attributes": {
    "department": ["IT"],
    "employeeId": ["12345"]
  },
  "credentials": [
    {
      "type": "password",
      "value": "initial_password",
      "temporary": true
    }
  ],
  "requiredActions": ["UPDATE_PASSWORD"],
  "groups": ["group-id-1", "group-id-2"]
}
```

#### ClientRepresentation (Create/Update Client)

```json
{
  "clientId": "my-client",
  "name": "My Client Application",
  "description": "My application description",
  "enabled": true,
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "redirectUris": ["https://my-app.example.com/*"],
  "webOrigins": ["+"],
  "publicClient": false,
  "authorizationServicesEnabled": false,
  "serviceAccountsEnabled": true,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

#### PKCE-Enabled Client Configuration

```json
{
  "clientId": "my-pkce-client",
  "name": "My PKCE-Enabled Client",
  "description": "A client configured for public clients using PKCE",
  "enabled": true,
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "redirectUris": ["https://my-app.example.com/callback", "http://localhost:3000/callback"],
  "webOrigins": ["+"],
  "publicClient": true,
  "authorizationServicesEnabled": false,
  "serviceAccountsEnabled": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

## Postman Example

Below is a comprehensive example of using Postman to manage users in a Keycloak realm:

### Step 1: Obtain Access Token

**Request:**
- Method: POST
- URL: `{{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token`
- Headers: 
  - Content-Type: application/x-www-form-urlencoded
- Body (form-data):
  - grant_type: client_credentials
  - client_id: {{client_id}}
  - client_secret: {{client_secret}}

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJRSnVoUjlFSFBIWTZFT195VjV4M1BTZWUzakRLNUs4M0lQMnAwQVhTY0UwIn0...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyMDg4YWRjZS1lZmZlLTRjODQtYmMxZi0zZTUyZWVhYTAyZjYifQ...",
  "token_type": "bearer",
  "not-before-policy": 0,
  "session_state": "e83b4602-b6b8-4120-8e66-5ce0063540a0",
  "scope": "profile email"
}
```

### Step 2: List Users

**Request:**
- Method: GET
- URL: `{{keycloak_url}}/admin/realms/{{realm}}/users?first=0&max=10&search=john`
- Headers:
  - Authorization: Bearer {{access_token}}
  - Accept: application/json

**Response:**
```json
[
  {
    "id": "7f6b6571-0a1a-4c48-ba09-2942b2e796c6",
    "createdTimestamp": 1628153126512,
    "username": "john.smith",
    "enabled": true,
    "totp": false,
    "emailVerified": true,
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "attributes": {
      "department": ["Marketing"],
      "phone": ["+1-555-123-4567"]
    },
    "disableableCredentialTypes": [],
    "requiredActions": [],
    "notBefore": 0,
    "access": {
      "manageGroupMembership": true,
      "view": true,
      "mapRoles": true,
      "impersonate": true,
      "manage": true
    }
  }
]
```

### Step 3: Create New User

**Request:**
- Method: POST
- URL: `{{keycloak_url}}/admin/realms/{{realm}}/users`
- Headers:
  - Authorization: Bearer {{access_token}}
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "username": "jane.doe",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "enabled": true,
  "emailVerified": false,
  "attributes": {
    "department": ["IT"],
    "jobTitle": ["Developer"]
  },
  "credentials": [
    {
      "type": "password",
      "value": "P@ssw0rd",
      "temporary": true
    }
  ],
  "requiredActions": ["UPDATE_PASSWORD", "VERIFY_EMAIL"]
}
```

**Response:**
- Status: 201 Created
- Headers:
  - Location: {{keycloak_url}}/admin/realms/{{realm}}/users/8f6d4a22-b75d-42c8-a0d1-5f36b8b1e25a

### Step 4: Get Specific User

**Request:**
- Method: GET
- URL: `{{keycloak_url}}/admin/realms/{{realm}}/users/8f6d4a22-b75d-42c8-a0d1-5f36b8b1e25a`
- Headers:
  - Authorization: Bearer {{access_token}}
  - Accept: application/json

**Response:**
```json
{
  "id": "8f6d4a22-b75d-42c8-a0d1-5f36b8b1e25a",
  "createdTimestamp": 1628154267859,
  "username": "jane.doe",
  "enabled": true,
  "totp": false,
  "emailVerified": false,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "attributes": {
    "department": ["IT"],
    "jobTitle": ["Developer"]
  },
  "disableableCredentialTypes": [],
  "requiredActions": ["UPDATE_PASSWORD", "VERIFY_EMAIL"],
  "notBefore": 0,
  "access": {
    "manageGroupMembership": true,
    "view": true,
    "mapRoles": true,
    "impersonate": true,
    "manage": true
  }
}
```

### Step 5: Update User

**Request:**
- Method: PUT
- URL: `{{keycloak_url}}/admin/realms/{{realm}}/users/8f6d4a22-b75d-42c8-a0d1-5f36b8b1e25a`
- Headers:
  - Authorization: Bearer {{access_token}}
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "firstName": "Jane",
  "lastName": "Doe-Smith",
  "email": "jane.doe@example.com",
  "enabled": true,
  "emailVerified": true,
  "attributes": {
    "department": ["IT"],
    "jobTitle": ["Senior Developer"],
    "location": ["New York"]
  }
}
```

**Response:**
- Status: 204 No Content

### Step 6: Authorization Code with PKCE Flow Example

This example demonstrates how to use the Authorization Code with PKCE flow to authenticate a user in a client-side application.

**Step 1: Frontend Code to Generate PKCE Challenge**

```javascript
// Generate a random code verifier
async function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Create a SHA-256 hash of the code verifier
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(hash);
}

// Base64URL encode a string or buffer
function base64URLEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Store code verifier in session storage for the token exchange step
async function initiateLogin() {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store the code verifier to use in the token exchange step
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  
  // Generate a random state value to prevent CSRF
  const state = generateRandomState();
  sessionStorage.setItem('pkce_state', state);
  
  // Redirect to Keycloak authorization endpoint
  const authUrl = new URL('{{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/auth');
  authUrl.searchParams.append('client_id', '{{client_id}}');
  authUrl.searchParams.append('redirect_uri', '{{redirect_uri}}');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile email');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  
  window.location.href = authUrl.toString();
}

// Generate a random state parameter
function generateRandomState() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

**Step 2: Handle the Authorization Response and Exchange Code for Token**

```javascript
// To be called on your redirect URI page
async function handleAuthResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  // Verify the state parameter matches what we stored
  const storedState = sessionStorage.getItem('pkce_state');
  if (state !== storedState) {
    console.error('State validation failed. Possible CSRF attack.');
    return;
  }
  
  // Check for errors
  if (error) {
    console.error('Authentication error:', error);
    return;
  }
  
  // Exchange the authorization code for tokens
  if (code) {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    
    try {
      const response = await fetch('{{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: '{{client_id}}',
          code: code,
          redirect_uri: '{{redirect_uri}}',
          code_verifier: codeVerifier
        })
      });
      
      const tokens = await response.json();
      
      // Store tokens securely (prefer secure, httpOnly cookies in production)
      sessionStorage.setItem('access_token', tokens.access_token);
      sessionStorage.setItem('refresh_token', tokens.refresh_token);
      sessionStorage.setItem('id_token', tokens.id_token);
      
      // Clear PKCE-related items
      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');
      
      // Redirect to the application
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Token exchange failed:', error);
    }
  }
}

// Call this function when the page loads on your redirect URI
document.addEventListener('DOMContentLoaded', handleAuthResponse);
```

**Step 3: Refresh Token Example**

```javascript
async function refreshTokens() {
  const refreshToken = sessionStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    return;
  }
  
  try {
    const response = await fetch('{{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: '{{client_id}}',
        refresh_token: refreshToken
      })
    });
    
    const tokens = await response.json();
    
    // Update stored tokens
    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
    
    return tokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login if refresh fails
    window.location.href = '/login';
  }
}
```

### Postman Collection JSON (Import-Ready)

```json
{
  "info": {
    "_postman_id": "b1e48b9a-c9a2-4b8c-9e7d-e5d74c7b54a5",
    "name": "Keycloak Admin API Demo",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Access Token",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "var jsonData = JSON.parse(responseBody);",
              "pm.environment.set(\"access_token\", jsonData.access_token);"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/x-www-form-urlencoded"
          }
        ],
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            {
              "key": "grant_type",
              "value": "client_credentials",
              "type": "text"
            },
            {
              "key": "client_id",
              "value": "{{client_id}}",
              "type": "text"
            },
            {
              "key": "client_secret",
              "value": "{{client_secret}}",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{keycloak_url}}/realms/{{realm}}/protocol/openid-connect/token",
          "host": ["{{keycloak_url}}"],
          "path": ["realms", "{{realm}}", "protocol", "openid-connect", "token"]
        },
        "description": "Retrieves an access token using client credentials."
      },
      "response": []
    },
    {
      "name": "List Users",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{keycloak_url}}/admin/realms/{{realm}}/users?first=0&max=10",
          "host": ["{{keycloak_url}}"],
          "path": ["admin", "realms", "{{realm}}", "users"],
          "query": [
            {
              "key": "first",
              "value": "0"
            },
            {
              "key": "max",
              "value": "10"
            }
          ]
        },
        "description": "Lists users in the realm with pagination."
      },
      "response": []
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"jane.doe\",\n  \"email\": \"jane.doe@example.com\",\n  \"firstName\": \"Jane\",\n  \"lastName\": \"Doe\",\n  \"enabled\": true,\n  \"emailVerified\": false,\n  \"attributes\": {\n    \"department\": [\"IT\"],\n    \"jobTitle\": [\"Developer\"]\n  },\n  \"credentials\": [\n    {\n      \"type\": \"password\",\n      \"value\": \"P@ssw0rd\",\n      \"temporary\": true\n    }\n  ],\n  \"requiredActions\": [\"UPDATE_PASSWORD\", \"VERIFY_EMAIL\"]\n}"
        },
        "url": {
          "raw": "{{keycloak_url}}/admin/realms/{{realm}}/users",
          "host": ["{{keycloak_url}}"],
          "path": ["admin", "realms", "{{realm}}", "users"]
        },
        "description": "Creates a new user in the realm."
      },
      "response": []
    }
  ],
  "variable": [
    {
      "key": "keycloak_url",
      "value": "https://keycloak.example.com"
    },
    {
      "key": "realm",
      "value": "master"
    },
    {
      "key": "client_id",
      "value": "admin-cli"
    },
    {
      "key": "client_secret",
      "value": "your-client-secret"
    }
  ]
}
```

## Usage Best Practices

1. **Token Management**
   - Store tokens securely
   - Monitor token expiration and refresh when needed
   - Use the shortest-lived tokens needed for your use case
   - For PKCE flows, store code verifiers securely and clear after use

2. **Error Handling**
   - Implement proper error handling for API responses
   - Use appropriate HTTP status code checks
   - Consider implementing retry logic for transient failures
   - Handle token refresh errors gracefully

3. **Security Recommendations**
   - Use client credentials flow for server-to-server authentication
   - Use authorization code with PKCE for browser-based and mobile applications
   - Create dedicated service accounts with minimal permissions
   - Rotate client secrets regularly
   - Always use HTTPS for production environments
   - Validate state parameters in PKCE flows to prevent CSRF attacks

4. **Performance Optimization**
   - Use pagination for large result sets (`first` and `max` parameters)
   - Request brief representations when full details aren't needed
   - Cache frequently used data when appropriate
   - Consider batching operations when possible

## Common Error Codes

| Status Code | Description | Possible Causes |
|-------------|-------------|----------------|
| 401 Unauthorized | Authentication failure | Invalid, expired, or missing token |
| 403 Forbidden | Permission denied | Token lacks required roles/permissions |
| 404 Not Found | Resource not found | Invalid ID, deleted resource |
| 409 Conflict | Resource conflict | Duplicate resource (e.g., username) |
| 400 Bad Request | Invalid request | Malformed JSON, invalid parameters |
| 500 Internal Server Error | Server error | Keycloak internal error |

## References

- [Official Keycloak Admin REST API Documentation](https://www.keycloak.org/docs-api/latest/rest-api/index.html)
- [Keycloak OpenAPI Definition](https://www.keycloak.org/docs-api/latest/rest-api/openapi.json)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Keycloak API Authentication Guide](https://www.keycloak.org/docs/latest/securing_apps/)

---

Generated: August 15, 2025
