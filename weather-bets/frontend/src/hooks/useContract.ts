import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { WEATHER_BETS_ADDRESS, WEATHER_BETS_ABI } from "../config/contract";
import { getReadOnlyProvider } from "../lib/providers";
import type { Market, Bet } from "../types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useContract() {
  const [isLoading, setIsLoading] = useState(false);

  const isDeployed = WEATHER_BETS_ADDRESS !== ZERO_ADDRESS;

  const getContract = useCallback((signerOrProvider?: ethers.Signer | ethers.Provider) => {
    const provider = signerOrProvider || getReadOnlyProvider();
    return new ethers.Contract(WEATHER_BETS_ADDRESS, WEATHER_BETS_ABI, provider);
  }, []);

  const getMarketCount = useCallback(async (): Promise<number> => {
    if (!isDeployed) return 0;
    const contract = getContract();
    const count = await contract.marketCount();
    return Number(count);
  }, [getContract, isDeployed]);

  const getMarket = useCallback(async (marketId: number): Promise<Market> => {
    const contract = getContract();
    const m = await contract.getMarket(marketId);
    return {
      id: Number(m.id),
      city: m.city,
      condition: Number(m.condition),
      operator: Number(m.operator),
      threshold: m.threshold,
      resolutionTime: m.resolutionTime,
      createdAt: m.createdAt,
      totalYesPool: m.totalYesPool,
      totalNoPool: m.totalNoPool,
      status: Number(m.status),
      outcome: m.outcome,
      creator: m.creator,
    };
  }, [getContract]);

  const getAllMarkets = useCallback(async (): Promise<Market[]> => {
    const count = await getMarketCount();
    if (count === 0) return [];
    const results = await Promise.allSettled(
      Array.from({ length: count }, (_, i) => getMarket(i))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Market> => r.status === "fulfilled")
      .map((r) => r.value);
  }, [getMarketCount, getMarket]);

  const getOdds = useCallback(async (marketId: number): Promise<{ yesPercent: number; noPercent: number }> => {
    const contract = getContract();
    const [yesPercent, noPercent] = await contract.getOdds(marketId);
    return { yesPercent: Number(yesPercent), noPercent: Number(noPercent) };
  }, [getContract]);

  const getUserBet = useCallback(async (marketId: number, userAddress: string): Promise<Bet> => {
    const contract = getContract();
    const bet = await contract.getUserBet(marketId, userAddress);
    return { amount: bet.amount, isYes: bet.isYes, claimed: bet.claimed };
  }, [getContract]);

  const getPotentialPayout = useCallback(async (marketId: number, isYes: boolean, amount: string): Promise<string> => {
    const contract = getContract();
    const amountWei = ethers.parseEther(amount);
    const payout = await contract.getPotentialPayout(marketId, isYes, amountWei);
    return ethers.formatEther(payout);
  }, [getContract]);

  const placeBet = useCallback(async (
    signer: ethers.Signer,
    marketId: number,
    isYes: boolean,
    amount: string
  ): Promise<{ receipt: ethers.TransactionReceipt; confirmationTime: number }> => {
    setIsLoading(true);
    try {
      const contract = getContract(signer);
      const startTime = Date.now();
      const tx = await contract.placeBet(marketId, isYes, { value: ethers.parseEther(amount) });
      const receipt = await tx.wait();
      const confirmationTime = Date.now() - startTime;
      return { receipt, confirmationTime };
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const claimWinnings = useCallback(async (signer: ethers.Signer, marketId: number): Promise<ethers.TransactionReceipt> => {
    setIsLoading(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.claimWinnings(marketId);
      return await tx.wait();
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const exitPosition = useCallback(async (
    signer: ethers.Signer,
    marketId: number
  ): Promise<{ receipt: ethers.TransactionReceipt; confirmationTime: number }> => {
    setIsLoading(true);
    try {
      const contract = getContract(signer);
      const startTime = Date.now();
      const tx = await contract.exitPosition(marketId);
      const receipt = await tx.wait();
      const confirmationTime = Date.now() - startTime;
      return { receipt, confirmationTime };
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  const getExitInfo = useCallback(async (marketId: number, userAddress: string): Promise<{ exitValue: bigint; feePercent: number; payout: bigint }> => {
    const contract = getContract();
    const [exitValue, feePercent, payout] = await contract.getExitInfo(marketId, userAddress);
    return { exitValue, feePercent: Number(feePercent), payout };
  }, [getContract]);

  return {
    getMarketCount, getMarket, getAllMarkets, getOdds,
    getUserBet, getPotentialPayout, placeBet, claimWinnings,
    exitPosition, getExitInfo, isLoading,
  };
}
