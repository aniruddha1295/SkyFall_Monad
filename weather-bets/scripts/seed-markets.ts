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
