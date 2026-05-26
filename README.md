# E-commerce Frontend

A modern, responsive e-commerce web application built with **React**, **TypeScript**, and **Vite**. This frontend connects to a backend API for data retrieval and submission, providing a complete shopping experience with customer and admin interfaces.

---

## 🛠️ Tech Stack

- **React** 19+ - UI library with functional components
- **TypeScript** 6+ - Type-safe development across the entire application
- **Vite** 8+ - Fast build tool, dev server with HMR, and optimized builds
- **TailwindCSS** 4+ - Utility-first CSS framework for rapid styling
- **Axios** - HTTP client with JWT token interceptors
- **React Router v7** - Client-side routing with protected routes

---

## 📦 Project Structure

```
ecommerce-frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication UI (login form, registration)
│   │   ├── layout/       # App layout (Navbar, Footer)
│   │   ├── product/      # Product-specific components (ProductCard, etc.)
│   │   └── ui/           # Base UI elements (buttons, inputs, modals)
│   │
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx    # User authentication state
│   │   └── CartContext.tsx    # Shopping cart state & API sync
│   │
│   ├── lib/              # Utilities
│   │   └── api.ts           # Axios instance with interceptors
│   │
│   ├── pages/            # Page components organized by domain:
│   │   ├── admin/         # Admin dashboard & management pages:
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminHomePage.tsx
│   │   │   ├── CategoriesAdminPage.tsx      # Category CRUD
│   │   │   ├── ProductsAdminPage.tsx        # Product CRUD
│   │   │   ├── ProductImagesAdminPage.tsx   # Image management
│   │   │   └── OrdersAdminPage.tsx          # Order tracking
│   │   │
│   │   ├── auth/         # User authentication pages:
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   │
│   │   ├── cart/         # Shopping cart page
│   │   ├── home/         # Landing/homepage
│   │   ├── orders/       # Order tracking & checkout:
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── OrderSuccessPage.tsx
│   │   └── products/     # Product browsing & details:
│   │       ├── ProductsPage.tsx            # Product listing (paginated)
│   │       └── ProductDetailPage.tsx       # Single product view
│   │
│   ├── routes/           # Route definitions & navigation logic
│   ├── types/            # TypeScript type definitions
│   │   └── product.ts    # API response types (Category, Product, etc.)
│   ├── App.tsx           # Main app component with routing setup
│   ├── main.tsx          # Vite entry point with providers
│   ├── index.css         # Tailwind + custom styles
│   └── App.css           # Additional CSS overrides
│
├── public/               # Static assets (favicon, icons)
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite bundler configuration
└── README.md             # This file
```

---

## 🎯 Features

### ✅ Customer Features
- **Product Browsing** - Browse products with pagination, filtering by category
- **Shopping Cart** - Add/remove items, real-time cart count badge
- **User Authentication** - Secure login & registration
- **Checkout Flow** - Multi-step checkout with address management
- **Order Tracking** - View order history and status
- **Responsive Design** - Fully responsive UI for all devices

### ✅ Admin Features
- **Dashboard** - Overview statistics and navigation
- **Category Management** - Create, edit, delete categories
- **Product Management** - Full CRUD operations with image handling
- **Order Management** - View, track, and manage customer orders
- **Role-Based Access** - Protected admin routes for authorized users

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A running backend API server (optional for initial setup)

### Installation

```bash
# Install dependencies with pnpm
pnpm install
```

### Development Mode

```bash
# Start the development server
pnpm dev
```

The app will open at `http://localhost:5173` with hot module replacement.

### Build for Production

```bash
pnpm build
```

This creates an optimized production build in the `dist/` folder, ready for deployment.

---

## 🌐 API Configuration

Update your `.env.local` file with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Authentication

The application uses **JWT tokens** for authentication:

1. Users log in via `/login` endpoint
2. Token is stored in `localStorage` and automatically attached to API requests
3. Protected routes check for valid authentication before rendering

---

## 🔐 Authentication & Authorization

The app implements a custom **AuthContext** for managing user sessions:

| Feature | Description |
|---------|-------------|
| **Login** | Stores user data and JWT token in localStorage |
| **Logout** | Clears all auth tokens and session data |
| **Protected Routes** | Users must be authenticated to access cart, checkout, orders pages |
| **Admin Routes** | Only accessible by users with `ADMIN` role |

### Route Structure

```
/              → Homepage (public)
/products      → Product listing (public)
/products/:id  → Product details (public)
/login         → Login page (public)
/register       → Registration page (public)
/cart          → Shopping cart (requires authentication)
/checkout      → Checkout flow (requires authentication)
/orders        → Order history (requires authentication)
/admin/*       → Admin dashboard (ADMIN role required)
```

---

## 📁 API Integration

The application uses **RESTful endpoints** with JSON responses wrapped in standard HTTP response patterns.

### Key API Patterns

```typescript
// GET requests for fetching data
api.get("/products")          // Fetch paginated products
api.get("/products/:id")      // Fetch single product details
api.get("/cart/me")           // Fetch current cart items (requires auth)
api.get("/categories")        // Fetch available categories

// POST/PUT/DELETE for mutations
api.post("/auth/register")    // New user registration
api.post("/auth/login")       // User login
api.post("/cart/items/:id")   // Add item to cart
api.put("/addresses")         // Save delivery addresses
api.post("/checkout")         // Process order
```

### TypeScript Types

All API responses are typed using TypeScript interfaces defined in `src/types/product.ts`:

- **Category** - Category metadata (id, name, description, active)
- **Product** - Product details (id, name, price, stock, imageUrl, categoryId)
- **ProductImage** - Multiple images for a product with primary flag
- **AuthResponse** - Login/register responses with JWT tokens

---

## 🎨 UI Components

### Layout Components

- **Navbar** - Navigation menu with cart badge and login links
- **Footer** - Site footer with information links
- **AppLayout** - Main layout wrapper with header, content area, and footer

### Page Components

| Page | Route | Protected? |
|------|-------|------------|
| Homepage | `/` | No |
| Products List | `/products` | No |
| Product Detail | `/products/:id` | No |
| Login | `/login` | No |
| Register | `/register` | No |
| Cart | `/cart` | Yes (auth required) |
| Checkout | `/checkout` | Yes (auth required) |
| Orders | `/orders` | Yes (auth required) |
| Admin Dashboard | `/admin` | Yes (ADMIN role) |

---

## 🔒 Security Features

- **JWT Token Management** - Secure token handling with localStorage
- **Authorization Headers** - Axios interceptors automatically attach Bearer tokens
- **Protected Routes** - React Router guards prevent unauthorized access
- **Role-Based Access Control** - Admin routes restricted to ADMIN role users

---

## ⚙️ Development Tools

| Tool | Purpose |
|------|---------|
| **Vite** | Fast dev server with HMR and optimized production builds |
| **TypeScript** | Type-safe development with strict type checking |
| **ESLint** | Code linting with React-specific rules |
| **TailwindCSS** | Utility-first CSS for rapid UI development |

---

## 📦 Dependencies Overview

### Production Dependencies
- `react` & `react-dom` - Core UI rendering
- `axios` - HTTP client with request/response interceptors
- `react-router` & `react-router-dom` - Client-side routing

### Development Dependencies
- `@tailwindcss/vite` - Tailwind CSS integration for Vite
- `vite` - Build tool and dev server
- `typescript` - Type checking and compilation
- `eslint` & plugins - Code quality and linting rules

---

## 📂 Type Definitions

The application uses strongly-typed API responses:

```typescript
// Example Product type
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  active: boolean;
  primaryImageUrl?: string | null;
}

// Example Auth user
interface User {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}
```

---

## 🚀 Deployment

Build your application:

```bash
pnpm build
```

The `dist/` folder contains optimized static files ready for deployment to any static hosting service.

---

*This frontend is designed to work with a compatible backend API. For complete integration, ensure your backend follows the RESTful patterns and data types defined in this project.*