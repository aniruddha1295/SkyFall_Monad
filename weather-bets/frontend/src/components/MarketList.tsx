import type { Market } from "../types";
import MarketCard from "./MarketCard";

interface MarketListProps {
  markets: Market[];
}

export default function MarketList({ markets }: MarketListProps) {
  if (markets.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-border rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-bg-hover" />
                <div className="w-20 h-4 rounded bg-bg-hover" />
              </div>
              <div className="w-16 h-5 rounded-full bg-bg-hover" />
            </div>
            <div className="w-full h-5 rounded bg-bg-hover mb-2" />
            <div className="w-3/4 h-5 rounded bg-bg-hover mb-4" />
            <div className="w-full h-8 rounded-lg bg-bg-hover mb-4" />
            <div className="flex justify-between">
              <div className="w-24 h-3 rounded bg-bg-hover" />
              <div className="w-20 h-3 rounded bg-bg-hover" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
