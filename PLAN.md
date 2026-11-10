# Smart Campus Canteen — Roadmap

The product is built in milestones. Each milestone keeps the rule set from the brief:
no invented tables, columns or records; nothing is reported as successful unless
Supabase confirms it; no secret keys in frontend code.

## Milestone 1 — Product surface ✅ (done)
- Branded, responsive UI for every student screen (Home, Menu, Cart, Order
  Confirmation, Order Tracking, QR Pickup) and the Staff Dashboard.
- Single data-access module (`src/lib/data/source.ts`) that currently returns
  `not-connected` for every call; every screen renders loading, empty, error and
  not-connected states.
- Opt-in "Layout preview" with clearly labeled sample content for demos.

## Milestone 2 — Verify the Supabase schema and connect the menu
- Get Supabase project URL + keys from the owner; store as Netlify env vars
  (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and a server-only key if required).
- Inspect the real schema (`menu_item`, `orders`, `dish`, `locker`, columns such as
  `is_available`, `price`, `status`, `temperature_celsius`) and RLS policies.
  Document the confirmed mapping in AGENTS.md.
- Implement `listMenuItems()` as a TanStack Start server function; map rows onto
  `MenuItem`. Flip `DATA_SOURCE.connected` only when calls succeed.

## Milestone 3 — Student authentication and order placement
- Supabase Auth for students (university email), session handled server-side.
- `placeOrder()` inserts the order (and line items, if the schema has them) and
  returns the row Supabase confirms; server re-validates prices and availability.
- `getOrder()` for tracking; optional Supabase Realtime subscription for live status.

## Milestone 4 — QR pickup and lockers
- Read the pickup token / QR payload and locker assignment exactly as stored.
  The UI already renders a QR from a backend token and shows locker data only
  when present.
- Staff-side token verification at handover.

## Milestone 5 — Staff dashboard on real data
- Staff role via Supabase Auth + RLS; protect `/staff`.
- `listStaffOrders()`, `updateOrderStatus()` with optimistic-free updates (UI
  changes only after Supabase confirms).
- `getSalesStats()` backed by a database view or RPC for orders today, revenue,
  average order, status counts and popular dishes.

## Milestone 6 — Polish
- Order history for students, notifications when an order is Ready, accessibility
  and performance pass, end-to-end tests.
