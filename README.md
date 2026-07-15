# ShopSphere 🛒
### The Smart E-Commerce Platform

> A production-grade product showcase website for a fictional e-commerce SaaS platform — built with React, Vite, Tailwind CSS v4, React Router, and Supabase.

---

## ✨ Features

- **5 Pages**: Home, Features, Pricing, About, Contact
- **Dark / Light Mode** with `localStorage` persistence
- **AOS Scroll Animations** on all cards and sections
- **Mobile Responsive** — hamburger menu, fluid grids
- **Contact Form** → saves to Supabase `contact_messages`
- **Newsletter** → saves to Supabase `newsletter`
- **Form Validation** with inline error messages
- **Animated Stats Counter** using IntersectionObserver
- **Loading Spinner** on first page load
- **Back-to-Top Button** with smooth scroll
- **SEO-ready** — title tags, meta descriptions, OG tags
- **Pricing Comparison Table** with feature matrix
- **FAQ Accordion** with smooth animations

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI Framework |
| Vite | 6 | Build Tool |
| Tailwind CSS | v4 | Styling |
| React Router DOM | 7 | Client-side Routing |
| Supabase JS | 2 | Backend / Database |
| AOS | 2 | Scroll Animations |

---

## Folder Structure

```
ecommerce-showcase/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── FeatureCard.jsx
│   │   ├── PricingCard.jsx
│   │   ├── TestimonialCard.jsx
│   │   ├── ContactForm.jsx
│   │   ├── Newsletter.jsx
│   │   ├── FAQ.jsx
│   │   ├── Stats.jsx
│   │   ├── Loader.jsx
│   │   └── BackToTop.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Features.jsx
│   │   ├── Pricing.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── services/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── vite.config.js
└── index.html
```

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your Project URL and anon key
3. Rename `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Create Database Tables

Run in Supabase SQL Editor:

```sql
CREATE TABLE contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text NOT NULL,
  message     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE newsletter (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts" ON newsletter FOR INSERT WITH CHECK (true);
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy

---

## License

MIT License (c) 2025 ShopSphere Inc.
