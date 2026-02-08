# Story 1.4: App Shell with Navigation

Status: review

## Story

As a user,
I want a consistent app layout with navigation and Monad branding,
So that I can move between pages easily.

## Acceptance Criteria

**Given** I open the app at any route
**When** the page loads
**Then** I see a top Navbar containing:
- Left: "WeatherBets" logo text with a cloud/lightning icon (can be emoji or SVG)
- Center/Left: Navigation links for "Markets" (links to `/`) and "My Bets" (links to `/my-bets`)
- Right: The wallet connect button from Story 1.3
**And** the Navbar has a dark background (`bg-bg-surface` / `#14141f`) with bottom border (`border-border` / `#2a2a3a`)
**And** the Navbar is sticky at the top of the viewport (`sticky top-0 z-50`)

**Given** I am on mobile (viewport < 768px)
**When** I view the Navbar
**Then** the navigation links are hidden behind a hamburger menu icon
**And** clicking the hamburger opens a slide-down or side panel with the nav links
**And** clicking a link or clicking outside closes the menu

**Given** I scroll to the bottom of any page
**When** I see the Footer
**Then** it contains:
- "Built on Monad" text with Monad branding
- "Monad Blitz Nagpur 2026" badge
- Link to Monad testnet explorer (`https://testnet.monadexplorer.com/`)
**And** the Footer uses `bg-bg-surface` background with `border-t border-border`

**Given** the app has routing configured
**When** I navigate between pages
**Then** `react-router-dom` v6 handles the following routes:
- `/` renders `HomePage`
- `/market/:id` renders `MarketPage`
- `/my-bets` renders `MyBetsPage`
**And** `App.tsx` wraps routes in `<BrowserRouter>` with `<Navbar />` above and `<Footer />` below the route outlet
**And** the layout has `min-h-screen flex flex-col` with the main content area using `flex-1`
**And** the main content area is centered with `max-w-7xl mx-auto px-4`

**Given** the app uses the custom dark theme
**When** any page renders
**Then** the background is `#0a0a0f`, text is `#f8fafc`, and the purple accent `#8b5cf6` is used for interactive elements (buttons, links, active states)
**And** Inter font is loaded from Google Fonts via a `<link>` tag in `index.html` or imported in `index.css`

## Tasks / Subtasks

- [x] Create Navbar component with logo, nav links, and wallet button
- [x] Style Navbar with bg-bg-surface, border-border, sticky top-0 z-50
- [x] Implement hamburger menu for mobile viewports (< 768px)
- [x] Create Footer component with Monad branding and explorer link
- [x] Style Footer with bg-bg-surface and border-t border-border
- [x] Configure react-router-dom v6 routes in App.tsx
- [x] Set up BrowserRouter with Navbar above and Footer below route outlet
- [x] Implement min-h-screen flex flex-col layout with flex-1 main content
- [x] Center content with max-w-7xl mx-auto px-4
- [x] Load Inter font from Google Fonts in index.html
- [x] Apply dark theme colors throughout (bg #0a0a0f, text #f8fafc, accent #8b5cf6)
- [x] Set up main.tsx entry point with React.StrictMode and RouterProvider/BrowserRouter

## Dev Notes

- Implementation completed outside formal BMAD workflow
- Retroactive review being performed

### References

- [Source: _bmad-output/planning-artifacts/epics.md]
- [Source: _bmad-output/planning-artifacts/architecture.md]

## Dev Agent Record

### Agent Model Used

Claude (pre-BMAD workflow)

### File List

- `weather-bets/frontend/src/App.tsx`
- `weather-bets/frontend/src/main.tsx`
- `weather-bets/frontend/src/components/Navbar.tsx`
- `weather-bets/frontend/src/components/Footer.tsx`
- `weather-bets/frontend/index.html`
- `weather-bets/frontend/src/index.css`
