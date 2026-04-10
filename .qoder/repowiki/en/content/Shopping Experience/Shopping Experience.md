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
- [shippingRoutes.js](file://backend/routes/shippingRoutes.js)
- [deliveryController.js](file://backend/controllers/deliveryController.js)
- [shipping.js](file://backend/config/shipping.js)
- [server.js](file://backend/server.js)
</cite>

## Update Summary
**Changes Made**
- Updated Cart page section to reflect new `/shipping/check/{pincode}` endpoint implementation
- Added detailed explanation of enhanced shipping calculation system with shipping zones
- Updated Checkout page section to document improved shipping information handling
- Enhanced troubleshooting guide with shipping-related error handling
- Added new shipping configuration and controller documentation

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
This document explains the complete customer shopping experience in the e-commerce application, covering the end-to-end journey from browsing products to order confirmation. It documents the Home page with product listings, category filtering, and promotional banners; the ProductDetails page for item presentation and adding to cart; the Cart page for managing items and initiating checkout with enhanced shipping calculation; the Checkout process including shipping, payment selection, and order review; and the OrderConfirmation page for purchase completion. It also describes the ProductCard component for consistent product presentation and outlines user experience, responsive design, and accessibility considerations.

## Project Structure
The frontend is organized by pages and shared components:
- Pages: Home, ProductDetails, Cart, Checkout, OrderConfirmation, Login, Register, AdminDashboard
- Shared components: ProductCard, ImageCarousel, BannerSlider, ManualUPI, Footer, Navbar
- Services and utilities: axios client, image helper
- Routing and layout: App sets up routes and navigation
- Backend shipping system: Dedicated shipping routes and controllers

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
subgraph "Backend Shipping System"
SHIPROUTES["shippingRoutes.js"]
DELIVERYCTRL["deliveryController.js"]
SHIPCONFIG["shipping.js"]
SERVER["server.js"]
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
CART --> SHIPROUTES
CHECKOUT --> SHIPROUTES
SHIPROUTES --> DELIVERYCTRL
DELIVERYCTRL --> SHIPCONFIG
SERVER --> SHIPROUTES
CAROUSEL --> IMGHELP
```

**Diagram sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)
- [Home.jsx:1-108](file://frontend/src/pages/Home.jsx#L1-L108)
- [ProductDetails.jsx:1-80](file://frontend/src/pages/ProductDetails.jsx#L1-L80)
- [Cart.jsx:1-161](file://frontend/src/pages/Cart.jsx#L1-L161)
- [Checkout.jsx:1-301](file://frontend/src/pages/Checkout.jsx#L1-L301)
- [OrderConfirmation.jsx:1-73](file://frontend/src/pages/OrderConfirmation.jsx#L1-L73)
- [ProductCard.jsx:1-28](file://frontend/src/components/ProductCard.jsx#L1-L28)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)
- [BannerSlider.jsx:1-153](file://frontend/src/components/BannerSlider.jsx#L1-L153)
- [ManualUPI.jsx:1-125](file://frontend/src/components/ManualUPI.jsx#L1-L125)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [imageHelper.js:1-5](file://frontend/src/utils/imageHelper.js#L1-L5)
- [shippingRoutes.js:1-12](file://backend/routes/shippingRoutes.js#L1-L12)
- [deliveryController.js:1-118](file://backend/controllers/deliveryController.js#L1-L118)
- [shipping.js:1-73](file://backend/config/shipping.js#L1-L73)
- [server.js:64](file://backend/server.js#L64)

**Section sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)

## Core Components
- ProductCard: Reusable card for product preview with image carousel, name, price, and action buttons.
- ImageCarousel: Generic image viewer with navigation and indicators.
- BannerSlider: Promotional banner carousel with auto-play and manual controls.
- ManualUPI: UPI payment component for manual UPI transactions with QR and transaction ID capture.
- Axios client: Centralized HTTP client with auth token injection and 401 handling.
- **Enhanced Shipping System**: Dedicated shipping routes, controllers, and configuration for comprehensive delivery calculation.

**Section sources**
- [ProductCard.jsx:1-28](file://frontend/src/components/ProductCard.jsx#L1-L28)
- [ImageCarousel.jsx:1-54](file://frontend/src/components/ImageCarousel.jsx#L1-L54)
- [BannerSlider.jsx:1-153](file://frontend/src/components/BannerSlider.jsx#L1-L153)
- [ManualUPI.jsx:1-125](file://frontend/src/components/ManualUPI.jsx#L1-L125)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [shippingRoutes.js:1-12](file://backend/routes/shippingRoutes.js#L1-L12)
- [deliveryController.js:1-118](file://backend/controllers/deliveryController.js#L1-L118)
- [shipping.js:1-73](file://backend/config/shipping.js#L1-L73)

## Architecture Overview
The customer journey is routed through React components that communicate with the backend via a centralized axios client. Authentication tokens are stored in localStorage and automatically attached to requests. The UI is responsive and uses Tailwind classes for consistent styling. The enhanced shipping system provides real-time delivery availability checking with comprehensive zone-based pricing and free shipping thresholds.

```mermaid
sequenceDiagram
participant C as "Customer"
participant R as "React Router"
participant H as "Home.jsx"
participant P as "ProductDetails.jsx"
participant CR as "Cart.jsx"
participant API as "axios.js"
participant SR as "shippingRoutes.js"
participant DC as "deliveryController.js"
participant CH as "Checkout.jsx"
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
C->>CR : Enter pincode and click "Check"
CR->>API : GET /shipping/check/ : pincode
API->>SR : Route request
SR->>DC : Call checkDelivery
DC->>DC : Validate pincode format
DC->>DC : Calculate shipping charges
DC->>DC : Check free shipping eligibility
DC-->>API : Shipping info {available, charge, message}
API-->>CR : Shipping info
CR-->>C : Show delivery availability and costs
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
- [Cart.jsx:35-62](file://frontend/src/pages/Cart.jsx#L35-L62)
- [shippingRoutes.js:7](file://backend/routes/shippingRoutes.js#L7)
- [deliveryController.js:2](file://backend/controllers/deliveryController.js#L2)
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
- "Add to Cart" triggers a cart add API call and shows a toast/alert.
- "View Details" navigates to the product's detail page.

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

### Cart Page: Item Management and Enhanced Shipping Calculation
**Updated** Enhanced with comprehensive shipping calculation system featuring real-time delivery checking and zone-based pricing.

Key behaviors:
- Loads the current cart and computes subtotal and total.
- **New**: Allows entering a pincode to check delivery availability via `/shipping/check/{pincode}` endpoint.
- **Enhanced**: Displays shipping information with free shipping eligibility, delivery estimates, and zone details.
- **Improved**: Real-time shipping cost calculation with different thresholds for various shipping zones.
- **Better UX**: Visual feedback for free shipping eligibility with green indicators.
- Enables proceeding to checkout with pre-filled shipping info.

```mermaid
flowchart TD
Enter(["Open Cart"]) --> LoadCart["GET /cart"]
LoadCart --> Items{"Cart has items?"}
Items --> |No| Empty["Show empty cart message"]
Items --> |Yes| List["List items"]
List --> Pincode["Enter pincode"]
Pincode --> Validate["Validate 6-digit pincode"]
Validate --> Valid{"Valid pincode?"}
Valid --> |No| Error["Show validation error"]
Valid --> |Yes| Check["GET /shipping/check/:pincode"]
Check --> Calc["Calculate shipping charges"]
Calc --> Free{"Meets free shipping threshold?"}
Free --> |Yes| FreeShip["Set charge: 0"]
Free --> |No| Standard["Set standard charge"]
FreeShip --> Display["Display shipping info"]
Standard --> Display
Display --> Summary["Compute totals with shipping"]
Summary --> Proceed["Navigate to Checkout with state"]
```

**Diagram sources**
- [Cart.jsx:13-26](file://frontend/src/pages/Cart.jsx#L13-L26)
- [Cart.jsx:35-62](file://frontend/src/pages/Cart.jsx#L35-L62)
- [Cart.jsx:99-124](file://frontend/src/pages/Cart.jsx#L99-L124)
- [Cart.jsx:127-152](file://frontend/src/pages/Cart.jsx#L127-L152)

**Section sources**
- [Cart.jsx:1-161](file://frontend/src/pages/Cart.jsx#L1-L161)

### Checkout: Shipping, Payment, and Order Review
**Updated** Enhanced with improved shipping information handling and better user feedback.

Key behaviors:
- Validates user authentication and loads cart.
- Receives shipping info from the Cart page and displays it with zone details.
- **Enhanced**: Shows detailed shipping information including zone name, delivery estimates, and free shipping status.
- Supports three payment methods:
  - Cash on Delivery (COD): Places order immediately with shipping details.
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
CH-->>U : Display shipping info with zone details
U->>CH : Fill address and select payment
alt COD
CH->>API : POST /orders/create {shippingAddress, paymentMethod : cod, shippingCharge, shippingZone}
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
CH->>API : POST /orders/create {razorpay, shippingAddress, shippingCharge, shippingZone}
API->>BE : Create order
BE-->>API : Order
API-->>CH : Order
CH-->>U : Navigate to OrderConfirmation
else Direct UPI
CH->>U : Show ManualUPI
U->>CH : Enter transaction ID
CH->>API : POST /orders/create {upi, pending, shippingAddress, shippingCharge, shippingZone}
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
- **Enhanced**: Shows shipping zone information and delivery estimates.
- Provides navigation to continue shopping or view orders.

```mermaid
flowchart TD
Start(["Open OrderConfirmation"]) --> State{"Has order state?"}
State --> |No| NotFound["Show 'Order Not Found'"]
State --> |Yes| Render["Display order details and shipping address"]
Render --> Zone["Show shipping zone and delivery info"]
Zone --> Actions["Provide 'Continue Shopping' and 'View Orders'"]
```

**Diagram sources**
- [OrderConfirmation.jsx:3-14](file://frontend/src/pages/OrderConfirmation.jsx#L3-L14)
- [OrderConfirmation.jsx:16-72](file://frontend/src/pages/OrderConfirmation.jsx#L16-L72)

**Section sources**
- [OrderConfirmation.jsx:1-73](file://frontend/src/pages/OrderConfirmation.jsx#L1-L73)

### ProductCard Component: Consistent Product Presentation
Key behaviors:
- Displays a product preview with an image carousel and hover dots.
- Provides "Details" and "Add to Cart" actions.
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

### Enhanced Shipping System: Comprehensive Delivery Calculation
**New Section** The application now features a sophisticated shipping calculation system with multiple tiers and real-time delivery checking.

#### Shipping Zones and Pricing
The system implements three-tier shipping zones with different pricing and free shipping thresholds:

- **Local Delivery (Hyderabad core areas)**: ₹40 with free shipping at ₹500+
- **State Delivery (Telangana & Andhra Pradesh)**: ₹80 with free shipping at ₹799+
- **National Delivery (Rest of India)**: ₹120 with free shipping at ₹1499+

#### Delivery Availability Checking
The `/shipping/check/{pincode}` endpoint provides:
- Real-time delivery availability validation
- Zone-based shipping charge calculation
- Free shipping eligibility determination
- Estimated delivery timeframes
- Comprehensive error handling for invalid inputs

#### Implementation Details
- **Frontend**: Cart page integrates pincode validation and real-time shipping calculation
- **Backend**: Dedicated shipping routes and controllers handle complex zone logic
- **Configuration**: Centralized shipping zone definitions with helper functions
- **User Experience**: Immediate feedback with visual indicators for free shipping eligibility

**Section sources**
- [shippingRoutes.js:1-12](file://backend/routes/shippingRoutes.js#L1-L12)
- [deliveryController.js:1-118](file://backend/controllers/deliveryController.js#L1-L118)
- [shipping.js:1-73](file://backend/config/shipping.js#L1-L73)
- [Cart.jsx:35-62](file://frontend/src/pages/Cart.jsx#L35-L62)

## Dependency Analysis
- Routing and layout: App defines routes and navigation.
- Pages depend on the axios client for API communication.
- Components share ImageCarousel and imageHelper for image rendering.
- Checkout integrates ManualUPI and Razorpay SDK for payments.
- **Enhanced**: Cart page depends on the new shipping system for delivery calculations.

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
CART --> SHIPROUTES["shippingRoutes.js"]
SHIPROUTES --> DELIVERYCTRL["deliveryController.js"]
DELIVERYCTRL --> SHIPCONFIG["shipping.js"]
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
- [shippingRoutes.js:1-12](file://backend/routes/shippingRoutes.js#L1-L12)
- [deliveryController.js:1-118](file://backend/controllers/deliveryController.js#L1-L118)
- [shipping.js:1-73](file://backend/config/shipping.js#L1-L73)

**Section sources**
- [App.jsx:19-66](file://frontend/src/App.jsx#L19-L66)
- [axios.js:1-17](file://frontend/src/api/axios.js#L1-L17)
- [imageHelper.js:1-5](file://frontend/src/utils/imageHelper.js#L1-L5)

## Performance Considerations
- Minimize re-renders by keeping product lists and cart state local to their pages.
- Debounce search input if the backend supports it to reduce API calls.
- Lazy-load images and banners to improve initial render performance.
- **Enhanced**: Cache shipping calculations per session to avoid repeated network requests to `/shipping/check/{pincode}`.
- **Optimized**: Implement debounced pincode checking to prevent excessive API calls during rapid typing.
- Use skeleton loaders during fetches for perceived performance.

## Accessibility and UX
- Keyboard navigation: Ensure focus styles and tab order are logical across forms and buttons.
- Screen reader support: Use aria-labels for carousel navigation and buttons.
- Color contrast: Maintain sufficient contrast for text and interactive elements.
- Responsive breakpoints: Tailwind utilities ensure mobile-first layouts; verify touch targets are adequately sized.
- Form validation feedback: Provide inline, visible error messages for address and payment steps.
- **Enhanced**: Clear shipping status indicators with color-coded feedback for free shipping eligibility.
- **Improved**: Visual cues for delivery availability with immediate user feedback.
- Clear CTAs: Use descriptive labels like "Add to Cart," "Proceed to Checkout," and "Place Order."

## Troubleshooting Guide
**Updated** Enhanced with shipping system troubleshooting.

Common issues and remedies:
- Authentication errors: Unauthorized requests remove the token; redirect to login and show a toast.
- Empty cart scenarios: Cart page shows a friendly message and a link to continue shopping.
- **Enhanced**: Pincode validation errors: Display specific error messages for invalid 6-digit inputs.
- **New**: Shipping calculation failures: Handle backend errors gracefully with user-friendly messages.
- **Improved**: Delivery availability issues: Provide clear explanations when delivery is not available in certain areas.
- Payment failures: Display user-friendly messages and allow retry or alternate payment method.
- UPI QR generation failures: Fallback to copying UPI ID and provide a WhatsApp help link.
- **Enhanced**: Shipping zone mismatches: Ensure proper zone detection and display appropriate shipping costs.

**Section sources**
- [axios.js:10-16](file://frontend/src/api/axios.js#L10-L16)
- [Cart.jsx:35-53](file://frontend/src/pages/Cart.jsx#L35-L53)
- [Cart.jsx:57-62](file://frontend/src/pages/Cart.jsx#L57-L62)
- [Checkout.jsx:167-177](file://frontend/src/pages/Checkout.jsx#L167-L177)
- [ManualUPI.jsx:67-78](file://frontend/src/components/ManualUPI.jsx#L67-L78)

## Conclusion
The e-commerce application delivers a cohesive shopping experience from browsing to confirmation, now enhanced with a sophisticated shipping calculation system. The Home page offers discovery with search and category filters, ProductDetails provides rich item information, Cart streamlines item management and shipping estimation with real-time delivery checking, Checkout supports secure and flexible payment methods with comprehensive shipping information, and OrderConfirmation closes the loop with clear order details. The new shipping system provides zone-based pricing with free shipping thresholds, real-time delivery availability checking, and improved user feedback throughout the shopping experience. Shared components like ImageCarousel and BannerSlider ensure consistent visuals, while the centralized axios client and dedicated shipping routes simplify API interactions and authentication handling.