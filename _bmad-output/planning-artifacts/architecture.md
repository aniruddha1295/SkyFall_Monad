---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
workflowType: 'architecture'
project_name: 'WeatherBets'
user_name: 'dell'
date: '2026-02-08'
lastStep: 8
status: 'complete'
completedAt: '2026-02-08'
---

# Architecture Decision Document - WeatherBets

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

1. **Market Creation** - Admin creates weather prediction markets specifying city, weather condition (rainfall/temperature/wind speed), comparison operator (above/below), threshold value (scaled by 100), and a future resolution timestamp.
2. **Bet Placement** - Users place YES or NO bets on open markets by sending MON tokens. One bet per user per market. Bets are accepted until the resolution time.
3. **Market Resolution** - Admin resolves a market after its resolution time by providing the actual weather outcome (true/false). The contract updates market status from OPEN to RESOLVED.
4. **Winnings Claim** - Winners of resolved markets claim their proportional share of the total pool minus a 2% platform fee. Double-claims are prevented on-chain.
5. **Wallet Connection** - Users connect via MetaMask exclusively. The app detects connection state, network correctness (Chain ID 10143), and displays the truncated address plus MON balance.
6. **Weather Display** - Live weather data (temperature, rainfall, wind speed, humidity) is fetched via the backend proxy from OpenWeather API and displayed in a WeatherWidget component per market.
7. **Odds Display** - Real-time parimutuel odds shown as a horizontal bar (OddsBar) reflecting the YES/NO pool ratio. Default 50/50 when no bets exist. Potential payout calculated via on-chain view function.
8. **Speed Demo** - A dedicated SpeedDemo component measures actual transaction confirmation time in milliseconds (Date.now() diff between tx submission and receipt) and contrasts it against Ethereum's ~12-second average.
9. **My Bets Portfolio** - Users view all their active and past bets, see current P&L for resolved markets, and claim winnings directly from this page.
10. **Market Listing & Filtering** - HomePage displays a responsive grid of all markets with filters (All/Active/Resolved) and sorting (Newest/Most Popular/Ending Soon).

**Non-Functional Requirements:**

- Sub-second finality on Monad Testnet (target <500ms confirmation)
- Low gas costs enabling micro-bets as small as 0.01 MON
- Mobile responsive design with breakpoints at 640px, 768px, and 1024px
- OpenWeather free tier rate limit: 60 calls/minute
- MetaMask is the only supported wallet (no RainbowKit, wagmi, or web3modal)
- No server-side rendering (Vite SPA only)
- No database; all state is on-chain
- TypeScript across all layers for type safety

**Scale & Complexity:**

- **Complexity Level:** Low-Medium (hackathon MVP, 7-hour build window)
- **Primary Domain:** Full-stack Web3 dApp (smart contract + backend proxy + frontend SPA)
- **Estimated Architectural Components:** 3 layers (Solidity smart contract, Express.js backend proxy, React frontend SPA)
- **User Volume:** Demo-scale (single-digit concurrent users during hackathon presentation)
- **Data Volume:** 3 seeded markets, up to ~20 bets total during demo

### Technical Constraints & Dependencies

| Constraint | Detail |
|---|---|
| **Wallet** | MetaMask browser extension required. No alternative wallet support. |
| **Blockchain** | Monad Testnet only (Chain ID 10143, RPC: https://testnet-rpc.monad.xyz/) |
| **Weather API** | OpenWeather free tier (60 calls/min, current weather + 5-day forecast, no historical data) |
| **Blockchain Library** | ethers.js v6 exclusively. v6 API differs significantly from v5 (BrowserProvider, parseEther, waitForDeployment). |
| **No SSR** | Vite + React SPA only. No Next.js, no server-rendered pages. `window.ethereum` is accessed directly. |
| **No Database** | Zero persistence layer. All market/bet state lives on-chain. No localStorage for state caching. |
| **No Indexing** | No The Graph, no subgraph. Direct contract reads for all data. Acceptable at MVP scale. |
| **Node.js 18+** | Required runtime for Hardhat, Express, and Vite dev server. |
| **Solidity ^0.8.20** | Compiler version pinned in Hardhat config. |
| **Gas Tokens** | Testnet MON from faucet.monad.xyz. Must be pre-funded before demo. |

### Cross-Cutting Concerns Identified

1. **Wallet Connection State** - Every page and component that interacts with the contract depends on wallet connection status. The `useWallet` hook must provide signer, provider, address, and balance globally. Components must gracefully handle three states: disconnected, wrong network, and connected.

2. **Network Switching** - If the user is on the wrong chain, the app must prompt switching to Monad Testnet via `wallet_addEthereumChain`. The Navbar must show a red "Switch to Monad" button. All contract interactions must be blocked until on the correct network.

3. **Transaction Timing for Speed Demo** - Every write transaction must capture `Date.now()` before submission and after `tx.wait()` completes. This timing data feeds the SpeedDemo component and is the primary Monad differentiator during the demo.

4. **Error Handling for Failed Transactions** - MetaMask rejections, insufficient balance, contract reverts (e.g., "Already bet on this market", "Market not open"), and RPC failures must all be caught and displayed with actionable messages. BetModal must support an error state with retry.

5. **Threshold Value Scaling** - The contract stores thresholds scaled by 100 (10.5mm = 1050). Every frontend display must divide by 100, and every contract write must multiply by 100. Inconsistency here would cause incorrect market questions and resolutions.

6. **Admin vs. User Permissions** - Market creation and resolution are admin-only (onlyAdmin modifier). The frontend should not expose admin actions to non-admin wallets. The backend resolution endpoint uses the admin's private key server-side.

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Web3 dApp consisting of three independently scaffolded layers:
- **Smart Contract Layer** - Solidity compiled and deployed via Hardhat
- **Backend Layer** - Express.js server acting as API proxy and admin resolver
- **Frontend Layer** - React SPA bundled by Vite with Tailwind CSS

### Selected Starter: Manual Scaffold (Vite + Hardhat + Express)

**Rationale:** The PRD explicitly specifies this exact stack composition. No single starter template or monorepo generator covers all three layers with the precise dependency versions required. Each layer is initialized separately using standard CLI tools, then composed into a single project directory with a root `package.json`.

**Why not existing starters:**
- **create-eth-app / scaffold-eth** - Too opinionated, bundles wagmi/RainbowKit which the PRD explicitly prohibits
- **Foundry** - Requires Rust installation, PRD specifies Hardhat for pure Node.js ecosystem
- **Next.js starters** - PRD prohibits SSR; Vite avoids `"use client"` headaches with `window.ethereum`
- **Turborepo/Nx** - Over-engineered for a hackathon MVP

### Initialization Commands

```bash
# Step 1: Create project root
mkdir weather-bets && cd weather-bets
npm init -y

# Step 2: Install Hardhat and contract tooling
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node dotenv
npx hardhat init  # Choose: TypeScript project

# Step 3: Scaffold React frontend with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install ethers@6
npm install react-router-dom@6
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

# Step 4: Set up Express backend
mkdir -p server/routes server/services
npm install express cors dotenv ethers@6
npm install -D @types/express @types/cors

# Step 5: Create environment file
cp .env.example .env
# Fill in: OPENWEATHER_API_KEY, DEPLOYER_PRIVATE_KEY, CONTRACT_ADDRESS, PORT, MONAD_RPC_URL

# Step 6: Create .gitignore
# Contents: node_modules/, .env, artifacts/, cache/, dist/
```

---

## Core Architectural Decisions

### Data Architecture

**On-Chain State (WeatherBets.sol) - Single Source of Truth:**

All application state lives on-chain. There is no database, no cache layer, and no localStorage persistence.

| State | Storage | Access Pattern |
|---|---|---|
| Markets | `mapping(uint256 => Market)` | Read via `getMarket(id)`, iterate via `marketCount` |
| Bets | `mapping(uint256 => mapping(address => Bet))` | Read via `getUserBet(marketId, address)` |
| Market Bettors | `mapping(uint256 => address[])` | Used internally for fee distribution |
| Market Count | `uint256 marketCount` | Counter for market IDs (0-indexed) |
| Admin Address | `address admin` | Set in constructor to deployer |
| Platform Fee | `uint256 platformFeePercent = 2` | Fixed at 2% |

**Parimutuel Pool Model:**
- All bets on a market flow into a shared pool (totalYesPool + totalNoPool)
- On resolution, winners split (totalPool - 2% fee) proportionally to their individual bet size relative to the winning side's pool
- Losers forfeit their entire bet amount to the pool
- Platform fee is distributed to the admin proportionally per claim transaction

**Threshold Value Encoding:**
- All threshold values are integers scaled by 100 to avoid floating-point in Solidity
- 10.5mm rainfall = 1050 on-chain
- 35.00 degrees C = 3500 on-chain
- 20.00 km/h wind = 2000 on-chain
- Frontend must divide by 100 for display and multiply by 100 for writes

**Market Lifecycle:**
```
OPEN (accepting bets) --> RESOLVED (outcome determined, claims open) --> [no further state change]
                      --> CANCELLED (stretch goal, not in MVP)
```

### Authentication & Security

- **Identity Model:** Wallet address IS user identity. No auth system, no sessions, no JWTs, no login flow. `msg.sender` in the contract is the canonical identifier.
- **Admin Access Control:** The `onlyAdmin` modifier restricts `createMarket` and `resolveMarket` to the deployer address (`admin = msg.sender` in constructor). No multi-sig, no role hierarchy.
- **Private Key Management:** The deployer/admin private key is stored in `.env` and used by Hardhat for deployment and by the Express backend for admin resolution calls. This file is gitignored and never committed.
- **CORS Policy:** Express backend enables CORS for the frontend origin (localhost:5173 in dev). No API key validation on the backend routes since the OpenWeather key is the only secret, and it is hidden from the client.
- **Input Validation:** The smart contract enforces all business rules: bet amount > 0, market is OPEN, resolution time not passed, no duplicate bets, admin-only resolution. The frontend provides UX-level validation but the contract is the authority.

### API & Communication

**Frontend to Smart Contract (ethers.js v6):**
```
Read operations (no gas, instant):
  - provider = new ethers.BrowserProvider(window.ethereum)
  - contract = new ethers.Contract(address, abi, provider)
  - contract.getMarket(id) --> Market struct
  - contract.getOdds(id) --> [yesPercent, noPercent]
  - contract.getUserBet(id, address) --> Bet struct
  - contract.getPotentialPayout(id, isYes, amount) --> uint256
  - contract.marketCount() --> uint256
  - contract.getActiveMarketCount() --> uint256

Write operations (requires signer, costs gas):
  - signer = await provider.getSigner()
  - contractWithSigner = contract.connect(signer)
  - contractWithSigner.placeBet(marketId, isYes, { value: ethers.parseEther(amount) })
  - contractWithSigner.claimWinnings(marketId)
```

**Frontend to Backend (REST API):**
```
GET  /api/weather/:city          --> Current weather data for a city
GET  /api/weather/:city/forecast --> 5-day / 3-hour forecast for a city
POST /api/resolve/:marketId      --> Admin triggers market resolution
```

**Backend to OpenWeather (REST API):**
```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric
GET https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={key}&units=metric

Response fields consumed:
  - main.temp (temperature in Celsius)
  - rain["1h"] / rain["3h"] (rainfall in mm)
  - wind.speed (m/s, multiply by 3.6 for km/h)
  - weather[0].main (condition string)
  - weather[0].icon (icon code for display)
  - name (confirmed city name)
```

**Smart Contract Events:**
```solidity
event MarketCreated(uint256 indexed marketId, string city, uint8 condition, uint256 threshold, uint256 resolutionTime);
event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount);
event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool);
event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout);
```

These events can be listened to via `contract.on("EventName", callback)` for real-time UI updates, though polling via direct reads is also acceptable for MVP.

### Frontend Architecture

**State Management: React Hooks Only**
- No Redux, no Zustand, no MobX. Three custom hooks manage all state:
  - `useWallet` - wallet connection, signer, provider, address, balance, chain ID
  - `useContract` - contract instance, market data reads, write transaction wrappers
  - `useWeather` - weather data fetching from backend proxy
- Component-local state via `useState` for UI state (modals, forms, loading, errors)
- Data is re-fetched from the contract on each relevant page load (no global cache)

**Component Architecture: Feature-Based Organization**
```
src/
  hooks/       --> Custom React hooks (useWallet, useContract, useWeather)
  components/  --> Reusable UI components (Navbar, MarketCard, BetModal, etc.)
  pages/       --> Route-level page components (HomePage, MarketPage, etc.)
  config/      --> Static configuration (contract ABI/address, chain config)
  lib/         --> Utility functions (formatters, providers, constants)
  types/       --> TypeScript interfaces and type definitions
```

**Routing: react-router-dom v6**
```
/              --> HomePage (market list grid)
/market/:id    --> MarketPage (market detail + betting interface)
/my-bets       --> MyBetsPage (user's bet portfolio)
/create        --> CreateMarketPage (stretch goal)
```

**Styling: Tailwind CSS with Custom Dark Theme**
- Monad-inspired color palette with near-black backgrounds, purple primary, green/red for YES/NO
- Custom theme extensions in tailwind.config.js for brand colors
- Inter font from Google Fonts with system sans-serif fallback
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- No custom CSS files; all styling via Tailwind utility classes

### Infrastructure & Deployment

| Component | Target | URL |
|---|---|---|
| Smart Contract | Monad Testnet | Chain ID 10143, address from deploy script |
| Frontend | Vite dev server | http://localhost:5173 |
| Backend | Express server | http://localhost:3001 |

- **No CI/CD pipeline** - hackathon MVP, manual deployment only
- **No containerization** - all three services run as local Node.js processes
- **No cloud hosting** - entirely local for demo day (laptop presentation)
- **Contract deployment** is a one-time action via `npx hardhat run scripts/deploy.ts --network monadTestnet`
- **Market seeding** is a one-time action via `npx hardhat run scripts/seed-markets.ts --network monadTestnet`

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Code Naming:**

| Category | Convention | Examples |
|---|---|---|
| React Components | PascalCase `.tsx` | `MarketCard.tsx`, `BetModal.tsx`, `SpeedDemo.tsx` |
| Custom Hooks | camelCase with `use` prefix `.ts` | `useWallet.ts`, `useContract.ts`, `useWeather.ts` |
| Utility Modules | camelCase `.ts` | `formatters.ts`, `providers.ts`, `constants.ts` |
| Type Definitions | PascalCase interfaces | `Market`, `Bet`, `WeatherData`, `WalletState` |
| Constants | UPPER_SNAKE_CASE | `MONAD_CHAIN_ID`, `WEATHER_BETS_ADDRESS`, `PLATFORM_FEE_PERCENT` |
| Solidity Contract | PascalCase `.sol` | `WeatherBets.sol` |
| Enums (Solidity) | PascalCase values | `WeatherCondition.RAINFALL`, `MarketStatus.OPEN` |
| Express Routes | lowercase `.ts` | `weather.ts`, `resolve.ts` |
| Scripts | kebab-case `.ts` | `deploy.ts`, `seed-markets.ts` |

**API Naming:**

| Layer | Convention | Examples |
|---|---|---|
| REST Endpoints | lowercase with colon params | `GET /api/weather/:city`, `POST /api/resolve/:marketId` |
| Contract Functions (write) | camelCase | `placeBet`, `resolveMarket`, `claimWinnings`, `createMarket` |
| Contract Functions (read) | camelCase with `get` prefix | `getMarket`, `getOdds`, `getUserBet`, `getPotentialPayout`, `getActiveMarketCount` |
| Contract Events | PascalCase | `MarketCreated`, `BetPlaced`, `MarketResolved`, `WinningsClaimed` |

### Structure Patterns

- **Frontend** is co-located by feature type: `hooks/`, `components/`, `pages/`, `config/`, `lib/`, `types/` under `frontend/src/`
- **Smart Contract** lives in `contracts/` at the project root (Hardhat convention)
- **Backend** is organized as `server/index.ts` entry with `routes/` and `services/` subdirectories
- **Deployment scripts** live in `scripts/` at the project root (Hardhat convention)
- **Configuration** is split by concern: `hardhat.config.ts` (root), `vite.config.ts` (frontend), `tailwind.config.js` (frontend), `.env` (root)
- **Generated artifacts** from Hardhat compilation go to `artifacts/` and `cache/` (both gitignored)
- **Deployed address** is written to `frontend/src/config/deployed-address.json` by the deploy script

### Format Patterns

| Data Type | Contract Format | Display Format | Conversion |
|---|---|---|---|
| MON values | `uint256` (wei) | `"1.5 MON"` | `ethers.parseEther()` / `ethers.formatEther()` |
| Threshold values | `uint256` scaled by 100 | `"10.5mm"`, `"35C"` | Divide by 100 for display, multiply by 100 for contract |
| Timestamps | `uint256` Unix seconds | `"5h 23m left"` countdown | `Date.now()/1000` vs. `resolutionTime`, render as countdown |
| Addresses | `address` (42-char hex) | `"0x1234...5678"` | Truncate: first 6 + last 4 characters |
| Odds | `uint256` (0-100) | `"YES 65% | NO 35%"` | Direct percentage from `getOdds()` |
| Wind speed | `float` m/s (from API) | `"20 km/h"` | Multiply OpenWeather `wind.speed` by 3.6 |
| Weather conditions | `uint8` enum index | `"Rainfall"`, `"Temperature"` | Map 0=RAINFALL, 1=TEMPERATURE, 2=WIND_SPEED |
| Operators | `uint8` enum index | `"above"`, `"below"` | Map 0=ABOVE, 1=BELOW |

### Process Patterns

**Error Handling Strategy:**

| Error Scenario | Detection | User-Facing Response |
|---|---|---|
| MetaMask not installed | `typeof window.ethereum === 'undefined'` | "Install MetaMask" message with link to metamask.io |
| Wrong network (not 10143) | `chainId !== '0x27a7'` (10143 in hex) | Red "Switch to Monad" button that calls `wallet_addEthereumChain` |
| Transaction rejected by user | MetaMask `ACTION_REJECTED` error code | "Transaction cancelled" message in BetModal, return to input state |
| Transaction reverted on-chain | Error message from contract revert string | Display revert reason: "Already bet on this market", "Market not open", etc. |
| Insufficient MON balance | Compare bet amount to wallet balance before submission | "Insufficient balance. You have X MON." with link to faucet |
| OpenWeather API failure | HTTP error or timeout from backend | WeatherWidget shows "Weather data unavailable" with last-fetched timestamp |
| Backend server unreachable | Network error on fetch to localhost:3001 | "Weather service offline" message; betting still works (contract reads are direct) |
| RPC node failure | ethers.js provider connection error | "Cannot connect to Monad. Please try again." with retry button |

**Loading State Patterns:**
- **Page load:** Tailwind `animate-pulse` skeleton screens matching the layout shape (grey rectangles for cards, text lines, bars)
- **Transaction states:** Four-phase flow in BetModal:
  1. **Input** - User enters bet amount, sees potential payout
  2. **Confirming** - MetaMask popup open, "Waiting for confirmation..." spinner
  3. **Success** - Green checkmark animation, confirmation time displayed, "Confirmed in Xms"
  4. **Closed** - Modal dismissed, market data refreshed
- **Error state:** Red border on BetModal, error message displayed, "Try Again" button returns to Input state
- **Weather refresh:** WeatherWidget shows a green "Live" dot that pulses, data refreshes every 60 seconds silently

**Transaction Timing Pattern (for SpeedDemo):**
```typescript
const startTime = Date.now();
const tx = await contractWithSigner.placeBet(marketId, isYes, { value });
const receipt = await tx.wait();
const confirmationTime = Date.now() - startTime;
// Pass confirmationTime to SpeedDemo component
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
weather-bets/
├── package.json                    # Root package.json (workspaces)
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Template for env vars
├── hardhat.config.ts               # Hardhat config with Monad Testnet
├── contracts/
│   └── WeatherBets.sol             # Core prediction market contract
├── scripts/
│   ├── deploy.ts                   # Deploy contract to Monad Testnet
│   └── seed-markets.ts             # Create demo markets post-deploy
├── frontend/
│   ├── index.html                  # Vite entry HTML
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.js          # Tailwind with custom theme
│   ├── postcss.config.js           # PostCSS for Tailwind
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── index.css               # Tailwind imports (@tailwind base/components/utilities)
│   │   ├── config/
│   │   │   ├── contract.ts         # ABI + deployed address + chain config
│   │   │   └── weather.ts          # Backend API URL config
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        # MetaMask connection hook
│   │   │   ├── useContract.ts      # Contract read/write hook
│   │   │   └── useWeather.ts       # Weather data fetching hook
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top nav with wallet connect button
│   │   │   ├── MarketCard.tsx      # Individual market display card
│   │   │   ├── MarketList.tsx      # Grid of active markets
│   │   │   ├── BetModal.tsx        # YES/NO bet placement modal
│   │   │   ├── BetConfirmation.tsx # Post-bet success animation
│   │   │   ├── MyBets.tsx          # User's active positions
│   │   │   ├── WeatherWidget.tsx   # Live weather data display
│   │   │   ├── OddsBar.tsx         # Visual YES/NO pool ratio bar
│   │   │   ├── MarketDetail.tsx    # Full market page with stats
│   │   │   ├── SpeedDemo.tsx       # Monad speed visualization component
│   │   │   └── Footer.tsx          # Footer with Monad branding
│   │   ├── pages/
│   │   │   ├── HomePage.tsx        # Landing page with market list
│   │   │   ├── MarketPage.tsx      # Individual market detail + betting
│   │   │   ├── MyBetsPage.tsx      # Portfolio of user's bets
│   │   │   └── CreateMarketPage.tsx # (Stretch) User-created markets
│   │   ├── lib/
│   │   │   ├── providers.ts        # ethers.js provider setup
│   │   │   ├── formatters.ts       # MON formatting, date helpers, address truncation
│   │   │   └── constants.ts        # App-wide constants (chain ID, RPC URL, etc.)
│   │   └── types/
│   │       └── index.ts            # TypeScript type definitions (Market, Bet, WeatherData, etc.)
│   └── public/
│       ├── favicon.ico
│       └── monad-logo.svg
├── server/
│   ├── index.ts                    # Express server entry (port 3001)
│   ├── routes/
│   │   ├── weather.ts              # GET /api/weather/:city, GET /api/weather/:city/forecast
│   │   └── resolve.ts             # POST /api/resolve/:marketId
│   └── services/
│       ├── openweather.ts          # OpenWeather API wrapper (fetch + parse)
│       └── resolver.ts             # Admin resolution logic (reads weather, calls contract)
└── README.md
```

### Architectural Boundaries

**Smart Contract Layer (WeatherBets.sol):**

WeatherBets.sol is the ONLY smart contract. It is the single source of truth for all market and bet state. No proxy contracts, no upgradability patterns, no external contract dependencies.

| Function Category | Functions | Access |
|---|---|---|
| **Admin Functions** | `createMarket(city, condition, operator, threshold, resolutionTime)` | `onlyAdmin` modifier |
| | `resolveMarket(marketId, outcome)` | `onlyAdmin` modifier |
| **User Functions** | `placeBet(marketId, isYes)` (payable) | Any address |
| | `claimWinnings(marketId)` | Any address (with valid winning bet) |
| **View Functions** | `getMarket(marketId)` | Public, no gas |
| | `getOdds(marketId)` | Public, no gas |
| | `getUserBet(marketId, user)` | Public, no gas |
| | `getActiveMarketCount()` | Public, no gas |
| | `getPotentialPayout(marketId, isYes, amount)` | Public, no gas |
| **State Variables** | `admin`, `marketCount`, `platformFeePercent` | Public auto-getters |

The contract enforces all business rules:
- Bets only on OPEN markets before resolution time
- One bet per user per market
- Non-zero bet amounts
- Admin-only market creation and resolution
- Resolution only after resolution time
- No double-claiming of winnings

**Backend Layer (Express Server):**

The Express server is a thin, stateless proxy with exactly two responsibilities:

1. **API Key Proxy** - Hides the OpenWeather API key from the frontend. The frontend calls `GET /api/weather/:city` on localhost:3001, and the server forwards the request to OpenWeather with the key appended server-side.

2. **Admin Resolution** - The `POST /api/resolve/:marketId` endpoint fetches current weather for the market's city, compares the actual value against the market's threshold and operator, determines the boolean outcome, and calls `resolveMarket(marketId, outcome)` on the contract using the admin's private key (from .env).

The backend has NO database, NO session management, NO authentication middleware, and NO business logic beyond weather comparison. It is approximately 80 lines of code total.

**Frontend Layer (React SPA):**

The React SPA is the user-facing interface with 4 pages, 3 custom hooks, and 11 components.

| Page | Responsibility | Key Components Used |
|---|---|---|
| `HomePage` | Market discovery, hero section, "How It Works" | Navbar, MarketList, MarketCard, OddsBar, Footer |
| `MarketPage` | Market detail, betting interface, weather display | Navbar, MarketDetail, BetModal, BetConfirmation, OddsBar, WeatherWidget, SpeedDemo |
| `MyBetsPage` | User's bet portfolio, claim winnings | Navbar, MyBets, Footer |
| `CreateMarketPage` | (Stretch) Create custom markets | Navbar, form components |

The frontend reads market/bet data directly from the contract via ethers.js (no backend intermediary for contract reads). Write transactions go through the user's MetaMask signer. Weather data is the only thing fetched from the backend.

### Data Flow

**Complete User Journey - Bet Placement:**

```
1. User opens app
   --> React app loads at localhost:5173
   --> useContract hook reads marketCount and all markets from contract via ethers.js provider
   --> HomePage renders MarketList with MarketCards

2. User connects wallet
   --> Clicks "Connect Wallet" in Navbar
   --> useWallet hook checks window.ethereum exists
   --> Calls ethereum.request({ method: 'eth_requestAccounts' })
   --> Checks chainId === 10143 (0x27a7)
   --> If wrong chain: prompt wallet_addEthereumChain with Monad Testnet config
   --> Stores address, balance, signer, provider in React state
   --> Navbar updates to show truncated address + MON balance

3. User browses markets
   --> Clicks a MarketCard: react-router navigates to /market/:id
   --> MarketPage calls contract.getMarket(id) for market details
   --> MarketPage calls contract.getOdds(id) for pool ratios
   --> useWeather hook fetches GET /api/weather/:city from backend
   --> WeatherWidget renders live weather data
   --> OddsBar renders YES/NO proportional bar

4. User places bet
   --> Clicks YES or NO button: BetModal opens
   --> User enters bet amount (or clicks quick amount: 0.1, 0.5, 1.0, 5.0 MON)
   --> Modal calls contract.getPotentialPayout(id, isYes, parseEther(amount)) for live payout preview
   --> User clicks "Place Bet"
   --> startTime = Date.now()
   --> tx = await contractWithSigner.placeBet(id, isYes, { value: parseEther(amount) })
   --> MetaMask popup appears: user confirms
   --> receipt = await tx.wait()
   --> confirmationTime = Date.now() - startTime
   --> BetConfirmation animation plays (green checkmark)
   --> SpeedDemo displays "Confirmed in Xms" with Ethereum comparison

5. Admin resolves market (after resolution time)
   --> POST /api/resolve/:marketId hits Express backend
   --> Backend fetches current weather from OpenWeather API
   --> Backend compares actual value vs. market threshold + operator
   --> Backend calls contract.resolveMarket(marketId, outcome) using admin signer
   --> Contract emits MarketResolved event
   --> Frontend re-reads market state: status updates to RESOLVED

6. User claims winnings
   --> Navigates to /my-bets: MyBetsPage lists all user's bets
   --> Resolved winning bets show "Claim" button
   --> User clicks "Claim": contractWithSigner.claimWinnings(marketId)
   --> Contract calculates proportional payout, transfers MON
   --> Contract emits WinningsClaimed event
   --> UI updates bet status to "Claimed" with payout amount
```

**Admin Resolution Data Flow (Backend):**

```
1. POST /api/resolve/:marketId received by Express
2. Server reads market from contract: contract.getMarket(marketId)
3. Extracts: city, condition (0/1/2), operator (0/1), threshold
4. Fetches weather: GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric
5. Extracts actual value based on condition:
   - RAINFALL (0): response.rain?.["1h"] || 0 --> multiply by 100
   - TEMPERATURE (1): response.main.temp --> multiply by 100
   - WIND_SPEED (2): response.wind.speed * 3.6 --> multiply by 100
6. Determines outcome:
   - ABOVE (0): actualScaled > threshold --> true
   - BELOW (1): actualScaled < threshold --> true
7. Calls contract.resolveMarket(marketId, outcome) with admin signer
8. Returns { success: true, outcome, actualValue } to caller
```

---

## Architecture Validation Results

### Coherence Validation

All architectural decisions are internally consistent and mutually reinforcing:

- **Vite + React** for SPA aligns with the "no SSR" constraint and direct `window.ethereum` access pattern
- **Hardhat** for contract compilation/deployment aligns with the Node.js-only runtime constraint (no Rust/Foundry)
- **Express.js** for backend aligns with the Node.js ecosystem and the minimal proxy scope (2 routes, ~80 lines)
- **ethers.js v6** is used consistently across both frontend (BrowserProvider for user transactions) and backend (JsonRpcProvider for admin transactions)
- **Tailwind CSS** aligns with the rapid styling needs of a hackathon and the fully specified design system from the PRD
- **No database** aligns with on-chain state model; all reads go to the contract, which is fast on Monad
- **No localStorage caching** aligns with the "read from contract every time" mandate; Monad's sub-second reads make this viable
- **MetaMask-only** wallet support aligns with the "no RainbowKit/wagmi" constraint and simplifies the useWallet hook
- No technology choice conflicts with any other choice in the stack

### Requirements Coverage

| PRD Requirement | Architectural Component | Coverage |
|---|---|---|
| Market creation | WeatherBets.sol `createMarket` + seed script | Fully covered |
| Bet placement | WeatherBets.sol `placeBet` + BetModal + useContract | Fully covered |
| Market resolution | WeatherBets.sol `resolveMarket` + Express `POST /api/resolve` + resolver service | Fully covered |
| Winnings claim | WeatherBets.sol `claimWinnings` + MyBets component | Fully covered |
| Wallet connection | useWallet hook + Navbar + MetaMask integration | Fully covered |
| Weather display | Express proxy + OpenWeather API + WeatherWidget | Fully covered |
| Odds display | WeatherBets.sol `getOdds` + OddsBar component | Fully covered |
| Speed demo | SpeedDemo component + Date.now() timing in useContract | Fully covered |
| My bets portfolio | MyBetsPage + MyBets component + contract reads | Fully covered |
| Market listing/filtering | MarketList + MarketCard + HomePage | Fully covered |
| Mobile responsiveness | Tailwind breakpoints (sm/md/lg) | Fully covered |
| Dark theme | Tailwind custom config with Monad color palette | Fully covered |
| Network switching | useWallet hook + wallet_addEthereumChain | Fully covered |
| Error handling | Per-component error states + retry patterns | Fully covered |
| Parimutuel pool model | WeatherBets.sol pool math + 2% fee | Fully covered |

All 15 core requirements map directly to defined architectural components. No requirement is left unaddressed.

### Implementation Readiness

- **Smart contract code** is fully provided in the PRD (Section 4.1) - approximately 200 lines of production-ready Solidity
- **Deployment scripts** are fully provided (deploy.ts and seed-markets.ts in Section 4.3/4.4)
- **Hardhat configuration** is fully provided (Section 4.2) with Monad Testnet network config
- **Tailwind theme** is fully specified (Section 7.2) with exact color values and font config
- **All file paths** and component responsibilities are defined in the project structure
- **Design system** is fully specified: colors, typography, border radii, shadows, spacing, responsive breakpoints
- **Page layouts** are wireframed in ASCII (Section 7.3) with exact component placement
- **API contracts** are defined: REST endpoints, contract function signatures, event signatures
- **Dependency versions** are pinned (Section 12.5) to avoid version mismatch issues
- **Environment variables** are enumerated (Section 5.4) with clear descriptions
- **Error scenarios** and their handling are documented
- **Demo script** is written (Section 10) to validate the end-to-end flow

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

The architecture is deliberately simple, reflecting the hackathon context. Three well-defined layers with clear boundaries, no unnecessary abstractions, and all specifications derived from a comprehensive PRD. Every technology choice is justified and consistent.

**Risk Assessment:**
- **Low risk:** Contract code is complete and simple (~200 lines). Hardhat compile will validate correctness immediately.
- **Low risk:** Frontend is a standard React SPA with well-understood patterns. No novel architectural decisions.
- **Medium risk:** OpenWeather API key activation delay (mitigated by signing up the night before; fallback: hardcoded weather data for demo).
- **Medium risk:** Monad Testnet RPC availability (mitigated by having backup RPC endpoints from QuickNode/Alchemy).

**AI Agent Implementation Guidelines:**

1. Follow ethers.js v6 API exactly: use `BrowserProvider` (not `Web3Provider`), `parseEther` (not `utils.parseEther`), `waitForDeployment` (not `deployed()`)
2. Use the exact color palette from PRD Section 7.1 in the Tailwind config - do not approximate colors
3. Copy the smart contract code from PRD Section 4.1 verbatim as the starting point - do not refactor or optimize
4. Follow the Phase order strictly: Phase 0 (scaffold + deploy) then Phase 1 (core frontend) then Phase 2 (data + polish) then Phase 3 (polish + demo prep)
5. Each STEP within a Phase is a self-contained unit; complete and test it before moving to the next
6. Do not add libraries not listed in the PRD (no axios, no lodash, no moment.js, no animation libraries)
7. Do not introduce abstractions beyond what is specified (no context providers, no state management libraries, no custom middleware)
8. Threshold values must always be divided by 100 for display and multiplied by 100 for contract writes - verify this in every component that touches thresholds
9. Every transaction must capture timing data for the SpeedDemo component
10. Test the full bet-resolve-claim flow end-to-end before any polish work
