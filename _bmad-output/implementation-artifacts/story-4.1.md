# Story 4.1: My Bets Portfolio Page

Status: review

## Story

As a user,
I want to see all my active and past bets,
So that I can track my positions and performance.

## Acceptance Criteria

**Given** I navigate to `/my-bets` while connected with my wallet
**When** the MyBetsPage loads
**Then** the page iterates over all markets (0 to `marketCount - 1`) and calls `contract.getUserBet(marketId, myAddress)` for each
**And** it filters to only markets where `userBet.amount > 0` (user has placed a bet)
**And** for each such market, it also calls `contract.getMarket(marketId)` and `contract.getOdds(marketId)` to get full market info
**And** while loading, a skeleton list with pulsing placeholders is shown

**Given** I have placed bets on one or more markets
**When** the bet list renders
**Then** each bet is displayed as a card/row showing:
- Market question (e.g., "Will Nagpur rainfall be above 10.00mm?")
- My side: "YES" in green or "NO" in red, displayed as a colored badge
- Amount bet: `formatMON(userBet.amount)` MON
- Current odds: YES X% / NO Y% (from `getOdds`)
- Potential payout: calculated via `contract.getPotentialPayout(marketId, userBet.isYes, userBet.amount)` and displayed as "X.XXXX MON"
- Market status: "OPEN" (green badge) or "RESOLVED" (gray badge)

**Given** a market is RESOLVED and I bet on the winning side (`userBet.isYes === market.outcome`)
**When** the bet card renders
**Then** it shows:
- Outcome badge: "WON" in green
- Payout amount in green text
- If `userBet.claimed === false`: a "Claim" button (purple, `bg-brand hover:bg-brand-hover text-white rounded-lg py-2 px-4`)
- If `userBet.claimed === true`: "Claimed" text in muted green (disabled, no button)

**Given** a market is RESOLVED and I bet on the losing side (`userBet.isYes !== market.outcome`)
**When** the bet card renders
**Then** it shows:
- Outcome badge: "LOST" in red
- Amount lost in red text: "-{amount} MON"
- No Claim button is shown

**Given** a market is still OPEN
**When** the bet card renders
**Then** it shows:
- Status: "OPEN" badge
- Time remaining: `formatCountdown(market.resolutionTime)`
- Current potential payout (which can change as more bets come in)

**Given** I have no bets (no `getUserBet` returns amount > 0)
**When** the MyBetsPage loads
**Then** I see an empty state:
- A large icon (e.g., a weather/cloud icon)
- Text: "No bets yet -- start predicting weather!"
- A purple button: "Browse Markets" that links to `/`

**Given** I am not connected with my wallet
**When** I navigate to `/my-bets`
**Then** I see: "Connect your wallet to view your bets" with a "Connect Wallet" button that triggers the wallet connection flow from Story 1.3

## Tasks / Subtasks

- [x] Create MyBetsPage that checks wallet connection state
- [x] Show "Connect your wallet" message with Connect Wallet button when disconnected
- [x] Iterate over all markets and call getUserBet for each with user address
- [x] Filter to markets where userBet.amount > 0
- [x] Fetch full market info and odds for each user bet
- [x] Show loading skeleton list while data loads
- [x] Create MyBets component rendering bet cards
- [x] Display market question, side badge (YES/NO), amount, odds, potential payout, status
- [x] Handle RESOLVED + winning side: show "WON" badge, payout, Claim button or "Claimed" text
- [x] Handle RESOLVED + losing side: show "LOST" badge, loss amount in red
- [x] Handle OPEN markets: show countdown timer and current potential payout
- [x] Implement empty state with icon, message, and "Browse Markets" link
- [x] Calculate potential payout via contract.getPotentialPayout()

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

- `weather-bets/frontend/src/pages/MyBetsPage.tsx`
- `weather-bets/frontend/src/components/MyBets.tsx`
