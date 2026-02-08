# Story 2.3: Market Detail Page

Status: review

## Story

As a user,
I want to see full details of a specific market,
So that I can make an informed betting decision.

## Acceptance Criteria

**Given** I navigate to `/market/:id` (e.g., `/market/0`)
**When** the MarketPage loads
**Then** the `useContract` hook calls `contract.getMarket(id)` and `contract.getOdds(id)` to fetch the market data
**And** while loading, a skeleton layout is shown with pulsing placeholders for each section

**Given** market data is loaded
**When** the MarketPage renders
**Then** I see a market header section with:
- Weather condition icon (large, e.g., 48px)
- City name in `text-3xl font-bold`
- Market question: e.g., "Will Nagpur rainfall be above 10.00mm?"
- Status badge: "OPEN" (green) or "RESOLVED" (gray)
- Countdown timer showing time remaining in `HH:MM:SS` format that ticks down every second using `setInterval`

**Given** the MarketPage layout
**When** I view on desktop (>= 1024px)
**Then** the content is split into two columns:
- Left column (60%): Odds visualization, pool stats, bet buttons, user's existing bet
- Right column (40%): WeatherWidget placeholder (empty card with "Weather data coming soon" text until Epic 5), SpeedDemo placeholder (empty card with "Place a bet to see Monad speed" until Epic 3)
**And** the columns use `grid grid-cols-1 lg:grid-cols-5 gap-6` with left taking `lg:col-span-3` and right taking `lg:col-span-2`

**Given** I view on mobile (< 1024px)
**When** the MarketPage renders
**Then** the columns stack vertically (left content on top, right content below)

**Given** the left column is visible
**When** I view the market details
**Then** I see:
- The full-width OddsBar (from Story 2.2) showing YES/NO percentages
- Pool stats in a card: "Total Pool: X MON", "YES Pool: X MON", "NO Pool: X MON", "Bettors: X" (bettors count from `marketBettors[id].length` or a read from contract)
- Two large buttons side by side: "Bet YES" (green, `bg-yes hover:bg-green-600`) and "Bet NO" (red, `bg-no hover:bg-red-600`)
- Each button has `text-lg font-bold py-3 px-6 rounded-lg` styling
- If wallet is not connected, clicking a bet button shows a tooltip: "Connect wallet to bet"

**Given** the market status is RESOLVED
**When** I view the MarketPage
**Then** the bet buttons are disabled and grayed out
**And** a result banner shows: "Market Resolved: YES won" (green) or "Market Resolved: NO won" (red)
**And** the countdown timer shows "Ended" instead of a timer

**Given** the countdown reaches zero
**When** the timer hits 0
**Then** it displays "Awaiting Resolution" and the bet buttons disable (since betting is closed after resolutionTime)

## Tasks / Subtasks

- [x] Create MarketPage that reads :id from route params
- [x] Fetch market data and odds via useContract hook
- [x] Implement loading skeleton with pulsing placeholders
- [x] Create market header with icon, city name, question, status badge, countdown
- [x] Implement live countdown timer with setInterval (HH:MM:SS format)
- [x] Create MarketDetail component with two-column layout (lg:grid-cols-5)
- [x] Left column: OddsBar, pool stats card, Bet YES/NO buttons
- [x] Right column: WeatherWidget and SpeedDemo placeholders
- [x] Style bet buttons (green for YES, red for NO, large with rounded-lg)
- [x] Handle wallet not connected: show tooltip on bet button click
- [x] Handle RESOLVED status: disable buttons, show result banner, show "Ended"
- [x] Handle countdown reaching zero: show "Awaiting Resolution", disable buttons
- [x] Ensure mobile responsiveness (columns stack vertically)

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

- `weather-bets/frontend/src/pages/MarketPage.tsx`
- `weather-bets/frontend/src/components/MarketDetail.tsx`
