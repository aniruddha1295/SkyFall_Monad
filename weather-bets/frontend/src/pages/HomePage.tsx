import { useState, useEffect, useRef } from "react";
import { useContract } from "../hooks/useContract";
import type { Market, WalletState } from "../types";
import MarketList from "../components/MarketList";

interface HomePageProps {
  wallet: WalletState;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 animate-pulse">
      <div className="h-4 bg-bg-hover rounded w-3/4 mb-3" />
      <div className="h-3 bg-bg-hover rounded w-1/2 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-8 bg-bg-hover rounded flex-1" />
        <div className="h-8 bg-bg-hover rounded flex-1" />
      </div>
      <div className="h-3 bg-bg-hover rounded w-2/3" />
    </div>
  );
}

const STEPS = [
  {
    step: 1,
    title: "Choose a weather market",
    description:
      "Browse open markets for cities around the world. Each market poses a weather question -- will temperature, rainfall, or wind speed cross a threshold?",
  },
  {
    step: 2,
    title: "Bet YES or NO with MON",
    description:
      "Connect your wallet and place a bet using MON tokens. Your bet is recorded on-chain with sub-second Monad finality.",
  },
  {
    step: 3,
    title: "Win if your prediction is correct",
    description:
      "When the market resolves, winnings are distributed proportionally from the losing pool. Claim your payout instantly.",
  },
];

export default function HomePage({ wallet: _wallet }: HomePageProps) {
  const { getAllMarkets } = useContract();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marketGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllMarkets();
        if (!cancelled) setMarkets(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load markets");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getAllMarkets]);

  const scrollToMarkets = () => {
    marketGridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-28 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.8)]">
            Predict Weather.{" "}
            <span className="text-primary drop-shadow-[0_0_40px_rgba(56,189,248,1)]">Hedge Risk.</span>{" "}
            Win MON.
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto font-medium">
            Powered by Monad's parallel EVM
          </p>
          <button
            onClick={scrollToMarkets}
            className="mt-10 px-10 py-4 rounded-lg bg-gradient-to-r from-primary to-light text-bg hover:from-light hover:to-primary shadow-lg font-bold text-xl transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] animate-pulse-glow"
            style={{ boxShadow: "0 0 30px rgba(56, 189, 248, 0.7)" }}
          >
            Explore Markets
          </button>
        </div>
      </section>

      {/* Market Grid */}
      <section ref={marketGridRef}>
        <h2 className="text-2xl font-bold text-white mb-6">Open Markets</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-no text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-bg-surface border border-border text-slate-300 hover:text-white hover:bg-bg-hover transition-colors"
            >
              Retry
            </button>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              No markets available yet. Check back soon!
            </p>
          </div>
        ) : (
          <MarketList markets={markets} />
        )}
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ step, title, description }) => (
            <div
              key={step}
              className="rounded-xl border border-border bg-bg-surface p-6 text-center hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
