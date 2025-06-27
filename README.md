# Converso - Personalized Learning Companion Platform

Converso is a SaaS platform that allows users to create, manage, and interact with AI-powered learning companions. Users can build companions for different subjects, track their learning sessions, and bookmark their favorite companions. The platform uses Clerk for authentication and Supabase for data storage.

---

## Features

- **User Authentication:** Secure sign-in and sign-up with Clerk.
- **Companion Builder:** Create custom learning companions for various subjects.
- **Session Tracking:** Track recently completed learning sessions.
- **Bookmarks:** Bookmark your favorite companions for quick access.
- **Subscription Plans:** 
  - **Pro users:** Unlimited companions.
  - **Feature-flagged users:** Limits based on Clerk feature flags (e.g., 3 or 10 companions).
- **Responsive UI:** Modern, mobile-friendly interface.

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **State Management:** React Hooks

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eyob13-coder/converso.git
cd converso
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

- `components/` - React components (UI, forms, cards, etc.)
- `lib/` - Utility functions, Supabase client, and server actions
- `pages/` or `app/` - Next.js routes and API endpoints
- `public/` - Static assets

---

## Companion Creation Limits

- **Pro users:** Unlimited companions
- **Users with `3_companion_limit` feature:** Up to 3 companions
- **Users with `10_companion_limit` feature:** Up to 10 companions
- **All others:** Default limit (configurable in code)

Limits are enforced in the backend using Clerk feature flags and Supabase row counts.

---

## Deployment

You can deploy this app to Vercel, Netlify, or any platform that supports Next.js.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---



## Acknowledgements

- [Clerk](https://clerk.dev/) for authentication
- [Supabase](https://supabase.com/) for backend and database
- [Next.js](https://nextjs.org/) for the React framework
