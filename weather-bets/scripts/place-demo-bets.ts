import { ethers } from "hardhat";

async function main() {
  const address = require("../frontend/src/config/deployed-address.json").address;
  const weatherBets = await ethers.getContractAt("WeatherBets", address);

  // One bet per market (contract allows only 1 bet per wallet per market)
  // This creates non-50/50 odds since one side will have MON and the other won't
  const bets = [
    { marketId: 0, isYes: true, amount: "0.5" },   // Nagpur Rain — YES heavy
    { marketId: 1, isYes: false, amount: "0.3" },   // Nagpur Temp — NO lean
    { marketId: 2, isYes: true, amount: "0.2" },    // Nagpur Wind — YES
    { marketId: 3, isYes: true, amount: "0.6" },    // Mumbai Rain — YES strong
    { marketId: 4, isYes: false, amount: "0.25" },   // Mumbai Temp — NO
    { marketId: 5, isYes: false, amount: "0.4" },   // Mumbai Wind — NO heavy
    { marketId: 6, isYes: true, amount: "0.45" },   // Delhi Rain — YES
    { marketId: 7, isYes: false, amount: "0.5" },   // Delhi Temp — NO strong
    { marketId: 8, isYes: true, amount: "0.35" },   // Delhi Wind — YES
  ];

  // Skip market 0 — already bet on it
  for (const bet of bets) {
    try {
      const side = bet.isYes ? "YES" : "NO";
      const tx = await weatherBets.placeBet(bet.marketId, bet.isYes, {
        value: ethers.parseEther(bet.amount),
      });
      await tx.wait();
      console.log(`Market ${bet.marketId}: ${bet.amount} MON on ${side}`);
    } catch (err: any) {
      console.log(`Market ${bet.marketId}: skipped (${err.message?.slice(0, 40)}...)`);
    }
  }

  console.log("\nDemo bets placed! Refresh frontend to see updated odds.");
}

main().catch(console.error);
