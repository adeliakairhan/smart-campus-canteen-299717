# Smart Campus Canteen

A responsive web app that lets university students order canteen food ahead of a
short break, follow the order's status, and collect it with a QR code — plus a
staff dashboard to manage orders and monitor sales.

## Screens
- **Home** (`/`) — welcome, search, food categories, featured menu, “View Menu”.
- **Menu** (`/menu`) — food cards with image, name, KZT price and availability;
  search, category chips, max-price slider and a “Budget meals ≤ 1500 KZT” filter.
- **Cart** (`/cart`) — quantities, removal, total, “Place Order”.
- **Order confirmation** (`/order/confirmation`) — shows order ID, total and status
  only when returned by the backend.
- **Order tracking** (`/track`) — Pending → Preparing → Ready → Completed.
- **QR pickup** (`/pickup`) — QR/pickup token and locker details only when provided
  by the backend.
- **Staff dashboard** (`/staff`) — KPIs, orders table with status controls, popular
  dishes, status breakdown; loading, empty and error states.

## Data status
The app is designed for an **existing Supabase database**, which is **not connected
yet**. All data calls live in `src/lib/data/source.ts` and currently report
“not connected”; the UI says so plainly. No menu items, orders, QR codes or lockers
are invented.

For demos, turn on **Layout preview** in the header. It fills screens with clearly
labeled sample content (“Sample …”, “Preview” tags) that is never sent anywhere.

## Tech
TanStack Start (React 19, TanStack Router), Tailwind CSS 4, shadcn/ui (Radix),
lucide-react icons, `qrcode.react`, deployed on Netlify. Images are served through
the Netlify Image CDN.

## Run locally
```bash
pnpm install
pnpm dev            # http://localhost:3000
# or, with Netlify emulation:
netlify dev
```

## Roadmap
See [PLAN.md](PLAN.md): schema verification and menu integration, student auth and
order placement, QR pickup and lockers, staff dashboard on real data, polish.
