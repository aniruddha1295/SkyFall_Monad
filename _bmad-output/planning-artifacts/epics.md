---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
status: 'complete'
completedAt: '2026-02-08'
---

# WeatherBets - Epic Breakdown

## Overview
This document provides the complete epic and story breakdown for WeatherBets, decomposing the PRD requirements into implementable stories for a hackathon MVP. Each story is self-contained and can be completed by a single dev agent. Stories within each epic are ordered so that no story has a forward dependency -- each story depends only on previously completed stories.

## Requirements Inventory

### Functional Requirements
FR1: Users can connect MetaMask wallet to the dApp
FR2: Users can view list of active weather prediction markets
FR3: Users can view market details including odds, pool sizes, and countdown
FR4: Users can place YES/NO bets on weather markets using MON tokens
FR5: Users can view potential payout before placing a bet
FR6: Users can view their active and past bets
FR7: Users can claim winnings from resolved markets
FR8: Admin can create weather prediction markets
FR9: Admin can resolve markets based on actual weather data
FR10: App displays live weather data for market cities
FR11: App shows transaction speed comparison (Monad vs Ethereum)
FR12: App displays current odds as visual bar (YES/NO split)
FR13: Smart contract implements parimutuel betting with 2% fee
FR14: App prompts network switch if user is on wrong chain
FR15: App shows "Install MetaMask" if no wallet detected

### Non-Functional Requirements
NFR1: Transaction confirmation displayed within sub-second (Monad speed)
NFR2: Mobile responsive design (1/2/3 column grid at sm/md/lg breakpoints)
NFR3: Dark theme with Monad-inspired purple/green color palette
NFR4: Weather data refreshes every 60 seconds
NFR5: OpenWeather API calls stay under 60/minute free tier limit
NFR6: Smart contract uses Solidity ^0.8.20 on Monad Testnet (Chain ID 10143)

### Additional Requirements
AR1: Use ethers.js v6 (NOT v5) - BrowserProvider, parseEther syntax
AR2: Use Vite + React (NOT Next.js) - no SSR
AR3: Use Tailwind CSS for styling with custom theme
AR4: Use Hardhat for contract compilation and deployment
AR5: Express backend serves as weather API proxy only
AR6: No database - all state on-chain
AR7: No localStorage for state - read from contract

### FR Coverage Map
FR1: Epic 1 - Wallet connection and network management
FR2: Epic 2 - Market listing and display
FR3: Epic 2 - Market detail view
FR4: Epic 3 - Bet placement flow
FR5: Epic 3 - Payout calculation display
FR6: Epic 4 - User bet portfolio
FR7: Epic 4 - Winnings claim flow
FR8: Epic 1 - Contract deployment and market seeding
FR9: Epic 5 - Weather-based market resolution
FR10: Epic 5 - Live weather data integration
FR11: Epic 3 - Speed demo component
FR12: Epic 2 - Odds bar visualization
FR13: Epic 1 - Smart contract with parimutuel logic
FR14: Epic 1 - Network switching prompt
FR15: Epic 1 - MetaMask detection

## Epic List

### Epic 1: Project Foundation & Smart Contract
Deploy the WeatherBets smart contract and establish wallet connectivity so users can connect to the dApp on Monad Testnet.
**FRs covered:** FR1, FR8, FR13, FR14, FR15

### Epic 2: Weather Market Discovery
Enable users to browse and explore weather prediction markets with live odds and countdown timers.
**FRs covered:** FR2, FR3, FR12

### Epic 3: Betting Experience
Allow users to place bets on weather outcomes and see transaction speed, making the core prediction market functional.
**FRs covered:** FR4, FR5, FR11

### Epic 4: Portfolio & Claims
Give users visibility into their bets and ability to claim winnings from resolved markets.
**FRs covered:** FR6, FR7

### Epic 5: Weather Data & Resolution
Integrate live weather data and enable admin market resolution to complete the end-to-end flow.
**FRs covered:** FR9, FR10

---

## Epic 1: Project Foundation & Smart Contract

Enable users to connect their wallet and interact with the deployed WeatherBets contract on Monad Testnet.

### Story 1.1: Set Up Project Structure and Smart Contract

As a developer,
I want the project scaffolded with Hardhat, Vite+React, and the WeatherBets contract compiled,
So that I have a working development environment.

**Acceptance Criteria:**

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

### Story 1.2: Deploy Contract and Seed Demo Markets

As a developer,
I want the WeatherBets contract deployed to Monad Testnet with 3 demo markets,
So that the frontend has real on-chain data to display.

**Acceptance Criteria:**

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

### Story 1.3: Wallet Connection with Network Management

As a user,
I want to connect my MetaMask wallet and be prompted to switch to Monad Testnet,
So that I can interact with WeatherBets.

**Acceptance Criteria:**

**Given** I open the app without MetaMask installed (no `window.ethereum`)
**When** I click "Connect Wallet"
**Then** I see a message: "MetaMask is required to use WeatherBets" with a clickable link to `https://metamask.io/download/`
**And** the message appears as a styled notification or inline alert (not a browser alert)

**Given** I have MetaMask installed but am connected to Ethereum Mainnet (chainId !== 10143)
**When** I click "Connect Wallet"
**Then** MetaMask opens a popup requesting to add/switch to Monad Testnet via `wallet_addEthereumChain` with params:
```json
{
  "chainId": "0x27A7",
  "chainName": "Monad Testnet",
  "nativeCurrency": { "name": "MON", "symbol": "MON", "decimals": 18 },
  "rpcUrls": ["https://testnet-rpc.monad.xyz/"],
  "blockExplorerUrls": ["https://testnet.monadexplorer.com/"]
}
```

**Given** I am on Monad Testnet
**When** I click "Connect Wallet"
**Then** MetaMask opens and I approve the connection via `eth_requestAccounts`
**And** after approval, the Navbar shows my truncated address (e.g., `0x1234...5678`) and MON balance (e.g., `4.2301 MON`)
**And** the `useWallet` hook stores in React state: `address: string`, `balance: string`, `signer: ethers.Signer`, `provider: ethers.BrowserProvider`, `isConnected: boolean`, `chainId: number`
**And** the provider is created via `new ethers.BrowserProvider(window.ethereum)`
**And** the signer is obtained via `provider.getSigner()`
**And** the balance is fetched via `provider.getBalance(address)` and formatted with `ethers.formatEther`

**Given** I am connected
**When** I switch accounts in MetaMask
**Then** the app detects the `accountsChanged` event on `window.ethereum`
**And** the displayed address and balance update automatically without page refresh

**Given** I am connected
**When** I switch to a different network in MetaMask
**Then** the app detects the `chainChanged` event on `window.ethereum`
**And** if the new chain is not 10143, the Navbar shows a red "Switch to Monad" button instead of the address
**And** clicking "Switch to Monad" triggers the network switch flow

**Given** the `useWallet` hook is used across the app
**When** the hook is imported in any component
**Then** it returns `{ address, balance, signer, provider, isConnected, chainId, connect, disconnect }` without duplicating provider instances

### Story 1.4: App Shell with Navigation

As a user,
I want a consistent app layout with navigation and Monad branding,
So that I can move between pages easily.

**Acceptance Criteria:**

**Given** I open the app at any route
**When** the page loads
**Then** I see a top Navbar containing:
- Left: "WeatherBets" logo text with a cloud/lightning icon (can be emoji or SVG)
- Center/Left: Navigation links for "Markets" (links to `/`) and "My Bets" (links to `/my-bets`)
- Right: The wallet connect button from Story 1.3
**And** the Navbar has a dark background (`bg-bg-surface` / `#14141f`) with bottom border (`border-border` / `#2a2a3a`)
**And** the Navbar is sticky at the top of the viewport (`sticky top-0 z-50`)

**Given** I am on mobile (viewport < 768px)
**When** I view the Navbar
**Then** the navigation links are hidden behind a hamburger menu icon
**And** clicking the hamburger opens a slide-down or side panel with the nav links
**And** clicking a link or clicking outside closes the menu

**Given** I scroll to the bottom of any page
**When** I see the Footer
**Then** it contains:
- "Built on Monad" text with Monad branding
- "Monad Blitz Nagpur 2026" badge
- Link to Monad testnet explorer (`https://testnet.monadexplorer.com/`)
**And** the Footer uses `bg-bg-surface` background with `border-t border-border`

**Given** the app has routing configured
**When** I navigate between pages
**Then** `react-router-dom` v6 handles the following routes:
- `/` renders `HomePage`
- `/market/:id` renders `MarketPage`
- `/my-bets` renders `MyBetsPage`
**And** `App.tsx` wraps routes in `<BrowserRouter>` with `<Navbar />` above and `<Footer />` below the route outlet
**And** the layout has `min-h-screen flex flex-col` with the main content area using `flex-1`
**And** the main content area is centered with `max-w-7xl mx-auto px-4`

**Given** the app uses the custom dark theme
**When** any page renders
**Then** the background is `#0a0a0f`, text is `#f8fafc`, and the purple accent `#8b5cf6` is used for interactive elements (buttons, links, active states)
**And** Inter font is loaded from Google Fonts via a `<link>` tag in `index.html` or imported in `index.css`

---

## Epic 2: Weather Market Discovery

Enable users to browse active weather prediction markets with real-time odds.

### Story 2.1: Market List with Grid Display

As a user,
I want to see all active weather markets in a card grid,
So that I can browse what's available to bet on.

**Depends on:** Epic 1 (all stories)

**Acceptance Criteria:**

**Given** I visit the HomePage (`/`)
**When** the page loads
**Then** I see a hero section at the top with:
- Heading: "Predict Weather. Hedge Risk. Win MON."
- Subtitle: "Powered by Monad's parallel EVM"
- A purple call-to-action button: "Explore Markets" that scrolls down to the market grid
**And** the hero text uses `text-4xl font-bold` on desktop and `text-2xl` on mobile

**Given** the contract has 3 seeded markets
**When** the `useContract` hook fetches market data
**Then** it calls `contract.marketCount()` to get the total number of markets
**And** it loops from 0 to `marketCount - 1`, calling `contract.getMarket(i)` for each
**And** it calls `contract.getOdds(i)` for each market to get YES/NO percentages
**And** all fetched markets are stored in React state as an array of `Market` objects
**And** a loading state shows pulsing skeleton cards (`animate-pulse` with `bg-bg-hover` rectangles) while data loads

**Given** markets are loaded
**When** the MarketList renders
**Then** I see a responsive grid:
- Desktop (>= 1024px): 3 columns (`grid-cols-3`)
- Tablet (>= 768px): 2 columns (`grid-cols-2`)
- Mobile (< 768px): 1 column (`grid-cols-1`)
**And** grid gap is `gap-6` (24px)

**Given** a MarketCard renders for each market
**When** I look at a card
**Then** it shows:
- City name in bold (`text-xl font-bold`)
- Weather condition icon (rain droplet for RAINFALL, thermometer for TEMPERATURE, wind for WIND_SPEED -- using emoji or simple SVG)
- Market question in plain English: e.g., "Will Nagpur rainfall be above 10.00mm?" (generated by `formatters.marketQuestion()`)
- The OddsBar component (placeholder horizontal bar for now; Story 2.2 implements it fully)
- Total pool size: `formatMON(market.totalYesPool + market.totalNoPool)` + " MON"
- Time remaining: `formatCountdown(market.resolutionTime)` (e.g., "5h 23m left")
- Status badge: "OPEN" (green pill) for status=0, "RESOLVED" (gray pill) for status=1
**And** the card has `bg-bg-surface rounded-xl border border-border p-6` styling
**And** on hover, the card has a purple glow shadow (`shadow-[0_10px_15px_-3px_rgba(139,92,246,0.15)]`) and slight scale (`hover:scale-[1.02]`) with `transition-all duration-300`

**Given** I see a MarketCard
**When** I click on it
**Then** I navigate to `/market/{market.id}` via `react-router-dom`'s `useNavigate` or a `<Link>` wrapper
**And** the card has `cursor-pointer` styling

**Given** the HomePage has a "How It Works" section
**When** I scroll below the market grid
**Then** I see 3 steps displayed in a row (stacked on mobile):
1. "Choose a weather market" (with a cloud icon)
2. "Bet YES or NO with MON" (with a coin icon)
3. "Win if your prediction is correct" (with a trophy icon)

### Story 2.2: Odds Bar Visualization

As a user,
I want to see a visual representation of YES/NO odds on each market,
So that I can quickly gauge market sentiment.

**Depends on:** Story 2.1

**Acceptance Criteria:**

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

### Story 2.3: Market Detail Page

As a user,
I want to see full details of a specific market,
So that I can make an informed betting decision.

**Depends on:** Stories 2.1, 2.2

**Acceptance Criteria:**

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

---

## Epic 3: Betting Experience

Allow users to place bets and experience Monad's transaction speed.

### Story 3.1: Bet Placement Flow

As a user,
I want to place a YES or NO bet on a weather market,
So that I can profit if my prediction is correct.

**Depends on:** Epic 2 (all stories), Story 1.3

**Acceptance Criteria:**

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

### Story 3.2: Speed Demo Component

As a user,
I want to see how fast Monad confirms my transaction compared to Ethereum,
So that I understand Monad's speed advantage.

**Depends on:** Story 3.1

**Acceptance Criteria:**

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

---

## Epic 4: Portfolio & Claims

Give users visibility into their betting positions and ability to collect winnings.

### Story 4.1: My Bets Portfolio Page

As a user,
I want to see all my active and past bets,
So that I can track my positions and performance.

**Depends on:** Stories 1.3, 1.4, 3.1

**Acceptance Criteria:**

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

### Story 4.2: Claim Winnings Flow

As a user,
I want to claim my winnings from markets I predicted correctly,
So that I receive my MON tokens.

**Depends on:** Story 4.1

**Acceptance Criteria:**

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

---

## Epic 5: Weather Data & Resolution

Complete the end-to-end flow with live weather data and market resolution.

### Story 5.1: Weather Data Backend & Display

As a user,
I want to see current weather conditions for a market's city,
So that I can make better-informed bets.

**Depends on:** Story 2.3 (MarketPage exists with placeholder)

**Acceptance Criteria:**

**Given** the Express backend needs to be set up
**When** I create `server/index.ts`
**Then** it runs an Express server on port `process.env.PORT` (default 3001) with:
- CORS enabled for `http://localhost:5173` (Vite dev server)
- JSON body parsing middleware
- Routes mounted: `app.use('/api/weather', weatherRoutes)` and `app.use('/api/resolve', resolveRoutes)`
- Console log on startup: "WeatherBets API server running on port {PORT}"

**Given** the weather route exists at `server/routes/weather.ts`
**When** a GET request is made to `/api/weather/:city` (e.g., `/api/weather/Nagpur`)
**Then** the server calls the OpenWeather API: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric`
**And** the API key is read from `process.env.OPENWEATHER_API_KEY` (never sent to the frontend)
**And** the response is transformed and returned as:
```json
{
  "city": "Nagpur",
  "temperature": 28.5,
  "rainfall": 0,
  "windSpeed": 12.4,
  "humidity": 45,
  "condition": "Clear",
  "icon": "01d",
  "iconUrl": "https://openweathermap.org/img/wn/01d@2x.png"
}
```
**And** `rainfall` is extracted from `response.rain?.["1h"] || response.rain?.["3h"] || 0`
**And** `windSpeed` is converted from m/s to km/h by multiplying by 3.6 and rounding to 1 decimal

**Given** the OpenWeather API call fails (network error, invalid key, rate limit)
**When** the server catches the error
**Then** it returns HTTP 500 with `{ "error": "Failed to fetch weather data", "message": error.message }`

**Given** the frontend `useWeather` hook exists in `frontend/src/hooks/useWeather.ts`
**When** it is called with a city name: `useWeather(city: string)`
**Then** it fetches from `http://localhost:3001/api/weather/{city}` on mount and every 60 seconds using `setInterval`
**And** it returns `{ data: WeatherData | null, loading: boolean, error: string | null, lastUpdated: Date | null }`
**And** it cleans up the interval on unmount

**Given** I am viewing a MarketPage
**When** the `WeatherWidget` component renders in the right column (replacing the placeholder from Story 2.3)
**Then** it displays:
- Header: "{City} Weather" with a green pulsing dot and "Live" text
- Weather icon: `<img src="{iconUrl}" alt="{condition}" />` at 64x64px
- Current condition text: e.g., "Clear"
- Temperature: "{temperature}C" with a thermometer icon
- Rainfall: "{rainfall} mm" with a rain droplet icon
- Wind Speed: "{windSpeed} km/h" with a wind icon
- Humidity: "{humidity}%" with a humidity icon
**And** the widget has `bg-bg-surface rounded-xl border border-border p-4` styling
**And** a "Last updated: {time}" footer in muted text (`text-text-muted text-xs`)

**Given** the weather API fails
**When** `useWeather` returns an error
**Then** the WeatherWidget shows:
- The last successful data if available, with "Last updated X min ago" in amber text
- If no data was ever fetched: "Unable to load weather data" with a retry button

**Given** the widget must respect the free tier limit
**When** the 60-second interval fires
**Then** only one API call is made per city per interval (no duplicate calls from re-renders)
**And** the `useWeather` hook uses `useRef` to track the interval and prevent duplicates

### Story 5.2: Admin Market Resolution

As an admin,
I want to resolve markets based on actual weather data,
So that winners can claim their payouts.

**Depends on:** Story 5.1 (weather backend), Story 4.2 (claim flow ready)

**Acceptance Criteria:**

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

---

## Dependency Graph

```
Epic 1 (Foundation)
  1.1 Project Structure & Contract ──┐
  1.2 Deploy & Seed ──────────────────┤
  1.3 Wallet Connection ──────────────┤
  1.4 App Shell & Navigation ─────────┘
                                       │
Epic 2 (Discovery)                     │
  2.1 Market List Grid ◄──────────────┘
  2.2 Odds Bar ◄────── 2.1
  2.3 Market Detail ◄── 2.1, 2.2
                         │
Epic 3 (Betting)         │
  3.1 Bet Placement ◄───┘◄── 1.3
  3.2 Speed Demo ◄──── 3.1
                         │
Epic 4 (Portfolio)       │
  4.1 My Bets Page ◄────┘◄── 1.3, 1.4
  4.2 Claim Winnings ◄── 4.1
                              │
Epic 5 (Weather & Resolution) │
  5.1 Weather Backend ◄── 2.3
  5.2 Admin Resolution ◄── 5.1, 4.2
```

## Implementation Order (Recommended)

The stories should be implemented in the following order to respect dependencies:

1. **Story 1.1** - Project scaffold and contract compilation
2. **Story 1.2** - Deploy contract and seed demo markets
3. **Story 1.3** - Wallet connection with network management
4. **Story 1.4** - App shell with navigation
5. **Story 2.1** - Market list with grid display
6. **Story 2.2** - Odds bar visualization
7. **Story 2.3** - Market detail page
8. **Story 3.1** - Bet placement flow
9. **Story 3.2** - Speed demo component
10. **Story 4.1** - My bets portfolio page
11. **Story 4.2** - Claim winnings flow
12. **Story 5.1** - Weather data backend and display
13. **Story 5.2** - Admin market resolution

This order maps approximately to the PRD phases:
- Phase 0: Stories 1.1, 1.2
- Phase 1: Stories 1.3, 1.4, 2.1, 2.2, 2.3, 3.1
- Phase 2: Stories 3.2, 4.1, 4.2, 5.1
- Phase 3: Story 5.2 + polish (handled within each story's visual specifications)
