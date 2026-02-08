import { useEffect, useState, useCallback } from "react";
import type { Market, Bet, WalletState } from "../types";
import { MarketStatus } from "../types";
import { useContract } from "../hooks/useContract";
import { formatMON, getMarketQuestion } from "../lib/formatters";
import ExitModal from "./ExitModal";

interface MyBetsProps {
  wallet: WalletState;
}

interface UserBetInfo {
  market: Market;
  bet: Bet;
  question: string;
}

interface ExitInfo {
  exitValue: bigint;
  feePercent: number;
  payout: bigint;
}

export default function MyBets({ wallet }: MyBetsProps) {
  const { getAllMarkets, getUserBet, claimWinnings, getExitInfo } = useContract();
  const [userBets, setUserBets] = useState<UserBetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedMarketForExit, setSelectedMarketForExit] = useState<UserBetInfo | null>(null);
  const [exitInfo, setExitInfo] = useState<ExitInfo | null>(null);
  const [loadingExitId, setLoadingExitId] = useState<number | null>(null);

  const loadBets = useCallback(async () => {
    if (!wallet.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const markets = await getAllMarkets();
      // Fetch all user bets in parallel instead of sequentially
      const betResults = await Promise.allSettled(
        markets.map((market) => getUserBet(market.id, wallet.address!))
      );
      const bets: UserBetInfo[] = [];
      for (let i = 0; i < markets.length; i++) {
        const result = betResults[i];
        if (result.status === "fulfilled" && result.value.amount > 0n) {
          const market = markets[i];
          bets.push({
            market,
            bet: result.value,
            question: getMarketQuestion(market.city, market.condition, market.operator, market.threshold),
          });
        }
      }
      setUserBets(bets);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, getAllMarkets, getUserBet]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  const handleClaim = async (marketId: number) => {
    if (!wallet.signer) return;
    setClaimingId(marketId);
    try {
      await claimWinnings(wallet.signer, marketId);
      await loadBets(); // Refresh after claim
    } catch (err: any) {
      console.error("Claim failed:", err);
    } finally {
      setClaimingId(null);
    }
  };

  const handleExitClick = async (betInfo: UserBetInfo) => {
    if (!wallet.address) return;
    setLoadingExitId(betInfo.market.id);
    try {
      const info = await getExitInfo(betInfo.market.id, wallet.address);
      setSelectedMarketForExit(betInfo);
      setExitInfo(info);
      setIsExitModalOpen(true);
    } catch (err: any) {
      console.error("Failed to get exit info:", err);
    } finally {
      setLoadingExitId(null);
    }
  };

  const handleExitSuccess = () => {
    setIsExitModalOpen(false);
    setSelectedMarketForExit(null);
    setExitInfo(null);
    loadBets(); // Refresh after exit
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-slate-400">Connect your wallet to view bets</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-border rounded-xl p-5 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-5 rounded bg-bg-hover" />
                <div className="flex gap-3">
                  <div className="w-16 h-6 rounded-full bg-bg-hover" />
                  <div className="w-24 h-6 rounded bg-bg-hover" />
                </div>
              </div>
              <div className="w-20 h-8 rounded bg-bg-hover" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (userBets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">&#127782;&#65039;</div>
        <p className="text-xl text-slate-400 mb-2">No bets yet</p>
        <p className="text-sm text-slate-500">Start predicting weather!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userBets.map(({ market, bet, question }) => {
        const isResolved = market.status === MarketStatus.RESOLVED;
        const didWin = isResolved && bet.isYes === market.outcome;
        const canClaim = isResolved && didWin && !bet.claimed;

        return (
          <div
            key={market.id}
            className="bg-bg-surface border border-border rounded-xl p-5 hover:border-brand/20 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: market info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 mb-2 truncate">
                  {question}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Side badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      bet.isYes
                        ? "bg-yes/15 text-yes border border-yes/30"
                        : "bg-no/15 text-no border border-no/30"
                    }`}
                  >
                    {bet.isYes ? "YES" : "NO"}
                  </span>

                  {/* Amount */}
                  <span className="text-sm text-slate-300">
                    {formatMON(bet.amount)} <span className="text-brand">MON</span>
                  </span>

                  {/* Resolved outcome */}
                  {isResolved && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        didWin
                          ? "bg-yes/10 text-yes"
                          : "bg-no/10 text-no"
                      }`}
                    >
                      {didWin ? "Won" : "Lost"}
                    </span>
                  )}

                  {/* Claimed badge */}
                  {bet.claimed && (
                    <span className="text-xs text-slate-500">(Claimed)</span>
                  )}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-3 shrink-0">
                {canClaim && (
                  <button
                    onClick={() => handleClaim(market.id)}
                    disabled={claimingId === market.id}
                    className="px-4 py-2 rounded-lg bg-yes hover:bg-yes/90 text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {claimingId === market.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Claiming...
                      </span>
                    ) : (
                      "Claim"
                    )}
                  </button>
                )}

                {/* Exit button for open markets */}
                {market.status === MarketStatus.OPEN && !bet.claimed && (
                  <button
                    onClick={() => handleExitClick({ market, bet, question })}
                    disabled={loadingExitId === market.id}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {loadingExitId === market.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "Exit Now"
                    )}
                  </button>
                )}

                {/* Status pill */}
                {market.status === MarketStatus.OPEN && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yes/10 text-yes border border-yes/20">
                    OPEN
                  </span>
                )}
                {market.status === MarketStatus.RESOLVED && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                    RESOLVED
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Exit Modal */}
      {selectedMarketForExit && exitInfo && (
        <ExitModal
          isOpen={isExitModalOpen}
          market={selectedMarketForExit.market}
          userBet={selectedMarketForExit.bet}
          exitInfo={exitInfo}
          wallet={wallet}
          onClose={() => {
            setIsExitModalOpen(false);
            setSelectedMarketForExit(null);
            setExitInfo(null);
          }}
          onSuccess={handleExitSuccess}
        />
      )}
    </div>
  );
}
