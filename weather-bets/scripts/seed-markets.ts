import { ethers } from "hardhat";

async function main() {
  const address = require("../frontend/src/config/deployed-address.json").address;
  const weatherBets = await ethers.getContractAt("WeatherBets", address);

  const now = Math.floor(Date.now() / 1000);
  const in12Hours = now + 43200;
  const in24Hours = now + 86400;
  const in48Hours = now + 172800;

  // Nagpur Markets
  await weatherBets.createMarket("Nagpur", 0, 0, 1000, in24Hours);   // Rainfall > 10mm
  console.log("Created: Nagpur Rainfall > 10mm");
  await weatherBets.createMarket("Nagpur", 1, 0, 3800, in24Hours);   // Temp > 38°C
  console.log("Created: Nagpur Temperature > 38°C");
  await weatherBets.createMarket("Nagpur", 2, 0, 2500, in48Hours);   // Wind > 25 km/h
  console.log("Created: Nagpur Wind > 25 km/h");

  // Mumbai Markets
  await weatherBets.createMarket("Mumbai", 0, 0, 1500, in24Hours);   // Rainfall > 15mm
  console.log("Created: Mumbai Rainfall > 15mm");
  await weatherBets.createMarket("Mumbai", 1, 0, 3300, in12Hours);   // Temp > 33°C
  console.log("Created: Mumbai Temperature > 33°C");
  await weatherBets.createMarket("Mumbai", 2, 0, 3000, in48Hours);   // Wind > 30 km/h
  console.log("Created: Mumbai Wind > 30 km/h");

  // Delhi Markets
  await weatherBets.createMarket("Delhi", 0, 0, 500, in24Hours);     // Rainfall > 5mm
  console.log("Created: Delhi Rainfall > 5mm");
  await weatherBets.createMarket("Delhi", 1, 1, 1000, in12Hours);    // Temp < 10°C
  console.log("Created: Delhi Temperature < 10°C");
  await weatherBets.createMarket("Delhi", 2, 0, 2000, in48Hours);    // Wind > 20 km/h
  console.log("Created: Delhi Wind > 20 km/h");

  console.log("\nSeeded 9 demo markets (3 cities × 3 weather types)");
}

main().catch(console.error);
