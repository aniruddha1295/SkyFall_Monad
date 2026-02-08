# Story 3.1: Bet Placement Flow

Status: review

## Story

As a user,
I want to place a YES or NO bet on a weather market,
So that I can profit if my prediction is correct.

## Acceptance Criteria

**Given** I am connected with MetaMask on Monad Testnet and viewing a MarketPage with status=OPEN
**When** I click the "Bet YES" button
**Then** a `BetModal` opens as a centered overlay with a dark backdrop (`bg-black/50`)
**And** the modal header shows "Bet YES" with green accent color and a close (X) button in the top-right
**And** the modal has `bg-bg-surface rounded-xl border border-border p-6 max-w-md mx-auto` styling

**Given** the BetModal is open for YES
**When** I view the modal content
**Then** I see:
- Selected side indicator: "YES" in green text with a green left border accent
- An amount input field: `<input type="number" step="0.01" min="0.01" placeholder="Amount in MON" />` with `bg-bg rounded-lg border border-border p-3 text-white w-full` styling
- Quick amount buttons in a row: 0.1, 0.5, 1.0, 5.0 MON -- each as a pill button (`rounded-full px-4 py-1 text-sm border border-border hover:border-brand`)
- Clicking a quick button sets the input value to that amount
- Potential payout display: "Potential Payout: X.XXXX MON" -- calculated by calling `contract.getPotentialPayout(marketId, true, ethers.parseEther(amount))`
- Implied probability: "Implied Probability: X%" -- calculated as `(winningPool / totalPool) * 100` where winningPool includes the user's bet
- A large "Place Bet" button: `bg-brand hover:bg-brand-hover text-white font-bold py-3 w-full rounded-lg`

**Given** I click "Bet NO" instead
**When** the BetModal opens
**Then** the header shows "Bet NO" with red accent color, the side indicator says "NO" in red, and the payout calculation passes `isYes=false`

**Given** I enter an amount (e.g., "1.0") in the input field
**When** the amount changes
**Then** the potential payout updates in real-time by calling `contract.getPotentialPayout(marketId, isYes, ethers.parseEther(amount))`
**And** if the input is empty or "0", the payout shows "--" instead of calling the contract
**And** debounce the contract call by 300ms to avoid excessive RPC calls

**Given** I enter a valid amount and click "Place Bet"
**When** MetaMask opens and I confirm the transaction
**Then** the modal transitions to a "Confirming..." state:
- The "Place Bet" button shows a spinning loader and text "Confirming..."
- The button is disabled
- The contract call is `contractWithSigner.placeBet(marketId, isYes, { value: ethers.parseEther(amount) })`
- The app calls `tx.wait()` to wait for confirmation

**Given** the transaction confirms successfully
**When** `tx.wait()` resolves
**Then** the modal shows a success state:
- A green checkmark icon (CSS animated: scale from 0 to 1 with bounce)
- Text: "Bet Placed Successfully!"
- The bet details: side, amount, transaction hash (truncated, linked to `https://testnet.monadexplorer.com/tx/{hash}`)
- A brief confetti animation (CSS-only keyframes: 20-30 small colored squares falling from top of modal)
**And** the modal auto-closes after 3 seconds or on clicking "Done"
**And** the MarketPage re-fetches market data so the OddsBar and pool stats update immediately

**Given** the transaction fails (user rejects in MetaMask or tx reverts on-chain)
**When** the error occurs
**Then** the modal shows an error state:
- Red warning icon
- Error message: "Transaction Failed" with the reason (e.g., "User rejected transaction" or "Already bet on this market")
- A "Try Again" button that resets the modal to the input state
- A "Close" button to dismiss

**Given** I have already placed a bet on this market
**When** I try to place another bet
**Then** the contract reverts with "Already bet on this market"
**And** the BetModal shows this error message in the error state

**Given** the market's resolutionTime has passed (betting closed)
**When** I try to bet
**Then** the contract reverts with "Betting closed"
**And** the frontend should also grey out bet buttons when `Date.now()/1000 >= market.resolutionTime`

## Tasks / Subtasks

- [x] Create BetModal component as centered overlay with dark backdrop
- [x] Implement modal header with side indicator (YES green / NO red) and close button
- [x] Create amount input field with proper styling and validation
- [x] Add quick amount buttons (0.1, 0.5, 1.0, 5.0 MON)
- [x] Calculate and display potential payout via contract.getPotentialPayout()
- [x] Calculate and display implied probability
- [x] Implement 300ms debounce on payout contract calls
- [x] Handle "Place Bet" submission: call contractWithSigner.placeBet() with value
- [x] Show "Confirming..." state with spinner during tx.wait()
- [x] Show success state with green checkmark, bet details, tx hash link
- [x] Implement CSS confetti animation on success
- [x] Auto-close modal after 3 seconds on success
- [x] Re-fetch market data after successful bet
- [x] Handle transaction failure: show error state with reason
- [x] Handle "Already bet on this market" revert
- [x] Handle "Betting closed" revert and grey out buttons
- [x] Create BetConfirmation component for success/error states

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

- `weather-bets/frontend/src/components/BetModal.tsx`
- `weather-bets/frontend/src/components/BetConfirmation.tsx`
