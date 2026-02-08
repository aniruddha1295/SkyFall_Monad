<p align="center">
  <img src="https://img.shields.io/badge/Monad-Testnet-8b5cf6?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/ethers.js-v6-2535a0?style=for-the-badge&logo=javascript&logoColor=white" />
</p>

# SkyFall - Weather Prediction Markets on Monad

> **Predict weather. Hedge risk. Win MON.**

SkyFall is a decentralized weather prediction market built on **Monad Testnet**. Users bet YES or NO on real-world weather outcomes (temperature, rainfall, wind speed) using MON tokens. Winners split the losing pool proportionally via on-chain parimutuel betting — all with sub-second Monad finality.

---

## Preview

```
 Homepage                          Market Detail
 ┌──────────────────────────┐     ┌──────────────────────────┐
 │  ⚡ SkyFall    [Connect] │     │  🌡️ Mumbai Temperature    │
 │                          │     │  Will it be above 35°C?  │
 │  Predict Weather.        │     │                          │
 │  Hedge Risk. Win MON.    │     │  ████████░░ YES 67%      │
 │                          │     │  Pool: 4.2 MON           │
 │  ┌────┐ ┌────┐ ┌────┐   │     │                          │
 │  │🌧️  │ │🌡️  │ │💨  │   │     │  [Bet YES]  [Bet NO]    │
 │  │Nagp│ │Mumb│ │Delhi│   │     │                          │
 │  │10mm│ │35°C│ │20kmh│   │     │  ☀️ Mumbai Weather: 32°C │
 │  └────┘ └────┘ └────┘   │     │  ⚡ Confirmed in 340ms   │
 └──────────────────────────┘     └──────────────────────────┘
```

---

## Features

- **On-chain parimutuel betting** — All bets pool together, winners split proportionally minus 2% platform fee
- **Real weather data** — Markets resolve using live OpenWeather API data
- **Sub-second finality** — Experience Monad's speed with a live tx speed comparison widget
- **3 weather conditions** — Rainfall (mm), Temperature (°C), Wind Speed (km/h)
- **MetaMask integration** — Connect wallet, auto-switch to Monad Testnet, view balance
- **Mobile responsive** — Full 1/2/3 column grid layout with hamburger nav
- **Dark theme** — Monad-inspired purple/green palette

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity ^0.8.20, Hardhat |
| **Blockchain** | Monad Testnet (Chain ID: 10143) |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Web3** | ethers.js v6, MetaMask |
| **Backend** | Express.js (weather API proxy) |
| **Weather Data** | OpenWeather API |
| **State** | 100% on-chain — no database, no localStorage |

---

## Project Structure

```
weather-bets/
├── contracts/
│   └── WeatherBets.sol          # Parimutuel betting smart contract
├── scripts/
│   ├── deploy.ts                # Deploy to Monad Testnet
│   └── seed-markets.ts          # Create 3 demo markets
├── frontend/
│   └── src/
│       ├── components/          # UI components (MarketCard, BetModal, OddsBar, etc.)
│       ├── pages/               # HomePage, MarketPage, MyBetsPage
│       ├── hooks/               # useWallet, useContract, useWeather
│       ├── config/              # Contract address + ABI
│       ├── lib/                 # Formatters, constants
│       └── types/               # TypeScript interfaces
├── server/
│   ├── index.ts                 # Express server entry
│   ├── routes/                  # /api/weather, /api/resolve
│   └── services/                # OpenWeather client, market resolver
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
git clone https://github.com/aniruddha1295/SkyFall_Monad.git
cd SkyFall_Monad
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
```

### 4. Compile the smart contract

```bash
npx hardhat compile
```

### 5. Deploy to Monad Testnet

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

This will:
- Deploy the WeatherBets contract to Monad Testnet
- Save the contract address to `frontend/src/config/deployed-address.json`

Copy the deployed address into your `.env` file as `CONTRACT_ADDRESS`.

### 6. Seed demo markets

```bash
npx hardhat run scripts/seed-markets.ts --network monadTestnet
```

Creates 3 markets:
| Market | City | Condition | Threshold | Duration |
|--------|------|-----------|-----------|----------|
| 0 | Nagpur | Rainfall above | 10.00 mm | 24 hours |
| 1 | Mumbai | Temperature above | 35.00°C | 24 hours |
| 2 | Delhi | Wind Speed above | 20.00 km/h | 48 hours |

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
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend   │────▶│  OpenWeather API │
│  React/Vite  │     │  Express.js │     │  (weather data)  │
└──────┬───────┘     └─────────────┘     └──────────────────┘
       │
       │ ethers.js v6
       ▼
┌──────────────────┐
│  WeatherBets.sol │
│  Monad Testnet   │
│  (Chain 10143)   │
└──────────────────┘
```

1. **Browse** — View open weather prediction markets with live odds
2. **Bet** — Connect MetaMask, choose YES or NO, enter MON amount
3. **Speed** — See your transaction confirm in <500ms on Monad
4. **Resolve** — Admin resolves markets using real weather data from OpenWeather
5. **Claim** — Winners claim proportional payout from the losing pool (minus 2% fee)

---

## Smart Contract

The `WeatherBets.sol` contract implements:

- **`createMarket(city, condition, operator, threshold, resolutionTime)`** — Admin creates a weather market
- **`placeBet(marketId, isYes)`** — Users bet MON on YES or NO (payable)
- **`resolveMarket(marketId, outcome)`** — Admin resolves with weather result
- **`claimWinnings(marketId)`** — Winners withdraw proportional payout
- **`getMarket()`, `getOdds()`, `getUserBet()`, `getPotentialPayout()`** — View functions

**Deployed on Monad Testnet:** [`0xD655286094942b13501451dB4031cCac2d01234F`](https://testnet.monadexplorer.com/address/0xD655286094942b13501451dB4031cCac2d01234F)

---

## Resolving Markets (Admin)

Markets are resolved via the backend API with the admin secret:

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

---

## License

MIT

---

<p align="center">
  <b>Monad Blitz Nagpur 2026</b><br/>
  Built with ⚡ on Monad
</p>
