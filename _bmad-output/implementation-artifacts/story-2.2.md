# Story 2.2: Odds Bar Visualization

Status: review

## Story

As a user,
I want to see a visual representation of YES/NO odds on each market,
So that I can quickly gauge market sentiment.

## Acceptance Criteria

**Given** a market has bets in the YES and NO pools (e.g., totalYesPool=100 MON, totalNoPool=50 MON)
**When** the `OddsBar` component renders with props `{ yesPercent: number, noPercent: number, yesPool: bigint, noPool: bigint }`
**Then** I see a horizontal bar that is 100% width of its container and 12px tall with rounded corners
**And** the left portion is green (`bg-yes` / `#22c55e`) representing the YES percentage
**And** the right portion is red (`bg-no` / `#ef4444`) representing the NO percentage
**And** the green portion width is `{yesPercent}%` and the red portion width is `{noPercent}%`
**And** below the bar, percentage labels are shown: "YES {yesPercent}%" on the left (green text) and "NO {noPercent}%" on the right (red text)
**And** the bar portions use `transition-all duration-500 ease-in-out` so width changes animate smoothly

**Given** I hover over the YES portion of the OddsBar
**When** the tooltip appears
**Then** it shows "YES Pool: {formatMON(yesPool)} MON" in a dark tooltip with `bg-bg-hover rounded px-2 py-1 text-sm`

**Given** I hover over the NO portion of the OddsBar
**When** the tooltip appears
**Then** it shows "NO Pool: {formatMON(noPool)} MON"

**Given** a market has no bets (totalYesPool=0, totalNoPool=0)
**When** the OddsBar renders
**Then** it shows a 50/50 split with "YES 50%" and "NO 50%"
**And** both sides use a muted gray (`bg-bg-hover`) instead of green/red to indicate no real data

**Given** the OddsBar is used both on MarketCard (compact) and MarketPage (full-width)
**When** it renders in different contexts
**Then** it fills the available width of its parent container and is reusable without modification

## Tasks / Subtasks

- [x] Create OddsBar component accepting yesPercent, noPercent, yesPool, noPool props
- [x] Render horizontal bar at 100% width, 12px tall, rounded corners
- [x] Color left portion green (bg-yes) and right portion red (bg-no)
- [x] Set portion widths based on percentage props
- [x] Add percentage labels below bar (YES % left, NO % right)
- [x] Implement smooth transition animation (transition-all duration-500 ease-in-out)
- [x] Add hover tooltips showing pool amounts in MON
- [x] Handle zero-bet edge case: show 50/50 split with muted gray
- [x] Ensure component is reusable across MarketCard and MarketPage contexts

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

- `weather-bets/frontend/src/components/OddsBar.tsx`
