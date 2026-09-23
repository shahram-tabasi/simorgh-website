# Simorgh — Next.js migration

This project was migrated from **React + Vite + React Router** to **Next.js App Router**.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Routes

Public:

- `/`
- `/products`
- `/products/[slug]`
- `/solutions`
- `/industries`
- `/industries/[slug]`
- `/technology`
- `/insights`
- `/company`
- `/contact`
- `/request-demo`

Admin:

- `/admin`
- `/admin/content`
- `/admin/hero`
- `/admin/media`
- `/admin/requests`
- `/admin/seo`

Locale-prefixed URLs such as `/en/products` and `/fa/products` are preserved through a redirect route.

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Migration notes

- Vite entry point and `react-router-dom` routing were removed.
- Next.js App Router route files were added under `app/`.
- Product and industry detail pages use Next.js dynamic routes.
- `Link`, `usePathname`, `useParams`, and `notFound` use Next.js APIs.
- The existing visual components, data files, Tailwind configuration, public assets, and Framer Motion UI were retained.
- The existing admin authentication is still the original client-side demo context; it has not been converted to a production authentication backend.

## Verification

The source was statically checked for remaining `react-router-dom`, `NavLink`, `Outlet`, and `<Link to=...>` usage.

A full `next build` was not completed in the conversion environment because installing npm dependencies exceeded the available execution window. Run `npm install` followed by `npm run build` locally/server-side to perform the final Next.js compiler check.
