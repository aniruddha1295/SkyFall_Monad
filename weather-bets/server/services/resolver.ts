import { ethers } from "ethers";
import { fetchCurrentWeather } from "./openweather";

const RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz/";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

const ABI = [
  "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string city, uint8 condition, uint8 operator, uint256 threshold, uint256 resolutionTime, uint256 createdAt, uint256 totalYesPool, uint256 totalNoPool, uint8 status, bool outcome, address creator))",
  "function resolveMarket(uint256 _marketId, bool _outcome) external",
];

export async function resolveMarket(marketId: number) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const market = await contract.getMarket(marketId);
  const city = market.city;
  const condition = Number(market.condition); // 0=RAINFALL, 1=TEMP, 2=WIND
  const operator = Number(market.operator);   // 0=ABOVE, 1=BELOW
  const threshold = Number(market.threshold);

  const weatherData = await fetchCurrentWeather(city);

  let actualScaled: number;
  switch (condition) {
    case 0: // RAINFALL
      actualScaled = Math.round((weatherData.rain?.["1h"] || 0) * 100);
      break;
    case 1: // TEMPERATURE
      actualScaled = Math.round(weatherData.main.temp * 100);
      break;
    case 2: // WIND_SPEED (m/s -> km/h, then scale)
      actualScaled = Math.round(weatherData.wind.speed * 3.6 * 100);
      break;
    default:
      throw new Error("Unknown weather condition");
  }

  let outcome: boolean;
  if (operator === 0) { // ABOVE
    outcome = actualScaled > threshold;
  } else { // BELOW
    outcome = actualScaled < threshold;
  }

  const tx = await contract.resolveMarket(marketId, outcome);
  const receipt = await tx.wait();

  return {
    success: true,
    marketId,
    outcome,
    actualValue: actualScaled / 100,
    threshold: threshold / 100,
    txHash: receipt.hash,
  };
}
