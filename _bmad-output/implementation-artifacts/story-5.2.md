# Story 5.2: Admin Market Resolution

Status: review

## Story

As an admin,
I want to resolve markets based on actual weather data,
So that winners can claim their payouts.

## Acceptance Criteria

**Given** the resolve route exists at `server/routes/resolve.ts`
**When** a POST request is made to `/api/resolve/:marketId`
**Then** the server:
1. Reads `marketId` from the URL parameter
2. Creates an ethers provider: `new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL)`
3. Creates an admin wallet: `new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider)`
4. Creates a contract instance: `new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, adminWallet)`
5. Reads the market: `contract.getMarket(marketId)`
6. Fetches current weather for `market.city` using the same OpenWeather service from Story 5.1
7. Determines the outcome based on the market's condition, operator, and threshold:
```typescript
let actualValue: number;
switch (market.condition) {
  case 0: actualValue = weatherData.rainfall * 100; break;  // RAINFALL in mm * 100
  case 1: actualValue = weatherData.temperature * 100; break; // TEMPERATURE in C * 100
  case 2: actualValue = weatherData.windSpeed * 100; break;  // WIND_SPEED in km/h * 100
}

let outcome: boolean;
if (market.operator === 0) { // ABOVE
  outcome = actualValue > Number(market.threshold);
} else { // BELOW
  outcome = actualValue < Number(market.threshold);
}
```
8. Calls `contract.resolveMarket(marketId, outcome)` with the admin wallet
9. Waits for the transaction to confirm: `tx.wait()`

**Given** the resolution succeeds
**When** the transaction confirms
**Then** the server responds with HTTP 200:
```json
{
  "success": true,
  "marketId": 0,
  "outcome": true,
  "actualValue": "8.5mm",
  "threshold": "10.00mm",
  "txHash": "0x..."
}
```
**And** the contract emits a `MarketResolved` event with `(marketId, outcome, totalPool)`
**And** the frontend (if open) can detect the status change on next data fetch and update the UI

**Given** a market's `resolutionTime` has NOT passed
**When** POST `/api/resolve/:marketId` is called
**Then** the `contract.resolveMarket` call reverts with "Too early to resolve"
**And** the server responds with HTTP 400: `{ "error": "Too early to resolve", "resolutionTime": market.resolutionTime }`

**Given** the DEPLOYER_PRIVATE_KEY in .env does not match the contract's admin
**When** the transaction is sent
**Then** the contract reverts with "Only admin"
**And** the server responds with HTTP 403: `{ "error": "Only admin can resolve markets" }`

**Given** the market is already resolved (status !== OPEN)
**When** POST `/api/resolve/:marketId` is called
**Then** the contract reverts with "Market not open"
**And** the server responds with HTTP 400: `{ "error": "Market already resolved" }`

**Given** the weather API fails during resolution
**When** the server cannot fetch weather data
**Then** the server responds with HTTP 500: `{ "error": "Failed to fetch weather data for resolution" }`
**And** the market is NOT resolved (no contract call is made)

**Given** the resolution endpoint should be protected
**When** any request hits POST `/api/resolve/:marketId`
**Then** the server checks for a simple auth header: `Authorization: Bearer {ADMIN_SECRET}` where `ADMIN_SECRET` is from `.env`
**And** if the header is missing or wrong, the server returns HTTP 401: `{ "error": "Unauthorized" }`
**And** the `.env.example` is updated to include `ADMIN_SECRET=your_admin_secret_here`

## Tasks / Subtasks

- [x] Create server/routes/resolve.ts with POST /api/resolve/:marketId endpoint
- [x] Implement Authorization header check against ADMIN_SECRET env var
- [x] Return HTTP 401 for missing/wrong auth header
- [x] Create ethers JsonRpcProvider with MONAD_RPC_URL
- [x] Create admin wallet from DEPLOYER_PRIVATE_KEY
- [x] Create contract instance with ABI and admin wallet
- [x] Read market data via contract.getMarket(marketId)
- [x] Fetch current weather data using OpenWeather service
- [x] Determine outcome based on condition, operator, threshold comparison
- [x] Call contract.resolveMarket(marketId, outcome) and await tx.wait()
- [x] Return HTTP 200 success response with marketId, outcome, actualValue, threshold, txHash
- [x] Handle "Too early to resolve" revert with HTTP 400
- [x] Handle "Only admin" revert with HTTP 403
- [x] Handle "Market not open" revert with HTTP 400
- [x] Handle weather API failure with HTTP 500 (no contract call made)
- [x] Create server/services/resolver.ts for resolution logic
- [x] Update .env.example with ADMIN_SECRET field

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

- `weather-bets/server/routes/resolve.ts`
- `weather-bets/server/services/resolver.ts`
