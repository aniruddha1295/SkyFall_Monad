# WeatherBets — Product Requirements Document (PRD)

## Hackathon: Monad Blitz Nagpur | February 8, 2026

### Document Purpose

This PRD is designed to be fed directly into **Claude Code** as the single source of truth for implementing the WeatherBets MVP. Every section contains actionable specifications — no ambiguity, no "TBD". Claude Code should be able to read this document and build the entire project end-to-end.

---

## 1. PROJECT OVERVIEW

### 1.1 What is WeatherBets?

WeatherBets is a **consumer-facing decentralized prediction market** where users bet on real-world weather outcomes using MON tokens on the **Monad blockchain**. It allows anyone — farmers, event planners, street vendors, or casual users — to hedge against weather risk by placing simple YES/NO bets on weather conditions.

### 1.2 One-Liner Pitch

> "Bet on tomorrow's weather, hedge your real-world risk — powered by Monad's parallel execution for instant settlement."

### 1.3 Why Monad?

- **Parallel Execution**: Multiple weather markets can settle simultaneously when conditions are met. On Ethereum, 50 markets settling after a storm = sequential, slow, expensive. On Monad = all resolve in parallel, instantly.
- **10,000 TPS + 1s Block Times**: Enables micro-bets (as low as 0.01 MON) that would be economically unviable on high-gas chains.
- **Sub-second Finality**: Bet placement feels instant — no waiting for confirmations. UX feels like a Web2 app.
- **Low Gas Costs**: Makes weather insurance accessible to small farmers and vendors who can't afford Ethereum gas fees.
- **Full EVM Compatibility**: Standard Solidity, standard tooling, zero learning curve for deployment.

### 1.4 Target Users (For Demo Narrative)

| User Persona | Problem | How WeatherBets Helps |
|---|---|---|
| Farmer in Nagpur | Loses crops if unexpected heavy rain | Bets YES on "Rainfall > 20mm" — if it rains, payout offsets crop damage |
| Outdoor Event Planner | Event ruined if rain on event day | Bets YES on "Rain tomorrow" — payout covers cancellation costs |
| Street Food Vendor | No customers on rainy days | Bets YES on "Rainfall > 5mm" — compensates lost revenue |
| Casual User | Just wants to have fun betting on weather | Simple, engaging, anyone can participate |

### 1.5 Core Mechanism: Parimutuel Betting

WeatherBets uses a **parimutuel pool** model:

- All bets on a market go into a shared pool
- When the market resolves, winners split the entire pool proportionally to their bet size
- No market maker needed, no complex AMM, no liquidity bootstrapping
- The contract itself takes a small fee (2%) to sustain the platform

**Example:**
- Market: "Will Nagpur rainfall exceed 10mm on Feb 9?"
- YES pool: 100 MON (from 5 users)
- NO pool: 50 MON (from 3 users)
- Total pool: 150 MON
- Platform fee: 3 MON (2%)
- If outcome = YES: 5 users split 147 MON proportionally
- User who bet 40 MON on YES gets: (40/100) × 147 = 58.8 MON (47% profit)

---

## 2. TECH STACK (COMPLETE)

### 2.1 Stack Overview

```
Layer          | Technology              | Version    | Purpose
--------------|-------------------------|------------|----------------------------------
Frontend      | React                   | 18.x       | UI framework
Build Tool    | Vite                    | 5.x        | Dev server + bundler
Styling       | Tailwind CSS            | 3.x        | Utility-first CSS
Blockchain    | ethers.js               | 6.x        | Frontend ↔ smart contract comms
Smart Contract| Solidity                | ^0.8.20    | On-chain prediction market logic
Deployment    | Hardhat                 | 2.x        | Compile + deploy contracts
Backend       | Express.js              | 4.x        | Weather API proxy + admin resolver
Language      | TypeScript              | 5.x        | Type safety across all layers
Weather Data  | OpenWeather API         | 3.0        | Real-time weather data (free tier)
Wallet        | MetaMask                | -          | User wallet connection
Chain         | Monad Testnet           | Chain 10143| Target blockchain
```

### 2.2 Why Each Choice (For Context)

- **Vite over Next.js**: No SSR needed for a dApp. Vite avoids `"use client"` headaches with `window.ethereum`. Instant HMR. Zero config.
- **ethers.js v6 over wagmi/RainbowKit**: Lighter, fewer dependencies, direct MetaMask integration with `BrowserProvider`. No extra wallet abstraction layers.
- **Hardhat over Foundry**: Pure Node.js, no Rust installation required. Integrates with the same `package.json`.
- **Express.js backend**: Only 2 jobs — proxy OpenWeather API (hide API key) and run admin market resolution. ~80 lines total.
- **Tailwind CSS**: Rapid styling, dark theme with Monad-inspired purple/green accents. No custom CSS files needed.

### 2.3 Monad Testnet Configuration

```
Network Name : Monad Testnet
RPC URL      : https://testnet-rpc.monad.xyz/
Chain ID     : 10143
Currency     : MON
Explorer     : https://testnet.monadexplorer.com/
Faucet       : https://faucet.monad.xyz/
```

### 2.4 External Dependencies

| Dependency | Purpose | Setup Required |
|---|---|---|
| MetaMask Browser Extension | User wallet | Install from browser store |
| OpenWeather API Key | Weather data | Sign up at openweathermap.org (free tier, instant) |
| Monad Testnet MON | Gas tokens | Claim from faucet.monad.xyz |
| Node.js 18+ | Runtime | Should be pre-installed |

---

## 3. PROJECT STRUCTURE

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
│   │   ├── index.css               # Tailwind imports
│   │   ├── config/
│   │   │   ├── contract.ts         # ABI + deployed address + chain config
│   │   │   └── weather.ts          # OpenWeather API config
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
│   │   │   ├── formatters.ts       # MON formatting, date helpers
│   │   │   └── constants.ts        # App-wide constants
│   │   └── types/
│   │       └── index.ts            # TypeScript type definitions
│   └── public/
│       ├── favicon.ico
│       └── monad-logo.svg
├── server/
│   ├── index.ts                    # Express server entry
│   ├── routes/
│   │   ├── weather.ts              # GET /api/weather/:city
│   │   └── resolve.ts             # POST /api/resolve/:marketId
│   └── services/
│       ├── openweather.ts          # OpenWeather API wrapper
│       └── resolver.ts             # Admin resolution logic (calls contract)
└── README.md
```

---

## 4. SMART CONTRACT SPECIFICATION

### 4.1 WeatherBets.sol — Full Specification

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WeatherBets {

    // ============ ENUMS ============

    enum WeatherCondition { RAINFALL, TEMPERATURE, WIND_SPEED }
    enum Operator { ABOVE, BELOW }
    enum MarketStatus { OPEN, RESOLVED, CANCELLED }

    // ============ STRUCTS ============

    struct Market {
        uint256 id;
        string city;
        WeatherCondition condition;
        Operator operator;
        uint256 threshold;          // scaled by 100 (e.g., 10.5mm = 1050)
        uint256 resolutionTime;     // unix timestamp after which market can resolve
        uint256 createdAt;
        uint256 totalYesPool;       // total MON bet on YES
        uint256 totalNoPool;        // total MON bet on NO
        MarketStatus status;
        bool outcome;               // true = YES won, false = NO won
        address creator;
    }

    struct Bet {
        uint256 amount;
        bool isYes;                 // true = bet YES, false = bet NO
        bool claimed;
    }

    // ============ STATE ============

    address public admin;
    uint256 public marketCount;
    uint256 public platformFeePercent = 2;  // 2% fee

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;

    // ============ EVENTS ============

    event MarketCreated(uint256 indexed marketId, string city, uint8 condition, uint256 threshold, uint256 resolutionTime);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool);
    event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout);

    // ============ MODIFIERS ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        admin = msg.sender;
    }

    // ============ CORE FUNCTIONS ============

    /// @notice Create a new weather prediction market
    /// @param _city City name (e.g., "Nagpur")
    /// @param _condition 0=RAINFALL, 1=TEMPERATURE, 2=WIND_SPEED
    /// @param _operator 0=ABOVE, 1=BELOW
    /// @param _threshold Value scaled by 100 (10.5mm = 1050)
    /// @param _resolutionTime Unix timestamp when market can be resolved
    function createMarket(
        string memory _city,
        WeatherCondition _condition,
        Operator _operator,
        uint256 _threshold,
        uint256 _resolutionTime
    ) external returns (uint256) {
        require(_resolutionTime > block.timestamp, "Resolution must be in future");

        uint256 marketId = marketCount;
        markets[marketId] = Market({
            id: marketId,
            city: _city,
            condition: _condition,
            operator: _operator,
            threshold: _threshold,
            resolutionTime: _resolutionTime,
            createdAt: block.timestamp,
            totalYesPool: 0,
            totalNoPool: 0,
            status: MarketStatus.OPEN,
            outcome: false,
            creator: msg.sender
        });

        marketCount++;
        emit MarketCreated(marketId, _city, uint8(_condition), _threshold, _resolutionTime);
        return marketId;
    }

    /// @notice Place a bet on a market
    /// @param _marketId Market to bet on
    /// @param _isYes true = bet YES, false = bet NO
    function placeBet(uint256 _marketId, bool _isYes) external payable {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp < market.resolutionTime, "Betting closed");
        require(msg.value > 0, "Bet must be > 0");
        require(bets[_marketId][msg.sender].amount == 0, "Already bet on this market");

        bets[_marketId][msg.sender] = Bet({
            amount: msg.value,
            isYes: _isYes,
            claimed: false
        });

        if (_isYes) {
            market.totalYesPool += msg.value;
        } else {
            market.totalNoPool += msg.value;
        }

        marketBettors[_marketId].push(msg.sender);
        emit BetPlaced(_marketId, msg.sender, _isYes, msg.value);
    }

    /// @notice Resolve a market with the actual weather outcome (admin only)
    /// @param _marketId Market to resolve
    /// @param _outcome true = YES condition met, false = NO
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyAdmin {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");

        market.status = MarketStatus.RESOLVED;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome, market.totalYesPool + market.totalNoPool);
    }

    /// @notice Claim winnings from a resolved market
    /// @param _marketId Market to claim from
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.RESOLVED, "Market not resolved");

        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(!userBet.claimed, "Already claimed");

        userBet.claimed = true;

        // Check if user won
        if (userBet.isYes == market.outcome) {
            uint256 totalPool = market.totalYesPool + market.totalNoPool;
            uint256 platformFee = (totalPool * platformFeePercent) / 100;
            uint256 distributablePool = totalPool - platformFee;

            uint256 winningPool = market.outcome ? market.totalYesPool : market.totalNoPool;
            uint256 payout = (userBet.amount * distributablePool) / winningPool;

            // Transfer platform fee to admin
            payable(admin).transfer(platformFee / marketBettors[_marketId].length);

            // Transfer payout to winner
            payable(msg.sender).transfer(payout);
            emit WinningsClaimed(_marketId, msg.sender, payout);
        }
        // Losers get nothing — their funds are in the pool
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get market details
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    /// @notice Get current odds for a market (returns YES percentage scaled by 100)
    function getOdds(uint256 _marketId) external view returns (uint256 yesPercent, uint256 noPercent) {
        Market storage market = markets[_marketId];
        uint256 total = market.totalYesPool + market.totalNoPool;
        if (total == 0) return (50, 50); // Default 50/50 when no bets

        yesPercent = (market.totalYesPool * 100) / total;
        noPercent = 100 - yesPercent;
    }

    /// @notice Get user's bet on a specific market
    function getUserBet(uint256 _marketId, address _user) external view returns (Bet memory) {
        return bets[_marketId][_user];
    }

    /// @notice Get all active markets count
    function getActiveMarketCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < marketCount; i++) {
            if (markets[i].status == MarketStatus.OPEN) count++;
        }
    }

    /// @notice Get potential payout for a bet amount on a side
    function getPotentialPayout(uint256 _marketId, bool _isYes, uint256 _amount) external view returns (uint256) {
        Market storage market = markets[_marketId];
        uint256 newYesPool = market.totalYesPool + (_isYes ? _amount : 0);
        uint256 newNoPool = market.totalNoPool + (_isYes ? 0 : _amount);
        uint256 totalPool = newYesPool + newNoPool;
        uint256 distributable = totalPool - (totalPool * platformFeePercent / 100);
        uint256 winningPool = _isYes ? newYesPool : newNoPool;
        return (_amount * distributable) / winningPool;
    }
}
```

### 4.2 Deployment Configuration (hardhat.config.ts)

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz/",
      chainId: 10143,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
    },
  },
};

export default config;
```

### 4.3 Deployment Script (scripts/deploy.ts)

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WeatherBets to Monad Testnet...");

  const WeatherBets = await ethers.getContractFactory("WeatherBets");
  const weatherBets = await WeatherBets.deploy();
  await weatherBets.waitForDeployment();

  const address = await weatherBets.getAddress();
  console.log(`WeatherBets deployed to: ${address}`);

  // Save address for frontend config
  const fs = require("fs");
  fs.writeFileSync(
    "./frontend/src/config/deployed-address.json",
    JSON.stringify({ address }, null, 2)
  );

  console.log("Address saved to frontend config.");
}

main().catch(console.error);
```

### 4.4 Seed Markets Script (scripts/seed-markets.ts)

```typescript
import { ethers } from "hardhat";

async function main() {
  const address = require("../frontend/src/config/deployed-address.json").address;
  const weatherBets = await ethers.getContractAt("WeatherBets", address);

  const now = Math.floor(Date.now() / 1000);
  const tomorrow = now + 86400;       // 24 hours
  const in48Hours = now + 172800;     // 48 hours

  // Market 0: Nagpur Rainfall
  await weatherBets.createMarket("Nagpur", 0, 0, 1000, tomorrow);    // RAINFALL ABOVE 10.00mm
  console.log("Created: Nagpur Rainfall > 10mm");

  // Market 1: Mumbai Temperature
  await weatherBets.createMarket("Mumbai", 1, 0, 3500, tomorrow);    // TEMP ABOVE 35.00°C
  console.log("Created: Mumbai Temperature > 35°C");

  // Market 2: Delhi Wind Speed
  await weatherBets.createMarket("Delhi", 2, 0, 2000, in48Hours);    // WIND ABOVE 20.00 km/h
  console.log("Created: Delhi Wind > 20 km/h");

  console.log("Seeding complete — 3 demo markets created.");
}

main().catch(console.error);
```

---

## 5. BACKEND SPECIFICATION

### 5.1 Express Server (server/index.ts)

Minimal server with 2 route groups:

```
GET  /api/weather/:city         → Fetches current weather from OpenWeather API
GET  /api/weather/:city/forecast → Fetches 5-day forecast
POST /api/resolve/:marketId     → Admin reads weather, calls resolveMarket on contract
```

### 5.2 OpenWeather API Integration

```
Base URL: https://api.openweathermap.org/data/2.5
Endpoints Used:
  - /weather?q={city}&appid={API_KEY}&units=metric     → current weather
  - /forecast?q={city}&appid={API_KEY}&units=metric    → 5-day / 3-hour forecast

Response Fields We Use:
  - main.temp          → Temperature in °C
  - rain["1h"]         → Rainfall in last 1 hour (mm)
  - rain["3h"]         → Rainfall in last 3 hours (mm)
  - wind.speed         → Wind speed in m/s (convert to km/h × 3.6)
  - weather[0].main    → Condition (Rain, Clear, Clouds, etc.)
  - weather[0].icon    → Icon code for display
  - name               → City name confirmed

Free Tier Limits:
  - 60 calls/minute
  - Current weather + 5-day forecast
  - No historical data (not needed for MVP)
```

### 5.3 Admin Resolution Flow

```
1. Cron job or manual trigger calls POST /api/resolve/:marketId
2. Server fetches current weather for the market's city
3. Server compares actual value against market threshold + operator
4. Server calls resolveMarket(marketId, outcome) using admin wallet
5. Contract emits MarketResolved event
6. Frontend picks up the event and updates UI
```

### 5.4 Environment Variables (.env)

```env
# OpenWeather
OPENWEATHER_API_KEY=your_key_here

# Deployer / Admin Wallet
DEPLOYER_PRIVATE_KEY=your_monad_testnet_private_key_here

# Contract
CONTRACT_ADDRESS=will_be_set_after_deployment

# Server
PORT=3001

# Monad
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
```

---

## 6. FRONTEND SPECIFICATION

### 6.1 Pages & Routes

```
/                    → HomePage       → Grid of active weather markets
/market/:id          → MarketPage     → Market detail + bet placement
/my-bets             → MyBetsPage     → User's positions and P&L
/create              → CreatePage     → (Stretch goal) Create custom market
```

### 6.2 Component Specifications

#### Navbar.tsx
- Logo ("WeatherBets" + cloud/lightning icon)
- Navigation links: Markets, My Bets
- Wallet connect button (right side)
  - Disconnected state: "Connect Wallet" button (purple)
  - Connected state: Show truncated address (0x1234...5678) + MON balance
  - Wrong network state: "Switch to Monad" button (red)
- Mobile responsive hamburger menu

#### MarketCard.tsx
- City name + weather condition icon
- Market question in plain English: "Will Nagpur rainfall exceed 10mm?"
- OddsBar component showing YES/NO pool ratio visually
- Total pool size in MON
- Time remaining countdown (e.g., "5h 23m left")
- Status badge (OPEN / RESOLVED / CLOSED)
- Click → navigates to /market/:id

#### MarketList.tsx
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
- Filters: All / Active / Resolved
- Sort: Newest / Most Popular (by pool size) / Ending Soon

#### BetModal.tsx
- Triggered when user clicks YES or NO on MarketPage
- Shows:
  - Selected side (YES/NO) with color (green/red)
  - Input field for bet amount in MON
  - Quick amount buttons: 0.1, 0.5, 1.0, 5.0 MON
  - Potential payout calculation (calls getPotentialPayout view function)
  - Implied probability display
  - "Place Bet" button
- States:
  - Input → Confirming (MetaMask popup) → Success animation → Closed
  - Error state with retry

#### OddsBar.tsx
- Horizontal bar split into YES (green) and NO (red) proportions
- Shows percentage labels: "YES 65%" | "NO 35%"
- Animated transitions when odds change
- Tooltip showing pool amounts in MON

#### WeatherWidget.tsx
- Displays current weather for the market's city
- Temperature, rainfall, wind speed, humidity
- Weather icon from OpenWeather
- "Live" indicator dot
- Updates every 60 seconds

#### SpeedDemo.tsx (CRITICAL — Demo Day Wow Factor)
- Shows a live transaction speed counter
- When user places a bet, displays:
  - "Transaction submitted" → "Confirmed in X ms" with actual timing
  - Compare badge: "On Ethereum this would take ~12 seconds"
- Animated speed visualization (could be a simple counter/progress bar)
- This component MUST be visible during the demo — it's the Monad differentiator

#### MyBets.tsx
- List of user's active and past bets
- Each bet shows: Market question, side (YES/NO), amount, current odds, potential payout
- Resolved bets show: Outcome, P&L (profit in green, loss in red)
- "Claim" button for won bets that haven't been claimed
- Empty state: "No bets yet — start predicting weather!"

#### Footer.tsx
- "Built on Monad" with Monad logo
- "Monad Blitz Nagpur 2026" badge
- Link to Monad testnet explorer

### 6.3 Wallet Connection Flow (useWallet.ts)

```
1. User clicks "Connect Wallet"
2. Check if window.ethereum exists
   - No → Show "Install MetaMask" message with link
   - Yes → Continue
3. Call ethereum.request({ method: 'eth_requestAccounts' })
4. Check chainId
   - If not 10143 → Prompt to switch network with ethereum.request({ method: 'wallet_addEthereumChain' })
   - If 10143 → Connected successfully
5. Store: address, balance, signer, provider in React state
6. Listen for accountsChanged and chainChanged events for auto-update
```

### 6.4 Contract Interaction Flow (useContract.ts)

```typescript
// Read operations (no gas, instant)
const contract = new ethers.Contract(address, abi, provider);
const market = await contract.getMarket(marketId);
const [yesPercent, noPercent] = await contract.getOdds(marketId);
const payout = await contract.getPotentialPayout(marketId, isYes, amount);

// Write operations (requires signer, sends transaction)
const contractWithSigner = contract.connect(signer);
const tx = await contractWithSigner.placeBet(marketId, isYes, { value: ethers.parseEther(amount) });
const receipt = await tx.wait(); // Measure time here for SpeedDemo
```

---

## 7. UI/UX DESIGN SPECIFICATION

### 7.1 Design System

```
Color Palette (Monad-Inspired Dark Theme):
  Background:      #0a0a0f (near black)
  Surface:         #14141f (card backgrounds)
  Surface Hover:   #1e1e2e
  Border:          #2a2a3a
  Primary:         #8b5cf6 (purple — Monad brand color)
  Primary Hover:   #a78bfa
  Success/YES:     #22c55e (green)
  Danger/NO:       #ef4444 (red)
  Warning:         #f59e0b (amber)
  Text Primary:    #f8fafc
  Text Secondary:  #94a3b8
  Text Muted:      #64748b
  Accent Glow:     rgba(139, 92, 246, 0.2) (purple glow for cards)

Typography:
  Font Family:     Inter (from Google Fonts) or system sans-serif fallback
  Headings:        Bold, tracking tight
  Body:            Regular, 16px base

Border Radius:
  Cards:           12px
  Buttons:         8px
  Inputs:          8px
  Badges:          9999px (pill shape)

Shadows:
  Card:            0 4px 6px -1px rgba(0,0,0,0.3)
  Card Hover:      0 10px 15px -3px rgba(139, 92, 246, 0.15) (purple glow)
  Modal:           0 25px 50px -12px rgba(0,0,0,0.5)

Spacing:
  Container max:   1200px centered
  Card padding:    24px
  Grid gap:        24px
  Section gap:     48px
```

### 7.2 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0a0a0f", surface: "#14141f", hover: "#1e1e2e" },
        border: { DEFAULT: "#2a2a3a" },
        brand: { DEFAULT: "#8b5cf6", hover: "#a78bfa" },
        yes: "#22c55e",
        no: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### 7.3 Page Layouts

#### HomePage Layout
```
┌──────────────────────────────────────────────────┐
│ Navbar: [Logo]  Markets  My Bets   [Connect Wallet] │
├──────────────────────────────────────────────────┤
│                                                    │
│  Hero Section:                                     │
│  "Predict Weather. Hedge Risk. Win MON."          │
│  Subtitle: "Powered by Monad's parallel EVM"      │
│  [Explore Markets] button                          │
│                                                    │
├──────────────────────────────────────────────────┤
│                                                    │
│  Active Markets Grid:                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ Nagpur  │ │ Mumbai  │ │ Delhi   │             │
│  │ 🌧️ Rain │ │ 🌡️ Temp │ │ 💨 Wind │             │
│  │ >10mm   │ │ >35°C   │ │ >20km/h │             │
│  │ ▓▓▓░░  │ │ ▓▓░░░  │ │ ▓░░░░  │             │
│  │ 65%/35% │ │ 40%/60% │ │ 20%/80% │             │
│  │ 5h left │ │ 12h left│ │ 36h left│             │
│  └─────────┘ └─────────┘ └─────────┘             │
│                                                    │
├──────────────────────────────────────────────────┤
│  How It Works: 3 simple steps                      │
│  1. Choose a weather market                        │
│  2. Bet YES or NO with MON                        │
│  3. Win if your prediction is correct              │
│                                                    │
├──────────────────────────────────────────────────┤
│ Footer: Built on Monad | Monad Blitz Nagpur 2026  │
└──────────────────────────────────────────────────┘
```

#### MarketPage Layout
```
┌──────────────────────────────────────────────────┐
│ Navbar                                             │
├──────────────────────────────────────────────────┤
│                                                    │
│  Market Header:                                    │
│  🌧️ Nagpur Rainfall                               │
│  "Will rainfall in Nagpur exceed 10mm?"            │
│  Status: OPEN | Resolves in: 5h 23m 10s           │
│                                                    │
├────────────────────────┬─────────────────────────┤
│  Left Column (60%):    │  Right Column (40%):     │
│                        │                          │
│  Odds Visualization    │  WeatherWidget:          │
│  ▓▓▓▓▓▓▓░░░░         │  Nagpur Current:         │
│  YES 65% | NO 35%     │  🌤️ 28°C, Clear          │
│                        │  Rain: 0mm               │
│  Pool Stats:           │  Wind: 12 km/h           │
│  Total Pool: 150 MON   │  Humidity: 45%           │
│  YES Pool:  100 MON    │                          │
│  NO Pool:    50 MON    │  SpeedDemo Component:    │
│  Bettors: 8           │  ⚡ Last tx: 340ms       │
│                        │  Ethereum avg: ~12,000ms │
│  ┌──────┐ ┌──────┐   │                          │
│  │ YES  │ │  NO  │   │                          │
│  │ BET  │ │ BET  │   │                          │
│  └──────┘ └──────┘   │                          │
│                        │                          │
│  Your Bet:             │                          │
│  (shows if user has    │                          │
│   an active bet)       │                          │
│                        │                          │
├────────────────────────┴─────────────────────────┤
│  Use Case Cards:                                   │
│  "🌾 Farmer? Bet YES to hedge against heavy rain" │
│  "🎪 Event? Bet YES to cover cancellation costs"  │
│                                                    │
└──────────────────────────────────────────────────┘
```

### 7.4 Animations & Micro-interactions

- **Card hover**: Subtle purple glow border + slight scale (transform: scale(1.02))
- **Odds bar**: Smooth CSS transition (0.5s ease) when pool ratios change
- **Bet confirmation**: Green checkmark animation + confetti (use CSS keyframes, no library)
- **Countdown timer**: Live seconds ticking down
- **Speed demo**: Counter animating from 0 to confirmation time in ms
- **Loading states**: Pulsing skeleton screens (Tailwind animate-pulse)
- **Wallet connection**: Slide-in notification from top right

### 7.5 Mobile Responsive Breakpoints

```
sm  (640px):  1 column market grid, stacked market page
md  (768px):  2 column market grid
lg  (1024px): 3 column market grid, side-by-side market page
```

---

## 8. DEV SPRINT STEPS (ORDERED)

### PHASE 0: Environment Setup (Tonight — Before Hackathon)

```
STEP 0.1 — MetaMask + Monad Testnet
  ✅ Install MetaMask browser extension if not installed
  ✅ Add Monad Testnet network manually:
     Network Name: Monad Testnet
     RPC URL: https://testnet-rpc.monad.xyz/
     Chain ID: 10143
     Currency Symbol: MON
     Explorer: https://testnet.monadexplorer.com/
  ✅ Visit https://faucet.monad.xyz/ and claim testnet MON
  ✅ Export private key for DEPLOYER_PRIVATE_KEY (testnet wallet only!)

STEP 0.2 — OpenWeather API Key
  ✅ Go to https://openweathermap.org/api
  ✅ Sign up (free)
  ✅ Generate API key (takes effect in ~10 minutes)
  ✅ Test: curl "https://api.openweathermap.org/data/2.5/weather?q=Nagpur&appid=YOUR_KEY&units=metric"

STEP 0.3 — Project Scaffold
  ✅ mkdir weather-bets && cd weather-bets
  ✅ npm init -y
  ✅ npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node dotenv
  ✅ npx hardhat init (choose TypeScript project)
  ✅ npm create vite@latest frontend -- --template react-ts
  ✅ cd frontend && npm install
  ✅ npm install ethers@6
  ✅ npm install -D tailwindcss postcss autoprefixer
  ✅ npx tailwindcss init -p
  ✅ cd .. && mkdir -p server && npm install express cors dotenv ethers@6
  ✅ Create .env file with all variables
  ✅ Create .gitignore (node_modules, .env, artifacts, cache)

STEP 0.4 — Smart Contract
  ✅ Write contracts/WeatherBets.sol (copy from Section 4.1)
  ✅ Configure hardhat.config.ts with Monad Testnet
  ✅ npx hardhat compile (verify no errors)
  ✅ npx hardhat run scripts/deploy.ts --network monadTestnet
  ✅ npx hardhat run scripts/seed-markets.ts --network monadTestnet
  ✅ Verify on https://testnet.monadexplorer.com/
  ✅ Copy ABI from artifacts/ to frontend/src/config/

STEP 0.5 — Verify Everything Works
  ✅ Contract deployed and verified on explorer
  ✅ 3 demo markets created and visible on explorer
  ✅ OpenWeather API returning data for Nagpur
  ✅ MetaMask connected to Monad Testnet with MON balance
  ✅ Frontend dev server starts with Vite
  ✅ Go to sleep — you need energy tomorrow
```

### PHASE 1: Core Frontend (Hackathon Hours 1-3)

```
STEP 1.1 — Project Foundation (30 min)
  • Set up Tailwind with custom theme (Section 7.2)
  • Create App.tsx with basic routing (react-router-dom or simple state)
  • Create Navbar with wallet connect button
  • Create useWallet hook
  • Test: Wallet connects, shows address and MON balance

STEP 1.2 — Market Display (60 min)
  • Create useContract hook to read markets from contract
  • Build MarketCard component
  • Build MarketList with grid layout
  • Build OddsBar component
  • Create HomePage with hero + market grid
  • Test: All 3 seeded markets display with correct data

STEP 1.3 — Betting Flow (90 min)
  • Build MarketPage with full layout
  • Build BetModal component
  • Implement placeBet transaction flow
  • Add BetConfirmation animation
  • Wire up potential payout calculation
  • Test: Can place a YES and NO bet on different markets
  • Test: Odds update after bet is placed
```

### PHASE 2: Data & Polish (Hackathon Hours 4-5)

```
STEP 2.1 — Weather Integration (45 min)
  • Set up Express server with weather routes
  • Build WeatherWidget component
  • Show live weather data on MarketPage
  • Show weather context cards ("Current rainfall: 0mm, threshold: 10mm")

STEP 2.2 — My Bets & Claims (45 min)
  • Build MyBetsPage
  • Show user's active positions with current P&L
  • Implement claimWinnings flow for resolved markets
  • Add empty state and loading states

STEP 2.3 — Speed Demo Component (30 min)
  • Build SpeedDemo component
  • Measure actual transaction confirmation time (Date.now() diff)
  • Display "Confirmed in Xms" with comparison to Ethereum
  • Place this prominently on MarketPage
```

### PHASE 3: Polish & Demo Prep (Hackathon Hours 6-7)

```
STEP 3.1 — Visual Polish (45 min)
  • Add hover effects and animations
  • Ensure mobile responsiveness
  • Add loading skeleton screens
  • Add error handling and fallback states
  • Add weather condition icons
  • Purple glow effects on cards

STEP 3.2 — Demo Preparation (45 min — CRITICAL)
  • Write 2-minute demo script (Section 10)
  • Seed fresh markets with resolution times that work for demo
  • Prepare admin resolution script to resolve a market LIVE during demo
  • Test entire flow end-to-end: connect → view → bet → resolve → claim
  • Record backup video of the flow (screen recording)
  • Prepare talking points about Monad-specific advantages

STEP 3.3 — Stretch Goals (if time allows)
  • CreateMarketPage — let audience create a market during demo
  • Batch settlement demo — resolve multiple markets simultaneously
  • Animated weather map background
```

---

## 9. TESTING CHECKLIST

### 9.1 Smart Contract Testing

```
Before deployment:
  □ Contract compiles without warnings
  □ createMarket creates market with correct parameters
  □ placeBet accepts MON and updates pool
  □ placeBet rejects: zero amount, duplicate bet, closed market
  □ resolveMarket only works for admin
  □ resolveMarket only works after resolutionTime
  □ claimWinnings pays correct amount to winners
  □ claimWinnings prevents double-claim
  □ getOdds returns 50/50 for empty markets
  □ getPotentialPayout calculates correctly

After deployment:
  □ Contract address is accessible on Monad explorer
  □ Seeded markets are visible via getMarket calls
  □ Can place bet from MetaMask
  □ Events are emitted correctly
```

### 9.2 Frontend Testing

```
Wallet:
  □ Connect wallet shows address and balance
  □ Disconnect works
  □ Wrong network shows "Switch to Monad" prompt
  □ No MetaMask shows install message

Markets:
  □ All seeded markets display on HomePage
  □ Market data matches contract state
  □ Odds bar reflects pool ratios
  □ Countdown timer ticks correctly
  □ Clicking card navigates to MarketPage

Betting:
  □ YES/NO buttons open BetModal
  □ Amount input accepts decimal MON values
  □ Quick amount buttons populate input
  □ Potential payout updates in real-time
  □ "Place Bet" sends MetaMask transaction
  □ Success animation plays after confirmation
  □ Odds update immediately after bet

Weather:
  □ WeatherWidget shows data for correct city
  □ Data refreshes periodically
  □ Fallback shown if API fails

My Bets:
  □ Shows all user's active bets
  □ Resolved bets show outcome and P&L
  □ Claim button works for winning bets
  □ Empty state for users with no bets
```

### 9.3 Demo Day E2E Flow

```
This exact flow must work flawlessly:

1. Open app in browser → HomePage loads with 3 markets
2. Click "Connect Wallet" → MetaMask connects, shows balance
3. Click Nagpur market → MarketPage opens with weather data
4. Click "YES" → BetModal opens
5. Enter 1 MON → Shows potential payout
6. Click "Place Bet" → MetaMask confirms → Success animation
7. SpeedDemo shows "Confirmed in ~400ms" ⚡
8. Navigate to My Bets → Bet appears
9. (Admin) Resolve market → Market shows result
10. Click "Claim Winnings" → MON received
```

---

## 10. DEMO SCRIPT (2 MINUTES)

### Slide 1: Hook (15 seconds)
> "Every year, Indian farmers lose ₹50,000 crores to unpredictable weather. What if they could hedge that risk with a simple bet on their phone? Meet WeatherBets."

### Slide 2: Live Demo (75 seconds)
> "Let me show you how it works. [Shows app] Here are active weather markets — Nagpur, Mumbai, Delhi. I'm a farmer worried about heavy rain destroying my crop. I click Nagpur rainfall, I can see current weather is clear, the threshold is 10mm."

> "I bet YES — if it rains heavily, I get paid. I put in 1 MON... [places bet] ...and look at that — confirmed in 380 milliseconds. On Ethereum, I'd still be waiting 12 seconds. That's Monad's parallel execution."

> "Now let me resolve this market live. [triggers resolution] Boom — settled instantly. And I can claim my winnings right here. [claims] Money in my wallet."

> "Now imagine 50 farmers' markets settling simultaneously after a monsoon storm. On Ethereum, that's sequential — one by one. On Monad, all 50 resolve in parallel in the same block."

### Slide 3: Close (30 seconds)
> "WeatherBets is a consumer prediction market for weather risk — simple enough for a farmer, powerful enough for real hedging. Built on Monad because only Monad gives us the speed and cost to make micro-insurance accessible to everyone. Thank you."

---

## 11. RISK MITIGATION

| Risk | Mitigation |
|---|---|
| OpenWeather API key takes time to activate | Sign up tonight, test immediately. Backup: hardcode weather data for demo |
| Monad Testnet RPC is slow/down | Have backup RPC: QuickNode or Alchemy Monad endpoints |
| Contract has a bug found during hackathon | Contract is simple (~200 lines). Deploy a v2 with a new address — just update config |
| MetaMask transaction fails | Have pre-funded test wallets. Keep faucet tab open for quick refills |
| Weather API fails during demo | Backend falls back to cached data. WeatherWidget shows "Last updated X min ago" |
| Time runs out before polish | Priority is: working bet flow > weather display > polish > stretch goals |
| Demo doesn't connect to MetaMask | Pre-connect MetaMask before demo, keep it logged in |

---

## 12. CLAUDE CODE IMPLEMENTATION NOTES

### 12.1 How Claude Code Should Use This Document

1. Read the **entire PRD** before writing any code
2. Follow the **Phase order** strictly (Phase 0 → 1 → 2 → 3)
3. Each **STEP** is a self-contained unit that should be completed and tested before moving to the next
4. Use the **exact file structure** from Section 3
5. Use the **exact smart contract code** from Section 4.1 as the starting point
6. Match the **color palette and design system** from Section 7.1
7. Test each component against the **testing checklist** in Section 9

### 12.2 Key Implementation Decisions (Do NOT Deviate)

- **DO** use ethers.js v6 (not v5). The API changed significantly.
- **DO** use `ethers.BrowserProvider(window.ethereum)` not `new ethers.providers.Web3Provider`
- **DO** use `ethers.parseEther()` not `ethers.utils.parseEther()`
- **DO** use `contract.waitForDeployment()` not `contract.deployed()` (v6 change)
- **DO NOT** add any database — all state lives on-chain
- **DO NOT** add authentication — wallet address IS the identity
- **DO NOT** use `localStorage` for state — read from contract every time (it's on Monad, it's fast)
- **DO NOT** install RainbowKit, wagmi, or web3modal — raw ethers.js only
- **DO NOT** use Next.js or any SSR framework — Vite + React only
- **DO NOT** add IPFS, The Graph, or any indexing solution — direct contract reads are fine for MVP
- **DO NOT** over-engineer — this is a 7-hour hackathon MVP

### 12.3 Common Pitfalls to Avoid

```
❌ Forgetting to add Monad network to MetaMask before testing
❌ Using ethers v5 syntax with v6 installed (breaking changes)
❌ Not converting threshold values (multiply by 100 for contract, divide by 100 for display)
❌ Forgetting that placeBet requires { value: ... } as the third argument
❌ Not handling the case where user hasn't connected wallet
❌ Not handling the case where user is on wrong network
❌ Making the UI too complex — simplicity wins hackathon demos
❌ Spending time on features instead of polishing the demo flow
❌ Not testing the full bet → resolve → claim flow before demo
```

### 12.4 Contract ABI Integration

After compiling with Hardhat, the ABI is at:
```
artifacts/contracts/WeatherBets.sol/WeatherBets.json
```

Copy the `abi` array from this file to `frontend/src/config/contract.ts`:

```typescript
export const WEATHER_BETS_ADDRESS = "0x..."; // from deployed-address.json
export const WEATHER_BETS_ABI = [ /* paste ABI here */ ];
export const MONAD_CHAIN_ID = 10143;
export const MONAD_RPC = "https://testnet-rpc.monad.xyz/";
```

### 12.5 Dependency Versions (Pin These)

```json
{
  "dependencies": {
    "ethers": "^6.13.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@types/react": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "hardhat": "^2.22.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

---

## 13. POST-HACKATHON POTENTIAL (Mention in Demo if Asked)

- **Chainlink Oracle Integration**: Replace admin resolver with decentralized weather oracle
- **Multiple Bet Types**: Range bets, multi-condition bets, parlays
- **Monad Mainnet Deployment**: Real MON, real payouts
- **Mobile App**: React Native version
- **Insurance Products**: Structured weather insurance policies as NFTs
- **DAO Governance**: Community votes on new markets and fee structures
- **API for Partners**: Insurance companies can create markets programmatically

---

*End of PRD. This document is the complete specification for WeatherBets. Feed this to Claude Code and follow the phases sequentially. Good luck at Monad Blitz, Steven! 🚀⚡*
