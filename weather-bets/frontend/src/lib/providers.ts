import { ethers } from "ethers";
import { MONAD_RPC } from "../config/contract";

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MONAD_RPC);
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}
