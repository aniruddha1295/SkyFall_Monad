# Story 1.2: Deploy Contract and Seed Demo Markets

Status: review

## Story

As a developer,
I want the WeatherBets contract deployed to Monad Testnet with 3 demo markets,
So that the frontend has real on-chain data to display.

## Acceptance Criteria

**Given** the contract compiles successfully (Story 1.1 complete) and `DEPLOYER_PRIVATE_KEY` is set in `.env`
**When** I run `npx hardhat run scripts/deploy.ts --network monadTestnet`
**Then** the console outputs `WeatherBets deployed to: 0x...`
**And** the deployed address is written to `frontend/src/config/deployed-address.json` as `{ "address": "0x..." }`
**And** the contract ABI from `artifacts/contracts/WeatherBets.sol/WeatherBets.json` is extracted and exported in `frontend/src/config/contract.ts` as:
```typescript
import deployedAddress from './deployed-address.json';
export const WEATHER_BETS_ADDRESS = deployedAddress.address;
export const WEATHER_BETS_ABI = [ /* full ABI array */ ];
export const MONAD_CHAIN_ID = 10143;
export const MONAD_RPC = "https://testnet-rpc.monad.xyz/";
```

**Given** the contract is deployed
**When** I run `npx hardhat run scripts/seed-markets.ts --network monadTestnet`
**Then** 3 demo markets are created on-chain:
- Market 0: city="Nagpur", condition=RAINFALL(0), operator=ABOVE(0), threshold=1000 (10.00mm), resolutionTime=now+24h
- Market 1: city="Mumbai", condition=TEMPERATURE(1), operator=ABOVE(0), threshold=3500 (35.00C), resolutionTime=now+24h
- Market 2: city="Delhi", condition=WIND_SPEED(2), operator=ABOVE(0), threshold=2000 (20.00km/h), resolutionTime=now+48h
**And** `contract.marketCount()` returns 3
**And** each market is verifiable at `https://testnet.monadexplorer.com/address/{CONTRACT_ADDRESS}`

**Given** the seed script has run
**When** I call `contract.getMarket(0)`, `contract.getMarket(1)`, `contract.getMarket(2)`
**Then** each returns the correct Market struct with status=OPEN(0), totalYesPool=0, totalNoPool=0

## Tasks / Subtasks

- [x] Write deploy.ts script that deploys WeatherBets contract to Monad Testnet
- [x] Output deployed address to console
- [x] Write deployed address to frontend/src/config/deployed-address.json (or embed in contract.ts)
- [x] Extract ABI and export in frontend/src/config/contract.ts
- [x] Export MONAD_CHAIN_ID and MONAD_RPC from contract.ts
- [x] Write seed-markets.ts script that creates 3 demo markets
- [x] Seed Market 0: Nagpur / RAINFALL / ABOVE / 10.00mm / 24h
- [x] Seed Market 1: Mumbai / TEMPERATURE / ABOVE / 35.00C / 24h
- [x] Seed Market 2: Delhi / WIND_SPEED / ABOVE / 20.00km/h / 48h
- [x] Verify marketCount returns 3 after seeding
- [x] Verify each market struct is correct via getMarket()

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

- `weather-bets/scripts/deploy.ts`
- `weather-bets/scripts/seed-markets.ts`
- `weather-bets/frontend/src/config/contract.ts`
