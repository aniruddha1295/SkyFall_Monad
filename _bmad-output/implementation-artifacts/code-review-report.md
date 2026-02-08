# BMAD Adversarial Code Review Report
Date: 2026-02-08

## Executive Summary

**Total Issues Found: 62** across all 13 stories.

| Severity | Count |
|----------|-------|
| CRITICAL | 8 |
| HIGH | 18 |
| MEDIUM | 24 |
| LOW | 12 |

**Stories Needing Fixes: 10 out of 13**

Key systemic problems:
1. **Missing ADMIN_SECRET authentication** on the resolve endpoint (security vulnerability)
2. **Weather API response not transformed** by the backend -- raw OpenWeather JSON is returned directly, but the frontend tries to parse raw OpenWeather format too, creating a fragile coupling
3. **Missing constants** specified in the story ACs (MONAD_CHAIN_ID, MONAD_RPC, MONAD_EXPLORER, CONDITION_LABELS, OPERATOR_LABELS not in constants.ts)
4. **OddsBar props mismatch** -- component accepts string pools but story specifies bigint
5. **No disconnect button** visible to connected users
6. **No "Connect Wallet" button** on MyBetsPage when disconnected
7. **Multiple missing error handling patterns** specified in ACs
8. **Missing Inter font** Google Fonts link in index.html (loaded via CSS @import instead, which is slower)

---

## Story-by-Story Review

### Story 1.1: Set Up Project Structure and Smart Contract
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Project structure matches spec | PARTIAL | `server/services/` exists but not in story AC structure; `tsconfig.json` at root exists (not in spec) |
| WeatherBets.sol matches PRD 4.1 | IMPLEMENTED | `contracts/WeatherBets.sol` - exact match to PRD spec |
| Hardhat config for Monad Testnet | IMPLEMENTED | `hardhat.config.ts:10-14` |
| Frontend Vite React-TS with deps | PARTIAL | `frontend/package.json` - React 19.2.0 instead of ^18.3.0, Vite 7.x instead of 5.x |
| Tailwind custom dark theme | IMPLEMENTED | `frontend/tailwind.config.js:6-12` |
| index.css Tailwind directives | PARTIAL | Uses inline CSS `background-color`/`color` instead of `@apply bg-bg text-white` |
| .env.example contents | PARTIAL | Missing `ADMIN_SECRET` entry (required by Story 5.2) |
| .gitignore exclusions | IMPLEMENTED | `.gitignore` covers all required entries |
| TypeScript types (Market, Bet) | PARTIAL | Uses enums instead of plain numbers for condition/operator/status |
| constants.ts exports | MISSING | `lib/constants.ts` does NOT export MONAD_CHAIN_ID, MONAD_RPC, MONAD_EXPLORER, CONDITION_LABELS, CONDITION_UNITS, OPERATOR_LABELS |
| formatters.ts helper functions | PARTIAL | `truncateAddress` is named `formatAddress`; `marketQuestion` is named `getMarketQuestion`; `formatMON` rounds to 2 decimal places instead of 4 |

**Issues Found:**
- CRITICAL: `lib/constants.ts` is missing 6 of 6 required exports specified in AC (MONAD_CHAIN_ID, MONAD_RPC, MONAD_EXPLORER, CONDITION_LABELS, CONDITION_UNITS, OPERATOR_LABELS). These are split across `config/contract.ts` and `config/weather.ts` instead. Story AC explicitly requires them in `lib/constants.ts`. [weather-bets/frontend/src/lib/constants.ts:1-4]
- HIGH: React version is 19.2.0 instead of specified ^18.3.0. This is a major version jump that could introduce breaking changes. [weather-bets/frontend/package.json:14]
- HIGH: Vite version is 7.2.4 instead of specified ^5.4.0. Major version change. [weather-bets/frontend/package.json:33]
- MEDIUM: `formatMON` rounds to 2 decimal places (`.toFixed(2)`) but AC specifies 4 decimal places. [weather-bets/frontend/src/lib/formatters.ts:4]
- MEDIUM: `index.css` uses raw CSS `background-color: #0a0a0f; color: #f8fafc;` instead of `@apply bg-bg text-white` as specified in AC. [weather-bets/frontend/src/index.css:8-9]
- MEDIUM: TypeScript types use enums (`WeatherCondition`, `Operator`, `MarketStatus`) instead of plain `number` as specified in AC. While arguably better practice, it diverges from the spec. [weather-bets/frontend/src/types/index.ts:4-6]
- LOW: `truncateAddress` is named `formatAddress` -- naming inconsistency with AC spec. [weather-bets/frontend/src/lib/formatters.ts:7]
- LOW: `marketQuestion` is named `getMarketQuestion` -- naming inconsistency with AC spec. [weather-bets/frontend/src/lib/formatters.ts:29]
- LOW: `getMarketQuestion` uses "exceed" and "fall below" instead of "be above" and "be below" as implied by the AC example format "Will {city} {condition} be {operator} {threshold}{unit}?". [weather-bets/frontend/src/lib/formatters.ts:31]

---

### Story 1.2: Deploy Contract and Seed Demo Markets
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| deploy.ts outputs address and writes to JSON | IMPLEMENTED | `scripts/deploy.ts:15-18` |
| contract.ts imports deployed-address.json | MISSING | `config/contract.ts:1` uses hardcoded zero address instead of `import deployedAddress from './deployed-address.json'` |
| contract.ts exports ABI, MONAD_CHAIN_ID, MONAD_RPC | IMPLEMENTED | `config/contract.ts:3-4,15-32` |
| seed-markets.ts creates 3 correct markets | IMPLEMENTED | `scripts/seed-markets.ts:11-21` |

**Issues Found:**
- CRITICAL: `contract.ts` uses a hardcoded zero address `"0x0000000000000000000000000000000000000000"` instead of importing from `deployed-address.json`. The AC explicitly requires `import deployedAddress from './deployed-address.json'` and `export const WEATHER_BETS_ADDRESS = deployedAddress.address`. This means the frontend will NEVER connect to the actual deployed contract. [weather-bets/frontend/src/config/contract.ts:1]
- MEDIUM: ABI uses human-readable format (ethers.js Interface format strings) instead of the full JSON ABI array extracted from `artifacts/`. While this works with ethers.js v6, it risks ABI mismatches and is harder to maintain. [weather-bets/frontend/src/config/contract.ts:15-32]

---

### Story 1.3: Wallet Connection with Network Management
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| MetaMask detection with styled message | IMPLEMENTED | `Navbar.tsx:47-54` shows Install MetaMask link |
| wallet_addEthereumChain with correct params | IMPLEMENTED | `useWallet.ts:66-76` |
| eth_requestAccounts on connect | IMPLEMENTED | `useWallet.ts:59` |
| Navbar shows address + MON balance | IMPLEMENTED | `Navbar.tsx:83-89` |
| useWallet stores required state fields | PARTIAL | Returns `{ wallet, connect, disconnect }` instead of flat `{ address, balance, signer, provider, isConnected, chainId, connect, disconnect }` |
| BrowserProvider + getSigner + getBalance | IMPLEMENTED | `useWallet.ts:25-39` |
| accountsChanged event listener | IMPLEMENTED | `useWallet.ts:96` |
| chainChanged event listener | IMPLEMENTED | `useWallet.ts:97` |
| Red "Switch to Monad" button on wrong network | IMPLEMENTED | `Navbar.tsx:75-79` |
| Hook returns connect/disconnect without duplicating providers | PARTIAL | Creates new BrowserProvider on every `updateWalletState` call |

**Issues Found:**
- HIGH: The `useWallet` hook returns a nested `{ wallet, connect, disconnect }` object instead of the flat destructuring specified in the AC: `{ address, balance, signer, provider, isConnected, chainId, connect, disconnect }`. This means every consumer must do `wallet.address` instead of just `address`. While functional, it deviates from the specification and forces a different API surface across the entire app. [weather-bets/frontend/src/hooks/useWallet.ts:104]
- MEDIUM: A new `BrowserProvider` is created on every call to `updateWalletState()` (line 25). The AC says "without duplicating provider instances." There should be a ref or memoized provider to avoid recreating it on every account/chain change. [weather-bets/frontend/src/hooks/useWallet.ts:25]
- MEDIUM: The `connect` function silently swallows the switch error when `switchError.code !== 4902`. If the user rejects the switch, no feedback is given. [weather-bets/frontend/src/hooks/useWallet.ts:70-77]
- LOW: No `disconnect` functionality is exposed to the user in the Navbar UI -- there is no disconnect button visible anywhere. The AC mentions `disconnect` as part of the hook return but there is no UI to trigger it. [weather-bets/frontend/src/components/Navbar.tsx]

---

### Story 1.4: App Shell with Navigation
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Navbar: logo, nav links, wallet button | IMPLEMENTED | `Navbar.tsx:22-91` |
| Navbar: bg-bg-surface, border-border, sticky top-0 z-50 | IMPLEMENTED | `Navbar.tsx:18` uses `bg-bg-surface/95 backdrop-blur-sm` |
| Mobile hamburger menu | IMPLEMENTED | `Navbar.tsx:94-174` |
| Footer: "Built on Monad", badge, explorer link | PARTIAL | Footer has text but MISSING explorer link |
| Footer: bg-bg-surface, border-t border-border | PARTIAL | Has `border-t border-border` but missing `bg-bg-surface` |
| Routes: /, /market/:id, /my-bets | IMPLEMENTED | `App.tsx:22-25` |
| BrowserRouter with Navbar above, Footer below | IMPLEMENTED | `main.tsx:35-37`, `App.tsx:13-29` |
| min-h-screen flex flex-col, flex-1 main | IMPLEMENTED | `App.tsx:13,21` |
| Content centered max-w-7xl mx-auto px-4 | PARTIAL | Uses `max-w-[1200px]` instead of `max-w-7xl` (1280px) |
| Inter font loaded | PARTIAL | Loaded via CSS @import in index.css, not via <link> in index.html |
| Dark theme colors applied | IMPLEMENTED | `App.tsx:13`, `index.css:8-9`, `index.html:9` |

**Issues Found:**
- HIGH: Footer is MISSING the link to Monad testnet explorer (`https://testnet.monadexplorer.com/`). The AC explicitly requires this. [weather-bets/frontend/src/components/Footer.tsx:1-14]
- HIGH: Footer is MISSING `bg-bg-surface` background. It only has `border-t border-border` but no surface background color. [weather-bets/frontend/src/components/Footer.tsx:3]
- MEDIUM: Main content uses `max-w-[1200px]` instead of `max-w-7xl` (which is 1280px). While close, it deviates from the AC specification. [weather-bets/frontend/src/App.tsx:21]
- MEDIUM: Inter font is loaded via CSS `@import url(...)` in `index.css:1` instead of a `<link>` tag in `index.html`. CSS @import blocks rendering and is slower. The AC says "via a `<link>` tag in `index.html` or imported in `index.css`" -- while technically compliant, the @import method is the less preferred option. [weather-bets/frontend/src/index.css:1]
- LOW: Navbar uses `bg-bg-surface/95 backdrop-blur-sm` instead of plain `bg-bg-surface`. The opacity and blur are not in the AC spec. [weather-bets/frontend/src/components/Navbar.tsx:18]
- LOW: Footer lacks the "Monad Blitz Nagpur 2026" as a distinct badge element -- it is just plain text. AC says "badge." [weather-bets/frontend/src/components/Footer.tsx:8-9]

---

### Story 2.1: Market List with Grid Display
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Hero section with heading, subtitle, CTA | IMPLEMENTED | `HomePage.tsx:79-94` |
| Hero text responsive sizing | PARTIAL | Uses `text-4xl sm:text-5xl lg:text-6xl` instead of `text-4xl` desktop / `text-2xl` mobile |
| useContract fetches marketCount + getMarket loop | IMPLEMENTED | `useContract.ts:45-53` via `getAllMarkets` |
| Fetches getOdds for each market | PARTIAL | Odds are fetched in MarketCard, not in the hook alongside market data |
| Loading skeleton cards with animate-pulse | IMPLEMENTED | `HomePage.tsx:99-104`, `MarketList.tsx:11-34` |
| Responsive grid 1/2/3 columns | IMPLEMENTED | `MarketList.tsx:38` |
| MarketCard: city, icon, question, OddsBar, pool, countdown, status | IMPLEMENTED | `MarketCard.tsx:57-96` |
| Card hover purple glow + scale | PARTIAL | Uses `hover:shadow-brand/10` instead of `shadow-[0_10px_15px_-3px_rgba(139,92,246,0.15)]` |
| Card clickable, navigates to /market/:id | IMPLEMENTED | `MarketCard.tsx:59` |
| "How It Works" section with 3 steps | PARTIAL | Missing icons (cloud, coin, trophy) -- uses numbered circles instead |
| Grid gap-6 | IMPLEMENTED | `MarketList.tsx:38` |

**Issues Found:**
- MEDIUM: Odds are fetched inside each `MarketCard` component individually (`MarketCard.tsx:21`) rather than being fetched alongside market data in the `useContract` hook or `HomePage`. This creates N separate contract calls as the cards mount, which is less efficient than batching. [weather-bets/frontend/src/components/MarketCard.tsx:21]
- MEDIUM: "How It Works" section uses numbered circles (1, 2, 3) instead of the specified icons: cloud icon, coin icon, and trophy icon. [weather-bets/frontend/src/pages/HomePage.tsx:137]
- MEDIUM: MarketCard city name uses `text-sm font-medium text-slate-400` instead of `text-xl font-bold` as specified in AC. The city is shown as secondary text below the icon. [weather-bets/frontend/src/components/MarketCard.tsx:66]
- LOW: Hero heading uses `text-4xl sm:text-5xl lg:text-6xl` (gets bigger on desktop) instead of the AC's simpler `text-4xl font-bold` desktop / `text-2xl` mobile. Technically richer but deviates. [weather-bets/frontend/src/pages/HomePage.tsx:81]
- LOW: MarketCard hover shadow uses `hover:shadow-lg hover:shadow-brand/10` instead of the exact `shadow-[0_10px_15px_-3px_rgba(139,92,246,0.15)]` specified in AC. [weather-bets/frontend/src/components/MarketCard.tsx:60]

---

### Story 2.2: Odds Bar Visualization
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| OddsBar accepts { yesPercent, noPercent, yesPool, noPool } | PARTIAL | Props are `yesPool?: string, noPool?: string` instead of `bigint` |
| Bar 100% width, 12px tall, rounded corners | PARTIAL | Bar is h-8 (32px) tall instead of 12px. Uses `rounded-lg` |
| Green YES portion, red NO portion | IMPLEMENTED | `OddsBar.tsx:24,43` with bg-yes/80 and bg-no/80 |
| Percentage labels below bar | PARTIAL | Labels are INSIDE the bar, not BELOW it |
| Smooth transition animation | IMPLEMENTED | `OddsBar.tsx:24` uses `transition-all duration-500 ease-out` |
| Hover tooltips with pool amounts | IMPLEMENTED | `OddsBar.tsx:34-38,53-57` |
| Zero-bet: 50/50 muted gray | MISSING | No muted gray handling; same green/red colors used at 50/50 |
| Reusable across contexts | IMPLEMENTED | Used in both MarketCard and MarketDetail |

**Issues Found:**
- HIGH: OddsBar accepts `yesPool` and `noPool` as `string` type (already formatted by caller via `formatMON`), but the AC specifies these as `bigint`. This means the tooltip shows pre-formatted values rather than formatting them internally, which breaks the component's encapsulation. [weather-bets/frontend/src/components/OddsBar.tsx:7-8]
- HIGH: The zero-bet edge case (totalYesPool=0, totalNoPool=0) does NOT use muted gray (`bg-bg-hover`) as specified. It shows the same green/red colors with 50/50 percentages, which is misleading -- it looks like there are actual bets when there are none. [weather-bets/frontend/src/components/OddsBar.tsx:10-17]
- MEDIUM: Bar height is `h-8` (32px) instead of the specified 12px. The AC is very specific: "12px tall." [weather-bets/frontend/src/components/OddsBar.tsx:21]
- MEDIUM: Percentage labels are rendered INSIDE the bar rather than BELOW it as specified: "below the bar, percentage labels are shown." [weather-bets/frontend/src/components/OddsBar.tsx:29-30,48-49]

---

### Story 2.3: Market Detail Page
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| MarketPage fetches market + odds | IMPLEMENTED | `MarketPage.tsx:39-42` |
| Loading skeleton | IMPLEMENTED | `MarketPage.tsx:71-88` |
| Header: icon, city, question, status, countdown | IMPLEMENTED | `MarketDetail.tsx:56-72` |
| Countdown in HH:MM:SS ticking every second | PARTIAL | Uses formatCountdown which returns "Xh Ym" not HH:MM:SS |
| Two-column layout lg:grid-cols-5 | IMPLEMENTED | `MarketPage.tsx:107` |
| Left: OddsBar, pool stats, bet buttons | IMPLEMENTED | `MarketDetail.tsx:75-147` |
| Right: WeatherWidget, SpeedDemo | IMPLEMENTED | `MarketPage.tsx:119-122` |
| Pool stats card with "Bettors: X" | PARTIAL | Bettors count shows "--" hardcoded |
| Bet buttons: green YES, red NO, large | IMPLEMENTED | `MarketDetail.tsx:133-146` |
| Wallet not connected: tooltip on bet click | MISSING | No tooltip shown; buttons just fire onBet regardless |
| RESOLVED: disabled buttons, result banner, "Ended" | PARTIAL | Buttons hidden entirely for resolved markets, no result banner |
| Countdown zero: "Awaiting Resolution", disable buttons | MISSING | Shows "Ended" but doesn't show "Awaiting Resolution" or disable buttons |

**Issues Found:**
- CRITICAL: When wallet is not connected, clicking bet buttons does NOT show "Connect wallet to bet" tooltip. The buttons fire the `onBet` callback regardless of wallet state, which will open the BetModal even when there is no signer, leading to a crash when trying to place the bet. [weather-bets/frontend/src/components/MarketDetail.tsx:133-146]
- HIGH: No "Market Resolved" result banner is shown for RESOLVED markets. The AC requires: "a result banner shows: 'Market Resolved: YES won' (green) or 'Market Resolved: NO won' (red)". [weather-bets/frontend/src/components/MarketDetail.tsx:53]
- HIGH: When countdown reaches zero, the AC requires the text to show "Awaiting Resolution" and bet buttons should disable. The current implementation just shows "Ended" (from formatCountdown) and keeps YES/NO buttons enabled as long as `status === OPEN`. A user could attempt to bet after resolution time, which would fail on-chain. [weather-bets/frontend/src/components/MarketDetail.tsx:68-69, 132-146]
- MEDIUM: Countdown format is "Xh Ym" instead of the specified "HH:MM:SS" format with per-second ticking. The AC specifically says "in `HH:MM:SS` format that ticks down every second using `setInterval`." [weather-bets/frontend/src/lib/formatters.ts:17-27]
- MEDIUM: "Bettors" count is hardcoded as "--" instead of reading from contract. The AC says "bettors count from `marketBettors[id].length` or a read from contract." [weather-bets/frontend/src/components/MarketDetail.tsx:106]
- MEDIUM: City name uses `text-sm font-medium text-slate-400` instead of `text-3xl font-bold` as specified in AC. [weather-bets/frontend/src/components/MarketDetail.tsx:60]

---

### Story 3.1: Bet Placement Flow
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| BetModal centered overlay with dark backdrop | IMPLEMENTED | `BetModal.tsx:81-86` |
| Header with "Bet YES"/"Bet NO" and close button | PARTIAL | Shows "Place Bet" instead of "Bet YES"/"Bet NO" with colored accent |
| Side indicator with colored border | PARTIAL | Shows badge but not with "green left border accent" |
| Amount input with proper styling | IMPLEMENTED | `BetModal.tsx:125-137` |
| Quick amount buttons (0.1, 0.5, 1.0, 5.0) | IMPLEMENTED | `BetModal.tsx:141-155` |
| Potential payout via getPotentialPayout | IMPLEMENTED | `BetModal.tsx:38-48` |
| Implied probability display | MISSING | Not implemented anywhere in BetModal |
| 300ms debounce on payout calls | IMPLEMENTED | `BetModal.tsx:43-48` |
| "Confirming..." state with spinner | IMPLEMENTED | `BetModal.tsx:183-192` |
| Success state: green checkmark, tx hash link | PARTIAL | Shows checkmark but NO transaction hash link to explorer |
| CSS confetti animation | MISSING in modal | Confetti is in BetConfirmation component but that component is NOT rendered from MarketPage |
| Auto-close after 3 seconds | PARTIAL | Auto-closes after 2 seconds, not 3 |
| Market data re-fetches after bet | IMPLEMENTED | `MarketPage.tsx:163-164` calls loadMarket() |
| Error state with "Try Again" button | IMPLEMENTED | `BetModal.tsx:210-228` |
| Error state "Close" button | MISSING | Only "Try Again" button, no "Close" button in error state |

**Issues Found:**
- HIGH: Implied probability display is completely MISSING. The AC requires: "Implied Probability: X% -- calculated as `(winningPool / totalPool) * 100`." [weather-bets/frontend/src/components/BetModal.tsx]
- HIGH: Transaction hash link to explorer is MISSING from success state. AC requires: "transaction hash (truncated, linked to `https://testnet.monadexplorer.com/tx/{hash}`)." The success state only shows confirmation time, not the tx hash. [weather-bets/frontend/src/components/BetModal.tsx:195-206]
- HIGH: BetConfirmation component (with confetti) exists but is NEVER rendered from MarketPage. The confetti animation specified in the AC is orphaned. MarketPage does not use `<BetConfirmation />` anywhere. [weather-bets/frontend/src/pages/MarketPage.tsx]
- MEDIUM: Modal header says "Place Bet" instead of "Bet YES" (green) or "Bet NO" (red) with colored accent as specified in AC. [weather-bets/frontend/src/components/BetModal.tsx:92]
- MEDIUM: Auto-close timeout is 2000ms instead of the specified 3 seconds (3000ms). [weather-bets/frontend/src/components/BetModal.tsx:59]
- MEDIUM: The side indicator uses dynamic Tailwind classes `bg-${sideColor}/15` which will NOT work because Tailwind cannot detect dynamically constructed class names at build time. These classes will be purged. [weather-bets/frontend/src/components/BetModal.tsx:113]
- LOW: Error state is missing a "Close" button alongside "Try Again." AC says both should exist. [weather-bets/frontend/src/components/BetModal.tsx:210-228]

---

### Story 3.2: Speed Demo Component
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Idle state: "Monad Speed" header with lightning bolt | IMPLEMENTED | `SpeedDemo.tsx:55-58` |
| Idle: "Place a bet to see Monad's speed" | IMPLEMENTED | `SpeedDemo.tsx:109` |
| Idle: "Ethereum avg: ~12,000ms" | MISSING | Not shown in idle state |
| Live counter ticking from 0ms on tx submit | MISSING | Counter is animated AFTER confirmation, not live during pending tx |
| Counter updates every 10ms | MISSING | Uses requestAnimationFrame ease-out animation post-confirmation, not live ticking |
| Counter displays text-3xl font-mono font-bold text-brand | PARTIAL | Uses `text-4xl font-bold text-brand tabular-nums` but NOT font-mono |
| Confirmed result display | IMPLEMENTED | `SpeedDemo.tsx:63-67` |
| Comparison bars (Monad vs Ethereum) | IMPLEMENTED | `SpeedDemo.tsx:71-93` |
| Speed callout "{N}x faster" | IMPLEMENTED | `SpeedDemo.tsx:98-103` |
| Reset on new transaction | IMPLEMENTED | `SpeedDemo.tsx:13-17` |
| onTransactionSubmit/onTransactionConfirm callbacks | PARTIAL | Only onConfirm is implemented; no real-time counting during pending |

**Issues Found:**
- CRITICAL: The SpeedDemo does NOT show a live counter ticking during the pending transaction. The AC explicitly requires: "A live counter ticking up from 0ms, updating every 10ms." Instead, the component only receives the final `confirmationTime` and animates to it post-hoc. This completely misses the dramatic real-time counting effect that is the "Demo Day Wow Factor." [weather-bets/frontend/src/components/SpeedDemo.tsx:12-42]
- HIGH: "Ethereum avg: ~12,000ms" is NOT shown in the idle state. AC requires this as a comparison placeholder. [weather-bets/frontend/src/components/SpeedDemo.tsx:107-110]
- MEDIUM: Counter uses `text-4xl` instead of specified `text-3xl`, and `tabular-nums` instead of `font-mono`. [weather-bets/frontend/src/components/SpeedDemo.tsx:64]
- MEDIUM: The comparison bars animate via CSS `transition-all duration-1000` but the AC specifies "growing from left to right over 0.5s" (duration-500). [weather-bets/frontend/src/components/SpeedDemo.tsx:79]

---

### Story 4.1: My Bets Portfolio Page
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| MyBetsPage iterates markets, calls getUserBet | IMPLEMENTED | `MyBets.tsx:31-48` |
| Filters to amount > 0 | IMPLEMENTED | `MyBets.tsx:36` |
| Fetches market info and odds for each bet | PARTIAL | Fetches market info but NOT odds for each bet |
| Loading skeleton | IMPLEMENTED | `MyBets.tsx:82-103` |
| Bet card: question, side badge, amount, odds, payout, status | PARTIAL | Missing current odds display, missing potential payout display |
| RESOLVED + winning: "WON" badge, payout, Claim/Claimed | PARTIAL | Shows "Won" (lowercase) not "WON" (uppercase) |
| RESOLVED + losing: "LOST" badge, loss amount in red | PARTIAL | Shows "Lost" (lowercase), does NOT show loss amount as "-{amount} MON" in red |
| OPEN: countdown timer + current potential payout | MISSING | No countdown timer, no potential payout for OPEN bets |
| Empty state with icon, message, "Browse Markets" link | PARTIAL | Has icon and message but no "Browse Markets" button |
| Not connected: "Connect your wallet" with Connect button | PARTIAL | Shows message but no Connect Wallet button |

**Issues Found:**
- HIGH: Current odds (YES X% / NO Y%) are NOT displayed on bet cards. The AC requires "Current odds: YES X% / NO Y% (from `getOdds`)" for each bet. [weather-bets/frontend/src/components/MyBets.tsx:118-209]
- HIGH: Potential payout is NOT displayed on bet cards. The AC requires "Potential payout: calculated via `contract.getPotentialPayout(marketId, userBet.isYes, userBet.amount)` and displayed as 'X.XXXX MON'." [weather-bets/frontend/src/components/MyBets.tsx:118-209]
- HIGH: No countdown timer shown for OPEN bets. AC requires "Time remaining: `formatCountdown(market.resolutionTime)`." [weather-bets/frontend/src/components/MyBets.tsx:195-198]
- MEDIUM: RESOLVED losing bets do not show the loss amount in red as "-{amount} MON". The AC explicitly requires this. [weather-bets/frontend/src/components/MyBets.tsx:152-163]
- MEDIUM: Empty state is missing the "Browse Markets" purple button that links to `/`. AC requires this. [weather-bets/frontend/src/components/MyBets.tsx:106-113]
- MEDIUM: "Connect your wallet" state is missing a "Connect Wallet" button. AC requires "a 'Connect Wallet' button that triggers the wallet connection flow from Story 1.3." [weather-bets/frontend/src/pages/MyBetsPage.tsx:13-17]
- LOW: Won/Lost badges use lowercase "Won"/"Lost" instead of uppercase "WON"/"LOST" as specified. [weather-bets/frontend/src/components/MyBets.tsx:161]

---

### Story 4.2: Claim Winnings Flow
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Claim button calls claimWinnings(marketId) | IMPLEMENTED | `MyBets.tsx:61-71` |
| Loading spinner + "Claiming..." during tx | IMPLEMENTED | `MyBets.tsx:180-186` |
| Button disabled during tx | IMPLEMENTED | `MyBets.tsx:177` |
| Success notification with payout amount | MISSING | No success notification/toast appears |
| Auto-dismiss notification after 5 seconds | MISSING | No notification implemented |
| Claim button changes to "Claimed" | IMPLEMENTED | `MyBets.tsx:166-168` via loadBets() refresh |
| Navbar balance updates after claim | MISSING | No balance re-fetch triggered |
| "Already claimed" error handling | PARTIAL | Only console.error, no UI notification |
| Losing side: red-tinted left border | MISSING | No red border on losing bet cards |
| Error notification with retry | MISSING | Only console.error, no user-facing error notification |
| Claimed state persists from contract | IMPLEMENTED | `MyBets.tsx:66` calls loadBets() which re-reads contract |

**Issues Found:**
- CRITICAL: No success notification/toast appears after claiming winnings. The AC requires "a success notification appears (top-right toast or inline banner): Green background with text: 'Winnings claimed! +{payout} MON'". The claim silently succeeds with only a data refresh. [weather-bets/frontend/src/components/MyBets.tsx:61-71]
- HIGH: Navbar MON balance does NOT update after claiming. The AC requires "the user's MON balance in the Navbar updates (by re-fetching balance from provider)." There is no mechanism to trigger a balance refresh from the MyBets component. [weather-bets/frontend/src/components/MyBets.tsx:61-71]
- HIGH: No error notification is shown to the user when claim fails. The AC requires "an error notification appears: 'Claim failed: {reason}. Please try again.'" Currently only `console.error` is called. [weather-bets/frontend/src/components/MyBets.tsx:67-68]
- MEDIUM: Losing bet cards do NOT have a "subtle red-tinted left border" as specified in the AC. [weather-bets/frontend/src/components/MyBets.tsx:126-127]
- MEDIUM: Claim button is styled `bg-yes hover:bg-yes/90` (green) instead of the specified purple `bg-brand hover:bg-brand-hover`. [weather-bets/frontend/src/components/MyBets.tsx:178]

---

### Story 5.1: Weather Data Backend & Display
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| Express server on PORT with CORS, JSON, routes | PARTIAL | CORS is open (no origin restriction) instead of restricted to localhost:5173 |
| GET /api/weather/:city calls OpenWeather | IMPLEMENTED | `server/routes/weather.ts:6-12` |
| Response transformed to spec format | MISSING | Backend returns RAW OpenWeather JSON; frontend does the transformation |
| rainfall extraction from rain.1h/3h | IMPLEMENTED on frontend | `useWeather.ts:22` does this client-side |
| windSpeed m/s to km/h conversion | IMPLEMENTED on frontend | `useWeather.ts:23` does this client-side |
| Error handling HTTP 500 | IMPLEMENTED | `server/routes/weather.ts:11` |
| useWeather hook with 60s interval | IMPLEMENTED | `useWeather.ts:37-41` |
| Returns { data, loading, error, lastUpdated } | IMPLEMENTED | `useWeather.ts:43` |
| Cleanup interval on unmount | IMPLEMENTED | `useWeather.ts:40` |
| WeatherWidget: header with Live dot | IMPLEMENTED | `WeatherWidget.tsx:66-72` |
| WeatherWidget: icon, condition, temp, rainfall, wind, humidity | IMPLEMENTED | `WeatherWidget.tsx:76-92` |
| WeatherWidget: "Last updated" footer | IMPLEMENTED | `WeatherWidget.tsx:96-100` |
| Error state: retry button | PARTIAL | Shows error message but no retry button |
| useRef to prevent duplicate intervals | MISSING | No useRef used for interval tracking |

**Issues Found:**
- CRITICAL: The backend weather route returns RAW OpenWeather API JSON directly to the frontend without any transformation. The AC explicitly requires the server to return a transformed response with specific fields: `{ city, temperature, rainfall, windSpeed, humidity, condition, icon, iconUrl }`. Instead, the `openweather.ts` service just returns `res.json()` raw. The frontend `useWeather.ts` hook then directly parses OpenWeather format (`data.main.temp`, `data.rain?.["1h"]`, etc.), which means the API key hiding proxy works but the API contract is wrong. [weather-bets/server/services/openweather.ts:4-8]
- HIGH: CORS is wide open with `app.use(cors())` instead of restricted to `http://localhost:5173`. The AC says "CORS enabled for `http://localhost:5173` (Vite dev server)." This is a security concern in any non-hackathon context. [weather-bets/server/index.ts:12]
- HIGH: The `WeatherData` type in `types/index.ts` has field `temp` instead of `temperature`, and `cityName` instead of `city`. This inconsistency with the AC-specified response format propagates through the component. [weather-bets/frontend/src/types/index.ts:39-47]
- MEDIUM: `useWeather` does NOT use `useRef` to track the interval and prevent duplicates as required by the AC: "the `useWeather` hook uses `useRef` to track the interval and prevent duplicates." This could lead to multiple intervals on re-renders with changed city. [weather-bets/frontend/src/hooks/useWeather.ts:37-41]
- MEDIUM: WeatherWidget error state shows text but no "retry button" as specified in the AC: "If no data was ever fetched: 'Unable to load weather data' with a retry button." [weather-bets/frontend/src/components/WeatherWidget.tsx:37-44]
- LOW: WeatherWidget shows "Weather data unavailable" instead of "Unable to load weather data" as specified. [weather-bets/frontend/src/components/WeatherWidget.tsx:40]
- LOW: The "Last updated" text only shows when `minutesAgo > 0`, meaning it's hidden for the first minute after fetching. The AC just says "a 'Last updated: {time}' footer." [weather-bets/frontend/src/components/WeatherWidget.tsx:96]

---

### Story 5.2: Admin Market Resolution
**Status Recommendation:** needs-fixes

**AC Validation:**
| AC | Status | Evidence |
|----|--------|----------|
| POST /api/resolve/:marketId endpoint | IMPLEMENTED | `server/routes/resolve.ts:6-17` |
| ethers JsonRpcProvider + Wallet + Contract | IMPLEMENTED | `server/services/resolver.ts:14-16` |
| Read market, fetch weather, determine outcome | IMPLEMENTED | `server/services/resolver.ts:18-46` |
| Call resolveMarket and wait | IMPLEMENTED | `server/services/resolver.ts:48-49` |
| HTTP 200 success response | IMPLEMENTED | `server/services/resolver.ts:51-58` |
| "Too early to resolve" HTTP 400 | MISSING | No specific error code mapping |
| "Only admin" HTTP 403 | MISSING | No specific error code mapping |
| "Market not open" HTTP 400 | MISSING | No specific error code mapping |
| Weather API failure HTTP 500 | PARTIAL | Throws generic error, no specific message |
| Authorization header check against ADMIN_SECRET | MISSING | No auth check at all |
| .env.example updated with ADMIN_SECRET | MISSING | Not present |

**Issues Found:**
- CRITICAL: The resolve endpoint has NO authentication whatsoever. The AC explicitly requires: "the server checks for a simple auth header: `Authorization: Bearer {ADMIN_SECRET}` where `ADMIN_SECRET` is from `.env`." Anyone can call POST `/api/resolve/:marketId` and resolve any market. This is a significant security vulnerability. [weather-bets/server/routes/resolve.ts:6-17]
- CRITICAL: `.env.example` does NOT include `ADMIN_SECRET=your_admin_secret_here` as required by the AC. [weather-bets/.env.example]
- HIGH: No differentiated HTTP error codes for different failure scenarios. All errors return HTTP 500. The AC specifies: HTTP 400 for "Too early to resolve" and "Market not open", HTTP 403 for "Only admin", HTTP 401 for missing auth. [weather-bets/server/routes/resolve.ts:14]
- MEDIUM: The resolver does not check whether the market's `resolutionTime` has passed before calling the contract. While the contract will revert, the AC says the server should pre-check and return HTTP 400 with `resolutionTime` info. [weather-bets/server/services/resolver.ts:48]
- MEDIUM: The resolver does not check market status before calling the contract. The AC says return HTTP 400 for already resolved markets. [weather-bets/server/services/resolver.ts:48]

---

## Cross-Cutting Issues

### 1. Provider Instance Duplication
The `useContract` hook creates a new `JsonRpcProvider` on every call to `getContract()` via `getReadOnlyProvider()`. Combined with `useWallet` creating new `BrowserProvider` instances on every state update, this means dozens of provider instances are created during normal usage. The architecture doc says "without duplicating provider instances."

**Files affected:** `frontend/src/hooks/useContract.ts:14-16`, `frontend/src/lib/providers.ts:4-6`, `frontend/src/hooks/useWallet.ts:25`

### 2. Dynamic Tailwind Class Names
Several components construct Tailwind class names dynamically (e.g., `` bg-${sideColor}/15 ``), which Tailwind's JIT compiler cannot detect at build time. These classes will be purged from the production build, resulting in missing styles.

**Files affected:** `frontend/src/components/BetModal.tsx:113`

### 3. Wallet State Prop Drilling
The wallet state is passed as props through multiple levels (App -> pages -> components) rather than using React Context or a shared hook pattern. This creates coupling and makes it harder to add wallet-dependent behavior to deeply nested components.

**Files affected:** `App.tsx`, all page components, `BetModal.tsx`, `MyBets.tsx`

### 4. Missing Error Boundary Integration
While `main.tsx` has an ErrorBoundary and `index.html` has global error handlers, contract call failures in hooks are silently swallowed (empty catch blocks in `MarketCard.tsx:21`, `MyBets.tsx:50`). Users get no feedback when data loading fails.

**Files affected:** `MarketCard.tsx:21`, `MyBets.tsx:45-47,50-51`

### 5. No Contract Deployment Check
The `WEATHER_BETS_ADDRESS` is hardcoded to the zero address. While `useContract` has an `isDeployed` check, this check only affects `getMarketCount` and not other functions. Calling `getMarket(0)` on the zero address will fail with an unhelpful error.

**Files affected:** `frontend/src/config/contract.ts:1`, `frontend/src/hooks/useContract.ts:12-13`

### 6. Express v5 Incompatibility Risk
The root `package.json` pins `express@^5.2.1`, which is Express 5. The routing API changed in Express 5 (e.g., `Router` import path, error handling). The current code appears to work, but Express 5 was not specified in the PRD (which says Express 4.x).

**Files affected:** `weather-bets/package.json:25`

---

## Recommended Fixes (Prioritized)

### P0 - Must Fix Before Demo

1. **Fix contract address**: Update `config/contract.ts` to import from `deployed-address.json` or set the actual deployed address. Without this, the entire app is non-functional. [Story 1.2]

2. **Add auth to resolve endpoint**: Add `Authorization: Bearer {ADMIN_SECRET}` check to `server/routes/resolve.ts`. Without this, anyone can resolve markets. [Story 5.2]

3. **Add ADMIN_SECRET to .env.example**: Update `.env.example` with the ADMIN_SECRET field. [Story 5.2]

4. **Fix wallet-not-connected bet flow**: Add wallet connection check before opening BetModal. Show "Connect wallet to bet" tooltip when disconnected. [Story 2.3]

5. **Add market resolved banner**: Show "Market Resolved: YES won" or "NO won" on resolved market pages. [Story 2.3]

### P1 - Should Fix

6. **Transform weather API response on backend**: The `openweather.ts` service should return the transformed format specified in the AC, not raw OpenWeather JSON. [Story 5.1]

7. **Fix OddsBar zero-bet state**: Use muted gray when both pools are zero. [Story 2.2]

8. **Add SpeedDemo live counter**: Implement real-time millisecond counter during pending transaction. [Story 3.2]

9. **Add claim success/error notifications**: Implement toast/notification on claim success and failure. [Story 4.2]

10. **Add missing MyBets data**: Display odds, potential payout, and countdown for each bet. [Story 4.1]

11. **Fix Footer**: Add explorer link and bg-bg-surface background. [Story 1.4]

12. **Fix dynamic Tailwind classes**: Replace `bg-${sideColor}/15` with conditional classes. [Story 3.1]

13. **Restrict CORS**: Set CORS origin to `http://localhost:5173`. [Story 5.1]

### P2 - Nice to Fix

14. **Add implied probability to BetModal**. [Story 3.1]
15. **Add tx hash link in bet success state**. [Story 3.1]
16. **Use BetConfirmation component (confetti)**. [Story 3.1]
17. **Move constants to lib/constants.ts as specified**. [Story 1.1]
18. **Fix formatMON to 4 decimal places**. [Story 1.1]
19. **Add "Awaiting Resolution" state when countdown hits zero**. [Story 2.3]
20. **Add "Browse Markets" button to empty bets state**. [Story 4.1]
21. **Add "Connect Wallet" button to disconnected bets state**. [Story 4.1]
22. **Add red-tinted left border on losing bets**. [Story 4.2]
23. **Add differentiated HTTP error codes to resolve endpoint**. [Story 5.2]
24. **Add retry button to WeatherWidget error state**. [Story 5.1]
25. **Downgrade React to ^18.3.0 per spec (or document the v19 decision)**. [Story 1.1]
