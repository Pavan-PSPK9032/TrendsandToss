# Login & Registration Process

<cite>
**Referenced Files in This Document**
- [server.js](file://backend/server.js)
- [authRoutes.js](file://backend/routes/authRoutes.js)
- [authController.js](file://backend/controllers/authController.js)
- [User.js](file://backend/models/User.js)
- [authMiddleware.js](file://backend/middleware/authMiddleware.js)
- [axios.js](file://frontend/src/api/axios.js)
- [api.js](file://frontend/src/services/api.js)
- [AuthContext.jsx](file://frontend/src/context/AuthContext.jsx)
- [Register.jsx](file://frontend/src/pages/Register.jsx)
- [Login.jsx](file://frontend/src/pages/Login.jsx)
- [package.json](file://backend/package.json)
- [package.json](file://frontend/package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Security Measures](#security-measures)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
This document explains the end-to-end user registration and login processes in the E-commerce App. It covers backend flows (input validation, password hashing with bcrypt, duplicate email checks, JWT token generation), frontend form handling and authentication state management, and security considerations such as CORS, bearer token usage, and session persistence. Practical examples focus on API integration patterns, error handling, and user feedback mechanisms.

## Project Structure
The authentication system spans the backend Express server and MongoDB via Mongoose, and the React frontend with Axios and local storage for tokens and user data.

```mermaid
graph TB
subgraph "Backend"
S["Express Server<br/>server.js"]
R["Auth Routes<br/>authRoutes.js"]
C["Auth Controller<br/>authController.js"]
M["User Model<br/>User.js"]
MW["Auth Middleware<br/>authMiddleware.js"]
end
subgraph "Frontend"
AX["Axios Config<br/>axios.js"]
SVC["API Service<br/>api.js"]
REG["Register Page<br/>Register.jsx"]
LOG["Login Page<br/>Login.jsx"]
CTX["Auth Context<br/>AuthContext.jsx"]
end
S --> R --> C --> M
S --> MW
REG --> AX --> SVC --> R
LOG --> AX --> SVC --> R
AX --> AX
SVC --> AX
CTX --> AX
```

**Diagram sources**
- [server.js:1-102](file://backend/server.js#L1-L102)
- [authRoutes.js:1-9](file://backend/routes/authRoutes.js#L1-L9)
- [authController.js:1-27](file://backend/controllers/authController.js#L1-L27)
- [User.js:1-20](file://backend/models/User.js#L1-L20)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)
- [Register.jsx:1-67](file://frontend/src/pages/Register.jsx#L1-L67)
- [Login.jsx:1-56](file://frontend/src/pages/Login.jsx#L1-L56)
- [AuthContext.jsx:1-33](file://frontend/src/context/AuthContext.jsx#L1-L33)

**Section sources**
- [server.js:1-102](file://backend/server.js#L1-L102)
- [authRoutes.js:1-9](file://backend/routes/authRoutes.js#L1-L9)
- [authController.js:1-27](file://backend/controllers/authController.js#L1-L27)
- [User.js:1-20](file://backend/models/User.js#L1-L20)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)
- [Register.jsx:1-67](file://frontend/src/pages/Register.jsx#L1-L67)
- [Login.jsx:1-56](file://frontend/src/pages/Login.jsx#L1-L56)
- [AuthContext.jsx:1-33](file://frontend/src/context/AuthContext.jsx#L1-L33)

## Core Components
- Backend server initializes CORS, routes, and middleware; exposes authentication endpoints under /api/auth.
- Authentication controller handles registration and login, including duplicate email checks and JWT signing.
- User model enforces bcrypt hashing on save and provides password comparison.
- Frontend pages manage form state, submit requests, persist tokens, and redirect on success.
- Axios interceptors attach Authorization headers and handle 401 responses globally.
- Auth context centralizes login/logout and user state hydration from localStorage.

**Section sources**
- [server.js:22-49](file://backend/server.js#L22-L49)
- [authRoutes.js:6-7](file://backend/routes/authRoutes.js#L6-L7)
- [authController.js:6-16](file://backend/controllers/authController.js#L6-L16)
- [authController.js:18-27](file://backend/controllers/authController.js#L18-L27)
- [User.js:11-18](file://backend/models/User.js#L11-L18)
- [Register.jsx:11-22](file://frontend/src/pages/Register.jsx#L11-L22)
- [Login.jsx:10-21](file://frontend/src/pages/Login.jsx#L10-L21)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)
- [AuthContext.jsx:16-28](file://frontend/src/context/AuthContext.jsx#L16-L28)

## Architecture Overview
The authentication architecture follows a clean separation of concerns:
- Routes define HTTP endpoints for registration and login.
- Controllers encapsulate business logic and interact with the User model.
- Middleware protects downstream routes and verifies JWTs.
- Frontend communicates via Axios with automatic bearer token injection and centralized error handling.

```mermaid
sequenceDiagram
participant FE as "Frontend Page<br/>Register/Login"
participant AX as "Axios<br/>axios.js"
participant API as "API Service<br/>api.js"
participant SRV as "Express Server<br/>server.js"
participant RT as "Auth Routes<br/>authRoutes.js"
participant CTRL as "Auth Controller<br/>authController.js"
participant MDL as "User Model<br/>User.js"
participant MW as "Auth Middleware<br/>authMiddleware.js"
FE->>AX : "Submit form"
AX->>API : "Attach Authorization header if present"
API->>SRV : "POST /api/auth/register or /api/auth/login"
SRV->>RT : "Route to controller"
RT->>CTRL : "Invoke handler"
CTRL->>MDL : "Check duplicate / Create user / Compare passwords"
MDL-->>CTRL : "Result"
CTRL-->>SRV : "JSON response {token, user}"
SRV-->>API : "HTTP 201/200"
API-->>FE : "Data"
FE->>FE : "Persist token/user, redirect"
```

**Diagram sources**
- [Register.jsx:11-22](file://frontend/src/pages/Register.jsx#L11-L22)
- [Login.jsx:10-21](file://frontend/src/pages/Login.jsx#L10-L21)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)
- [server.js:57-63](file://backend/server.js#L57-L63)
- [authRoutes.js:6-7](file://backend/routes/authRoutes.js#L6-L7)
- [authController.js:6-16](file://backend/controllers/authController.js#L6-L16)
- [authController.js:18-27](file://backend/controllers/authController.js#L18-L27)
- [User.js:11-18](file://backend/models/User.js#L11-L18)

## Detailed Component Analysis

### Backend Registration Flow
- Input extraction: name, email, password from request body.
- Duplicate email check: findOne by email; responds with error if found.
- User creation: User.create persists with bcrypt-hashed password via pre-save hook.
- Token generation: signToken creates a signed JWT with a 7-day expiry.
- Response: returns token and sanitized user object (without password).

```mermaid
flowchart TD
Start(["POST /api/auth/register"]) --> Extract["Extract name, email, password"]
Extract --> CheckDup["Find existing user by email"]
CheckDup --> Exists{"Email exists?"}
Exists --> |Yes| ErrDup["Return 400: Email exists"]
Exists --> |No| CreateUser["Create user record"]
CreateUser --> Hash["bcrypt hash via pre-save hook"]
Hash --> Sign["Sign JWT with secret"]
Sign --> Respond["Return {token, user}"]
ErrDup --> End(["Exit"])
Respond --> End
```

**Diagram sources**
- [authController.js:8-14](file://backend/controllers/authController.js#L8-L14)
- [User.js:11-14](file://backend/models/User.js#L11-L14)

**Section sources**
- [authController.js:6-16](file://backend/controllers/authController.js#L6-L16)
- [User.js:11-18](file://backend/models/User.js#L11-L18)

### Backend Login Flow
- Credential lookup: findOne by email.
- Password verification: matchPassword compares bcrypt hash.
- Token generation: signToken creates a signed JWT with a 7-day expiry.
- Response: returns token and sanitized user object.

```mermaid
flowchart TD
Start(["POST /api/auth/login"]) --> Lookup["Find user by email"]
Lookup --> Found{"User found?"}
Found --> |No| ErrCreds["Return 401: Invalid credentials"]
Found --> |Yes| Verify["Compare password with bcrypt"]
Verify --> Match{"Password matches?"}
Match --> |No| ErrCreds
Match --> |Yes| Sign["Sign JWT with secret"]
Sign --> Respond["Return {token, user}"]
ErrCreds --> End(["Exit"])
Respond --> End
```

**Diagram sources**
- [authController.js:18-26](file://backend/controllers/authController.js#L18-L26)
- [User.js:16-18](file://backend/models/User.js#L16-L18)

**Section sources**
- [authController.js:18-27](file://backend/controllers/authController.js#L18-L27)
- [User.js:16-18](file://backend/models/User.js#L16-L18)

### Frontend Registration Implementation
- Form state: manages name, email, password.
- Submission: posts to /api/auth/register via Axios.
- Persistence: stores token and user in localStorage.
- Feedback: alerts on success/failure; navigates to home on success.

```mermaid
sequenceDiagram
participant P as "Register Page"
participant AX as "Axios"
participant API as "API Service"
participant SRV as "Server"
P->>P : "Collect form state"
P->>AX : "POST /api/auth/register"
AX->>API : "Attach Authorization header if any"
API->>SRV : "Send request"
SRV-->>API : "Response {token, user}"
API-->>AX : "Data"
AX-->>P : "Data"
P->>P : "localStorage.setItem('token','...')"
P->>P : "localStorage.setItem('user','...')"
P->>P : "alert + navigate('/')"
```

**Diagram sources**
- [Register.jsx:11-22](file://frontend/src/pages/Register.jsx#L11-L22)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)

**Section sources**
- [Register.jsx:1-67](file://frontend/src/pages/Register.jsx#L1-L67)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)

### Frontend Login Implementation
- Form state: manages email, password.
- Submission: posts to /api/auth/login via Axios.
- Persistence: stores token and user in localStorage.
- Feedback: alerts on success/failure; navigates to home on success.

```mermaid
sequenceDiagram
participant P as "Login Page"
participant AX as "Axios"
participant API as "API Service"
participant SRV as "Server"
P->>P : "Collect form state"
P->>AX : "POST /api/auth/login"
AX->>API : "Attach Authorization header if any"
API->>SRV : "Send request"
SRV-->>API : "Response {token, user}"
API-->>AX : "Data"
AX-->>P : "Data"
P->>P : "localStorage.setItem('token','...')"
P->>P : "localStorage.setItem('user','...')"
P->>P : "alert + navigate('/')"
```

**Diagram sources**
- [Login.jsx:10-21](file://frontend/src/pages/Login.jsx#L10-L21)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)

**Section sources**
- [Login.jsx:1-56](file://frontend/src/pages/Login.jsx#L1-L56)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [api.js:1-8](file://frontend/src/services/api.js#L1-L8)

### Authentication Context and Session Management
- Hydration: reads user from localStorage on mount to restore session.
- Login: performs POST /api/auth/login, stores token and user, updates context.
- Logout: removes token and user from localStorage and clears context.

```mermaid
flowchart TD
Mount["App mounts"] --> LoadUser["Read 'user' from localStorage"]
LoadUser --> HasUser{"User present?"}
HasUser --> |Yes| SetCtx["Set context.user"]
HasUser --> |No| Done["Done"]
SetCtx --> Done
Login["AuthContext.login()"] --> CallAPI["POST /api/auth/login"]
CallAPI --> Save["localStorage.setItem('token','...')"]
Save --> SaveUser["localStorage.setItem('user','...')"]
SaveUser --> UpdateCtx["Update context.user"]
UpdateCtx --> Done
Logout["AuthContext.logout()"] --> Remove["Remove 'token' and 'user'"]
Remove --> Clear["Clear context.user"]
Clear --> Done
```

**Diagram sources**
- [AuthContext.jsx:10-14](file://frontend/src/context/AuthContext.jsx#L10-L14)
- [AuthContext.jsx:16-28](file://frontend/src/context/AuthContext.jsx#L16-L28)

**Section sources**
- [AuthContext.jsx:1-33](file://frontend/src/context/AuthContext.jsx#L1-L33)

### Protected Routes and Role-Based Access
- protect middleware extracts Bearer token from Authorization header, verifies it, attaches user (without password) to request, and continues.
- admin middleware checks user role for admin-only endpoints.

```mermaid
sequenceDiagram
participant Client as "Client"
participant MW as "protect middleware"
participant UserDB as "User Model"
Client->>MW : "Request with Authorization : Bearer <token>"
MW->>MW : "Verify JWT"
MW->>UserDB : "findById(decoded.id).select('-password')"
UserDB-->>MW : "User without password"
MW->>Client : "Next()"
```

**Diagram sources**
- [authMiddleware.js:4-15](file://backend/middleware/authMiddleware.js#L4-L15)
- [User.js:10](file://backend/models/User.js#L10)

**Section sources**
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [User.js:10](file://backend/models/User.js#L10)

## Dependency Analysis
- Backend dependencies include bcryptjs for password hashing, jsonwebtoken for JWT signing, and mongoose for ODM.
- Frontend depends on axios for HTTP requests and react-router-dom for navigation.

```mermaid
graph LR
BE_PKG["backend/package.json"] --> BC["bcryptjs"]
BE_PKG --> JWT["jsonwebtoken"]
BE_PKG --> MONGO["mongoose"]
FE_PKG["frontend/package.json"] --> AX["axios"]
FE_PKG --> RR["react-router-dom"]
```

**Diagram sources**
- [package.json:8-22](file://backend/package.json#L8-L22)
- [package.json:8-16](file://frontend/package.json#L8-L16)

**Section sources**
- [package.json:8-22](file://backend/package.json#L8-L22)
- [package.json:8-16](file://frontend/package.json#L8-L16)

## Performance Considerations
- Password hashing cost: bcrypt uses a fixed salt and cost factor in the model’s pre-save hook; ensure appropriate deployment settings for production workloads.
- Token lifetime: JWT expires in seven days; consider refresh token strategies for long-lived sessions.
- Request parsing: server enables JSON and URL-encoded bodies; keep payload sizes reasonable for registration/login.
- Frontend caching: localStorage is synchronous and single-threaded; avoid excessive writes during rapid user interactions.

[No sources needed since this section provides general guidance]

## Security Measures
- CORS configuration: Strict origins list with credentials support and allowed headers/methods; preflight caching reduces latency.
- Bearer token injection: Axios interceptor automatically attaches Authorization header for protected routes.
- Token removal on 401: Response interceptor clears token on unauthorized responses to prevent stale tokens.
- Protected routes: JWT verification middleware decodes token and attaches user without password.
- Role-based access: Admin middleware restricts endpoints to admin users.

```mermaid
flowchart TD
Req["HTTP Request"] --> CORS["CORS Validation"]
CORS --> |Allowed| Parse["Parse JSON/URL-encoded"]
CORS --> |Blocked| Deny["Reject with error"]
Parse --> Route["Route to Handler"]
Route --> JWT["Verify JWT in protect middleware"]
JWT --> Attach["Attach user (no password)"]
Attach --> Next["Proceed to handler"]
Deny --> End(["Exit"])
Next --> End
```

**Diagram sources**
- [server.js:22-49](file://backend/server.js#L22-L49)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)
- [authMiddleware.js:4-15](file://backend/middleware/authMiddleware.js#L4-L15)

**Section sources**
- [server.js:22-49](file://backend/server.js#L22-L49)
- [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
- [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)
- [authMiddleware.js:4-15](file://backend/middleware/authMiddleware.js#L4-L15)

## Troubleshooting Guide
- Registration fails with “Email exists”:
  - Cause: Duplicate email detected by the backend.
  - Action: Prompt user to use another email or log in instead.
  - Section sources
    - [authController.js:9-11](file://backend/controllers/authController.js#L9-L11)

- Login fails with “Invalid credentials”:
  - Cause: No user found or password mismatch.
  - Action: Prompt user to re-enter credentials; ensure caps lock is off and spelling is correct.
  - Section sources
    - [authController.js:21-22](file://backend/controllers/authController.js#L21-L22)

- 401 Unauthorized after login:
  - Cause: Token missing or invalid; response interceptor clears token on 401.
  - Action: Re-authenticate; check browser network tab for Authorization header presence.
  - Section sources
    - [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)

- Frontend shows stale user after logout:
  - Cause: Context not updated or localStorage not cleared.
  - Action: Ensure logout removes token and user; verify AuthContext state.
  - Section sources
    - [AuthContext.jsx:24-28](file://frontend/src/context/AuthContext.jsx#L24-L28)

- Protected route returns “Not authorized”:
  - Cause: Missing or malformed Authorization header.
  - Action: Confirm interceptor injects Bearer token; verify JWT_SECRET environment variable.
  - Section sources
    - [authMiddleware.js:5-6](file://backend/middleware/authMiddleware.js#L5-L6)
    - [authMiddleware.js:9](file://backend/middleware/authMiddleware.js#L9)

## Conclusion
The authentication system integrates secure backend processing (bcrypt hashing, JWT signing, duplicate checks) with robust frontend state management (form handling, token persistence, global error handling). The architecture supports protected routes and role-based access while maintaining a clean separation of concerns. For production hardening, consider adding input sanitization, rate limiting, CSRF protection, and password reset/account verification flows.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Endpoints Reference
- POST /api/auth/register
  - Body: { name, email, password }
  - Response: { token, user: { id, name, email, role } }
  - Status: 201 on success, 400 on duplicate email, 500 on server error
  - Section sources
    - [authRoutes.js:6](file://backend/routes/authRoutes.js#L6)
    - [authController.js:6-16](file://backend/controllers/authController.js#L6-L16)

- POST /api/auth/login
  - Body: { email, password }
  - Response: { token, user: { id, name, email, role } }
  - Status: 200 on success, 401 on invalid credentials, 500 on server error
  - Section sources
    - [authRoutes.js:7](file://backend/routes/authRoutes.js#L7)
    - [authController.js:18-27](file://backend/controllers/authController.js#L18-L27)

### Frontend Integration Patterns
- Axios configuration:
  - Automatic Authorization header injection for protected routes.
  - Global 401 handling to remove token.
  - Section sources
    - [axios.js:4-8](file://frontend/src/api/axios.js#L4-L8)
    - [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)

- API service wrapper:
  - Centralized base URL and interceptors.
  - Section sources
    - [api.js:1-8](file://frontend/src/services/api.js#L1-L8)

### Practical Examples
- Registration form submission:
  - Collects name, email, password; posts to /api/auth/register; stores token/user; navigates on success.
  - Section sources
    - [Register.jsx:11-22](file://frontend/src/pages/Register.jsx#L11-L22)

- Login form submission:
  - Posts credentials to /api/auth/login; stores token/user; navigates on success.
  - Section sources
    - [Login.jsx:10-21](file://frontend/src/pages/Login.jsx#L10-L21)

- Protected route usage:
  - Apply protect middleware to routes requiring authentication; apply admin middleware for admin-only routes.
  - Section sources
    - [authMiddleware.js:4-15](file://backend/middleware/authMiddleware.js#L4-L15)
    - [authMiddleware.js:17-20](file://backend/middleware/authMiddleware.js#L17-L20)

### Additional Workflows (Planned Enhancements)
- Account verification:
  - Add email verification tokens and resend endpoints; update user status upon verification.
- Password reset:
  - Implement reset token generation, email delivery, and secure password update endpoint.
- Session management:
  - Introduce refresh tokens and sliding expiration; enforce logout on token refresh failures.

[No sources needed since this section provides general guidance]