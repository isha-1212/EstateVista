# EstateVista - Real Estate Platform

A modern, full-featured real estate platform built with **React, TypeScript, and Tailwind CSS**. This is a responsive web application that allows users to browse properties, manage listings, and connect with realtors in India.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [File-by-File Breakdown](#file-by-file-breakdown)
- [Features & Functionalities](#features--functionalities)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [Component Architecture](#component-architecture)
- [Data Models & Types](#data-models--types)
- [Authentication Routes](#authentication-routes)
- [Styling & Design System](#styling--design-system)

---

## 🎯 Project Overview

**EstateVista** is a comprehensive real estate marketplace focused on India properties. The platform enables:

- **Property Buyers/Renters**: Browse, search, and filter properties by location, type, price, and amenities
- **Realtors**: Manage property listings, view inquiries, and track business metrics through a dedicated dashboard
- **Admin**: Handle property posting, user management, and listing administration

The application uses a **mock database** (mockData.ts) for property listings, realtors, and inquiries during development, with planned **Supabase integration** for backend services.

---

## 🛠 Technology Stack

### Frontend Framework
- **React 18.3.1** - UI library for building interactive components
- **TypeScript 5.5.3** - Static type checking for JavaScript
- **React Router DOM 7.15.1** - Client-side routing and navigation

### Build & Development Tools
- **Vite 5.4.2** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework for styling
- **PostCSS 8.4.35** - CSS transformation tool for Tailwind
- **Autoprefixer 10.4.18** - Automatic vendor prefixing

### Code Quality & Linting
- **ESLint 9.9.1** - JavaScript/TypeScript linting
- **TypeScript ESLint 8.3.0** - ESLint plugin for TypeScript
- **ESLint React Hooks** - Rules for React hooks usage
- **ESLint React Refresh** - Fast refresh support

### Backend Integration (Future)
- **Supabase 2.57.4** - PostgreSQL database and authentication backend
- **Lucide React 0.344.0** - Icon library with 344+ icons

---

## 📁 Project Structure

```
project/
│
├── src/
│   ├── App.tsx                          # Main app component with routing
│   ├── main.tsx                         # React DOM entry point
│   ├── index.css                        # Global CSS styles
│   ├── vite-env.d.ts                    # Vite environment type definitions
│   │
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx               # Reusable button component
│   │       ├── Navbar.tsx               # Navigation header with links
│   │       ├── Footer.tsx               # Footer component
│   │       ├── PropertyCard.tsx         # Property listing card (grid/list view)
│   │       ├── LoadingSkeleton.tsx      # Loading placeholder skeleton
│   │       └── index.ts                 # Component exports barrel file
│   │
│   ├── pages/
│   │   ├── Home.tsx                     # Landing page with search & testimonials
│   │   ├── PropertyListing.tsx          # Properties browse/search/filter page
│   │   ├── PropertyDetails.tsx          # Individual property detail view
│   │   ├── RealtorDashboard.tsx         # Realtor management dashboard
│   │   ├── AddProperty.tsx              # Form to add new property
│   │   ├── Login.tsx                    # User login page
│   │   ├── Signup.tsx                   # User registration page
│   │   └── index.ts                     # Page exports barrel file
│   │
│   ├── data/
│   │   └── mockData.ts                  # Mock database with properties, realtors, users
│   │
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces & types
│   │
│   └── (future: services/, utils/, hooks/)
│
├── public/                              # Static assets (favicon, images, etc.)
│
├── Configuration Files
│   ├── package.json                     # Project dependencies & scripts
│   ├── tsconfig.json                    # TypeScript compiler configuration
│   ├── tsconfig.app.json                # TypeScript config for app source
│   ├── tsconfig.node.json               # TypeScript config for build tools
│   ├── vite.config.ts                   # Vite build configuration
│   ├── tailwind.config.js               # Tailwind CSS theme customization
│   ├── postcss.config.js                # PostCSS plugins configuration
│   ├── eslint.config.js                 # ESLint rules configuration
│   ├── index.html                       # HTML entry point
│   ├── TODO.md                          # Development tasks & bug fixes
│   └── README.md                        # This file
```

---

## 📄 File-by-File Breakdown

### **Root Configuration Files**

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies, dev dependencies, and project scripts (dev, build, lint, preview) |
| `tsconfig.json` | Main TypeScript compiler options |
| `tsconfig.app.json` | TypeScript config for application source code |
| `tsconfig.node.json` | TypeScript config for build tool configuration files |
| `vite.config.ts` | Vite bundler configuration; enables React fast refresh |
| `tailwind.config.js` | Custom Tailwind theme colors (teak, walnut, cream, olive palettes) |
| `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `eslint.config.js` | ESLint rules for code quality |
| `index.html` | HTML template with root div for React mounting |

### **Source Files (`src/`)**

#### **Entry Points**
- **main.tsx**: React DOM mount point. Renders App component into root element.
- **App.tsx**: Main application wrapper. Sets up React Router with all routes and layout (Navbar, Footer).
- **index.css**: Global CSS including Tailwind directives and custom styles.
- **vite-env.d.ts**: Type definitions for Vite environment variables.

#### **Pages (`src/pages/`)**

| File | Purpose | Functionality |
|------|---------|---------------|
| **Home.tsx** | Landing page | Featured properties display, advanced search bar, property type filters, testimonials section, call-to-action buttons |
| **PropertyListing.tsx** | Property browse & filter page | Grid/list view toggle, advanced filtering (price, location, type, bedrooms), search query parsing, pagination (6 per page), responsive design |
| **PropertyDetails.tsx** | Individual property view | Full property information, image gallery, realtor details, inquiry form, similar properties suggestions, amenities list |
| **RealtorDashboard.tsx** | Realtor management portal | 3 tabs: Overview (stats), My Properties (CRUD operations), Inquiries (management). Shows metrics like total properties, active inquiries, property views |
| **AddProperty.tsx** | Property submission form | Form for realtors to add new properties (title, description, price, location, type, amenities, images) |
| **Login.tsx** | User authentication (login) | Email/password login form, form validation, navigation to signup |
| **Signup.tsx** | User registration (signup) | Registration form with user role selection (buyer/realtor), form validation, navigation to login |

#### **Components (`src/components/common/`)**

| File | Purpose | Props/Features |
|------|---------|-----------------|
| **Button.tsx** | Reusable button component | Variants (primary, secondary, outline), sizes, loading states, onClick handlers |
| **Navbar.tsx** | Navigation header | Logo, navigation links (Home, Properties, Dashboard, Login/Signup), responsive mobile menu |
| **Footer.tsx** | Footer section | Company info, links, contact information, social links, copyright |
| **PropertyCard.tsx** | Property card display | Two variants: 'default' (grid) and 'horizontal' (list). Shows image, price, location, beds/baths, area, like button |
| **LoadingSkeleton.tsx** | Loading placeholder | Skeleton screen for property cards during data loading |
| **index.ts** | Barrel export file | Exports all common components for cleaner imports |

#### **Data (`src/data/`)**

**mockData.ts** - Central mock database containing:
- **realtors[]**: 3 sample realtors (Arjun Nair, Priya Menon, Vijay Kumar) with profiles, ratings, listings
- **properties[]**: 15+ sample properties with full details (price, location, amenities, images, bedrooms, etc.)
- **dummyUser**: Sample realtor user for dashboard functionality
- **dummyInquiries**: Sample property inquiries for dashboard
- **locations[]**: List of India property locations for filtering

#### **Types (`src/types/`)**

**index.ts** - TypeScript interfaces for type safety:
```typescript
- Property: Complete property information (id, title, price, location, images, amenities, etc.)
- Realtor: Realtor profile (name, email, experience, ratings, listings)
- Inquiry: Property inquiry/contact (name, email, message, status)
- User: User account (name, role: 'user'|'realtor', avatar)
```

---

## 🎨 Features & Functionalities

### **Public Features (Buyers/Renters)**
✅ Browse all properties with grid/list view toggle
✅ Advanced search by keyword, location, type, price range
✅ Filter by property features (bedrooms, bathrooms, amenities)
✅ View property details with image gallery
✅ Contact realtors through inquiry form
✅ Save favorite properties (like functionality)
✅ View realtor profiles and ratings
✅ Pagination for browsing properties
✅ Testimonials and platform information on homepage
✅ User authentication (login/signup)

### **Realtor Features (Dashboard)**
✅ Personal dashboard with business metrics overview
✅ Manage property listings (view, edit, delete)
✅ Track property inquiries with status updates
✅ Add new properties to platform
✅ View inquiry details and contact information
✅ Analytics: total views, properties sold, active listings

### **Technical Features**
✅ Single Page Application (SPA) with React Router
✅ Type-safe development with TypeScript
✅ Responsive design (mobile-first approach)
✅ Custom Tailwind color palette (teak, walnut, cream, olive)
✅ Fast development with Vite HMR
✅ ESLint code quality rules
✅ URL-based filter persistence (query parameters)

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js 16+ and npm/yarn
- Git (optional, for version control)

### **Installation Steps**

1. **Clone the repository** (if using Git)
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional for Supabase future integration)
   ```bash
   # Create .env.local file in root (if needed)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (Vite default port)

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run typecheck` | Run TypeScript type checking |

---

## 🏗 Component Architecture

### **Routing Structure (in App.tsx)**
```
/ → Home (landing page)
/properties → PropertyListing (search/browse)
/property/:id → PropertyDetails (single property)
/dashboard → RealtorDashboard (realtor portal)
/add-property → AddProperty (add new listing)
/login → Login (authentication)
/signup → Signup (registration)
```

### **Component Hierarchy**
```
App
├── Navbar (fixed header)
├── Router (page content)
│   ├── Home
│   │   ├── PropertyCard(s)
│   │   └── Button(s)
│   ├── PropertyListing
│   │   ├── Filter UI
│   │   ├── PropertyCard(s) - grid/list
│   │   └── Pagination
│   ├── PropertyDetails
│   │   ├── Image Gallery
│   │   ├── Property Info
│   │   ├── Realtor Card
│   │   └── Inquiry Form
│   ├── RealtorDashboard
│   │   ├── Overview Tab
│   │   ├── Properties Tab
│   │   └── Inquiries Tab
│   ├── AddProperty (Form)
│   ├── Login (Form)
│   └── Signup (Form)
└── Footer (fixed bottom)
```

---

## 📊 Data Models & Types

### **Property Interface**
```typescript
{
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  propertyType: 'apartment' | 'villa' | 'commercial' | 'land';
  listingType: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  realtor: Realtor;
  featured: boolean;
  createdAt: string;
}
```

### **Realtor Interface**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  experience: number;
  listings: number;
  rating: number;
}
```

### **Inquiry Interface**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}
```

### **User Interface**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'realtor';
  avatar: string;
}
```

---

## 🔐 Authentication Routes

Currently using **mock authentication** with static user data. Future implementation will use **Supabase Auth**:

- **Public Routes**: Home, PropertyListing, PropertyDetails, Login, Signup
- **Protected Routes**: RealtorDashboard, AddProperty (requires realtor role)
- **Auth State**: Stored in mockData.ts (dummyUser)

---

## 🎨 Styling & Design System

### **Tailwind Custom Theme**

The project includes a custom color palette optimized for real estate:

| Color | Hex Range | Usage |
|-------|-----------|-------|
| **Teak** | #faf5f0 - #5b3e2c | Primary brand color, buttons |
| **Walnut** | #faf8f5 - #5a4438 | Secondary accents, borders |
| **Cream** | #fefdfb - #463324 | Background, text contrast |
| **Olive** | #f7f9f3 - ... | Tertiary accents, hover states |

### **Responsive Design**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl (Tailwind default)
- Flexible layouts with flexbox and grid
- Touch-friendly interactive elements

---

## 📝 Development Workflow

### **Current Tasks (TODO.md)**
- Property image fallback guards implemented
- PropertyCard render path secured
- Dev build and test validation completed

### **Future Enhancements**
- [ ] Supabase backend integration
- [ ] Real user authentication system
- [ ] Payment gateway integration (property booking/transactions)
- [ ] Email notifications for inquiries
- [ ] Advanced analytics for realtors
- [ ] Property image upload functionality
- [ ] Chat/messaging between users and realtors
- [ ] Favorite properties wishlist with persistence
- [ ] Admin panel for platform management
- [ ] Mobile app (React Native)

---

## 🐛 Known Issues & Fixes

✅ **Fixed**: PropertyCard image fallback when images array is empty
✅ **Fixed**: Safe image rendering with guard clauses (property.images?.[0] ?? '')

---

## 📞 Support & Contact

This is a learning project for an internship. For questions or issues:
1. Check the codebase comments
2. Review the TODO.md for in-progress items
3. Examine component PropTypes and TypeScript interfaces
4. Check Tailwind and ESLint configurations

---

## 📜 License

This is a student project. All rights reserved.

---

## 🎓 Learning Resources Used

- **React**: Component composition, hooks, routing
- **TypeScript**: Type safety, interfaces, strict mode
- **Tailwind CSS**: Utility-first CSS, custom themes
- **Vite**: Fast build tool, HMR capabilities
- **React Router v7**: Modern routing patterns
- **Real Estate UX**: Property listings, filter patterns

---

**Last Updated**: June 2026
**Framework Version**: React 18.3.1 + TypeScript 5.5.3
**Build Tool**: Vite 5.4.2
