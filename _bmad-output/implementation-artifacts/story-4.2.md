# Story 4.2: Claim Winnings Flow

Status: review

## Story

As a user,
I want to claim my winnings from markets I predicted correctly,
So that I receive my MON tokens.

## Acceptance Criteria

**Given** a market is resolved and I bet on the winning side and have not yet claimed
**When** I click the "Claim" button on the MyBetsPage
**Then** MetaMask opens prompting me to confirm the `claimWinnings(marketId)` transaction
**And** the "Claim" button shows a loading spinner and text "Claiming..." while the transaction is pending
**And** the button is disabled during the transaction

**Given** the claim transaction confirms successfully
**When** `tx.wait()` resolves
**Then** a success notification appears (top-right toast or inline banner):
- Green background with text: "Winnings claimed! +{payout} MON"
- The notification auto-dismisses after 5 seconds
**And** the "Claim" button changes to "Claimed" (disabled, muted green text)
**And** the user's MON balance in the Navbar updates (by re-fetching balance from provider)
**And** the bet card updates to show `claimed: true`

**Given** I try to claim the same market again (e.g., by refreshing and clicking)
**When** the transaction is sent
**Then** the contract reverts with "Already claimed"
**And** the UI shows an error notification: "Already claimed for this market"

**Given** a market is resolved and I bet on the losing side
**When** I view the MyBetsPage
**Then** the bet card shows "LOST" badge in red and the bet amount as a loss
**And** no "Claim" button is rendered
**And** the card has a subtle red-tinted left border to visually indicate a loss

**Given** the claim transaction fails for any reason (gas issue, contract revert)
**When** the error occurs
**Then** the "Claim" button reverts to its clickable state
**And** an error notification appears: "Claim failed: {reason}. Please try again."

**Given** I claim winnings and then navigate away and back to `/my-bets`
**When** the page re-loads data from the contract
**Then** the claimed bet shows "Claimed" status (since `userBet.claimed` is read from the contract, not local state)

## Tasks / Subtasks

- [x] Implement handleClaim function in MyBets component
- [x] Call contractWithSigner.claimWinnings(marketId) on Claim button click
- [x] Show loading spinner and "Claiming..." text during transaction
- [x] Disable Claim button during pending transaction
- [x] Show success notification with payout amount on tx.wait() resolve
- [x] Auto-dismiss success notification after 5 seconds
- [x] Update Claim button to "Claimed" (disabled, muted green) on success
- [x] Re-fetch MON balance in Navbar after successful claim
- [x] Update bet card to reflect claimed: true
- [x] Handle "Already claimed" contract revert with error notification
- [x] Handle losing side: show "LOST" badge, no Claim button, red-tinted border
- [x] Handle generic claim failures with error notification and button reset
- [x] Ensure claimed state persists on page reload (read from contract, not local state)

## Dev Notes

- Implementation completed outside formal BMAD workflow
- Retroactive review being performed
- The claim logic (handleClaim) is implemented within the MyBets.tsx component

### References

- [Source: _bmad-output/planning-artifacts/epics.md]
- [Source: _bmad-output/planning-artifacts/architecture.md]

## Dev Agent Record

### Agent Model Used

Claude (pre-BMAD workflow)

### File List

- `weather-bets/frontend/src/components/MyBets.tsx`
