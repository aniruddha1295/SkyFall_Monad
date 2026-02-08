# Story 1.3: Wallet Connection with Network Management

Status: review

## Story

As a user,
I want to connect my MetaMask wallet and be prompted to switch to Monad Testnet,
So that I can interact with WeatherBets.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Create useWallet.ts hook with full wallet state management
- [x] Implement MetaMask detection (window.ethereum check)
- [x] Show styled "Install MetaMask" message with download link when not detected
- [x] Implement wallet_addEthereumChain for Monad Testnet network switch
- [x] Implement eth_requestAccounts for wallet connection
- [x] Create BrowserProvider and get signer on connection
- [x] Fetch and format MON balance using provider.getBalance
- [x] Listen for accountsChanged event and update state
- [x] Listen for chainChanged event and update state
- [x] Show "Switch to Monad" button when on wrong network
- [x] Export MONAD_CHAIN_ID and MONAD_NETWORK_CONFIG from config/contract.ts
- [x] Return connect/disconnect functions from hook

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

- `weather-bets/frontend/src/hooks/useWallet.ts`
- `weather-bets/frontend/src/config/contract.ts`
