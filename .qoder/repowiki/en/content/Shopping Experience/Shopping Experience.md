# Shopping Experience

<cite>
**Referenced Files in This Document**
- [App.jsx](file://frontend/src/App.jsx)
- [Home.jsx](file://frontend/src/pages/Home.jsx)
- [ProductDetails.jsx](file://frontend/src/pages/ProductDetails.jsx)
- [Cart.jsx](file://frontend/src/pages/Cart.jsx)
- [Checkout.jsx](file://frontend/src/pages/Checkout.jsx)
- [OrderConfirmation.jsx](file://frontend/src/pages/OrderConfirmation.jsx)
- [ProductCard.jsx](file://frontend/src/components/ProductCard.jsx)
- [ImageCarousel.jsx](file://frontend/src/components/ImageCarousel.jsx)
- [BannerSlider.jsx](file://frontend/src/components/BannerSlider.jsx)
- [ManualUPI.jsx](file://frontend/src/components/ManualUPI.jsx)
- [axios.js](file://frontend/src/api/axios.js)
- [imageHelper.js](file://frontend/src/utils/imageHelper.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Accessibility and UX](#accessibility-and-ux)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
This document explains the complete customer shopping experience in the e-commerce application, covering the end-to-end journey from browsing products to order confirmation. It documents the Home page with product listings, category filtering, and promotional banners; the ProductDetails page for item presentation and adding to cart; the Cart page for managing items and initiating checkout; the Checkout process including shipping, payment selection, and order review; and the OrderConfirmation page for purchase completion. It also describes the ProductCard component for consistent product presentation and outlines user experience, responsive design, and accessibility considerations.

## Project Structure
The frontend is organized by pages and shared components:
- Pages: Home, ProductDetails, Cart, Checkout, OrderConfirmation, Login, Register, AdminDashboard
- Shared components: ProductCard, ImageCarousel, BannerSlider, ManualUPI, Footer, Navbar
- Services and utilities: axios client, image helper
- Routing and layout: App sets up routes and navigation

```mermaid
graph TB
subgraph "Routing Layer"
APP["App.jsx"]
end
subgraph "Pages"
HOME["Home.jsx"]
PDP["ProductDetails.jsx"]
CART["Cart.jsx"]
CHECKOUT["Checkout.jsx"]
CONFIRM["OrderConfirmation.jsx"]
end
subgraph "Shared Components"
PCARD["ProductCard.jsx"]
CAROUSEL["ImageCarousel.jsx"]
BANNER["BannerSlider.jsx"]
UPI["ManualUPI.jsx"]
end
subgraph "Services"
AXIOS["axios.js"]
IMGHELP["imageHelper.js"]
end
APP --> HOME
APP --> PDP
APP --> CART
APP --> CHECKOUT
APP --> CONFIRM
HOME --> BANNER
HOME --> CAROUSEL
HOME --> PDP
PDP --> CAROUSEL
CART --> CAROUSEL
CHECKOUT --> UPI
HOME --> AXIOS
PDP --> AXIOS
CART --> AXIOS
CHECKOUT --> AXIOS
CONFIRM --> APP
CAROUSEL --> IMGHELP
```

**Diagram sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)
- [Home.jsx:1-108](file://frontend/src/pages/Home.jsx#L1-L108)
- [ProductDetails.jsx:1-80](file://frontend/src/pages/ProductDetails.jsx#L1-L80)
- [Cart.jsx:1-152](file://frontend/src/pages/Cart.jsx#L1-L152)
- [Checkout.jsx:1-301](file://frontend/src/pages/Checkout.jsx#L1-L301)
- [OrderConfirmation.jsx:1-73](file://frontend/src/pages/OrderConfirmation.jsx#L1-L73)
- [ProductCard.jsx:1-28](file://frontend/src/components/ProductCard.jsx#L1-L28)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)
- [BannerSlider.jsx:1-153](file://frontend/src/components/BannerSlider.jsx#L1-L153)
- [ManualUPI.jsx:1-125](file://frontend/src/components/ManualUPI.jsx#L1-L125)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [imageHelper.js:1-5](file://frontend/src/utils/imageHelper.js#L1-L5)

**Section sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)

## Core Components
- ProductCard: Reusable card for product preview with image carousel, name, price, and action buttons.
- ImageCarousel: Generic image viewer with navigation and indicators.
- BannerSlider: Promotional banner carousel with auto-play and manual controls.
- ManualUPI: UPI payment component for manual UPI transactions with QR and transaction ID capture.
- Axios client: Centralized HTTP client with auth token injection and 401 handling.

**Section sources**
- [ProductCard.jsx:1-28](file://frontend/src/components/ProductCard.jsx#L1-L28)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)
- [BannerSlider.jsx:1-153](file://frontend/src/components/BannerSlider.jsx#L1-L153)
- [ManualUPI.jsx:1-125](file://frontend/src/components/ManualUPI.jsx#L1-L125)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)

## Architecture Overview
The customer journey is routed through React components that communicate with the backend via a centralized axios client. Authentication tokens are stored in localStorage and automatically attached to requests. The UI is responsive and uses Tailwind classes for consistent styling.

```mermaid
sequenceDiagram
participant C as "Customer"
participant R as "React Router"
participant H as "Home.jsx"
participant P as "ProductDetails.jsx"
participant CR as "Cart.jsx"
participant CH as "Checkout.jsx"
participant API as "axios.js"
participant B as "Backend API"
C->>R : Navigate to "/"
R->>H : Render Home
H->>API : GET /products
API->>B : Fetch products
B-->>API : Products[]
API-->>H : Products[]
H-->>C : Display product cards and banners
C->>R : Click "View Details" on a product
R->>P : Render ProductDetails
P->>API : GET /products/ : id
API->>B : Fetch product
B-->>API : Product
API-->>P : Product
P-->>C : Show product details
C->>P : Click "Add to Cart"
P->>API : POST /cart/add
API->>B : Add to cart
B-->>API : OK
API-->>P : OK
P-->>C : Toast "Added to cart"
C->>R : Navigate to "/cart"
R->>CR : Render Cart
CR->>API : GET /cart
API->>B : Fetch cart
B-->>API : Cart
API-->>CR : Cart
CR-->>C : Show items and summary
C->>CR : Click "Proceed to Checkout"
CR->>CH : Navigate with shipping info
R->>CH : Render Checkout
CH->>API : GET /cart (reconfirm)
API->>B : Fetch cart
B-->>API : Cart
API-->>CH : Cart
CH-->>C : Show shipping and payment options
C->>CH : Submit address and select payment
CH->>API : Create order (COD/Razorpay/UPI)
API->>B : Create order
B-->>API : Order
API-->>CH : Order
CH-->>R : Navigate to "/order-confirmation"
R->>CONF : Render OrderConfirmation
CONF-->>C : Show order details
```

**Diagram sources**
- [App.jsx:48-57](file://frontend/src/App.jsx#L48-L57)
- [Home.jsx:19-37](file://frontend/src/pages/Home.jsx#L19-L37)
- [ProductDetails.jsx:15-33](file://frontend/src/pages/ProductDetails.jsx#L15-L33)
- [Cart.jsx:17-26](file://frontend/src/pages/Cart.jsx#L17-L26)
- [Checkout.jsx:33-43](file://frontend/src/pages/Checkout.jsx#L33-L43)
- [OrderConfirmation.jsx:3-14](file://frontend/src/pages/OrderConfirmation.jsx#L3-L14)
- [axios.js:4-16](file://frontend/src/api/axios.js#L4-L16)

## Detailed Component Analysis

### Home Page: Product Browsing, Filtering, and Promotions
Key behaviors:
- Loads products on mount and displays a loading state while fetching.
- Provides a search bar to filter by product name or description.
- Supports category filtering with a horizontal scrollable category bar.
- Renders product cards with images, pricing, and action buttons.
- Integrates a promotional BannerSlider at the top.

User flow highlights:
- Search updates filtered results instantly.
- Category selection narrows results dynamically.
- “Add to Cart” triggers a cart add API call and shows a toast/alert.
- “View Details” navigates to the product’s detail page.

```mermaid
flowchart TD
Start(["Home mounted"]) --> Load["Fetch products"]
Load --> Done{"Products loaded?"}
Done --> |No| Loading["Show loading message"]
Done --> |Yes| Render["Render banners and filters"]
Render --> Search["User types in search box"]
Search --> Filter["Filter by name/description"]
Render --> Category["User selects category"]
Category --> FilterCat["Filter by category"]
Filter --> Cards["Render product cards"]
FilterCat --> Cards
Cards --> AddToCart["Click 'Add to Cart'"]
AddToCart --> APIAdd["POST /cart/add"]
APIAdd --> Alert["Show success or login prompt"]
Cards --> ViewDetails["Click 'View Details'"]
ViewDetails --> NavigatePDP["Navigate to ProductDetails"]
```

**Diagram sources**
- [Home.jsx:15-44](file://frontend/src/pages/Home.jsx#L15-L44)
- [Home.jsx:30-37](file://frontend/src/pages/Home.jsx#L30-L37)
- [BannerSlider.jsx:31-62](file://frontend/src/components/BannerSlider.jsx#L31-L62)

**Section sources**
- [Home.jsx:1-108](file://frontend/src/pages/Home.jsx#L1-L108)
- [BannerSlider.jsx:1-153](file://frontend/src/components/BannerSlider.jsx#L1-L153)

### ProductDetails Page: Item Presentation and Add-to-Cart
Key behaviors:
- Loads a single product by ID and shows loading/error states.
- Displays product images via ImageCarousel, pricing, availability, and description.
- Adds the product to the cart with a single quantity.
- Disables the add button when out of stock.

```mermaid
sequenceDiagram
participant U as "User"
participant PD as "ProductDetails.jsx"
participant API as "axios.js"
participant BE as "Backend"
U->>PD : Open product detail
PD->>API : GET /products/ : id
API->>BE : Fetch product
BE-->>API : Product
API-->>PD : Product
PD-->>U : Render product details
U->>PD : Click "Add to Cart"
PD->>API : POST /cart/add {productId, quantity : 1}
API->>BE : Add to cart
BE-->>API : OK
API-->>PD : OK
PD-->>U : Toast "Added to cart"
```

**Diagram sources**
- [ProductDetails.jsx:11-33](file://frontend/src/pages/ProductDetails.jsx#L11-L33)
- [ImageCarousel.jsx:4-23](file://frontend/src/components/ImageCarousel.jsx#L4-L23)
- [axios.js:4-16](file://frontend/src/api/axios.js#L4-L16)

**Section sources**
- [ProductDetails.jsx:1-80](file://frontend/src/pages/ProductDetails.jsx#L1-L80)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)

### Cart Page: Item Management and Checkout Initiation
Key behaviors:
- Loads the current cart and computes subtotal and total.
- Allows entering a pincode to calculate shipping charges.
- Displays each cart item with image and quantity.
- Enables proceeding to checkout with pre-filled shipping info.

```mermaid
flowchart TD
Enter(["Open Cart"]) --> LoadCart["GET /cart"]
LoadCart --> Items{"Cart has items?"}
Items --> |No| Empty["Show empty cart message"]
Items --> |Yes| List["List items"]
List --> Pincode["Enter pincode"]
Pincode --> Calc["POST /shipping/calculate"]
Calc --> Shipping["Show shipping info"]
Shipping --> Summary["Compute totals"]
Summary --> Proceed["Navigate to Checkout with state"]
```

**Diagram sources**
- [Cart.jsx:13-53](file://frontend/src/pages/Cart.jsx#L13-L53)
- [Cart.jsx:66-149](file://frontend/src/pages/Cart.jsx#L66-L149)

**Section sources**
- [Cart.jsx:1-152](file://frontend/src/pages/Cart.jsx#L1-L152)

### Checkout: Shipping, Payment, and Order Review
Key behaviors:
- Validates user authentication and loads cart.
- Receives shipping info from the Cart page and displays it.
- Supports three payment methods:
  - Cash on Delivery (COD): Places order immediately.
  - Online Payment (Razorpay): Opens Razorpay checkout and verifies payment server-side.
  - Direct UPI: Uses ManualUPI component to collect transaction ID and places order with pending verification.
- Validates required address fields and enforces phone length.

```mermaid
sequenceDiagram
participant U as "User"
participant CH as "Checkout.jsx"
participant API as "axios.js"
participant RP as "Razorpay SDK"
participant BE as "Backend"
U->>CH : Open checkout with shipping info
CH->>API : GET /cart
API->>BE : Fetch cart
BE-->>API : Cart
API-->>CH : Cart
U->>CH : Fill address and select payment
alt COD
CH->>API : POST /orders/create {cod}
API->>BE : Create order
BE-->>API : Order
API-->>CH : Order
CH-->>U : Navigate to OrderConfirmation
else Online (Razorpay)
CH->>API : POST /orders/razorpay/order {amount}
API->>BE : Create order
BE-->>API : {orderId, amount}
API-->>CH : {orderId, amount}
CH->>RP : Open checkout
RP-->>CH : Payment response
CH->>API : POST /orders/razorpay/verify
API->>BE : Verify payment
BE-->>API : Verified
API-->>CH : Verified
CH->>API : POST /orders/create {razorpay}
API->>BE : Create order
BE-->>API : Order
API-->>CH : Order
CH-->>U : Navigate to OrderConfirmation
else Direct UPI
CH->>U : Show ManualUPI
U->>CH : Enter transaction ID
CH->>API : POST /orders/create {upi, pending}
API->>BE : Create order
BE-->>API : Order
API-->>CH : Order
CH-->>U : Navigate to OrderConfirmation
end
```

**Diagram sources**
- [Checkout.jsx:22-43](file://frontend/src/pages/Checkout.jsx#L22-L43)
- [Checkout.jsx:67-86](file://frontend/src/pages/Checkout.jsx#L67-L86)
- [Checkout.jsx:88-137](file://frontend/src/pages/Checkout.jsx#L88-L137)
- [Checkout.jsx:139-165](file://frontend/src/pages/Checkout.jsx#L139-L165)
- [ManualUPI.jsx:19-25](file://frontend/src/components/ManualUPI.jsx#L19-L25)

**Section sources**
- [Checkout.jsx:1-301](file://frontend/src/pages/Checkout.jsx#L1-L301)
- [ManualUPI.jsx:1-125](file://frontend/src/components/ManualUPI.jsx#L1-L125)

### OrderConfirmation: Purchase Completion
Key behaviors:
- Receives order data from the previous page via location state.
- Displays order ID, total amount, payment status, and shipping address.
- Provides navigation to continue shopping or view orders.

```mermaid
flowchart TD
Start(["Open OrderConfirmation"]) --> State{"Has order state?"}
State --> |No| NotFound["Show 'Order Not Found'"]
State --> |Yes| Render["Display order details and shipping address"]
Render --> Actions["Provide 'Continue Shopping' and 'View Orders'"]
```

**Diagram sources**
- [OrderConfirmation.jsx:3-14](file://frontend/src/pages/OrderConfirmation.jsx#L3-L14)
- [OrderConfirmation.jsx:16-72](file://frontend/src/pages/OrderConfirmation.jsx#L16-L72)

**Section sources**
- [OrderConfirmation.jsx:1-73](file://frontend/src/pages/OrderConfirmation.jsx#L1-L73)

### ProductCard Component: Consistent Product Presentation
Key behaviors:
- Displays a product preview with an image carousel and hover dots.
- Provides “Details” and “Add to Cart” actions.
- Uses a shared ImageCarousel component for consistent image handling.

```mermaid
classDiagram
class ProductCard {
+product : Object
+render()
}
class ImageCarousel {
+images : Array
+alt : String
+height : String
+render()
}
ProductCard --> ImageCarousel : "uses"
```

**Diagram sources**
- [ProductCard.jsx:4-27](file://frontend/src/components/ProductCard.jsx#L4-L27)
- [ImageCarousel.jsx:4-53](file://frontend/src/components/ImageCarousel.jsx#L4-L53)

**Section sources**
- [ProductCard.jsx:1-28](file://frontend/src/components/ProductCard.jsx#L1-L28)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)

## Dependency Analysis
- Routing and layout: App defines routes and navigation.
- Pages depend on the axios client for API communication.
- Components share ImageCarousel and imageHelper for image rendering.
- Checkout integrates ManualUPI and Razorpay SDK for payments.

```mermaid
graph LR
APP["App.jsx"] --> ROUTES["Routes"]
ROUTES --> HOME["Home.jsx"]
ROUTES --> PDP["ProductDetails.jsx"]
ROUTES --> CART["Cart.jsx"]
ROUTES --> CHECKOUT["Checkout.jsx"]
ROUTES --> CONF["OrderConfirmation.jsx"]
HOME --> AXIOS["axios.js"]
PDP --> AXIOS
CART --> AXIOS
CHECKOUT --> AXIOS
HOME --> BANNER["BannerSlider.jsx"]
HOME --> CAROUSEL["ImageCarousel.jsx"]
PDP --> CAROUSEL
CART --> CAROUSEL
CHECKOUT --> UPI["ManualUPI.jsx"]
CAROUSEL --> IMGHELP["imageHelper.js"]
```

**Diagram sources**
- [App.jsx:48-57](file://frontend/src/App.jsx#L48-L57)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [imageHelper.js:1-5](file://frontend/src/utils/imageHelper.js#L1-L5)

**Section sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [imageHelper.js:1-5](file://frontend/src/utils/imageHelper.js#L1-L5)

## Performance Considerations
- Minimize re-renders by keeping product lists and cart state local to their pages.
- Debounce search input if the backend supports it to reduce API calls.
- Lazy-load images and banners to improve initial render performance.
- Cache shipping calculations per session to avoid repeated network requests.
- Use skeleton loaders during fetches for perceived performance.

## Accessibility and UX
- Keyboard navigation: Ensure focus styles and tab order are logical across forms and buttons.
- Screen reader support: Use aria-labels for carousel navigation and buttons.
- Color contrast: Maintain sufficient contrast for text and interactive elements.
- Responsive breakpoints: Tailwind utilities ensure mobile-first layouts; verify touch targets are adequately sized.
- Form validation feedback: Provide inline, visible error messages for address and payment steps.
- Clear CTAs: Use descriptive labels like “Add to Cart,” “Proceed to Checkout,” and “Place Order.”

## Troubleshooting Guide
Common issues and remedies:
- Authentication errors: Unauthorized requests remove the token; redirect to login and show a toast.
- Empty cart scenarios: Cart page shows a friendly message and a link to continue shopping.
- Invalid pincode: Enforce 6-digit input and show an error if invalid.
- Payment failures: Display user-friendly messages and allow retry or alternate payment method.
- UPI QR generation failures: Fallback to copying UPI ID and provide a WhatsApp help link.

**Section sources**
- [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)
- [Cart.jsx:35-53](file://frontend/src/pages/Cart.jsx#L35-L53)
- [Checkout.jsx:167-177](file://frontend/src/pages/Checkout.jsx#L167-L177)
- [ManualUPI.jsx:67-78](file://frontend/src/components/ManualUPI.jsx#L67-L78)

## Conclusion
The e-commerce application delivers a cohesive shopping experience from browsing to confirmation. The Home page offers discovery with search and category filters, ProductDetails provides rich item information, Cart streamlines item management and shipping estimation, Checkout supports secure and flexible payment methods, and OrderConfirmation closes the loop with clear order details. Shared components like ImageCarousel and BannerSlider ensure consistent visuals, while the centralized axios client simplifies API interactions and authentication handling.