import { ethers } from "ethers";
import { MONAD_RPC } from "../config/contract";

let _readOnlyProvider: ethers.JsonRpcProvider | null = null;

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  if (!_readOnlyProvider) {
    _readOnlyProvider = new ethers.JsonRpcProvider(MONAD_RPC);
  }
  return _readOnlyProvider;
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}
