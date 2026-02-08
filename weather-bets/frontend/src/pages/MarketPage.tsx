import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useContract } from "../hooks/useContract";
import type { Market, Bet, WalletState } from "../types";
import MarketDetail from "../components/MarketDetail";
import WeatherWidget from "../components/WeatherWidget";
import SpeedDemo from "../components/SpeedDemo";
import BetModal from "../components/BetModal";

interface MarketPageProps {
  wallet: WalletState;
}

export default function MarketPage({ wallet }: MarketPageProps) {
  const { id } = useParams<{ id: string }>();
  const { getMarket, getOdds, getUserBet } = useContract();

  const [market, setMarket] = useState<Market | null>(null);
  const [odds, setOdds] = useState<{ yesPercent: number; noPercent: number }>({ yesPercent: 50, noPercent: 50 });
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [betSide, setBetSide] = useState<boolean>(true); // true = YES, false = NO
  const [confirmationTime, setConfirmationTime] = useState<number | null>(null);

  const marketId = id ? parseInt(id) : NaN;

  const loadMarket = useCallback(async () => {
    if (isNaN(marketId)) {
      setError("Invalid market ID");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [marketData, oddsData] = await Promise.all([
        getMarket(marketId),
        getOdds(marketId),
      ]);
      setMarket(marketData);
      setOdds(oddsData);

      if (wallet.isConnected && wallet.address) {
        try {
          const bet = await getUserBet(marketId, wallet.address);
          setUserBet(bet.amount > 0n ? bet : null);
        } catch {
          setUserBet(null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load market");
    } finally {
      setIsLoading(false);
    }
  }, [marketId, getMarket, getOdds, getUserBet, wallet.isConnected, wallet.address]);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  const handleBetClick = (isYes: boolean) => {
    if (!wallet.isConnected) {
      setError("Please connect your wallet to place a bet");
      return;
    }
    setBetSide(isYes);
    setIsBetModalOpen(true);
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-bg-hover rounded w-2/3 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-64 bg-bg-surface rounded-xl border border-border" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-bg-surface rounded-xl border border-border" />
              <div className="h-32 bg-bg-surface rounded-xl border border-border" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="text-center py-20">
        <p className="text-no text-lg">{error || "Market not found"}</p>
        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-bg-surface border border-border text-slate-300 hover:text-white hover:bg-bg-hover transition-colors"
        >
          Back to Markets
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Layout: 60/40 on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Market Details */}
        <div className="lg:col-span-3">
          <MarketDetail
            market={market}
            odds={odds}
            userBet={userBet ?? undefined}
            onBet={handleBetClick}
          />
        </div>

        {/* Right Column: Weather + Speed Demo */}
        <div className="lg:col-span-2 space-y-6">
          <WeatherWidget city={market.city} />
          <SpeedDemo confirmationTime={confirmationTime} />
        </div>
      </div>

      {/* Use Case Cards */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Real-World Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="text-2xl mb-2">&#127806;</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Farmer's Hedge
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A farmer worried about drought can bet YES on "Temperature above 40C."
              If the heat wave hits and damages crops, the payout helps offset losses.
              If it stays cool, the crops thrive and the small bet cost is negligible.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="text-2xl mb-2">&#127914;</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Event Planner's Insurance
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              An outdoor event organizer can bet YES on "Rainfall above 5mm."
              If it rains and the event is disrupted, the winnings cover cancellation costs.
              If the weather holds, the event proceeds and the bet cost is a small insurance premium.
            </p>
          </div>
        </div>
      </section>

      {/* Bet Modal */}
      <BetModal
        isOpen={isBetModalOpen}
        market={market}
        isYes={betSide}
        wallet={wallet}
        onClose={() => setIsBetModalOpen(false)}
        onSuccess={(time) => {
          setConfirmationTime(time);
          setIsBetModalOpen(false);
          loadMarket();
        }}
      />
    </div>
  );
}
