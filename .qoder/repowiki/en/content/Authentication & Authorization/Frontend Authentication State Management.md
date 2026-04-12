# Frontend Authentication State Management

<cite>
**Referenced Files in This Document**
- [main.jsx](file://frontend/src/main.jsx)
- [AuthContext.jsx](file://frontend/src/context/AuthContext.jsx)
- [firebase.js](file://frontend/src/config/firebase.js)
- [axios.js](file://frontend/src/api/axios.js)
- [authController.js](file://backend/controllers/authController.js)
- [authMiddleware.js](file://backend/middleware/authMiddleware.js)
- [Login.jsx](file://frontend/src/pages/Login.jsx)
- [navbar.jsx](file://frontend/src/components/navbar.jsx)
</cite>

## Update Summary
**Changes Made**
- Complete Firebase Authentication integration replacing manual JWT token management
- Enhanced AuthContext with Firebase ID token verification and automatic token refresh
- Removed manual token persistence in favor of Firebase Authentication state management
- Updated API interceptors to work with Firebase ID tokens from auth.currentUser
- Implemented real-time authentication state synchronization with Firebase
- Added comprehensive error handling for Firebase authentication flows

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the frontend authentication state management built with React Context API, now enhanced with comprehensive Firebase Authentication integration. The system leverages Firebase Authentication for secure user authentication, automatic token management, and real-time state synchronization. The AuthContext implementation now focuses on Firebase ID token verification, automatic token refresh, and seamless integration with the backend Firebase authentication system. The enhanced implementation provides robust authentication flow with automatic token lifecycle management, comprehensive error handling, and seamless user experience across all components.

**Updated** Complete Firebase Authentication integration with automatic token management, real-time state synchronization, and backend verification through Firebase Admin SDK.

## Project Structure
The authentication implementation centers around a React Context provider with integrated Firebase Authentication. The main application mounts the AuthProvider at the root level, ensuring proper authentication context availability throughout the application. The system now uses Firebase Authentication for all authentication methods, with automatic token verification and refresh handled by Firebase SDK.

```mermaid
graph TB
subgraph "Frontend Root"
MAIN["main.jsx<br/>AuthProvider Wrapper"]
APP["App.jsx"]
end
subgraph "Context Layer"
AUTHCTX["AuthContext.jsx<br/>Firebase Auth Provider"]
end
subgraph "Firebase Authentication"
FIREBASE["firebase.js<br/>Firebase Auth SDK"]
AUTHSTATE["onAuthStateChanged<br/>Real-time Sync"]
ENDPOINT["Backend Firebase Controller<br/>Token Verification"]
end
subgraph "Pages"
LOGIN["Login.jsx<br/>Firebase Auth Methods"]
NAV["navbar.jsx<br/>Conditional Rendering"]
end
subgraph "API Layer"
AXIOS["axios.js<br/>Firebase ID Token Interceptor"]
MIDDLEWARE["authMiddleware.js<br/>Firebase Token Verification"]
end
MAIN --> APP
APP --> AUTHCTX
AUTHCTX --> FIREBASE
AUTHCTX --> AUTHSTATE
AUTHCTX --> ENDPOINT
APP --> LOGIN
APP --> NAV
LOGIN --> AXIOS
NAV --> AUTHCTX
AXIOS --> MIDDLEWARE
```

**Diagram sources**
- [main.jsx:7-13](file://frontend/src/main.jsx#L7-L13)
- [AuthContext.jsx:31-48](file://frontend/src/context/AuthContext.jsx#L31-L48)
- [firebase.js:21-63](file://frontend/src/config/firebase.js#L21-L63)
- [authController.js:5-68](file://backend/controllers/authController.js#L5-L68)
- [Login.jsx:7](file://frontend/src/pages/Login.jsx#L7)
- [navbar.jsx:5](file://frontend/src/components/navbar.jsx#L5)
- [axios.js:8-16](file://frontend/src/api/axios.js#L8-L16)
- [authMiddleware.js:4-24](file://backend/middleware/authMiddleware.js#L4-L24)

**Section sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)

## Core Components
- **Enhanced AuthProvider** manages user state with Firebase Authentication integration, automatically synchronizes with Firebase auth state, and handles real-time authentication updates through onAuthStateChanged listener.
- **Firebase Authentication Integration** provides seamless Google OAuth, email/password authentication, and automatic token management with automatic refresh capabilities.
- **Automatic Token Synchronization** uses Firebase ID tokens for backend communication, with automatic token refresh and verification through backend Firebase Admin SDK.
- **Real-time State Management** implements onAuthStateChanged listener to keep frontend state synchronized with Firebase authentication state, eliminating manual token persistence.
- **Comprehensive Authentication Methods** including Google login, email/password login, email/password registration, and logout with Firebase integration.
- **Enhanced Error Handling** with comprehensive logging and user feedback for Firebase authentication failures and token verification errors.
- **Automatic Token Injection** through Axios interceptors that extract fresh Firebase ID tokens from auth.currentUser for each request.
- **Backend Verification** with Firebase Admin SDK verifying ID tokens and managing user synchronization between Firebase and backend databases.

Key implementation references:
- **Root-level provider setup with AuthProvider wrapper**: [main.jsx:9](file://frontend/src/main.jsx#L9)
- **Firebase auth state synchronization**: [AuthContext.jsx:31-48](file://frontend/src/context/AuthContext.jsx#L31-L48)
- **Firebase ID token synchronization**: [AuthContext.jsx:13-29](file://frontend/src/context/AuthContext.jsx#L13-L29)
- **Email/password login via Firebase**: [AuthContext.jsx:51-54](file://frontend/src/context/AuthContext.jsx#L51-L54)
- **Email/password registration via Firebase**: [AuthContext.jsx:57-60](file://frontend/src/context/AuthContext.jsx#L57-L60)
- **Google login via Firebase**: [AuthContext.jsx:63-66](file://frontend/src/context/AuthContext.jsx#L63-L66)
- **Firebase sign-out**: [AuthContext.jsx:68-76](file://frontend/src/context/AuthContext.jsx#L68-L76)
- **Firebase auth state listener**: [AuthContext.jsx:37-47](file://frontend/src/context/AuthContext.jsx#L37-L47)
- **Firebase configuration and exports**: [firebase.js:15-67](file://frontend/src/config/firebase.js#L15-L67)
- **Automatic token injection**: [axios.js:9-16](file://frontend/src/api/axios.js#L9-L16)
- **Backend Firebase token verification**: [authController.js:13-14](file://backend/controllers/authController.js#L13-L14)
- **Backend auth middleware token verification**: [authMiddleware.js:14](file://backend/middleware/authMiddleware.js#L14)

**Section sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)
- [authMiddleware.js:1-33](file://backend/middleware/authMiddleware.js#L1-L33)
- [axios.js:1-29](file://frontend/src/api/axios.js#L1-L29)

## Architecture Overview
The authentication architecture combines React Context with Firebase Authentication SDK for automatic token management and real-time state synchronization. The AuthProvider listens for Firebase auth state changes and automatically synchronizes user data with the backend through Firebase ID tokens. The system eliminates manual token persistence by leveraging Firebase's automatic token refresh and verification capabilities.

```mermaid
sequenceDiagram
participant U as "User"
participant M as "main.jsx<br/>AuthProvider"
participant AC as "AuthContext.jsx"
participant FA as "Firebase Auth"
participant AX as "axios.js"
participant BC as "Backend Controller"
U->>M : "App Mount"
M->>AC : "Initialize AuthProvider"
AC->>FA : "onAuthStateChanged(listener)"
AC->>AC : "Restore user from localStorage"
FA-->>AC : "Auth state change detected"
AC->>FA : "getIdToken()"
FA-->>AC : "Firebase ID token"
AC->>BC : "POST /auth/firebase-login {idToken}"
BC-->>AC : "{ user } with backend user data"
AC->>AC : "Update context state"
AC->>AC : "Update localStorage"
AC-->>U : "{ user, loading }"
U->>AX : "API Request"
AX->>FA : "auth.currentUser.getIdToken()"
FA-->>AX : "Fresh Firebase ID token"
AX-->>U : "Response with protected data"
```

**Diagram sources**
- [main.jsx:7-13](file://frontend/src/main.jsx#L7-L13)
- [AuthContext.jsx:31-48](file://frontend/src/context/AuthContext.jsx#L31-L48)
- [AuthContext.jsx:20-29](file://frontend/src/context/AuthContext.jsx#L20-L29)
- [authController.js:5-68](file://backend/controllers/authController.js#L5-L68)
- [axios.js:9-16](file://frontend/src/api/axios.js#L9-L16)

## Detailed Component Analysis

### Enhanced AuthProvider with Firebase Integration
The AuthProvider now serves as a bridge between Firebase Authentication and the application state, automatically synchronizing user data and handling real-time authentication updates. The provider uses Firebase's onAuthStateChanged listener to detect authentication changes and automatically refreshes user data through backend verification.

```mermaid
classDiagram
class AuthProvider {
+useState(user)
+useState(loading)
+onAuthStateChanged(listener)
+syncUser(firebaseUser)
+login(email, password)
+register(name, email, password)
+loginWithGoogle()
+logout()
}
class FirebaseAuthListener {
+onAuthStateChanged(callback)
+getIdToken()
+signOut()
}
class BackendSync {
+firebaseLogin(idToken)
+userVerification(decoded)
}
AuthProvider --> FirebaseAuthListener : "manages auth state"
AuthProvider --> BackendSync : "synchronizes user data"
```

**Diagram sources**
- [AuthContext.jsx:8-83](file://frontend/src/context/AuthContext.jsx#L8-L83)
- [firebase.js:21-63](file://frontend/src/config/firebase.js#L21-L63)
- [authController.js:5-68](file://backend/controllers/authController.js#L5-L68)

Implementation highlights:
- **Root-level provider setup**: [main.jsx:9](file://frontend/src/main.jsx#L9)
- **Firebase auth state listener**: [AuthContext.jsx:37-47](file://frontend/src/context/AuthContext.jsx#L37-L47)
- **Automatic user synchronization**: [AuthContext.jsx:13-29](file://frontend/src/context/AuthContext.jsx#L13-L29)
- **Email/password login via Firebase**: [AuthContext.jsx:51-54](file://frontend/src/context/AuthContext.jsx#L51-L54)
- **Email/password registration via Firebase**: [AuthContext.jsx:57-60](file://frontend/src/context/AuthContext.jsx#L57-L60)
- **Google login via Firebase**: [AuthContext.jsx:63-66](file://frontend/src/context/AuthContext.jsx#L63-L66)
- **Firebase sign-out**: [AuthContext.jsx:68-76](file://frontend/src/context/AuthContext.jsx#L68-L76)

**Section sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)

### Firebase Authentication Integration
The Firebase integration provides seamless authentication through Google OAuth and email/password methods, with automatic token management and real-time state synchronization. The system handles authentication flows, token extraction, and user data synchronization automatically.

```mermaid
flowchart TD
Start(["Authentication Request"]) --> Method{"Authentication Method"}
Method --> |Google| GoogleAuth["signInWithGoogle()"]
Method --> |Email/Password| EmailAuth["signInWithEmail()"]
GoogleAuth --> GetToken["getIdToken()"]
EmailAuth --> GetToken
GetToken --> SendToBackend["POST /auth/firebase-login"]
SendToBackend --> VerifyToken["Firebase Admin verifyIdToken()"]
VerifyToken --> SyncUser["Sync user data with backend"]
SyncUser --> UpdateContext["Update AuthContext state"]
UpdateContext --> UpdateStorage["Update localStorage"]
UpdateStorage --> Success["Authentication Complete"]
```

**Diagram sources**
- [AuthContext.jsx:20-29](file://frontend/src/context/AuthContext.jsx#L20-L29)
- [authController.js:13-14](file://backend/controllers/authController.js#L13-L14)
- [firebase.js:21-63](file://frontend/src/config/firebase.js#L21-L63)

Key implementation details:
- **Firebase configuration and exports**: [firebase.js:15-67](file://frontend/src/config/firebase.js#L15-L67)
- **Google sign-in with popup**: [firebase.js:21-29](file://frontend/src/config/firebase.js#L21-L29)
- **Email/password authentication**: [firebase.js:32-53](file://frontend/src/config/firebase.js#L32-L53)
- **Firebase ID token extraction**: [AuthContext.jsx:20](file://frontend/src/context/AuthContext.jsx#L20)
- **Backend token verification**: [authController.js:13-14](file://backend/controllers/authController.js#L13-L14)
- **User synchronization**: [AuthContext.jsx:21-23](file://frontend/src/context/AuthContext.jsx#L21-L23)

**Section sources**
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)

### Automatic Token Management and API Interceptors
The Axios interceptors now automatically handle Firebase ID tokens through the Firebase SDK, eliminating manual token persistence and providing automatic token refresh capabilities. The system extracts fresh tokens from Firebase auth.currentUser for each request.

```mermaid
flowchart TD
Start(["API Request"]) --> CheckAuth["Check auth.currentUser"]
CheckAuth --> HasAuth{"User authenticated?"}
HasAuth --> |Yes| GetToken["auth.currentUser.getIdToken()"]
HasAuth --> |No| SkipToken["Skip token attachment"]
GetToken --> AttachHeader["Attach Authorization: Bearer token"]
SkipToken --> SendRequest["Send request"]
AttachHeader --> SendRequest
SendRequest --> Response["Receive response"]
Response --> Handle401{"Status == 401?"}
Handle401 --> |Yes| ClearStorage["Remove user from localStorage"]
Handle401 --> |No| Complete["Complete request"]
ClearStorage --> Complete
Complete --> End(["Done"])
```

**Diagram sources**
- [axios.js:9-27](file://frontend/src/api/axios.js#L9-L27)

Practical implications:
- **Automatic token refresh** through Firebase SDK eliminates manual token expiration handling.
- **Real-time authentication state** synchronization through onAuthStateChanged listener.
- **Automatic cleanup** on 401 responses prevents stale authentication state.
- **Seamless integration** with Firebase Authentication without manual token management.

**Section sources**
- [axios.js:1-29](file://frontend/src/api/axios.js#L1-L29)

### Enhanced Login Page Integration
The Login page now integrates seamlessly with Firebase Authentication, supporting both Google OAuth and email/password authentication through Firebase SDK. The page handles authentication flows, error handling, and automatic navigation on successful authentication.

```mermaid
sequenceDiagram
participant U as "User"
participant P as "Login.jsx"
participant AC as "AuthContext"
participant FA as "Firebase Auth"
participant AX as "axios.js"
U->>P : "Click Google Login"
P->>AC : "loginWithGoogle()"
AC->>FA : "signInWithGoogle()"
FA-->>AC : "Firebase user object"
AC->>AC : "syncUser(firebaseUser)"
AC->>AX : "POST /auth/firebase-login"
AX-->>AC : "Backend user data"
AC->>AC : "Update context state"
AC->>AC : "Update localStorage"
P-->>U : "Navigate to home"
```

**Diagram sources**
- [Login.jsx:30-47](file://frontend/src/pages/Login.jsx#L30-L47)
- [AuthContext.jsx:63-66](file://frontend/src/context/AuthContext.jsx#L63-L66)
- [AuthContext.jsx:13-29](file://frontend/src/context/AuthContext.jsx#L13-L29)

**Section sources**
- [Login.jsx:1-133](file://frontend/src/pages/Login.jsx#L1-L133)

### Enhanced Navbar Conditional Rendering
The Navbar consumes authentication state to switch between authenticated and unauthenticated navigation links, with enhanced role-based access control for admin users. The component now benefits from real-time authentication state updates through Firebase integration.

```mermaid
flowchart TD
Start(["Navbar render"]) --> GetUser["useAuth() -> { user, logout }"]
GetUser --> HasUser{"user present?"}
HasUser --> |Yes| CheckRole{"user.role === 'admin'?"}
CheckRole --> |Yes| AdminLinks["Show Cart, Admin, Logout"]
CheckRole --> |No| UserLinks["Show Cart, Logout"]
HasUser --> |No| GuestLinks["Show Login, Register"]
AdminLinks --> End(["Done"])
UserLinks --> End
GuestLinks --> End
```

**Diagram sources**
- [navbar.jsx:5](file://frontend/src/components/navbar.jsx#L5)

**Section sources**
- [navbar.jsx:1-26](file://frontend/src/components/navbar.jsx#L1-L26)

### Backend Firebase Authentication Integration
The backend now verifies Firebase ID tokens through Firebase Admin SDK, providing secure authentication verification and user synchronization between Firebase and backend systems. The system handles token verification, user creation/update, and role-based access control.

```mermaid
sequenceDiagram
participant C as "Client (AuthContext)"
participant AX as "axios.js"
participant BC as "Backend Controller"
participant FA as "Firebase Admin"
participant DB as "MongoDB User Collection"
alt Firebase Authentication
C->>AX : "Request with Firebase ID token"
AX->>BC : "Request with Authorization header"
BC->>FA : "verifyIdToken(idToken)"
FA-->>BC : "Decoded token with uid, email, name"
BC->>DB : "Find user by firebaseUid"
DB-->>BC : "User record or null"
alt User exists
BC->>DB : "Update user if needed"
else New user
BC->>DB : "Create new user with firebaseUid"
end
BC-->>AX : "User data with role"
AX-->>C : "Protected data response"
end
```

**Diagram sources**
- [axios.js:9-16](file://frontend/src/api/axios.js#L9-L16)
- [authController.js:5-68](file://backend/controllers/authController.js#L5-L68)
- [authMiddleware.js:14](file://backend/middleware/authMiddleware.js#L14)

**Section sources**
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)
- [authMiddleware.js:1-33](file://backend/middleware/authMiddleware.js#L1-L33)

## Dependency Analysis
The authentication system exhibits clear separation of concerns with Firebase-first architecture:
- **Enhanced AuthProvider** manages Firebase authentication state with automatic synchronization and real-time updates.
- **Firebase Authentication SDK** provides seamless Google OAuth and email/password authentication with automatic token management.
- **Backend Firebase Admin SDK** verifies ID tokens and manages user synchronization with comprehensive error handling.
- **Axios interceptors** automatically handle Firebase ID token injection with fresh token extraction for each request.
- **Pages and components** consume authentication state through useAuth hook with real-time updates from Firebase.
- **Backend middleware** enforces authorization and admin checks using Firebase Admin SDK verification.

```mermaid
graph LR
MAIN["main.jsx<br/>AuthProvider Wrapper"] --> AC["AuthContext.jsx<br/>Firebase Auth Provider"]
AC --> FA["firebase.js<br/>Firebase Auth SDK"]
AC --> AX["axios.js<br/>Firebase Token Interceptor"]
FA --> FASDK["Firebase Authentication SDK"]
AC --> BC["authController.js<br/>Firebase Token Verification"]
BC --> FASDK
BC --> DB["MongoDB User Collection"]
AX --> FASDK
AX --> BM["authMiddleware.js<br/>Firebase Token Verification"]
```

**Diagram sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)
- [axios.js:1-29](file://frontend/src/api/axios.js#L1-L29)
- [authMiddleware.js:1-33](file://backend/middleware/authMiddleware.js#L1-L33)

**Section sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)
- [axios.js:1-29](file://frontend/src/api/axios.js#L1-L29)
- [authMiddleware.js:1-33](file://backend/middleware/authMiddleware.js#L1-L33)

## Performance Considerations
- **Automatic token refresh** eliminates manual token expiration handling and reduces authentication overhead.
- **Real-time state synchronization** through onAuthStateChanged listener provides immediate UI updates without polling.
- **Firebase SDK optimization** leverages native token caching and refresh mechanisms for optimal performance.
- **Minimal re-renders** through efficient state updates and selective component re-rendering.
- **Automatic cleanup** through Firebase SDK's built-in cleanup mechanisms reduces memory leaks.
- **Efficient backend verification** through Firebase Admin SDK's optimized token verification process.
- **Reduced localStorage operations** by relying on Firebase auth state instead of manual token persistence.

## Troubleshooting Guide
Common issues and resolutions with Firebase Authentication integration:

### Firebase Authentication Issues
- **Firebase SDK initialization errors**:
  - **Symptom**: Firebase SDK fails to initialize or authentication methods don't work.
  - **Root cause**: Incorrect Firebase configuration or missing environment variables.
  - **Resolution**: Verify Firebase configuration object and ensure all required fields are present.
  - **References**: [firebase.js:5-13](file://frontend/src/config/firebase.js#L5-L13)

- **Google login popup blocked**:
  - **Symptom**: Google OAuth popup is blocked by browser or login fails silently.
  - **Root cause**: Popup blocking by browser security policies.
  - **Resolution**: Ensure login is triggered by direct user interaction and check browser popup settings.
  - **References**: [Login.jsx:30-47](file://frontend/src/pages/Login.jsx#L30-L47)

- **Firebase ID token verification failures**:
  - **Symptom**: Backend rejects Firebase ID tokens with verification errors.
  - **Root cause**: Expired tokens, invalid token format, or Firebase Admin SDK configuration issues.
  - **Resolution**: Check Firebase Admin SDK initialization, verify token validity, and ensure proper error handling.
  - **References**: [authController.js:13-14](file://backend/controllers/authController.js#L13-L14), [authMiddleware.js:14](file://backend/middleware/authMiddleware.js#L14)

### Authentication State Issues
- **Stale authentication state**:
  - **Symptom**: UI shows incorrect authentication state or user data is outdated.
  - **Root cause**: Missing onAuthStateChanged listener or improper state cleanup.
  - **Resolution**: Ensure onAuthStateChanged listener is active and properly cleaned up on component unmount.
  - **References**: [AuthContext.jsx:37-47](file://frontend/src/context/AuthContext.jsx#L37-L47)

- **User not found after authentication**:
  - **Symptom**: User authenticates successfully but backend returns "User not found".
  - **Root cause**: User synchronization issues between Firebase and backend databases.
  - **Resolution**: Check user creation logic in backend controller and ensure proper user linking.
  - **References**: [authController.js:20-44](file://backend/controllers/authController.js#L20-L44)

### Token Management Issues
- **Missing Authorization header**:
  - **Symptom**: Protected routes return 401 Unauthorized despite being logged in.
  - **Resolution**: Verify Firebase auth.currentUser is available and getIdToken() is working correctly.
  - **References**: [axios.js:9-16](file://frontend/src/api/axios.js#L9-L16)

- **Token refresh not working**:
  - **Symptom**: Tokens expire prematurely or require manual refresh.
  - **Resolution**: Firebase SDK handles automatic token refresh; check for proper auth state synchronization.
  - **References**: [AuthContext.jsx:37-47](file://frontend/src/context/AuthContext.jsx#L37-L47)

### Provider and Hook Issues
- **useAuth undefined errors**:
  - **Symptom**: Components throw "Cannot read property 'useAuth' of undefined" errors.
  - **Root cause**: Missing AuthProvider wrapper or incorrect import/export.
  - **Resolution**: Ensure AuthProvider wraps the App component and useAuth is exported/imported correctly.
  - **References**: [main.jsx:9](file://frontend/src/main.jsx#L9), [AuthContext.jsx:85](file://frontend/src/context/AuthContext.jsx#L85)

- **Authentication state not persisting across reloads**:
  - **Symptom**: User loses authentication after page refresh.
  - **Resolution**: Firebase handles persistence automatically; check onAuthStateChanged listener setup.
  - **References**: [AuthContext.jsx:31-48](file://frontend/src/context/AuthContext.jsx#L31-L48)

**Section sources**
- [main.jsx:1-14](file://frontend/src/main.jsx#L1-L14)
- [AuthContext.jsx:1-86](file://frontend/src/context/AuthContext.jsx#L1-L86)
- [firebase.js:1-67](file://frontend/src/config/firebase.js#L1-L67)
- [authController.js:1-69](file://backend/controllers/authController.js#L1-L69)
- [authMiddleware.js:1-33](file://backend/middleware/authMiddleware.js#L1-L33)
- [axios.js:1-29](file://frontend/src/api/axios.js#L1-L29)
- [Login.jsx:1-133](file://frontend/src/pages/Login.jsx#L1-L133)

## Conclusion
The frontend authentication state management now leverages Firebase Authentication for comprehensive, secure, and scalable user authentication. The enhanced implementation eliminates manual token management through automatic Firebase ID token handling, real-time state synchronization, and seamless integration with backend Firebase Admin SDK verification. The system provides robust authentication flow with automatic token refresh, comprehensive error handling, and seamless user experience across all components. The Firebase-first approach ensures optimal performance, security, and maintainability while providing developers with a clean, modern authentication solution.