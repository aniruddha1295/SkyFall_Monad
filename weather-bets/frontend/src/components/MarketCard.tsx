import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Market } from "../types";
import { MarketStatus, WeatherCondition } from "../types";
import { formatMON, formatCountdown, getMarketQuestion } from "../lib/formatters";
import { CONDITION_ICONS } from "../config/weather";
import { useContract } from "../hooks/useContract";
import OddsBar from "./OddsBar";

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const navigate = useNavigate();
  const { getOdds } = useContract();
  const [odds, setOdds] = useState({ yesPercent: 50, noPercent: 50 });
  const [countdown, setCountdown] = useState(formatCountdown(market.resolutionTime));

  useEffect(() => {
    getOdds(market.id).then(setOdds).catch(() => {});
  }, [market.id, getOdds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(market.resolutionTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [market.resolutionTime]);

  const totalPool = market.totalYesPool + market.totalNoPool;
  const icon = CONDITION_ICONS[market.condition] || "🌤️";
  const question = getMarketQuestion(market.city, market.condition, market.operator, market.threshold);

  const statusBadge = () => {
    if (market.status === MarketStatus.OPEN) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yes/15 text-yes border border-yes/30">
          OPEN
        </span>
      );
    }
    if (market.status === MarketStatus.RESOLVED) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
          RESOLVED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
        CANCELLED
      </span>
    );
  };

  return (
    <div
      onClick={() => navigate(`/market/${market.id}`)}
      className="backdrop-blur-sm bg-bg-surface/90 border-2 border-border rounded-xl p-6 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] hover:border-primary/50 hover:ring-2 hover:ring-primary/20 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm font-medium text-slate-400">{market.city}</span>
        </div>
        {statusBadge()}
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-slate-100 mb-4 leading-snug group-hover:text-white transition-colors">
        {question}
      </h3>

      {/* Odds Bar */}
      <div className="mb-4">
        <OddsBar
          yesPercent={odds.yesPercent}
          noPercent={odds.noPercent}
          yesPool={formatMON(market.totalYesPool)}
          noPool={formatMON(market.totalNoPool)}
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          {formatMON(totalPool)} <span className="text-primary">MON</span> pool
        </span>
        <span className={market.status === MarketStatus.OPEN ? "text-yes/80" : "text-slate-500"}>
          {market.status === MarketStatus.OPEN ? countdown : "Ended"}
        </span>
      </div>
    </div>
  );
}
