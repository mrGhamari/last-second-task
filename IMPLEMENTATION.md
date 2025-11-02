# Smart Home Dashboard — Implementation Guide

This document explains what was implemented, why, and how to work with or extend the app. It covers styling, API integration, routing, state management, interactive controls, accessibility, performance, and troubleshooting.

## 1) Setup & Commands

- Requirements
  - Node.js 18+ (Nuxt 4 requirement)

- Install & run
  - `npm install`
  - `npm run dev` — start dev server
  - `npm run build` — production build
  - `npm run generate` — SSG for pre-rendered routes

## 2) Directory Structure (Nuxt 4)

- App source under `app/` (via `srcDir: 'app'`)
  - `app/app.vue` — app shell
  - `app/layouts/default.vue` — main layout with navbar, theme toggle, footer
  - `app/pages/` — all pages, including dynamic routes
  - `app/components/` — reusable components
  - `app/stores/` — Pinia stores for rooms and devices
  - `app/composables/` — UI/business logic composition functions (e.g., form)
  - `app/assets/styles/` — SCSS for Bootstrap theme and global styles
  - `app/plugins/` — client/server plugins (Bootstrap JS, retrying fetch)
  - `app/types/` — app-level TypeScript declarations

- Server routes under root `server/` (Nuxt Nitro)
  - Proxies to your Laravel API and a simple `/api/logs` endpoint for error logging

## 3) Styling & Theming

- Bootstrap 5.3 integration
  - `nuxt.config.ts` loads SCSS: `~/assets/styles/bootstrap.scss` and `~/assets/styles/main.scss`
  - `app/assets/styles/bootstrap.scss` overrides Bootstrap variables using the Sass module system `@use ... with (...)` to avoid collisions. Colors, radii, and font stack are customized.
  - `app/assets/styles/main.scss` adds route transitions, smooth theme transitions, reduced-motion, and robust `:focus-visible` outlines.

- Color mode (light/dark)
  - Early head script sets `data-bs-theme` on `<html>` using persisted preference or system default to avoid flicker.
  - Navbar theme toggle updates `data-bs-theme` at runtime and persists choice.

## 4) API Configuration

- Base URL
  - `runtimeConfig.public.apiBase` (default: `https://smart-home-api.lahzeakhari.ir/api`)
  - Override via env var: `NUXT_PUBLIC_API_BASE`.

- Data fetching
  - Pages use Nuxt’s native `useAsyncData` (or `useFetch`) with a custom `$apiFetch` plugin providing retries and error logging.
  - No Axios or external HTTP libraries are used.

## 5) Application Structure & Routing

- Main Layout & Navigation — `app/layouts/default.vue`
  - Bootstrap responsive navbar with burger menu (mobile) and theme toggle
  - Footer anchored to bottom using flex layout (`min-vh-100`, `flex-grow-1`, `mt-auto`)
  - Skip link, ARIA attributes, and keyboard-friendly behavior
  - Menu links come from `app/constants/menu.ts` for easy extension

- Pages
  - Home: `app/pages/index.vue` — lists rooms using `RoomList` component
  - Rooms: `app/pages/rooms/index.vue` — same list, dedicated route
  - Room Detail: `app/pages/rooms/[id].vue` — shows room details, device list, and interactive controls

- Dynamic Routing
  - `pages/rooms/[id].vue` uses route params and updates reactively when switching rooms

## 6) State Management (Pinia) & Data Handling

- Pinia stores
  - Rooms Store — `app/stores/rooms.ts`
    - Holds `rooms` list and `current` room; setters to update from fetched data
  - Devices Store — `app/stores/devices.ts`
    - Holds `devicesByRoom` and `selectedByRoom`
    - `normalizeDevice()` maps API payloads to a consistent internal shape (status on/off → online/offline; brightness/level; temperature/temp)
    - `initFromRoom()` initializes devices only once to avoid clobbering optimistic updates
    - `getDevices()`, `getSelectedId()`, `getSelected()` provide computed getters
    - `updateDevice()` performs optimistic updates, calls POST with retry via `$apiFetch`, then merges response while preferring the user’s intended values to prevent snap-back if the backend returns stale state

- Data fetching (Nuxt built‑in)
  - Home and Rooms: `GET /rooms`
  - Room Detail: `GET /rooms/{id}`
  - Update Device: `POST /rooms/{id}/devices/{deviceId}`

## 7) Interactive Controls & Live Preview

- Components
  - `app/components/DeviceSelector.vue` — store-driven device selector (no API logic)
  - `app/components/ControlPanel.vue` — UI + validation only; delegates updates to devices store
  - `app/components/LivePreview.vue` — reflects changes instantly from store (status, brightness glow, temperature)

- Form composable — `app/composables/useDeviceControlForm.ts`
  - Encapsulates form state, validation, type guards (light/climate), and idPrefix
  - Maintains a snapshot for deterministic Reset behavior

## 8) Accessibility & Responsiveness

- ARIA attributes on interactive elements (switches, alerts)
- Announce loading/errors via `aria-live` and `role="alert"`
- Strong `:focus-visible` outlines; keyboard-operable navbar and theme toggle
- Responsive Bootstrap grid (cards/list/groups) + mobile burger menu fixed

## 9) Performance

- Code splitting
  - Lazy-load large components on demand via `defineAsyncComponent` (RoomList, ControlPanel, LivePreview)

- SSR and SSG
  - `ssr: true`, prerender `/` and `/rooms` in `routeRules`
  - Nitro prerender crawling enabled

- Caching
  - Client-side `staleTime` on data fetches to reduce unnecessary network calls
  - You can adjust retry counts/delays in `$apiFetch` per-call

## 10) Error Handling, Retries & Logging

- `$apiFetch` plugin — `app/plugins/api-fetch.ts`
  - Automatic retries (network errors, 408, 429, 5xx) with exponential backoff
  - Logs failed requests to `/api/logs` with context (method, path, attempts)

- Server log endpoint — `server/api/logs.post.ts`
  - Prints errors to server console for developers to review

- Error views
  - `app/error.vue` presents user-friendly messages and actions (reload/home)
  - Control Panel prints helpful API error messages if updates fail

## 11) Mobile Navbar (Burger Menu) Fix

- Programmatic control using Bootstrap’s Collapse API
  - Reliable toggle on click and auto-collapse on route change
  - Fallback toggling when Bootstrap JS isn’t available

## 12) Environment Variables

- `NUXT_PUBLIC_API_BASE` — override the Laravel API base URL (default set in `nuxt.config.ts`)

## 13) Troubleshooting

- Pinia module not found
  - Run `npm install` (ensures `pinia` and `@pinia/nuxt` are installed)
  - Restart dev server after install

- Sass variable collision
  - Bootstrap theme uses `@use ... with (...)`; do not redeclare variables at top-level

- Font-family Sass error
  - Font stack is provided as a list in `$font-family-sans-serif` via `with (...)`

- Burger menu not opening
  - Bootstrap JS bundle is loaded via `app/plugins/bootstrap.client.ts`
  - The layout toggles Collapse programmatically and listens to Bootstrap events

## 14) Extending the App

- Add dashboard KPIs to Home (energy usage, online devices)
- Add filters/sorting to Rooms list
- Add DeviceStatusBadge component for unified status UI
- Persist logs to file or external service (extend `/api/logs`)

---

If you have different field names in your Laravel API responses, adjust `normalizeDevice()` in `app/stores/devices.ts` (and optionally the rooms store types) to keep the UI consistent.

