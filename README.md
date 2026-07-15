# ShopSphere

A responsive e-commerce platform showcase built with React and Vite. It includes public marketing pages, contact and newsletter forms, and a mobile-friendly admin dashboard for reviewing and approving customer messages.

## Features

- Public pages for Home, Features, Pricing, About, and Contact
- Responsive navigation and layouts for mobile, tablet, and desktop
- Dark and light theme persistence
- Contact form and newsletter subscription storage with Supabase and local fallback storage
- Admin dashboard for viewing messages and subscribers
- EmailJS approval emails sent to the customer email entered in the contact form
- Responsive mobile admin menu and approval modal
- Animated background, AOS effects, loading screen, FAQ, and back-to-top button

## Tech stack

| Technology | Purpose |
| --- | --- |
| React 18 | User interface |
| Vite 8 | Development server and production build |
| React Router 7 | Client-side routing |
| Supabase | Contact and newsletter data |
| EmailJS | Customer approval email delivery |
| Tailwind CSS 4 and custom CSS | Styling |
| AOS / Three.js | Animations and visual effects |

## Project structure

```text
ecommerce-showcase/
├── public/                         # Static files served as-is
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                     # Images and the Supabase client
│   │   ├── hero.png
│   │   └── subabaseclient.js
│   ├── components/                 # Reusable public-site components
│   │   ├── AnimatedBackground.jsx
│   │   ├── ContactForm.jsx
│   │   ├── Navbar.jsx
│   │   ├── Newsletter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Features.jsx
│   │   ├── Pricing.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── admin/                  # Admin login, dashboard, and settings
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminNavbar.jsx
│   │       └── AdminSettings.jsx
│   ├── services/
│   │   ├── localStore.js           # Browser-storage fallback and merge helpers
│   │   └── supabase.js             # Supabase data helpers
│   ├── App.jsx                     # Routes and theme provider
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global and responsive styles
├── E-Comerence/                    # Legacy standalone HTML/CSS/JS prototype
├── .env.example                    # Environment-variable template
├── index.html
├── package.json
└── vite.config.js
```

## Getting started

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

### 3. Configure EmailJS

Create an EmailJS template for approval replies. Its dynamic values should be configured as follows:

| Template field | Value |
| --- | --- |
| To Email | `{{user_email}}` |
| Reply To | `{{reply_to}}` |
| Subject | `{{title}}` or `{{subject}}` |
| Content | Use `{{name}}` and `{{message}}` as needed |

The admin dashboard passes the approved contact's email through `user_email`, so the email goes to that customer—not to a fixed admin address.

### 4. Set up Supabase tables

Create the tables used by the current application:

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

For production, protect database access with Supabase Authentication and restrictive Row Level Security policies. Do not expose write, read, or delete access broadly through the anonymous key.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the configured linter |

## Deployment

Deploy to Vercel or another Vite-compatible static host. Configure the same `VITE_` environment variables in the hosting provider's project settings, then redeploy.

## Notes

- `.env` contains environment-specific values and should not be committed with private credentials.
- The current admin login is a client-side demonstration. Replace it with Supabase Auth or a server-side authentication system before production use.

## License

MIT
