# Story 3.2: Speed Demo Component

Status: review

## Story

As a user,
I want to see how fast Monad confirms my transaction compared to Ethereum,
So that I understand Monad's speed advantage.

## Acceptance Criteria

**Given** I am viewing a MarketPage and no bet has been placed yet in this session
**When** the SpeedDemo component renders in the right column
**Then** it shows a card with:
- Header: "Monad Speed" with a lightning bolt icon
- Body text: "Place a bet to see Monad's speed"
- A comparison placeholder: "Ethereum avg: ~12,000ms" in muted text
**And** the card has `bg-bg-surface rounded-xl border border-border p-4` styling

**Given** I submit a bet transaction (Story 3.1)
**When** the transaction is sent to the network (`tx` returned from `placeBet`)
**Then** the SpeedDemo component is notified (via a shared state or callback prop) with the submission timestamp (`Date.now()`)
**And** the component shows:
- "Transaction submitted..." with an animated spinning indicator
- A live counter ticking up from 0ms, updating every 10ms via `requestAnimationFrame` or `setInterval(10)`
- The counter displays in large text: `text-3xl font-mono font-bold text-brand`

**Given** the transaction confirms (`tx.wait()` resolves)
**When** the SpeedDemo receives the confirmation timestamp
**Then** the counter stops at the actual elapsed time (e.g., `confirmTime - submitTime`)
**And** it displays: "Confirmed in {X}ms" where X is the actual milliseconds
**And** below it shows a comparison bar:
- Monad bar: short green bar proportional to actual time, labeled "{X}ms"
- Ethereum bar: long red/gray bar representing 12,000ms, labeled "~12,000ms"
- The bars are animated, growing from left to right over 0.5s
**And** a text callout: "That's {Math.round(12000/X)}x faster than Ethereum"

**Given** the user places another bet on a different market later
**When** the SpeedDemo receives a new transaction
**Then** it resets and measures the new transaction, replacing the previous result

**Given** the SpeedDemo component needs to communicate with the bet flow
**When** the architecture is designed
**Then** the `MarketPage` passes a `onTransactionSubmit` and `onTransactionConfirm` callback (or uses a shared context/state) that the `BetModal` calls with timestamps, and the `SpeedDemo` reads these values from props or context

## Tasks / Subtasks

- [x] Create SpeedDemo component with initial idle state card
- [x] Display "Monad Speed" header with lightning bolt icon
- [x] Show "Place a bet to see Monad's speed" placeholder text
- [x] Show "Ethereum avg: ~12,000ms" comparison placeholder
- [x] Implement live counter ticking from 0ms on transaction submit
- [x] Update counter every 10ms using requestAnimationFrame or setInterval
- [x] Display counter in text-3xl font-mono font-bold text-brand
- [x] Stop counter on transaction confirmation
- [x] Display "Confirmed in {X}ms" result
- [x] Create animated comparison bars (Monad vs Ethereum 12,000ms)
- [x] Calculate and display "That's {N}x faster than Ethereum" callout
- [x] Handle reset on new transaction submission
- [x] Wire up onTransactionSubmit/onTransactionConfirm callbacks from MarketPage/BetModal

## Dev Notes

- Implementation completed outside formal BMAD workflow
- Retroactive review being performed
- The Ethereum comparison baseline of 12,000ms is defined in lib/constants.ts

### References

- [Source: _bmad-output/planning-artifacts/epics.md]
- [Source: _bmad-output/planning-artifacts/architecture.md]

## Dev Agent Record

### Agent Model Used

Claude (pre-BMAD workflow)

### File List

- `weather-bets/frontend/src/components/SpeedDemo.tsx`
- `weather-bets/frontend/src/lib/constants.ts`
