# WeatherBets — Product Requirements Document (PRD) v2.0

## Hackathon: Monad Blitz Nagpur | February 8, 2026

### Document Purpose

This PRD is designed to be fed directly into **Claude Code** as the single source of truth for implementing the WeatherBets MVP. Every section contains actionable specifications — no ambiguity, no "TBD". Claude Code should be able to read this document and build the entire project end-to-end.

### Changelog from v1

- Added: Early Exit with dynamic time-based fees (Section 4)
- Added: x402 Premium Weather API integration (Section 6)
- Added: Competitive Positioning (Section 11)
- Added: Deployment Instructions for Vercel (Section 12)
- Updated: Smart contract with exitPosition() + dynamic fees
- Updated: Demo script with exit + x402 + competitive angles
- Updated: Market seeding — 3 cities × multiple weather types
- Updated: Project structure for Vercel serverless functions
- Added: Create Market as stretch goal (Section 8)

---

## 1. PROJECT OVERVIEW

### 1.1 What is WeatherBets?

WeatherBets is a **consumer-facing decentralized prediction market** where users bet on real-world weather outcomes using MON tokens on the **Monad blockchain**. It allows anyone — farmers, event planners, street vendors, or casual users — to hedge against weather risk by placing simple YES/NO bets on weather conditions.

### 1.2 One-Liner Pitch

> "Predict weather. Hedge risk. Win MON — powered by Monad's parallel execution for instant settlement."

### 1.3 Why Monad?

- **Parallel Execution**: Multiple weather markets settle simultaneously when conditions are met. On Ethereum, 50 markets settling after a storm = sequential, slow. On Monad = all resolve in parallel, instantly.
- **10,000 TPS + 1s Block Times**: Enables micro-bets (as low as 0.01 MON) unviable on high-gas chains.
- **Sub-second Finality**: Bet placement feels instant — UX feels like a Web2 app.
- **Low Gas Costs**: Makes weather insurance accessible to small farmers and vendors who can't afford Ethereum gas.
- **Full EVM Compatibility**: Standard Solidity, standard tooling, zero learning curve.

### 1.4 Target Users (For Demo Narrative)

| User Persona | Problem | How WeatherBets Helps |
|---|---|---|
| Farmer in Nagpur | Loses crops if unexpected heavy rain | Bets YES on "Rainfall > 20mm" — payout offsets crop damage |
| Outdoor Event Planner | Event ruined if rain on event day | Bets YES on "Rain tomorrow" — payout covers cancellation costs |
| Street Food Vendor | No customers on rainy days | Bets YES on "Rainfall > 5mm" — compensates lost revenue |
| Casual User | Wants to have fun betting on weather | Simple, engaging, anyone can participate |
| Developer / AI Agent | Needs premium weather data | Pays per API call via x402 micropayments |

### 1.5 Core Mechanism: Parimutuel Betting

All bets on a market go into a shared pool. When the market resolves, winners split the entire pool proportionally to their bet size. No market maker needed, no complex AMM.

**Example:**
- Market: "Will Nagpur rainfall exceed 10mm on Feb 9?"
- YES pool: 100 MON, NO pool: 50 MON, Total: 150 MON
- Platform fee: 3 MON (2%)
- If outcome = YES: winners split 147 MON proportionally
- User who bet 40 MON on YES gets: (40/100) × 147 = 58.8 MON (47% profit)

### 1.6 Early Exit Mechanism

Users can exit positions before market resolution at current implied odds minus a **dynamic time-based fee**:

| Time Remaining | Exit Fee | Rationale |
|---|---|---|
| 6+ hours | 3% | Low fee encourages early risk management |
| 2-6 hours | 5% | Moderate fee as resolution approaches |
| Less than 2 hours | 10% | High fee — you're close to settlement, hold or exit at cost |

---

## 2. TECH STACK

### 2.1 Stack Overview

```
Layer           | Technology              | Version    | Purpose
----------------|-------------------------|------------|----------------------------------
Frontend        | React                   | 18.x       | UI framework
Build Tool      | Vite                    | 5.x        | Dev server + bundler (local dev)
Styling         | Tailwind CSS            | 3.x        | Utility-first CSS
Blockchain Lib  | ethers.js               | 6.x        | Frontend ↔ smart contract
Smart Contract  | Solidity                | ^0.8.20    | On-chain prediction market
Deployment Tool | Hardhat                 | 2.x        | Compile + deploy contracts
API Layer       | Vercel Serverless Fns   | -          | Weather API proxy + x402
Language        | TypeScript              | 5.x        | Type safety across all layers
Weather Data    | OpenWeather API         | 3.0        | Real-time weather (free tier)
Payments Proto  | x402                    | latest     | Premium API micropayments
Wallet          | MetaMask                | -          | User wallet connection
Chain           | Monad Testnet           | Chain 10143| Target blockchain
Hosting         | Vercel                  | -          | Frontend + serverless deployment
```

### 2.2 Monad Testnet Configuration

```
Network Name : Monad Testnet
RPC URL      : https://testnet-rpc.monad.xyz/
Chain ID     : 10143
Currency     : MON
Explorer     : https://testnet.monadexplorer.com/
Faucet       : https://faucet.monad.xyz/
```

### 2.3 External Dependencies

| Dependency | Purpose | Setup Required |
|---|---|---|
| MetaMask Browser Extension | User wallet | Install from browser store |
| OpenWeather API Key | Weather data | Sign up at openweathermap.org (free tier) |
| Monad Testnet MON | Gas tokens | Claim from faucet.monad.xyz |
| Node.js 18+ | Runtime | Pre-installed |
| Vercel CLI | Deployment | npm install -g vercel |

---

## 3. PROJECT STRUCTURE

```
weather-bets/
├── package.json
├── .env                            # Local env vars (gitignored)
├── .env.example                    # Template
├── vercel.json                     # Vercel config for serverless
├── hardhat.config.ts               # Hardhat with Monad Testnet
├── contracts/
│   └── WeatherBets.sol             # Core prediction market + early exit
├── scripts/
│   ├── deploy.ts                   # Deploy to Monad Testnet
│   └── seed-markets.ts             # Create 9 demo markets (3 cities × 3 types)
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root component with routing
│   ├── index.css                   # Tailwind imports
│   ├── config/
│   │   ├── contract.ts             # ABI + deployed address + chain config
│   │   ├── weather.ts              # OpenWeather config
│   │   └── x402.ts                 # x402 network + facilitator config
│   ├── hooks/
│   │   ├── useWallet.ts            # MetaMask connection hook
│   │   ├── useContract.ts          # Contract read/write hook
│   │   └── useWeather.ts           # Weather data fetching hook
│   ├── components/
│   │   ├── Navbar.tsx              # Top nav + wallet connect
│   │   ├── MarketCard.tsx          # Market display card
│   │   ├── MarketList.tsx          # Grid of active markets
│   │   ├── BetModal.tsx            # YES/NO bet placement
│   │   ├── BetConfirmation.tsx     # Post-bet success animation
│   │   ├── ExitModal.tsx           # Early exit confirmation
│   │   ├── MyBets.tsx              # User's positions + exit buttons
│   │   ├── WeatherWidget.tsx       # Live weather display
│   │   ├── OddsBar.tsx             # Visual YES/NO pool ratio
│   │   ├── MarketDetail.tsx        # Full market page
│   │   ├── SpeedDemo.tsx           # Monad speed visualization
│   │   ├── CreateMarket.tsx        # (Stretch) User-created markets
│   │   └── Footer.tsx              # Monad branding
│   ├── pages/
│   │   ├── HomePage.tsx            # Landing + market grid
│   │   ├── MarketPage.tsx          # Market detail + betting
│   │   ├── MyBetsPage.tsx          # Portfolio of bets
│   │   └── CreateMarketPage.tsx    # (Stretch) Create custom market
│   ├── lib/
│   │   ├── providers.ts            # ethers.js provider setup
│   │   ├── formatters.ts           # MON formatting, date helpers
│   │   └── constants.ts            # App-wide constants
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── api/                            # Vercel serverless functions
│   ├── weather/
│   │   └── [city].ts               # GET /api/weather/:city (free)
│   ├── forecast/
│   │   └── [city].ts               # GET /api/forecast/:city (free)
│   ├── premium/
│   │   ├── forecast/
│   │   │   └── [city].ts           # GET /api/premium/forecast/:city (x402 paid)
│   │   ├── historical/
│   │   │   └── [city].ts           # GET /api/premium/historical/:city (x402 paid)
│   │   └── alerts/
│   │       └── [city].ts           # GET /api/premium/alerts/:city (x402 paid)
│   └── resolve/
│       └── [marketId].ts           # POST /api/resolve/:marketId (admin)
├── public/
│   ├── favicon.ico
│   └── monad-logo.svg
├── index.html                      # Vite entry HTML
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind theme
├── postcss.config.js               # PostCSS
└── README.md
```

---

## 4. SMART CONTRACT SPECIFICATION

### 4.1 WeatherBets.sol — Full Contract

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
        uint256 threshold;          // scaled by 100 (10.5mm = 1050)
        uint256 resolutionTime;     // unix timestamp
        uint256 createdAt;
        uint256 totalYesPool;
        uint256 totalNoPool;
        MarketStatus status;
        bool outcome;
        address creator;
    }

    struct Bet {
        uint256 amount;
        bool isYes;
        bool claimed;
    }

    // ============ STATE ============

    address public admin;
    uint256 public marketCount;
    uint256 public platformFeePercent = 2;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;

    // ============ EVENTS ============

    event MarketCreated(uint256 indexed marketId, string city, uint8 condition, uint256 threshold, uint256 resolutionTime);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool);
    event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout);
    event PositionExited(uint256 indexed marketId, address indexed bettor, uint256 originalAmount, uint256 exitPayout, uint256 feePercent);

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

    /// @notice Exit a position early with dynamic time-based fee
    function exitPosition(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp < market.resolutionTime, "Betting closed");

        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(!userBet.claimed, "Already claimed");

        // Calculate dynamic fee based on time remaining
        uint256 timeRemaining = market.resolutionTime - block.timestamp;
        uint256 feePercent;

        if (timeRemaining > 6 hours) {
            feePercent = 3;     // Low fee — plenty of time left
        } else if (timeRemaining > 2 hours) {
            feePercent = 5;     // Moderate fee — getting closer
        } else {
            feePercent = 10;    // High fee — close to resolution
        }

        // Calculate exit value based on current pool ratio
        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 userPool = userBet.isYes ? market.totalYesPool : market.totalNoPool;

        // Exit value: proportional share adjusted by pool balance
        // If pools are balanced (50/50): exit ≈ original amount
        // If your side is heavy (80/20): exit < original (you're in the popular side)
        // If your side is light (20/80): exit > original (you're contrarian)
        uint256 exitValue = (userBet.amount * totalPool) / (2 * userPool);

        // Apply dynamic fee
        uint256 fee = (exitValue * feePercent) / 100;
        uint256 payout = exitValue - fee;

        // Safety: can't withdraw more than original bet amount
        if (payout > userBet.amount) {
            payout = userBet.amount;
        }

        // Safety: ensure contract has enough balance
        require(address(this).balance >= payout, "Insufficient contract balance");

        // Update pools
        if (userBet.isYes) {
            market.totalYesPool -= userBet.amount;
        } else {
            market.totalNoPool -= userBet.amount;
        }

        userBet.claimed = true;

        payable(msg.sender).transfer(payout);
        emit PositionExited(_marketId, msg.sender, userBet.amount, payout, feePercent);
    }

    /// @notice Resolve a market (admin only)
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyAdmin {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");

        market.status = MarketStatus.RESOLVED;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome, market.totalYesPool + market.totalNoPool);
    }

    /// @notice Claim winnings from resolved market
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.RESOLVED, "Market not resolved");

        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(!userBet.claimed, "Already claimed");

        userBet.claimed = true;

        if (userBet.isYes == market.outcome) {
            uint256 totalPool = market.totalYesPool + market.totalNoPool;
            uint256 platformFee = (totalPool * platformFeePercent) / 100;
            uint256 distributablePool = totalPool - platformFee;
            uint256 winningPool = market.outcome ? market.totalYesPool : market.totalNoPool;
            uint256 payout = (userBet.amount * distributablePool) / winningPool;

            payable(admin).transfer(platformFee / marketBettors[_marketId].length);
            payable(msg.sender).transfer(payout);
            emit WinningsClaimed(_marketId, msg.sender, payout);
        }
    }

    // ============ VIEW FUNCTIONS ============

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    function getOdds(uint256 _marketId) external view returns (uint256 yesPercent, uint256 noPercent) {
        Market storage market = markets[_marketId];
        uint256 total = market.totalYesPool + market.totalNoPool;
        if (total == 0) return (50, 50);
        yesPercent = (market.totalYesPool * 100) / total;
        noPercent = 100 - yesPercent;
    }

    function getUserBet(uint256 _marketId, address _user) external view returns (Bet memory) {
        return bets[_marketId][_user];
    }

    function getActiveMarketCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < marketCount; i++) {
            if (markets[i].status == MarketStatus.OPEN) count++;
        }
    }

    function getPotentialPayout(uint256 _marketId, bool _isYes, uint256 _amount) external view returns (uint256) {
        Market storage market = markets[_marketId];
        uint256 newYesPool = market.totalYesPool + (_isYes ? _amount : 0);
        uint256 newNoPool = market.totalNoPool + (_isYes ? 0 : _amount);
        uint256 totalPool = newYesPool + newNoPool;
        uint256 distributable = totalPool - (totalPool * platformFeePercent / 100);
        uint256 winningPool = _isYes ? newYesPool : newNoPool;
        return (_amount * distributable) / winningPool;
    }

    /// @notice Calculate exit value and fee for a position
    function getExitInfo(uint256 _marketId, address _user) external view returns (
        uint256 exitValue,
        uint256 feePercent,
        uint256 payout
    ) {
        Market storage market = markets[_marketId];
        Bet storage userBet = bets[_marketId][_user];

        if (userBet.amount == 0 || userBet.claimed || market.status != MarketStatus.OPEN) {
            return (0, 0, 0);
        }

        uint256 timeRemaining = market.resolutionTime > block.timestamp
            ? market.resolutionTime - block.timestamp
            : 0;

        if (timeRemaining > 6 hours) {
            feePercent = 3;
        } else if (timeRemaining > 2 hours) {
            feePercent = 5;
        } else {
            feePercent = 10;
        }

        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 userPool = userBet.isYes ? market.totalYesPool : market.totalNoPool;

        exitValue = (userBet.amount * totalPool) / (2 * userPool);
        uint256 fee = (exitValue * feePercent) / 100;
        payout = exitValue - fee;

        if (payout > userBet.amount) {
            payout = userBet.amount;
        }
    }
}
```

### 4.2 Hardhat Configuration

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

### 4.3 Deployment Script

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WeatherBets to Monad Testnet...");
  const WeatherBets = await ethers.getContractFactory("WeatherBets");
  const weatherBets = await WeatherBets.deploy();
  await weatherBets.waitForDeployment();
  const address = await weatherBets.getAddress();
  console.log(`WeatherBets deployed to: ${address}`);

  const fs = require("fs");
  fs.writeFileSync(
    "./src/config/deployed-address.json",
    JSON.stringify({ address }, null, 2)
  );
  console.log("Address saved to frontend config.");
}
main().catch(console.error);
```

### 4.4 Seed Markets Script (3 Cities × 3 Types = 9 Markets)

```typescript
import { ethers } from "hardhat";

async function main() {
  const address = require("../src/config/deployed-address.json").address;
  const weatherBets = await ethers.getContractAt("WeatherBets", address);

  const now = Math.floor(Date.now() / 1000);
  const in12Hours = now + 43200;
  const in24Hours = now + 86400;
  const in48Hours = now + 172800;

  // Nagpur Markets
  await weatherBets.createMarket("Nagpur", 0, 0, 1000, in24Hours);   // Rainfall > 10mm
  await weatherBets.createMarket("Nagpur", 1, 0, 3800, in24Hours);   // Temp > 38°C
  await weatherBets.createMarket("Nagpur", 2, 0, 2500, in48Hours);   // Wind > 25 km/h

  // Mumbai Markets
  await weatherBets.createMarket("Mumbai", 0, 0, 1500, in24Hours);   // Rainfall > 15mm
  await weatherBets.createMarket("Mumbai", 1, 0, 3300, in12Hours);   // Temp > 33°C
  await weatherBets.createMarket("Mumbai", 2, 0, 3000, in48Hours);   // Wind > 30 km/h

  // Delhi Markets
  await weatherBets.createMarket("Delhi", 0, 0, 500, in24Hours);     // Rainfall > 5mm
  await weatherBets.createMarket("Delhi", 1, 1, 1000, in12Hours);    // Temp < 10°C
  await weatherBets.createMarket("Delhi", 2, 0, 2000, in48Hours);    // Wind > 20 km/h

  console.log("Seeded 9 demo markets (3 cities × 3 weather types)");
}
main().catch(console.error);
```

---

## 5. FRONTEND SPECIFICATION

### 5.1 Pages & Routes

```
/                    → HomePage          → Grid of active weather markets
/market/:id          → MarketPage        → Market detail + bet + exit
/my-bets             → MyBetsPage        → User's positions + P&L + exit
/create              → CreateMarketPage  → (Stretch) User-created markets
```

### 5.2 Design System

```
Color Palette (Monad-Inspired Dark Theme):
  Background:      #0a0a0f
  Surface:         #14141f
  Surface Hover:   #1e1e2e
  Border:          #2a2a3a
  Primary:         #8b5cf6 (purple — Monad brand)
  Primary Hover:   #a78bfa
  Success/YES:     #22c55e (green)
  Danger/NO:       #ef4444 (red)
  Warning:         #f59e0b (amber)
  Text Primary:    #f8fafc
  Text Secondary:  #94a3b8
  Text Muted:      #64748b

Typography: Inter (Google Fonts) or system sans-serif
Border Radius: Cards 12px, Buttons 8px, Badges 9999px
Container: max-width 1200px centered
```

### 5.3 Tailwind Config

```javascript
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
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
```

### 5.4 Key Component Specifications

#### Navbar.tsx
- Logo "WeatherBets" with ⛈️ icon
- Nav links: Markets, My Bets
- Wallet button: "Connect Wallet" (purple) → Connected shows address + MON balance
- Wrong network: "Switch to Monad" (red)

#### MarketCard.tsx
- City + weather icon + condition type badge (Rain/Temp/Wind)
- Question: "Will Nagpur rainfall exceed 10mm?"
- OddsBar (green/red proportional bar)
- Total pool in MON + bettor count
- Countdown timer
- Status badge (OPEN/RESOLVED)

#### BetModal.tsx
- Side selection (YES green / NO red)
- Amount input + quick buttons: 0.1, 0.5, 1.0, 5.0 MON
- Potential payout display (calls getPotentialPayout)
- "Place Bet" button
- States: Input → MetaMask popup → Success animation → Close

#### ExitModal.tsx (NEW)
- Shows current position details
- Displays dynamic fee tier with color coding:
  - 3% → green "Low Fee"
  - 5% → amber "Medium Fee"
  - 10% → red "High Fee"
- Shows exit payout calculation
- Time remaining indicator
- "Exit Position" button with confirmation
- Comparison: "Exit now: X MON" vs "Potential win: Y MON" vs "Potential loss: 0 MON"

#### MyBets.tsx (UPDATED)
```
┌──────────────────────────────────────────────────┐
│  🌧️ Nagpur Rainfall > 10mm                      │
│  Your Bet: 5 MON on YES                         │
│  Current Odds: YES 70% | NO 30%                 │
│  ─────────────────────────────────               │
│  Potential Win:     7.2 MON  (+44%)              │
│  Exit Now:          3.8 MON  (-24%)  🟡 5% fee  │
│  Time Left:         4h 23m                       │
│                                                   │
│  [Hold Position]          [Exit Now → 3.8 MON]   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  🌡️ Mumbai Temperature > 33°C        ✅ RESOLVED │
│  Your Bet: 2 MON on NO                          │
│  Result: NO won!                                  │
│  Your Payout: 3.6 MON (+80%)                     │
│                                                   │
│  [Claim 3.6 MON]                                 │
└──────────────────────────────────────────────────┘
```

#### SpeedDemo.tsx (CRITICAL for Demo)
- Measures actual tx confirmation time (Date.now() before and after tx.wait())
- Displays "⚡ Confirmed in Xms"
- Shows comparison: "On Ethereum: ~12,000ms | On Monad: ~400ms"
- Animated speed bar or counter
- Must be visible on MarketPage

#### WeatherWidget.tsx
- Current weather for market city via OpenWeather API
- Temperature, rainfall, wind, humidity + icon
- "Live" green dot indicator
- Refreshes every 60 seconds

### 5.5 Wallet Connection Flow

```
1. Check window.ethereum exists → No: show "Install MetaMask"
2. eth_requestAccounts → get address
3. Check chainId → Not 10143: prompt wallet_addEthereumChain
4. Store: address, balance, signer, provider in React state
5. Listen accountsChanged + chainChanged events
```

### 5.6 Mobile Responsive

```
sm (640px):  1 column grid, stacked layouts
md (768px):  2 column market grid
lg (1024px): 3 column grid, side-by-side market page
```

---

## 6. x402 PREMIUM WEATHER API

### 6.1 Overview

WeatherBets exposes a monetized weather data API using the x402 protocol. Developers and AI agents can pay micropayments to access premium weather data — no accounts, no API keys, no subscriptions.

### 6.2 Architecture

```
FREE ENDPOINTS (no payment):
  GET /api/weather/:city          → Current basic weather
  GET /api/forecast/:city         → 5-day basic forecast

PAID ENDPOINTS (x402 micropayment):
  GET /api/premium/forecast/:city     → Detailed hourly forecast + analysis
  GET /api/premium/historical/:city   → 30-day historical weather data
  GET /api/premium/alerts/:city       → Severe weather alerts + risk score
```

### 6.3 x402 Implementation (Vercel Serverless)

**Network strategy:** Try Monad Testnet via Thirdweb facilitator first. If integration issues arise, fallback to Base Sepolia with Coinbase facilitator.

**Install:**
```bash
npm install @x402/core @x402/evm
```

**Example paid endpoint (api/premium/forecast/[city].ts):**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PRICE = "0.001";  // $0.001 USDC per call
const NETWORK = "monad-testnet"; // fallback: "base-sepolia"
const PAY_TO = process.env.X402_RECEIVE_ADDRESS;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { city } = req.query;

  // Check for x402 payment header
  const paymentHeader = req.headers['x-payment'];

  if (!paymentHeader) {
    // Return 402 Payment Required
    return res.status(402).json({
      x402Version: 1,
      accepts: [{
        scheme: "exact",
        network: NETWORK,
        maxAmountRequired: PRICE,
        resource: `/api/premium/forecast/${city}`,
        payTo: PAY_TO,
        description: `Premium hourly forecast for ${city}`,
        mimeType: "application/json",
      }],
      error: `Payment required: $${PRICE} for premium forecast data`
    });
  }

  // Verify payment via facilitator
  // (x402 middleware handles this — simplified here)

  // Fetch premium data from OpenWeather
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();

  // Return enriched premium data
  return res.status(200).json({
    city,
    premium: true,
    hourlyForecast: data.list.slice(0, 24),
    analysis: {
      rainProbability: calculateRainProbability(data),
      temperatureTrend: calculateTrend(data),
      riskScore: calculateRiskScore(data),
    },
    hedgingRecommendation: generateRecommendation(data, city),
  });
}
```

### 6.4 x402 Pricing

| Endpoint | Price | Data Returned |
|---|---|---|
| /api/premium/forecast/:city | $0.001 | 24-hour hourly forecast + rain probability + risk analysis |
| /api/premium/historical/:city | $0.01 | 30-day historical weather + trend analysis |
| /api/premium/alerts/:city | $0.005 | Active severe weather alerts + risk score + hedging recommendation |

### 6.5 Why x402 Matters (Pitch Points)

- **Revenue model**: Every API call generates income without subscriptions
- **AI agent ready**: Autonomous agents can pay for weather data to make hedging decisions
- **Monad-native**: Near-zero gas makes micropayments viable
- **No competition**: Polymarket has no API monetization layer

---

## 7. DEPLOYMENT SPECIFICATION

### 7.1 Vercel Deployment (Frontend + Serverless)

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Step-by-step deployment:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Set environment variables
vercel env add OPENWEATHER_API_KEY
vercel env add DEPLOYER_PRIVATE_KEY
vercel env add X402_RECEIVE_ADDRESS
vercel env add MONAD_RPC_URL

# 4. Deploy
vercel

# 5. Get your production URL
vercel --prod
```

This gives you a live URL like `https://weather-bets.vercel.app` that judges can visit.

### 7.2 Smart Contract (Already Deployed)

The contract lives on Monad Testnet — no hosting needed. Just ensure the deployed address is in `src/config/deployed-address.json`.

---

## 8. DEV SPRINT STEPS

### PHASE 0: Environment Setup (Night Before)

```
STEP 0.1 — MetaMask + Monad Testnet
  ✅ Add Monad Testnet: RPC https://testnet-rpc.monad.xyz/, Chain ID 10143
  ✅ Claim MON from https://faucet.monad.xyz/
  ✅ Export private key for DEPLOYER_PRIVATE_KEY

STEP 0.2 — OpenWeather API Key
  ✅ Sign up at openweathermap.org (free)
  ✅ Test: curl "https://api.openweathermap.org/data/2.5/weather?q=Nagpur&appid=KEY&units=metric"

STEP 0.3 — Project Scaffold
  ✅ Create project directory, init npm
  ✅ Install Hardhat + toolbox
  ✅ Scaffold Vite React TypeScript app
  ✅ Install: ethers@6, tailwindcss, react-router-dom
  ✅ Configure Tailwind with custom theme
  ✅ Create .env with all variables

STEP 0.4 — Smart Contract Deploy
  ✅ Write contracts/WeatherBets.sol (Section 4.1)
  ✅ npx hardhat compile
  ✅ npx hardhat run scripts/deploy.ts --network monadTestnet
  ✅ npx hardhat run scripts/seed-markets.ts --network monadTestnet
  ✅ Verify on explorer, copy ABI to frontend config

STEP 0.5 — Verify + Sleep
  ✅ Contract deployed + 9 markets seeded
  ✅ OpenWeather API returning data
  ✅ Frontend dev server starts
  ✅ Go to sleep
```

### PHASE 1: Core Frontend (Hours 1-3)

```
STEP 1.1 — Foundation (30 min)
  • App.tsx with routing
  • Navbar with wallet connect
  • useWallet hook
  • Test: wallet connects, shows address + balance

STEP 1.2 — Market Display (60 min)
  • useContract hook for reading markets
  • MarketCard + MarketList + OddsBar
  • HomePage with hero + market grid (3×3 = 9 markets)
  • Filter tabs: All / Rainfall / Temperature / Wind
  • Test: all 9 markets display correctly

STEP 1.3 — Betting Flow (90 min)
  • MarketPage full layout
  • BetModal with amount input + payout calc
  • BetConfirmation animation
  • SpeedDemo component (measure tx time)
  • Test: can place bets, odds update, speed shows
```

### PHASE 2: Features + Data (Hours 4-5.5)

```
STEP 2.1 — Weather Integration (30 min)
  • Vercel serverless function for /api/weather/:city
  • WeatherWidget component on MarketPage
  • Show real weather context alongside market

STEP 2.2 — My Bets + Early Exit (60 min)
  • MyBetsPage with active + resolved bets
  • ExitModal with dynamic fee display
  • exitPosition() transaction flow
  • claimWinnings() for resolved markets
  • Test: full exit flow works, fees display correctly

STEP 2.3 — x402 Premium API (45 min)
  • Install x402 packages
  • Create 3 premium serverless endpoints
  • Add x402 payment requirement headers
  • Test: endpoints return 402, verify payment flow
  • Add "Premium Data" badge/section on MarketPage
```

### PHASE 3: Polish + Deploy + Demo (Hours 5.5-7)

```
STEP 3.1 — Deploy (30 min)
  • vercel login
  • Set environment variables
  • vercel --prod
  • Test live URL works end-to-end

STEP 3.2 — Visual Polish (30 min)
  • Hover effects, purple glow on cards
  • Loading skeletons
  • Error handling + fallback states
  • Mobile responsiveness check

STEP 3.3 — Demo Prep (30 min) — CRITICAL
  • Seed fresh markets with demo-friendly resolution times
  • Prepare admin resolve script
  • Test: connect → bet → exit → resolve → claim (full flow)
  • Write demo talking points on phone/paper
  • Record backup screen recording

STEP 3.4 — Stretch: Create Market (if time allows)
  • CreateMarketPage with form
  • City dropdown, condition type, threshold input, duration
  • Calls createMarket on contract
  • Would be amazing for live demo — audience creates a market
```

---

## 9. TESTING CHECKLIST

### Smart Contract
```
□ compile without warnings
□ createMarket — correct parameters
□ placeBet — accepts MON, updates pool, rejects duplicates
□ exitPosition — calculates dynamic fee correctly
□ exitPosition — 3% when >6h, 5% when 2-6h, 10% when <2h
□ exitPosition — payout capped at original bet amount
□ exitPosition — pool decreases correctly after exit
□ resolveMarket — admin only, after resolutionTime
□ claimWinnings — correct proportional payout
□ claimWinnings — prevents double claim
□ getExitInfo — returns correct values for all fee tiers
```

### Frontend
```
□ Wallet connects, shows address + MON balance
□ Wrong network prompts switch
□ 9 markets display in grid with filters
□ Market detail shows weather data + odds
□ Bet placement works (YES and NO)
□ Odds update after bet
□ SpeedDemo shows confirmation time
□ My Bets shows all positions
□ Exit modal shows correct fee tier + payout
□ Exit transaction works
□ Claim winnings works for resolved markets
□ Mobile responsive
```

### x402
```
□ Free weather endpoint returns data
□ Premium endpoint returns 402 without payment
□ Premium endpoint returns data with valid payment
□ All 3 premium endpoints functional
```

### Demo Day E2E
```
1. Open live URL → markets load
2. Connect wallet → balance shows
3. Click market → weather data + odds display
4. Place bet → SpeedDemo shows ~400ms ⚡
5. Go to My Bets → position shows with exit option
6. Exit position → fee displayed, payout received
7. Resolve market (admin) → result shows
8. Claim winnings → MON received
9. Show x402 API → 402 response → explain monetization
```

---

## 10. DEMO SCRIPT (2 MINUTES)

### Opening — The Hook (20 seconds)
> *"How many of you checked the weather today? [hands] Now — 70% of businesses globally are affected by weather. Indian farmers lose ₹50,000 crores annually. Platforms like Arbol serve enterprises with 6-figure minimums. Polymarket has weather bets, but they're built for traders in New York, not farmers in Nagpur. We built WeatherBets."*

### Live Demo — Core Flow (50 seconds)
> *"I'm a farmer worried about heavy rain. I open WeatherBets — here are 9 active markets across Nagpur, Mumbai, Delhi. I click Nagpur Rainfall. I can see the LIVE weather — currently clear, 28 degrees, zero rain. The threshold is 10mm.*
>
> *I bet YES — if heavy rain comes, I get paid to offset my crop damage. 1 MON... [places bet] ...confirmed in 380 milliseconds. On Ethereum? Still waiting. That's Monad's parallel execution."*

### Live Demo — Early Exit (25 seconds)
> *"Now here's what makes us different from Polymarket. Say the forecast changes — no rain coming. On Polymarket, I'm stuck. On WeatherBets, I go to My Bets, and I can EXIT my position. The fee is dynamic — 3% if I exit early, 10% if I wait too long. [shows exit] I recover 4.8 MON instead of risking the full 5. Real-time risk management, not just betting."*

### Live Demo — Resolution (15 seconds)
> *"Let me resolve this market live. [triggers] Settled instantly. Winners claim payouts in one click. Now imagine 50 markets settling after a monsoon — on Monad, all 50 resolve in parallel in the same block."*

### x402 + Differentiation (25 seconds)
> *"One more thing. WeatherBets isn't just a consumer app — we have a monetized weather API powered by x402. Developers and AI agents pay $0.001 per API call for premium forecast data. No accounts, no subscriptions — just HTTP and micropayments on Monad. Polymarket doesn't have this. Arbol doesn't have this. This is an ecosystem — consumers hedge risk, AI agents consume data, all on Monad."*

### Close (15 seconds)
> *"WeatherBets: consumer-first weather hedging, real-time position management, and a monetized data layer. Built on Monad because only Monad makes micro-insurance economics possible. Thank you."*

---

## 11. COMPETITIVE POSITIONING

### 11.1 Landscape

| Platform | What They Do | Gap |
|---|---|---|
| **Arbol** | Enterprise parametric insurance on Ethereum via Chainlink | B2B only, high minimums, no consumer UX |
| **Polymarket** | General prediction market (weather is one of 50+ categories) | Trader-focused, no weather UX, Polygon (slower), no API monetization |
| **dClimate** | Decentralized climate data marketplace | Infrastructure only, no end-user product |
| **WeatherXM** | Hardware weather stations + WXM token | Data collection, not trading/hedging |

### 11.2 WeatherBets Differentiators

1. **Consumer-first** — farmer/vendor UX vs Arbol's enterprise vs Polymarket's trading terminal
2. **Monad-native** — 400ms finality, near-zero gas, parallel settlement (vs Polygon's 2s + higher fees)
3. **Weather-vertical** — entire UX built for weather risk, with live data integration (Polymarket shows zero weather context)
4. **Early exit** — dynamic fee position trading (Polymarket locks you in or requires order book)
5. **x402 API layer** — monetized data for developers/AI agents (no competitor has this)
6. **India-focused** — built for emerging markets where protection gap is widest

### 11.3 If Asked "How Are You Different From Polymarket?"

> *"Polymarket is a general prediction market where weather is a side feature for professional traders. WeatherBets is a purpose-built weather hedging platform for real people — the farmer, the event planner, the street vendor — running on Monad for instant settlement and micro-insurance economics. We also have position exit with dynamic fees and a monetized weather API via x402 that Polymarket doesn't offer. They let you speculate on weather. We let you protect yourself from it."*

### 11.4 What NOT to Say
```
❌ "We're Polymarket but on Monad" — sounds like a fork
❌ "Polymarket is centralized" — false
❌ "We're better than Polymarket" — they have $4.3M volume
❌ "We have no competition" — dishonest
```

### 11.5 What TO Say
```
✅ "Same financial primitive, different user and UX"
✅ "They serve traders. We serve the 70% affected by weather."
✅ "Monad unlocks micro-insurance that Polygon can't support"
✅ "We respect what Polymarket built. We're solving a different problem."
```

---

## 12. ENVIRONMENT VARIABLES

```env
# OpenWeather
OPENWEATHER_API_KEY=your_key_here

# Deployer / Admin Wallet (Monad Testnet only!)
DEPLOYER_PRIVATE_KEY=your_monad_testnet_private_key

# Contract (set after deployment)
VITE_CONTRACT_ADDRESS=0x_deployed_address

# Monad
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
VITE_MONAD_CHAIN_ID=10143
VITE_MONAD_EXPLORER=https://testnet.monadexplorer.com/

# x402
X402_RECEIVE_ADDRESS=your_monad_wallet_address
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=monad-testnet

# Note: VITE_ prefix makes vars accessible in frontend
# Non-VITE_ vars are only available in serverless functions
```

---

## 13. RISK MITIGATION

| Risk | Mitigation |
|---|---|
| OpenWeather API key not active | Sign up tonight, test immediately. Fallback: hardcode data for demo |
| Monad Testnet RPC slow | Backup: QuickNode or Alchemy Monad endpoints |
| Contract bug during hackathon | Simple contract (~250 lines). Deploy v2 with new address |
| MetaMask fails | Pre-connect before demo. Keep faucet tab open |
| x402 on Monad doesn't work | Fallback to Base Sepolia. Mention "multi-chain x402 support" in pitch |
| Vercel deploy fails | Have localhost as backup. Deploy early in Phase 3 |
| Time runs out | Priority: working bet flow > exit feature > x402 > polish > stretch |
| "How is this different from Polymarket?" | See Section 11.3 — rehearse this answer |

---

## 14. CLAUDE CODE IMPLEMENTATION NOTES

### 14.1 How to Use This PRD

1. Read the **entire PRD** before writing any code
2. Follow **Phase order** strictly (0 → 1 → 2 → 3)
3. Each STEP is self-contained — complete and test before moving on
4. Use the **exact file structure** from Section 3
5. Use the **exact contract code** from Section 4.1
6. Match the **design system** from Section 5.2

### 14.2 Critical Implementation Rules

```
DO:
  ✅ Use ethers.js v6 (BrowserProvider, parseEther, etc.)
  ✅ Use Vite for local dev, Vercel for deployment
  ✅ Put serverless functions in /api directory
  ✅ Use VITE_ prefix for frontend env vars
  ✅ Measure tx confirmation time for SpeedDemo

DO NOT:
  ❌ Use ethers v5 syntax
  ❌ Add any database
  ❌ Use localStorage for state
  ❌ Install RainbowKit, wagmi, or web3modal
  ❌ Use Next.js or SSR
  ❌ Add IPFS, The Graph, or indexing
  ❌ Over-engineer — this is a 7-hour MVP
```

### 14.3 Dependency Versions

```json
{
  "dependencies": {
    "ethers": "^6.13.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0",
    "@x402/core": "latest",
    "@x402/evm": "latest"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@types/react": "^18.3.0",
    "@vercel/node": "^3.0.0",
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

### 14.4 Common Pitfalls

```
❌ Forgetting VITE_ prefix for frontend env vars (they'll be undefined)
❌ Using ethers v5 syntax with v6
❌ Not converting threshold values (×100 for contract, ÷100 for display)
❌ placeBet needs { value: ... } as options
❌ exitPosition has no payable — it sends MON back, doesn't receive
❌ Not handling wallet not connected state
❌ Not handling wrong network state
❌ Spending time on features instead of demo polish
❌ Not testing full flow before demo
```

---

## 15. POST-HACKATHON VISION (Mention if Asked)

- Chainlink Oracle integration replacing admin resolver
- Monad Mainnet deployment with real MON
- Mobile React Native app
- AI agent auto-hedging using x402 data
- Insurance products as NFTs
- DAO governance for market creation + fees
- Multi-chain x402 data marketplace
- Partnership with Indian agricultural cooperatives

---

*End of PRD v2.0. Feed this to Claude Code and follow the phases sequentially. Good luck at Monad Blitz, Steven! 🚀⚡*
