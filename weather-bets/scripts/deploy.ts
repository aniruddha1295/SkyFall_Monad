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
