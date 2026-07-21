# ShopSphere

A full-featured e-commerce platform showcase built with **React 18**, **Vite 8**, and **Supabase**. Features user authentication (Email/Password + Google OAuth), a product shop with cart and checkout, user dashboard with profile management, order tracking, coupon system, and a complete admin dashboard for managing orders, products, categories, users, messages, and subscribers.

**Live Demo:** https://ecommerce-showcase-silk.vercel.app/

---

## Pages

| Route | Access | Page |
|-------|--------|------|
| `/` | Public | **Home** — Hero with animated 3D background, stats counter, features preview (6 cards), testimonials, FAQ accordion, newsletter subscription |
| `/shop` | Public | **Shop** — Product grid (Jackets + Shoes), search, category filter, size/color/quantity selector, add to cart |
| `/features` | Public | **Features** — Overview of ShopSphere capabilities |
| `/features/:slug` | Public | **Feature Detail** — Individual feature pages (inventory, analytics, payments, order tracking, CRM, multi-vendor) |
| `/pricing` | Public | **Pricing** — Pricing plans |
| `/about` | Public | **About** — Company story, team, milestones |
| `/contact` | Public | **Contact** — Contact form (stored in Supabase + local fallback) |
| `/login` | Public | **Login** — Email/password + Google OAuth, admin redirect, forgot password |
| `/signup` | Public | **Signup** — Create account with name, email, password |
| `/auth/callback` | Public | **Auth Callback** — Google OAuth redirect handler |
| `/checkout` | Auth required | **Checkout** — Shipping form, coupon codes, order summary, COD payment |
| `/order-success/:orderId` | Auth required | **Order Success** — Order confirmation with details |
| `/my-orders` | Auth required | **My Orders** — User order history with status |
| `/user-dashboard` | Auth required | **User Dashboard** — Profile management, settings, account info, FAQ, support |
| `/dashboard` | Auth required | Backward compatible alias for `/user-dashboard` |
| `/admin` | Public | **Admin Login** — Admin authentication |
| `/admin/dashboard` | Admin auth | **Admin Dashboard** — Stats, Orders, Products, Categories, Users, Messages, Subscribers, Database viewer |
| `/admin/settings` | Admin auth | **Admin Settings** — Admin profile settings |

---

## Features

### 🏠 Home Page
- **Hero Section** — "Build Your **Online Store** Faster Than Ever" with animated 3D background (Three.js), morphing blobs, floating icons, dashboard mockup with chart animation, floating badges ("✅ New order — $249.00", "📈 Sales up 34% this week"), hero stats (10K+ Users, 500+ Stores, 98% Satisfaction)
- **Stats Bar** — Animated count-up statistics
- **Features Preview** — 6 feature cards: Inventory Management, Analytics Dashboard, Secure Payments, Order Tracking, Customer Management, Multi-Vendor Support
- **Testimonials** — 3 reviews from FROSTED TECH team (Haseeb, Wahaj Qureshi, Maheen)
- **FAQ Accordion** — 5 questions about ShopSphere
- **Newsletter** — Email subscription with Supabase + local fallback

### 🛍️ Shop
- **Products:** Jackets (Winter Leather Jacket, Classic Denim Jacket, City Bomber Jacket, Everyday Hoodie Jacket, Alpine Puffer Jacket) and Shoes (Nike Air Max, Adidas Ultraboost, Puma RS-X, Converse Chuck Taylor, New Balance 574)
- **Product Cards** — Image, name, price, rating, badges (Best seller, New, 20% off), size/color/quantity selection
- **Search** — Real-time product search
- **Category Filter** — All Products / Jackets / Shoes
- **Results Count** — Shows matching product count

### 🔐 Authentication
- **Email/Password** — Sign up and login via Supabase Auth
- **Google OAuth** — One-click login with Google via Supabase
- **Role-Based Redirect** — Admin email automatically redirects to admin dashboard, regular users go to user dashboard
- **Protected Routes** — `/user-dashboard`, `/my-orders`, `/checkout`, and admin routes guarded by auth route guards
- **Password Reset** — Forgot password flow via Supabase
- **Persistent Session** — Auth state tracked via Supabase `onAuthStateChange`

### 🛒 E-Commerce Workflow
- **Shopping Cart** — Persisted in `localStorage` for guests, synced to Supabase `cart` table for logged-in users; live item count badge in navbar
- **Coupon System** — Apply coupon codes at checkout:
  | Code | Type | Discount |
  |------|------|----------|
  | `WELCOME10` | Percentage | 10% off |
  | `SUMMER20` | Percentage | 20% off |
  | `VIP25` | Percentage | 25% off |
  | `FREESHIP` | Fixed | $10 off |
- **Shipping Rules** — Free shipping over $100, flat rate $5.99 under $100, per-country overrides (e.g., Pakistan flat $5), per-city overrides (e.g., Karachi free)
- **Checkout** — Validated shipping form (full name, email, phone, country, city, address, postal code), country selector (US, Canada, UK, Pakistan, UAE, Saudi Arabia, Other), order summary with product images, subtotal/shipping/discount/total breakdown
- **Payment** — Cash on Delivery (COD); Stripe/PayPal structure ready for later
- **Order Processing** — Unique order numbers (`ORD-XXXXXX`), items saved to `order_items`, `payments` row created (COD = pending), inventory stock decremented, out-of-stock blocked
- **Email Notifications** — Customer order confirmation + admin new-order notification via EmailJS or Resend Edge Function

### 👤 User Dashboard (`/user-dashboard`)
- **Profile Card** — Avatar display (uploaded image or initial letter fallback), upload/change/delete profile picture (Supabase "avatars" bucket), welcome greeting with display name, email, member-since date, logout button
- **Profile Settings** — Edit display name saved to `profiles` table with success/error messages
- **Account Information** — Email, Name, Member Since, User ID
- **Help & Support** — FAQ accordion (5 questions), Contact Support button, Privacy Policy link, Terms & Conditions link

### 👑 Admin Dashboard (`/admin/dashboard`)
- **Dashboard Tab** — Stats cards: Total Orders, Total Revenue, Total Customers, Total Products, Pending Orders, Total Messages, Newsletter Subs, Unread Messages, Approved Messages; Recent Contact Messages table; Recent Newsletter Subscribers table; Database Overview
- **Orders Tab** — View all orders (order #, customer, email, phone, date, total, status, payment status), filter by status (pending/confirmed/processing/shipped/delivered/cancelled), update order status via dropdown, search/filter bar
- **Products Tab** — View all products with image thumbnails, name, category, price, stock, active/inactive status; Add Product button opens ProductModal (image upload to Supabase Storage `product-images` bucket, name, description, price, category, stock, featured/active flags); Edit/Delete actions
- **Categories Tab** — View all categories (name, slug, description); Add/Edit/Delete via CategoryModal
- **Users Tab** — View all registered users with email, name, role, order count
- **Messages Tab** — Contact form inbox with #, name, email, subject, message preview, date, read/unread status, approved status; filter by all/unread/read/pending/approved; search messages; Approve & Send Email via EmailJS; Delete messages
- **Subscribers Tab** — View all newsletter subscribers with email and subscription date; Remove subscribers
- **Database Tab** — Schema viewer for `contact_messages` and `newsletter` tables (column names, types, descriptions, CREATE TABLE SQL), sample queries
- **Auto-Refresh** — Data refreshes every 30 seconds
- **Real-Time Notifications** — New entry toast notifications for contact messages and newsletter subscriptions

### 📧 Email Notifications
After each successful order, `src/services/emailService.js` sends:
1. **Customer** — Order confirmation with order number, items list (product name × qty — total), subtotal, shipping, discount, total, payment method, shipping address
2. **Admin** — New order notification with customer details, order summary, items, shipping address

Supports **EmailJS** (client-side via `VITE_EMAILJS_*` vars) and **Resend Edge Function** (via `VITE_RESEND_FUNCTION_URL`). If neither is configured, the payload is logged and checkout continues silently.

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React 18 | User interface |
| Vite 8 | Development server and production build |
| React Router 7 | Client-side routing |
| Supabase Auth | Email/Password and Google OAuth authentication |
| Supabase Database | Contact forms, newsletter, user profiles, orders, products, categories, cart, coupons, payments, inventory |
| Supabase Storage | Avatar uploads ("avatars" bucket) and product images ("product-images" bucket) |
| EmailJS | Email delivery (order confirmations, admin notifications, approval replies) |
| Resend (Edge Function) | Alternative email delivery via `VITE_RESEND_FUNCTION_URL` |
| Tailwind CSS 4 + Custom CSS (4600+ lines) | Styling |
| Three.js / @react-three/fiber / @react-three/drei | 3D animated background effects |
| AOS (Animate on Scroll) | Scroll-based reveal animations |
| bcryptjs | Password hashing helpers |
| Oxlint | Code linting |

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Optional:
# VITE_RESEND_FUNCTION_URL=https://your-resend-edge-function.com/send
# VITE_ADMIN_EMAIL=admin@example.com
```

---

## Database Setup

Run `supabase/ecommerce-schema.sql` in the Supabase SQL Editor. This creates:

### E-Commerce Tables
- `profiles` — User profiles (id, full_name, avatar_url, avatar_file_path) with RLS
- `categories` — Product categories (id, name, slug, description)
- `products` — Products (id, name, slug, description, price, image, category_id, stock, active, featured)
- `cart` — Shopping cart items (id, user_id, product_id, quantity, size, color)
- `orders` — Orders (id, order_number, customer_name, email, phone, subtotal, shipping_cost, discount, total, status, payment_method, shipping_address as JSONB)
- `order_items` — Order line items (id, order_id, product_id, product_name, quantity, price, total, size, color)
- `addresses` — Saved addresses (id, user_id, full_name, email, phone, country, city, address, postal_code)
- `coupons` — Discount coupons (id, code, type, value, min_order_amount, usage_limit, used_count, expires_at)
- `payments` — Payment records (id, order_id, amount, payment_method, payment_status)
- `inventory_log` — Stock change tracking (id, product_id, change, reason, order_id)

### Contact & Newsletter Tables
```sql
CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);

CREATE TABLE newsletter (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL UNIQUE
);
```

### Storage Buckets
- **"avatars"** — Public bucket for user profile pictures
- **"product-images"** — Public bucket for product images (created automatically by e-commerce schema SQL)

---

## Project Structure

```text
ecommerce-showcase/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── admin-profile.jpg
│   │   └── subabaseclient.js          # Supabase client singleton
│   ├── components/
│   │   ├── Navbar.jsx                 # Navigation with auth, cart, theme toggle
│   │   ├── Footer.jsx                 # Site footer
│   │   ├── Loader.jsx                 # Animated loading screen
│   │   ├── BackToTop.jsx              # Scroll-to-top button
│   │   ├── AnimatedBackground.jsx     # Three.js 3D background
│   │   ├── FeatureCard.jsx            # Feature preview card
│   │   ├── TestimonialCard.jsx        # Testimonial card
│   │   ├── Stats.jsx                  # Animated stats counter
│   │   ├── FAQ.jsx                    # FAQ accordion
│   │   ├── Newsletter.jsx             # Email subscription form
│   │   ├── ShopOverlays.jsx           # Login modal, cart drawer, order modal
│   │   ├── UserProtectedRoute.jsx     # Auth route guard
│   │   ├── ProtectedRoute.jsx         # Admin route guard
│   │   └── admin/
│   │       ├── ProductModal.jsx       # Add/edit product modal
│   │       └── CategoryModal.jsx      # Add/edit category modal
│   ├── context/
│   │   └── ShopContext.jsx            # Global state: auth, cart, profile, orders, coupons, shipping
│   ├── data/
│   │   ├── products.js                # Static product catalog (10 products)
│   │   └── featureDetails.js          # Feature detail page content + team data
│   ├── pages/
│   │   ├── Home.jsx                   # Landing page
│   │   ├── Shop.jsx                   # Product shop
│   │   ├── Features.jsx               # Features overview
│   │   ├── FeatureDetail.jsx          # Individual feature page
│   │   ├── Pricing.jsx                # Pricing plans
│   │   ├── About.jsx                  # About page
│   │   ├── Contact.jsx                # Contact form
│   │   ├── Checkout.jsx               # Full checkout flow
│   │   ├── OrderSuccess.jsx           # Order confirmation
│   │   ├── MyOrders.jsx               # User order history
│   │   ├── UserDashboard.jsx          # User profile dashboard
│   │   ├── auth/
│   │   │   ├── Login.jsx              # Login page
│   │   │   ├── Signup.jsx             # Signup page
│   │   │   └── Callback.jsx           # Google OAuth callback
│   │   └── admin/
│   │       ├── AdminLogin.jsx         # Admin login
│   │       ├── AdminDashboard.jsx     # Main admin panel
│   │       └── AdminSettings.jsx      # Admin settings
│   ├── services/
│   │   ├── shopAuth.js                # Auth functions + profile CRUD + avatar upload
│   │   ├── adminAuth.js               # Admin credential helpers
│   │   ├── ecommerceService.js        # Supabase e-commerce helpers
│   │   ├── emailService.js            # Email notification service
│   │   ├── supabase.js                # Generic Supabase helpers
│   │   └── localStore.js              # localStorage fallback + merge helpers
│   ├── App.jsx                        # Routes, theme, layout
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles (4600+ lines)
├── supabase/
│   ├── ecommerce-schema.sql           # Full e-commerce schema
│   ├── commerce-schema.sql            # Alternative schema
│   └── login-table-auth.sql           # Login table auth schema
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase and EmailJS credentials
```

### 3. Set up Supabase
- Run `supabase/ecommerce-schema.sql` in Supabase SQL Editor
- Create a **public** Storage bucket named `avatars`

### 4. Run locally
```bash
npm run dev
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint linter |

---

## Deployment

Configured for **Vercel** (`vercel.json`). Deploy to any Vite-compatible static host.

**Live:** https://ecommerce-showcase-silk.vercel.app/

---

## Security Notes

- Admin credentials (`shakeelbhatti143143@gmail.com` / `1234qwerty`) are hardcoded for demo only — **do not use in production**
- Enable Row Level Security (RLS) on all Supabase tables
- The anonymous Supabase key is safe in client code, but RLS must restrict data access

---

## License

MIT
