# Product Model

<cite>
**Referenced Files in This Document**
- [Product.js](file://backend/models/Product.js)
- [productController.js](file://backend/controllers/productController.js)
- [productRoutes.js](file://backend/routes/productRoutes.js)
- [uploadMiddleware.js](file://backend/middleware/uploadMiddleware.js)
- [cloudinary.js](file://backend/config/cloudinary.js)
- [authMiddleware.js](file://backend/middleware/authMiddleware.js)
- [server.js](file://backend/server.js)
- [ProductCard.jsx](file://frontend/src/components/ProductCard.jsx)
- [ProductDetails.jsx](file://frontend/src/pages/ProductDetails.jsx)
- [ProductsManagement.jsx](file://frontend/src/components/admin/ProductsManagement.jsx)
- [Cart.js](file://backend/models/Cart.js)
- [cartController.js](file://backend/controllers/cartController.js)
</cite>

## Update Summary
**Changes Made**
- Updated Product model schema to include new originalPrice field for MRP support
- Enhanced frontend components to display MRP and discount calculations
- Updated admin interface to support MRP entry during product creation
- Added discount percentage calculation logic in frontend components

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
This document provides comprehensive data model documentation for the Product model used in the ecommerce application. It covers the schema definition, validation rules, pricing and inventory constraints, category associations, media references, and the end-to-end workflows for product creation, updates, retrieval, and deletion. The model now includes MRP (Maximum Retail Price) support through the optional originalPrice field, maintaining backward compatibility for existing products while enabling discount display functionality.

## Project Structure
The Product model and its related functionality span the backend (Mongoose model, controller, routes, middleware) and the frontend (UI components that render product cards, details, and admin management). The server serves static uploaded images and exposes REST endpoints for product management.

```mermaid
graph TB
subgraph "Backend"
M["Product Model<br/>backend/models/Product.js"]
C["Product Controller<br/>backend/controllers/productController.js"]
R["Product Routes<br/>backend/routes/productRoutes.js"]
U["Upload Middleware<br/>backend/middleware/uploadMiddleware.js"]
S["Server<br/>backend/server.js"]
A["Auth Middleware<br/>backend/middleware/authMiddleware.js"]
CL["Cloudinary Config<br/>backend/config/cloudinary.js"]
end
subgraph "Frontend"
PC["ProductCard.jsx<br/>frontend/src/components/ProductCard.jsx"]
PD["ProductDetails.jsx<br/>frontend/src/pages/ProductDetails.jsx"]
PM["ProductsManagement.jsx<br/>frontend/src/components/admin/ProductsManagement.jsx"]
end
S --> R
R --> C
C --> M
C --> U
C --> A
S --> PC
S --> PD
S --> PM
U -. optional .-> CL
```

**Diagram sources**
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)
- [productController.js:1-137](file://backend/controllers/productController.js#L1-L137)
- [productRoutes.js:1-23](file://backend/routes/productRoutes.js#L1-L23)
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)
- [server.js:1-102](file://backend/server.js#L1-L102)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [cloudinary.js:1-13](file://backend/config/cloudinary.js#L1-L13)
- [ProductCard.jsx:1-125](file://frontend/src/components/ProductCard.jsx#L1-L125)
- [ProductDetails.jsx:1-205](file://frontend/src/pages/ProductDetails.jsx#L1-L205)
- [ProductsManagement.jsx:200-235](file://frontend/src/components/admin/ProductsManagement.jsx#L200-L235)

**Section sources**
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)
- [productController.js:1-137](file://backend/controllers/productController.js#L1-L137)
- [productRoutes.js:1-23](file://backend/routes/productRoutes.js#L1-L23)
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)
- [server.js:1-102](file://backend/server.js#L1-L102)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [cloudinary.js:1-13](file://backend/config/cloudinary.js#L1-L13)
- [ProductCard.jsx:1-125](file://frontend/src/components/ProductCard.jsx#L1-L125)
- [ProductDetails.jsx:1-205](file://frontend/src/pages/ProductDetails.jsx#L1-L205)
- [ProductsManagement.jsx:200-235](file://frontend/src/components/admin/ProductsManagement.jsx#L200-L235)

## Core Components
This section defines the Product data model and its validation rules, along with the business constraints enforced during product operations. The model now includes MRP (Maximum Retail Price) support through the optional originalPrice field.

- Schema Fields and Types
  - name: String, required
  - description: String, required
  - price: Number, required (Selling price)
  - originalPrice: Number, optional (MRP - Maximum Retail Price)
  - images: Array of String URLs
  - category: String, required
  - stock: Number, required, default 0
  - timestamps: createdAt, updatedAt (automatically managed)

- Validation Rules
  - All fields marked required must be present on create/update.
  - Price must be a positive number (enforced by type and application logic).
  - originalPrice is optional and should be greater than or equal to price when provided.
  - Stock must be a non-negative integer (enforced by type and application logic).
  - Images array is validated by the upload middleware to allow only specific MIME types and file size limits.

- Business Constraints
  - Maximum of 3 images per product during updates.
  - Search filters support category and free-text search across name and description.
  - Pagination is supported via page and limit query parameters.
  - Sorting defaults to newest-first by creation date.
  - Discount calculation requires originalPrice > price for display.

**Updated** Added originalPrice field for MRP support with optional validation

**Section sources**
- [Product.js:3-11](file://backend/models/Product.js#L3-L11)
- [productController.js:4-37](file://backend/controllers/productController.js#L4-L37)
- [uploadMiddleware.js:14-28](file://backend/middleware/uploadMiddleware.js#L14-L28)
- [productController.js:75-113](file://backend/controllers/productController.js#L75-L113)

## Architecture Overview
The Product domain integrates with the server's routing, authentication, and file upload middleware. The controller orchestrates product operations, while the model persists data to MongoDB. The frontend renders product listings and details using the backend APIs, with enhanced MRP and discount display capabilities.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant SRV as "Server"
participant RT as "Product Routes"
participant CTRL as "Product Controller"
participant MDL as "Product Model"
participant FS as "Local Storage"
FE->>SRV : GET /api/products?page&limit&search&category
SRV->>RT : Route match
RT->>CTRL : getProducts()
CTRL->>MDL : Find with filters, sort, paginate
MDL-->>CTRL : Products + count
CTRL-->>SRV : JSON response
SRV-->>FE : Paginated product list with MRP display
FE->>SRV : POST /api/products (admin)
SRV->>RT : Route match
RT->>CTRL : createProduct()
CTRL->>FS : Save uploaded files
CTRL->>MDL : Create product with images[] and optional originalPrice
MDL-->>CTRL : Saved product
CTRL-->>SRV : 201 Created
SRV-->>FE : Product JSON with MRP and discount info
```

**Diagram sources**
- [server.js:54-63](file://backend/server.js#L54-L63)
- [productRoutes.js:14-21](file://backend/routes/productRoutes.js#L14-L21)
- [productController.js:3-37](file://backend/controllers/productController.js#L3-L37)
- [productController.js:51-83](file://backend/controllers/productController.js#L51-L83)
- [uploadMiddleware.js:4-12](file://backend/middleware/uploadMiddleware.js#L4-L12)
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)

## Detailed Component Analysis

### Product Data Model
The Product model defines the canonical schema for product records, including identification, pricing, inventory, categorization, and media references. The model now includes MRP (Maximum Retail Price) support through the optional originalPrice field.

```mermaid
erDiagram
PRODUCT {
string _id
string name
string description
number price
number originalPrice
array images
string category
number stock
datetime createdAt
datetime updatedAt
}
```

- Field Definitions
  - _id: ObjectId (auto-generated)
  - name: Product title
  - description: Product details
  - price: Unit selling price in smallest currency unit
  - originalPrice: Maximum Retail Price (optional, MRP)
  - images: List of image URLs stored locally under /uploads
  - category: Product category string
  - stock: Available quantity
  - createdAt/updatedAt: Timestamps

- Validation and Defaults
  - Required fields enforced at schema level.
  - stock defaults to 0 if omitted.
  - originalPrice is optional and should be greater than or equal to price when provided.

**Updated** Added originalPrice field for MRP support with optional validation

**Diagram sources**
- [Product.js:3-11](file://backend/models/Product.js#L3-L11)

**Section sources**
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)

### Product Controller Operations
The controller implements CRUD operations with search, filtering, pagination, and image handling. The controller now handles the optional originalPrice field during product operations.

- Retrieve Products
  - Filters: search term (case-insensitive substring match on name or description), category.
  - Sorting: newest first by createdAt.
  - Pagination: page and limit query parameters.
  - Response: products array plus pagination metadata.

- Retrieve Single Product
  - Fetch by ObjectId; 404 if not found.

- Create Product (Admin Only)
  - Authentication: JWT protected.
  - Authorization: admin role required.
  - Upload: Multer disk storage with file type and size limits.
  - Image URLs: constructed as /uploads/{filename}.
  - Validation: runValidators via Mongoose.
  - **Updated**: originalPrice field is optional and processed when provided.

- Update Product (Admin Only)
  - Merge existing images with new uploads.
  - Enforce maximum 3 images.
  - Validation: runValidators via Mongoose.
  - **Updated**: originalPrice field is optional and processed when provided.

- Delete Product (Admin Only)
  - Authentication and admin authorization required.

```mermaid
flowchart TD
Start(["Create/Update Product"]) --> CheckAuth["Verify JWT and Admin Role"]
CheckAuth --> Upload["Process Uploaded Files"]
Upload --> BuildImages["Build images[] URL list"]
BuildImages --> CheckOriginalPrice{"originalPrice provided?"}
CheckOriginalPrice --> |Yes| ProcessOriginalPrice["Process originalPrice field"]
CheckOriginalPrice --> |No| SkipOriginalPrice["Skip originalPrice processing"]
ProcessOriginalPrice --> MaxImages{"Count > 3?"}
SkipOriginalPrice --> MaxImages
MaxImages --> |Yes| Slice["Limit to first 3 images"]
MaxImages --> |No| Continue["Proceed"]
Slice --> Continue
Continue --> Persist["Save to Product Model"]
Persist --> Done(["Response Sent"])
```

**Updated** Enhanced flowchart to include originalPrice processing logic

**Diagram sources**
- [productController.js:51-83](file://backend/controllers/productController.js#L51-L83)
- [productController.js:85-123](file://backend/controllers/productController.js#L85-L123)
- [uploadMiddleware.js:14-28](file://backend/middleware/uploadMiddleware.js#L14-L28)
- [authMiddleware.js:4-20](file://backend/middleware/authMiddleware.js#L4-L20)

**Section sources**
- [productController.js:3-37](file://backend/controllers/productController.js#L3-L37)
- [productController.js:39-49](file://backend/controllers/productController.js#L39-L49)
- [productController.js:51-83](file://backend/controllers/productController.js#L51-L83)
- [productController.js:85-123](file://backend/controllers/productController.js#L85-L123)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)

### Routing and Middleware
- Routes
  - GET /api/products: Public listing with search and filter.
  - GET /api/products/:id: Public single product.
  - POST /api/products: Admin-only creation with image upload.
  - PUT /api/products/:id: Admin-only update with image upload.
  - DELETE /api/products/:id: Admin-only deletion.

- Middleware
  - Authentication: JWT verification and user injection.
  - Authorization: admin role check.
  - Upload: Multer disk storage with file type and size limits.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Product Routes"
participant Auth as "Auth Middleware"
participant Upload as "Upload Middleware"
participant Controller as "Product Controller"
Client->>Router : POST /api/products
Router->>Auth : protect()
Auth-->>Router : user injected
Router->>Auth : admin()
Auth-->>Router : allowed
Router->>Upload : upload.array('images', 3)
Upload-->>Router : files parsed
Router->>Controller : createProduct()
Controller-->>Client : 201 Created with MRP support
```

**Diagram sources**
- [productRoutes.js:18-21](file://backend/routes/productRoutes.js#L18-L21)
- [authMiddleware.js:4-20](file://backend/middleware/authMiddleware.js#L4-L20)
- [uploadMiddleware.js:14-28](file://backend/middleware/uploadMiddleware.js#L14-L28)
- [productController.js:51-83](file://backend/controllers/productController.js#L51-L83)

**Section sources**
- [productRoutes.js:1-23](file://backend/routes/productRoutes.js#L1-L23)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)

### Media Handling and Storage
- Local Disk Storage
  - Destination: uploads/
  - Filename: timestamp + random + extension
  - Limits: max 5MB per file; allowed types: jpg, jpeg, png, webp
  - Serving: Static route /uploads/*
- Cloudinary Integration
  - Configured but not used for product images in current implementation.

```mermaid
flowchart TD
Req["HTTP Request with Files"] --> Multer["Multer Disk Storage"]
Multer --> Dest["uploads/destination"]
Dest --> Name["Unique filename generation"]
Name --> Serve["Serve via /uploads/*"]
Serve --> CDN["Optional CDN in front of /uploads/*"]
```

**Diagram sources**
- [uploadMiddleware.js:4-12](file://backend/middleware/uploadMiddleware.js#L4-L12)
- [server.js:54-55](file://backend/server.js#L54-L55)

**Section sources**
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)
- [server.js:54-55](file://backend/server.js#L54-L55)
- [cloudinary.js:1-13](file://backend/config/cloudinary.js#L1-L13)

### Frontend Integration
- Product Listing
  - ProductCard displays product images, name, price, and MRP with discount percentage when applicable.
  - Supports image carousel behavior via state.
  - **Updated**: Enhanced to show MRP and discount calculations when originalPrice > price.

- Product Details
  - Fetches product by ID and renders images, name, price, description, category, stock status, and MRP with discount display.
  - Integrates with cart functionality.
  - **Updated**: Enhanced to display MRP with strikethrough and discount percentage.

- Admin Management
  - ProductsManagement form includes MRP field alongside selling price.
  - **Updated**: Added optional MRP input field with proper validation.

```mermaid
sequenceDiagram
participant UI as "ProductDetails.jsx"
participant API as "Backend API"
participant Model as "Product Model"
UI->>API : GET /api/products/ : id
API->>Model : findById
Model-->>API : Product document (with originalPrice)
API-->>UI : Product JSON with MRP info
UI-->>UI : Render product details with discount display
```

**Updated** Enhanced sequence diagram to include MRP display logic

**Diagram sources**
- [ProductDetails.jsx:15-24](file://frontend/src/pages/ProductDetails.jsx#L15-L24)
- [productController.js:39-49](file://backend/controllers/productController.js#L39-L49)
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)

**Section sources**
- [ProductCard.jsx:1-125](file://frontend/src/components/ProductCard.jsx#L1-L125)
- [ProductDetails.jsx:1-205](file://frontend/src/pages/ProductDetails.jsx#L1-L205)
- [ProductsManagement.jsx:200-235](file://frontend/src/components/admin/ProductsManagement.jsx#L200-L235)
- [productController.js:39-49](file://backend/controllers/productController.js#L39-L49)

### Inventory Management Logic
- Stock Representation
  - stock is a non-negative integer; default 0.
- Availability Display
  - Frontend conditionally renders availability text and button state based on stock > 0.
- Relationship with Cart
  - Cart items reference Product via productId; quantity is tracked per user.
- **Updated**: MRP and Discount Display Logic
  - Frontend conditionally renders MRP with strikethrough and discount percentage when originalPrice > price.
  - Discount calculation: Math.round(((originalPrice - price) / originalPrice) * 100))%.

```mermaid
classDiagram
class Product {
+string name
+string description
+number price
+number originalPrice
+string[] images
+string category
+number stock
}
class CartItem {
+ObjectId productId
+number quantity
}
class Cart {
+ObjectId userId
+CartItem[] items
}
class DiscountDisplay {
+calculateDiscountPercentage(originalPrice, price)
+renderMRPWithDiscount(originalPrice, price)
}
Cart --> CartItem : "contains"
CartItem --> Product : "references"
DiscountDisplay --> Product : "uses for display"
```

**Updated** Added DiscountDisplay class to represent MRP and discount calculation logic

**Diagram sources**
- [Product.js:3-11](file://backend/models/Product.js#L3-L11)
- [Cart.js:3-9](file://backend/models/Cart.js#L3-L9)
- [ProductCard.jsx:98-108](file://frontend/src/components/ProductCard.jsx#L98-L108)
- [ProductDetails.jsx:102-109](file://frontend/src/pages/ProductDetails.jsx#L102-L109)

**Section sources**
- [Product.js:6-11](file://backend/models/Product.js#L6-L11)
- [ProductDetails.jsx:102-109](file://frontend/src/pages/ProductDetails.jsx#L102-L109)
- [ProductCard.jsx:98-108](file://frontend/src/components/ProductCard.jsx#L98-L108)
- [Cart.js:1-12](file://backend/models/Cart.js#L1-L12)
- [cartController.js:1-38](file://backend/controllers/cartController.js#L1-L38)

## Dependency Analysis
The Product domain depends on the model for persistence, the controller for orchestration, the routes for exposure, and the upload middleware for media handling. Authentication and authorization are enforced at the route layer. The server serves static files for images. The frontend components depend on the Product model for displaying MRP and discount information.

```mermaid
graph LR
Routes["productRoutes.js"] --> Controller["productController.js"]
Controller --> Model["Product.js"]
Controller --> Upload["uploadMiddleware.js"]
Routes --> Auth["authMiddleware.js"]
Server["server.js"] --> Routes
Server --> Upload
Frontend["ProductCard.jsx / ProductDetails.jsx / ProductsManagement.jsx"] --> Routes
Frontend --> Model
```

**Updated** Enhanced dependency graph to include MRP-related frontend components

**Diagram sources**
- [productRoutes.js:1-23](file://backend/routes/productRoutes.js#L1-L23)
- [productController.js:1-137](file://backend/controllers/productController.js#L1-L137)
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [server.js:54-63](file://backend/server.js#L54-L63)
- [ProductCard.jsx:1-125](file://frontend/src/components/ProductCard.jsx#L1-L125)
- [ProductDetails.jsx:1-205](file://frontend/src/pages/ProductDetails.jsx#L1-L205)
- [ProductsManagement.jsx:200-235](file://frontend/src/components/admin/ProductsManagement.jsx#L200-L235)

**Section sources**
- [productRoutes.js:1-23](file://backend/routes/productRoutes.js#L1-L23)
- [productController.js:1-137](file://backend/controllers/productController.js#L1-L137)
- [Product.js:1-13](file://backend/models/Product.js#L1-L13)
- [uploadMiddleware.js:1-30](file://backend/middleware/uploadMiddleware.js#L1-L30)
- [authMiddleware.js:1-20](file://backend/middleware/authMiddleware.js#L1-L20)
- [server.js:54-63](file://backend/server.js#L54-L63)
- [ProductCard.jsx:1-125](file://frontend/src/components/ProductCard.jsx#L1-L125)
- [ProductDetails.jsx:1-205](file://frontend/src/pages/ProductDetails.jsx#L1-L205)
- [ProductsManagement.jsx:200-235](file://frontend/src/components/admin/ProductsManagement.jsx#L200-L235)

## Performance Considerations
- Indexing
  - Consider adding an index on category for filtered queries.
  - Text indexes could improve free-text search performance on name and description.
  - **Updated**: Consider adding an index on originalPrice for MRP-based queries.
- Query Patterns
  - Use projection to limit returned fields for listing endpoints.
  - Prefer exact category matches over regex filters when possible.
  - **Updated**: Consider filtering by originalPrice presence for discount-enabled products.
- Pagination
  - Keep page and limit reasonable to avoid large skips.
- Image Delivery
  - Serve images via CDN in production for reduced latency.
- Caching
  - Implement caching for popular product lists with cache-invalidation on updates.
- **Updated**: Discount Calculation Performance
  - Frontend discount calculations are lightweight and cached in component state.
  - Consider server-side discount calculations for complex scenarios.

## Troubleshooting Guide
- Product Not Found
  - Symptom: 404 when fetching by ID.
  - Cause: Invalid ObjectId or record deleted.
  - Action: Verify ID and existence in database.
- Unauthorized Access
  - Symptom: 401 or 403 on admin routes.
  - Cause: Missing/invalid token or non-admin role.
  - Action: Ensure proper auth headers and admin privileges.
- Upload Errors
  - Symptom: Error indicating unsupported file type or size exceeded.
  - Cause: File type not in allowed list or size > 5MB.
  - Action: Confirm file MIME/type and size; adjust client-side constraints accordingly.
- Image URLs Not Loading
  - Symptom: Images show broken links.
  - Cause: Missing static route or incorrect path.
  - Action: Confirm /uploads/* static serving and correct image paths.
- **Updated**: MRP Display Issues
  - Symptom: MRP not showing despite being set.
  - Cause: originalPrice not greater than price or frontend logic issues.
  - Action: Verify originalPrice > price and check discount calculation logic.
- **Updated**: Discount Percentage Incorrect
  - Symptom: Wrong discount percentage displayed.
  - Cause: Division by zero or negative values.
  - Action: Ensure originalPrice > price and both values are positive numbers.

**Section sources**
- [productController.js:39-49](file://backend/controllers/productController.js#L39-L49)
- [authMiddleware.js:4-20](file://backend/middleware/authMiddleware.js#L4-L20)
- [uploadMiddleware.js:17-27](file://backend/middleware/uploadMiddleware.js#L17-L27)
- [server.js:54-55](file://backend/server.js#L54-L55)
- [ProductCard.jsx:98-108](file://frontend/src/components/ProductCard.jsx#L98-L108)
- [ProductDetails.jsx:102-109](file://frontend/src/pages/ProductDetails.jsx#L102-L109)

## Conclusion
The Product model provides a concise yet robust foundation for product data, enforcing essential validations and constraints. Its controller and routes implement secure, admin-protected operations with practical search, filtering, and pagination. The model now includes MRP (Maximum Retail Price) support through the optional originalPrice field, maintaining backward compatibility while enabling enhanced discount display functionality. The current implementation stores images locally and serves them statically, while Cloudinary configuration exists for potential future migration. The frontend integrates seamlessly with the backend APIs to render product listings and details with MRP and discount information, and to manage cart interactions. The addition of MRP support enhances the shopping experience by providing transparent pricing information and discount visibility.