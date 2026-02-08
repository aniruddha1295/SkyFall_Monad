# Story 1.1: Set Up Project Structure and Smart Contract

Status: review

## Story

As a developer,
I want the project scaffolded with Hardhat, Vite+React, and the WeatherBets contract compiled,
So that I have a working development environment.

## Acceptance Criteria

**Given** the project root directory exists
**When** I run the setup commands
**Then** the project has the following structure:
```
weather-bets/
├── package.json
├── hardhat.config.ts
├── .env.example
├── .gitignore
├── contracts/
│   └── WeatherBets.sol
├── scripts/
│   ├── deploy.ts
│   └── seed-markets.ts
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── config/
│       ├── hooks/
│       ├── components/
│       ├── pages/
│       ├── lib/
│       └── types/
└── server/
    ├── index.ts
    └── routes/
```

**And** `contracts/WeatherBets.sol` contains the full parimutuel betting contract from PRD Section 4.1 with:
- `WeatherCondition` enum (RAINFALL, TEMPERATURE, WIND_SPEED)
- `Operator` enum (ABOVE, BELOW)
- `MarketStatus` enum (OPEN, RESOLVED, CANCELLED)
- `Market` struct with id, city, condition, operator, threshold (scaled by 100), resolutionTime, pools, status, outcome, creator
- `Bet` struct with amount, isYes, claimed
- `createMarket`, `placeBet`, `resolveMarket`, `claimWinnings` functions
- `getMarket`, `getOdds`, `getUserBet`, `getActiveMarketCount`, `getPotentialPayout` view functions
- 2% platform fee on winnings distribution
- Events: MarketCreated, BetPlaced, MarketResolved, WinningsClaimed

**And** `npx hardhat compile` succeeds without errors

**And** `hardhat.config.ts` is configured for Monad Testnet:
```typescript
networks: {
  monadTestnet: {
    url: "https://testnet-rpc.monad.xyz/",
    chainId: 10143,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
}
```

**And** `frontend/` is initialized with Vite React-TS template, with dependencies:
- `ethers@^6.13.0`, `react@^18.3.0`, `react-dom@^18.3.0`, `react-router-dom@^6.20.0`

**And** Tailwind CSS is configured with the custom dark theme from PRD Section 7.2:
```javascript
colors: {
  bg: { DEFAULT: "#0a0a0f", surface: "#14141f", hover: "#1e1e2e" },
  border: { DEFAULT: "#2a2a3a" },
  brand: { DEFAULT: "#8b5cf6", hover: "#a78bfa" },
  yes: "#22c55e",
  no: "#ef4444",
},
fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
```

**And** `index.css` imports Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) and sets `body { @apply bg-bg text-white; }`

**And** `.env.example` contains:
```
OPENWEATHER_API_KEY=your_key_here
DEPLOYER_PRIVATE_KEY=your_monad_testnet_private_key_here
CONTRACT_ADDRESS=will_be_set_after_deployment
PORT=3001
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
```

**And** `.gitignore` excludes `node_modules/`, `.env`, `artifacts/`, `cache/`, `dist/`, `typechain-types/`

**And** `frontend/src/types/index.ts` defines TypeScript types:
```typescript
export interface Market {
  id: number;
  city: string;
  condition: number; // 0=RAINFALL, 1=TEMPERATURE, 2=WIND_SPEED
  operator: number;  // 0=ABOVE, 1=BELOW
  threshold: bigint;
  resolutionTime: bigint;
  createdAt: bigint;
  totalYesPool: bigint;
  totalNoPool: bigint;
  status: number;    // 0=OPEN, 1=RESOLVED, 2=CANCELLED
  outcome: boolean;
  creator: string;
}

export interface Bet {
  amount: bigint;
  isYes: boolean;
  claimed: boolean;
}
```

**And** `frontend/src/lib/constants.ts` exports:
```typescript
export const MONAD_CHAIN_ID = 10143;
export const MONAD_RPC = "https://testnet-rpc.monad.xyz/";
export const MONAD_EXPLORER = "https://testnet.monadexplorer.com/";
export const CONDITION_LABELS = ["Rainfall", "Temperature", "Wind Speed"];
export const CONDITION_UNITS = ["mm", "C", "km/h"];
export const OPERATOR_LABELS = ["above", "below"];
```

**And** `frontend/src/lib/formatters.ts` exports helper functions:
- `truncateAddress(address: string): string` -- returns `0x1234...5678` format
- `formatMON(wei: bigint): string` -- converts wei to MON with 4 decimal places using `ethers.formatEther`
- `formatThreshold(value: bigint, condition: number): string` -- divides by 100 and appends correct unit
- `formatCountdown(resolutionTime: bigint): string` -- returns "Xh Ym" or "Xd Yh" remaining
- `marketQuestion(market: Market): string` -- returns "Will {city} {condition} be {operator} {threshold}{unit}?"

## Tasks / Subtasks

- [x] Initialize root project with package.json, tsconfig.json, hardhat.config.ts
- [x] Create .env.example with required environment variables
- [x] Create .gitignore with appropriate exclusions
- [x] Write WeatherBets.sol smart contract with full parimutuel betting logic
- [x] Configure Hardhat for Monad Testnet (chainId 10143)
- [x] Scaffold frontend with Vite React-TS template
- [x] Install frontend dependencies (ethers, react-router-dom)
- [x] Configure Tailwind CSS with custom dark theme colors
- [x] Set up postcss.config.js for Tailwind
- [x] Create index.css with Tailwind directives and body styling
- [x] Define TypeScript types (Market, Bet) in types/index.ts
- [x] Create constants.ts with chain config and label arrays
- [x] Create formatters.ts with helper functions (truncateAddress, formatMON, formatThreshold, formatCountdown, marketQuestion)
- [x] Scaffold server directory with index.ts and routes/
- [x] Scaffold scripts directory with deploy.ts and seed-markets.ts placeholders
- [x] Verify contract compiles with `npx hardhat compile`

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

- `weather-bets/package.json`
- `weather-bets/hardhat.config.ts`
- `weather-bets/tsconfig.json`
- `weather-bets/.env.example`
- `weather-bets/.gitignore`
- `weather-bets/contracts/WeatherBets.sol`
- `weather-bets/frontend/index.html`
- `weather-bets/frontend/package.json`
- `weather-bets/frontend/vite.config.ts`
- `weather-bets/frontend/tailwind.config.js`
- `weather-bets/frontend/postcss.config.js`
- `weather-bets/frontend/tsconfig.json`
- `weather-bets/frontend/tsconfig.app.json`
- `weather-bets/frontend/tsconfig.node.json`
- `weather-bets/frontend/src/index.css`
- `weather-bets/frontend/src/types/index.ts`
- `weather-bets/frontend/src/lib/constants.ts`
- `weather-bets/frontend/src/lib/formatters.ts`
- `weather-bets/server/index.ts`
- `weather-bets/server/routes/weather.ts`
- `weather-bets/server/routes/resolve.ts`
- `weather-bets/scripts/deploy.ts`
- `weather-bets/scripts/seed-markets.ts`
