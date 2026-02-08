import deployedAddress from "./deployed-address.json";

export const WEATHER_BETS_ADDRESS: string = deployedAddress.address;

export const MONAD_CHAIN_ID = 10143;
export const MONAD_RPC = "https://testnet-rpc.monad.xyz/";
export const MONAD_EXPLORER = "https://testnet.monadexplorer.com/";

export const MONAD_NETWORK_CONFIG = {
  chainId: "0x" + MONAD_CHAIN_ID.toString(16),
  chainName: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: [MONAD_RPC],
  blockExplorerUrls: [MONAD_EXPLORER],
};

export const WEATHER_BETS_ABI = [
  "function createMarket(string memory _city, uint8 _condition, uint8 _operator, uint256 _threshold, uint256 _resolutionTime) external returns (uint256)",
  "function placeBet(uint256 _marketId, bool _isYes) external payable",
  "function resolveMarket(uint256 _marketId, bool _outcome) external",
  "function claimWinnings(uint256 _marketId) external",
  "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string city, uint8 condition, uint8 operator, uint256 threshold, uint256 resolutionTime, uint256 createdAt, uint256 totalYesPool, uint256 totalNoPool, uint8 status, bool outcome, address creator))",
  "function getOdds(uint256 _marketId) external view returns (uint256 yesPercent, uint256 noPercent)",
  "function getUserBet(uint256 _marketId, address _user) external view returns (tuple(uint256 amount, bool isYes, bool claimed))",
  "function getActiveMarketCount() external view returns (uint256 count)",
  "function getPotentialPayout(uint256 _marketId, bool _isYes, uint256 _amount) external view returns (uint256)",
  "function marketCount() external view returns (uint256)",
  "function admin() external view returns (address)",
  "function platformFeePercent() external view returns (uint256)",
  "event MarketCreated(uint256 indexed marketId, string city, uint8 condition, uint256 threshold, uint256 resolutionTime)",
  "event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount)",
  "event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool)",
  "event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout)",
  "function exitPosition(uint256 _marketId) external",
  "function getExitInfo(uint256 _marketId, address _user) external view returns (uint256 exitValue, uint256 feePercent, uint256 payout)",
  "event PositionExited(uint256 indexed marketId, address indexed bettor, uint256 originalAmount, uint256 exitPayout, uint256 feePercent)",
] as const;
