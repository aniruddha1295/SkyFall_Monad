import { ethers } from "ethers";

export function formatMON(value: bigint): string {
  return parseFloat(ethers.formatEther(value)).toFixed(2);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatThreshold(value: bigint, condition: number): string {
  const num = Number(value) / 100;
  const units: Record<number, string> = { 0: "mm", 1: "°C", 2: "km/h" };
  return `${num}${units[condition] || ""}`;
}

export function formatCountdown(resolutionTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(resolutionTime) - now;
  if (remaining <= 0) return "Ended";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export function getMarketQuestion(city: string, condition: number, operator: number, threshold: bigint): string {
  const condLabels: Record<number, string> = { 0: "rainfall", 1: "temperature", 2: "wind speed" };
  const opLabels: Record<number, string> = { 0: "exceed", 1: "fall below" };
  const thresholdStr = formatThreshold(threshold, condition);
  return `Will ${city} ${condLabels[condition] || "weather"} ${opLabels[operator] || "exceed"} ${thresholdStr}?`;
}
