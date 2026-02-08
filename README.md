<p align="center">
  <img src="https://img.shields.io/badge/Monad-Testnet-8b5cf6?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/x402-Payment_Protocol-f59e0b?style=for-the-badge&logo=lightning&logoColor=white" />
  <img src="https://img.shields.io/badge/ethers.js-v6-2535a0?style=for-the-badge&logo=javascript&logoColor=white" />
</p>

# WeatherBet - Weather Prediction Markets on Monad

**[Live Demo](https://weather-bet-nine.vercel.app/)**

> **Predict weather. Hedge risk. Win MON — powered by Monad's parallel execution for instant settlement.**

WeatherBet is a **consumer-facing decentralized prediction market** where users bet on real-world weather outcomes using MON tokens on the **Monad blockchain**. Farmers, event planners, street vendors, or casual users can hedge against weather risk by placing simple YES/NO bets — with **early exit**, **live weather data**, and a **monetized premium API via x402**.

---

## Why WeatherBet?

| Platform | Gap | WeatherBet Advantage |
|----------|-----|---------------------|
| **Polymarket** | Trader-focused, no weather UX, Polygon (slower) | Consumer-first, weather-vertical, Monad speed |
| **Arbol** | Enterprise only, high minimums | Accessible micro-insurance for anyone |
| **dClimate** | Infrastructure only, no end-user product | Full consumer dApp + API layer |

---

## Features

### Core Betting
- **On-chain parimutuel betting** — All bets pool together, winners split proportionally minus 2% platform fee
- **9 weather markets** — 3 cities (Nagpur, Mumbai, Delhi) x 3 conditions (Rainfall, Temperature, Wind Speed)
- **Real weather data** — Markets resolve using live OpenWeather API data
- **Sub-second finality** — Experience Monad's speed with a live tx speed comparison widget

### Early Exit (Unique Feature)
- **Exit positions before resolution** — Don't wait for the market to settle
- **Dynamic time-based fees:**
  - `6+ hours remaining` → **3% fee** (green — low)
  - `2-6 hours remaining` → **5% fee** (amber — medium)
  - `< 2 hours remaining` → **10% fee** (red — high)
- **Risk management** — Recover your stake if the forecast changes

### x402 Premium Weather API
- **Monetized data endpoints** — Pay per API call with USDC micropayments
- **No subscriptions, no API keys** — Payment IS the authentication
- **AI agent ready** — Autonomous agents can pay for weather data programmatically
- **Three premium endpoints:**

| Endpoint | Price | Data |
|----------|-------|------|
| `/api/premium/forecast/:city` | $0.001 | Hourly forecast + rain probability + risk analysis |
| `/api/premium/historical/:city` | $0.01 | Weather data + trend analysis |
| `/api/premium/alerts/:city` | $0.005 | Severe weather alerts + risk score + hedging recommendations |

### Other
- **MetaMask integration** — Connect wallet, auto-switch to Monad Testnet, view balance
- **Mobile responsive** — Full 1/2/3 column grid layout with hamburger nav
- **Dark theme** — Monad-inspired purple/green palette

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Smart Contract** | Solidity ^0.8.20, Hardhat | Parimutuel betting + early exit |
| **Blockchain** | Monad Testnet (Chain ID: 10143) | Sub-second finality, low gas |
| **Frontend** | React 18, Vite, Tailwind CSS | Consumer UI |
| **Web3** | ethers.js v6, MetaMask | Wallet + contract interaction |
| **Backend** | Express.js | Weather API proxy + x402 endpoints |
| **Weather Data** | OpenWeather API | Real-time weather |
| **Payments** | x402 Protocol | Premium API micropayments |
| **State** | 100% on-chain | No database, no localStorage |

---

## Project Structure

```
weather-bets/
├── contracts/
│   └── WeatherBets.sol          # Parimutuel betting + early exit contract
├── scripts/
│   ├── deploy.ts                # Deploy to Monad Testnet
│   ├── seed-markets.ts          # Create 9 demo markets (3 cities x 3 types)
│   └── place-demo-bets.ts       # Seed varied odds for demo
├── frontend/
│   └── src/
│       ├── components/          # MarketCard, BetModal, ExitModal, OddsBar, etc.
│       ├── pages/               # HomePage, MarketPage, MyBetsPage, ApiPage
│       ├── hooks/               # useWallet, useContract, useWeather
│       ├── config/              # Contract ABI + address, weather config
│       ├── lib/                 # Formatters, constants, providers
│       └── types/               # TypeScript interfaces
├── server/
│   ├── index.ts                 # Express server entry
│   ├── routes/
│   │   ├── weather.ts           # Free weather endpoints
│   │   ├── resolve.ts           # Admin market resolution (auth protected)
│   │   └── premium.ts           # x402 premium endpoints (3 paid routes)
│   └── services/
│       ├── openweather.ts       # OpenWeather API client
│       ├── resolver.ts          # Market resolution logic
│       └── weather-analysis.ts  # Rain probability, trends, risk scores
├── hardhat.config.ts
└── .env.example
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MetaMask** browser extension
- **MON tokens** on Monad Testnet (from [faucet](https://faucet.monad.xyz/))
- **OpenWeather API key** (free at [openweathermap.org](https://openweathermap.org/appid))

### 1. Clone the repo

```bash
git clone https://github.com/aniruddha1295/WeatherBet.git
cd WeatherBet
```

### 2. Install dependencies

```bash
cd weather-bets
npm install
cd frontend
npm install
cd ..
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
DEPLOYER_PRIVATE_KEY=your_metamask_private_key
CONTRACT_ADDRESS=will_be_set_after_deployment
PORT=3001
ADMIN_SECRET=pick_any_secret_string
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
X402_RECEIVE_ADDRESS=your_wallet_address
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=base-sepolia
```

### 4. Compile the smart contract

```bash
npx hardhat compile
```

### 5. Deploy to Monad Testnet

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

This deploys the contract and saves the address to `frontend/src/config/deployed-address.json`. Copy the address into `.env` as `CONTRACT_ADDRESS`.

### 6. Seed demo markets

```bash
# Create 9 markets (3 cities x 3 weather types)
npx hardhat run scripts/seed-markets.ts --network monadTestnet

# (Optional) Place demo bets for varied odds
npx hardhat run scripts/place-demo-bets.ts --network monadTestnet
```

| # | City | Condition | Threshold | Duration |
|---|------|-----------|-----------|----------|
| 0 | Nagpur | Rainfall above | 10.00 mm | 24h |
| 1 | Nagpur | Temperature above | 38.00°C | 24h |
| 2 | Nagpur | Wind Speed above | 25.00 km/h | 48h |
| 3 | Mumbai | Rainfall above | 15.00 mm | 24h |
| 4 | Mumbai | Temperature above | 33.00°C | 12h |
| 5 | Mumbai | Wind Speed above | 30.00 km/h | 48h |
| 6 | Delhi | Rainfall above | 5.00 mm | 24h |
| 7 | Delhi | Temperature below | 10.00°C | 12h |
| 8 | Delhi | Wind Speed above | 20.00 km/h | 48h |

### 7. Start the servers

**Terminal 1 — Backend:**
```bash
cd weather-bets
npx tsx server/index.ts
```

**Terminal 2 — Frontend:**
```bash
cd weather-bets/frontend
npx vite --host
```

### 8. Open in browser

Navigate to **http://localhost:5173** — connect MetaMask and start betting!

---

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│    Frontend      │────▶│    Backend       │────▶│  OpenWeather API │
│   React/Vite     │     │   Express.js     │     │  (weather data)  │
└────────┬─────────┘     │                  │     └──────────────────┘
         │               │  x402 Premium    │
         │ ethers.js v6  │  /api/premium/*  │◀──── AI Agents / Devs
         ▼               └─────────────────┘      (pay $0.001 USDC)
┌──────────────────┐
│  WeatherBets.sol │
│  Monad Testnet   │
│  (Chain 10143)   │
└──────────────────┘
```

1. **Browse** — View 9 weather prediction markets across 3 cities with live odds
2. **Bet** — Connect MetaMask, choose YES or NO, enter MON amount
3. **Speed** — See your transaction confirm in <500ms on Monad
4. **Exit** — Exit positions early with dynamic fees (3%/5%/10%) if the forecast changes
5. **Resolve** — Admin resolves markets using real weather data from OpenWeather
6. **Claim** — Winners claim proportional payout from the losing pool (minus 2% fee)
7. **API** — Developers and AI agents pay micropayments for premium weather analysis

---

## Smart Contract

The `WeatherBets.sol` contract implements:

| Function | Description |
|----------|-------------|
| `createMarket()` | Admin creates a weather prediction market |
| `placeBet(marketId, isYes)` | Users bet MON on YES or NO (payable) |
| `exitPosition(marketId)` | Exit early with dynamic time-based fee |
| `resolveMarket(marketId, outcome)` | Admin resolves with weather result |
| `claimWinnings(marketId)` | Winners withdraw proportional payout |
| `getExitInfo(marketId, user)` | Preview exit value, fee tier, and payout |
| `getMarket()`, `getOdds()`, `getUserBet()`, `getPotentialPayout()` | View functions |

**Deployed on Monad Testnet:** [`0x76ce5a2C951A96c9f8B748E8beaAcD1cb806543c`](https://testnet.monadexplorer.com/address/0x76ce5a2C951A96c9f8B748E8beaAcD1cb806543c)

---

## x402 Premium API

WeatherBet exposes a monetized weather data API using the [x402 protocol](https://x402.org). No accounts, no API keys — payment is the authentication.

```bash
# Try it — returns 402 Payment Required with pricing
curl http://localhost:3001/api/premium/forecast/Nagpur
```

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "0.001",
    "payTo": "0x044c...715e",
    "description": "Premium weather forecast with analysis"
  }],
  "error": "Payment required: $0.001 for Premium weather forecast with analysis"
}
```

The interactive API demo is available at `/api` in the frontend.

---

## Resolving Markets (Admin)

```bash
curl -X POST http://localhost:3001/api/resolve/0 \
  -H "Authorization: Bearer your_admin_secret"
```

The server fetches live weather data, compares against the market threshold, and calls `resolveMarket()` on-chain.

---

## Built With

- [Monad](https://monad.xyz/) — High-performance EVM-compatible L1
- [Hardhat](https://hardhat.org/) — Ethereum development environment
- [ethers.js v6](https://docs.ethers.org/v6/) — Ethereum library
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [OpenWeather API](https://openweathermap.org/api) — Real-time weather data
- [x402 Protocol](https://x402.org/) — HTTP-native micropayments

---

## License

MIT

---

<p align="center">
  <b>Monad Blitz Nagpur 2026</b><br/>
  Built with speed on Monad
</p>
