# ShopSphere

A responsive e-commerce platform showcase built with React and Vite. Features full user authentication (Email/Password + Google OAuth via Supabase), a user dashboard with profile management, and a mobile-friendly admin dashboard for reviewing and approving customer messages.

## Features

### User Features
- **Authentication**: Email/Password signup and login, Google OAuth login via Supabase
- **User Dashboard**: Profile picture upload/replace/delete, display name editing, account info
- **Protected Routes**: `/user-dashboard` and `/dashboard` are only accessible when logged in
- **Role-Based Redirect**: Admin email automatically redirects to admin dashboard, regular users go to user dashboard
- **Navbar Integration**: Shows user avatar and name when logged in, Login button when logged out

### Admin Features
- Admin login (hardcoded credentials for demo)
- Dashboard with stats (messages, subscribers, **orders, revenue, customers, products, pending orders**)
- **Order Management**: view all orders, search by order #/name/email, filter by status, update order status (pending → confirmed → processing → shipped → delivered → cancelled) and payment status
- **Product Management**: add/edit/delete products with image upload (Supabase Storage `product-images` bucket), stock, featured/active flags
- **Category Management**: full CRUD for categories
- **Users**: view all registered users with order counts and role
- Approve/email contact messages via EmailJS
- Delete messages and subscribers
- Database schema viewer
- Logout button in topbar and sidebar

### E-Commerce Workflow
- Shopping cart persisted in `localStorage` for guests and synced to Supabase for logged-in users; navbar shows live item count
- Email/Password + Google authentication required before checkout
- Checkout collects shipping details (validated), shows order summary with images, applies coupons, and computes subtotal/shipping/discount/total
- Orders saved with a unique order number; each item saved to `order_items`; a `payments` row is created (COD = pending)
- Inventory stock decremented automatically; out-of-stock purchases blocked; order confirmation email sent to customer and new-order notification to admin (EmailJS/Resend ready)
- "My Orders" page with order details and status
- Coupons (percentage/fixed), shipping rules (free/flat/city-based), and Cash-on-Delivery payment (Stripe/PayPal structured for later)

### Email Notifications
After each order, `src/services/emailService.js` sends:
- **Customer**: order confirmation (order #, items, total)
- **Admin**: new order notification

Configure EmailJS via `VITE_EMAILJS_*` (already present in `.env`), or set `VITE_RESEND_FUNCTION_URL` for Resend Edge Function delivery. If neither is configured, the payload is logged and checkout continues.

### Public Pages
- Home, Features (with detail pages), Pricing, About, Contact
- Shop with product grid, search, categories, cart drawer
- Responsive navigation with dark/light theme persistence
- Contact form and newsletter subscription with Supabase + local fallback
- Animated backgrounds, 3D card effects, AOS scroll animations, loading screen, FAQ, back-to-top button

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React 18 | User interface |
| Vite 8 | Development server and production build |
| React Router 7 | Client-side routing |
| Supabase Auth | Email/Password and Google OAuth authentication |
| Supabase Database | Contact, newsletter, and user profile data |
| Supabase Storage | Avatar image uploads ("avatars" bucket) |
| EmailJS | Customer approval email delivery |
| Tailwind CSS 4 and custom CSS | Styling |
| Three.js | 3D animated backgrounds |

## Project Structure

```text
ecommerce-showcase/
├── public/                         # Static files served as-is
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                     # Images and the Supabase client
│   │   ├── hero.png
│   │   └── subabaseclient.js       # Supabase client singleton
│   ├── components/                 # Reusable components
│   │   ├── Navbar.jsx              # Navbar with auth-aware user menu
│   │   ├── UserProtectedRoute.jsx  # Route guard for authenticated users
│   │   ├── ProtectedRoute.jsx      # Route guard for admin users
│   │   ├── ShopOverlays.jsx        # Login modal, cart drawer, order modal
│   │   └── ...                     # Other UI components
│   ├── context/
│   │   └── ShopContext.jsx         # Global state: auth, cart, profile, toast
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Features.jsx
│   │   ├── FeatureDetail.jsx
│   │   ├── Pricing.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Shop.jsx
│   │   ├── UserDashboard.jsx       # Full user dashboard with profile management
│   │   ├── auth/                   # Standalone auth pages
│   │   │   ├── Login.jsx           # Email/password + Google login with role redirect
│   │   │   └── Signup.jsx          # Registration with auto-login
│   │   └── admin/                  # Admin section
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx  # Stats, messages, subscribers, DB viewer
│   │       ├── AdminNavbar.jsx
│   │       └── AdminSettings.jsx
│   ├── services/
│   │   ├── shopAuth.js             # Auth functions + profile CRUD + avatar upload
│   │   ├── adminAuth.js            # Admin credential helpers
│   │   ├── supabase.js             # Generic Supabase data helpers
│   │   └── localStore.js           # Browser-storage fallback and merge helpers
│   ├── App.jsx                     # Routes, theme provider, loader
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global and responsive styles (4600+ lines)
├── supabase/                       # SQL schema backup files
├── .env.example                    # Environment-variable template
├── index.html
├── package.json
└── vite.config.js
```

## Authentication Flow

### Login Page (`/login`)
- Enter email and password
- **Admin check**:Admin email and password redirects to `/admin/dashboard`
- **Regular user**: Authenticates via Supabase Auth → redirects to `/user-dashboard`
- Google OAuth button → authenticates via Supabase → redirects to `/user-dashboard`

### Signup Page (`/signup`)
- Enter name, email, password
- Creates account in Supabase Auth with `full_name` metadata
- If auto-confirm is enabled in Supabase → automatically redirected to dashboard
- If email confirmation required → shows pending message

### User Dashboard (`/user-dashboard`)
Protected by `UserProtectedRoute` — redirects to `/login` if not authenticated.

**Profile Card:**
- Avatar display (uploaded image or initial letter fallback)
- Upload / Change / Delete profile picture (stored in Supabase "avatars" bucket)
- Welcome greeting with display name
- Email and member-since date
- Logout button

**Profile Settings:**
- Edit display name and save to `profiles` table
- Success/error messages

**Account Information:**
- Email, Name, Member Since, User ID

**Help & Support:**
- FAQ accordion (5 questions)
- Contact Support button
- Privacy Policy link
- Terms & Conditions link

### Logout
- Clears all localStorage auth keys
- Calls `supabase.auth.signOut()`
- Navbar updates immediately (Login button reappears)

## Profile Table (Required SQL)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  avatar_file_path TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Supabase Storage: "avatars" bucket
1. Go to Supabase Dashboard → Storage
2. Create a **public** bucket named `avatars`
3. Optional: add RLS policy for authenticated uploads

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`, then add your Supabase and EmailJS values.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

Restart the Vite server whenever `.env` changes.

### 3. Set up Supabase tables

Run the full e-commerce schema in `supabase/ecommerce-schema.sql` in the Supabase SQL Editor. It creates:
`profiles`, `categories`, `products`, `cart`, `orders`, `order_items`, `addresses`, `coupons`, `payments`, `inventory_log` — with primary/foreign keys, indexes, constraints, RLS policies, helper functions, triggers, seed categories, and the `product-images` storage bucket.

Also create a **public** Storage bucket named `product-images` (the SQL attempts this automatically; otherwise do it in the dashboard) so the admin product uploader can store images.

```sql
CREATE TABLE contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
```

### 4. Configure EmailJS (for admin approval replies)

Create an EmailJS template with these dynamic values:

| Template field | Value |
| --- | --- |
| To Email | `{{user_email}}` |
| Reply To | `{{reply_to}}` |
| Subject | `{{title}}` or `{{subject}}` |
| Content | Use `{{name}}` and `{{message}}` as needed |

### 5. Run locally

```bash
npm run dev
```

OPEN: https://ecommerce-showcase-silk.vercel.app/

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the configured linter |

## Route Map

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page |
| `/shop` | Public | Product shop |
| `/features` | Public | Features overview |
| `/features/:slug` | Public | Feature detail |
| `/pricing` | Public | Pricing plans |
| `/about` | Public | About page |
| `/contact` | Public | Contact form |
| `/login` | Public | Login (Email/Password + Google) |
| `/signup` | Public | Create account |
| `/user-dashboard` | Auth required | User dashboard |
| `/dashboard` | Auth required | Backward compatible alias |
| `/admin` | Public | Admin login |
| `/admin/dashboard` | Admin auth | Admin dashboard (Orders, Products, Categories, Users, Messages, Subscribers) |
| `/admin/settings` | Admin auth | Admin settings |

## Deployment

Deploy to Vercel or another Vite-compatible static host. Configure the same `VITE_` environment variables in the hosting provider's project settings, then redeploy.

## Security Notes

- The admin credentials (`shakeelbhatti143143@gmail.com` / `1234qwerty`) are currently hardcoded in the frontend for demonstration purposes. **Do not use in production** — implement proper role-based access control in Supabase.
- Supabase Row Level Security (RLS) should be enabled on all tables.
- The anonymous Supabase key is safe to expose in client code, but RLS policies must restrict data access appropriately.

## License

MIT