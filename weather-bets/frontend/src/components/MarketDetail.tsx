import { useEffect, useState } from "react";
import type { Market, Bet } from "../types";
import { MarketStatus } from "../types";
import { formatMON, formatCountdown, getMarketQuestion } from "../lib/formatters";
import { CONDITION_ICONS } from "../config/weather";
import OddsBar from "./OddsBar";

interface MarketDetailProps {
  market: Market;
  odds: { yesPercent: number; noPercent: number };
  onBet: (isYes: boolean) => void;
  userBet?: Bet;
}

export default function MarketDetail({ market, odds, onBet, userBet }: MarketDetailProps) {
  const [countdown, setCountdown] = useState(formatCountdown(market.resolutionTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(market.resolutionTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [market.resolutionTime]);

  const icon = CONDITION_ICONS[market.condition] || "🌤️";
  const question = getMarketQuestion(market.city, market.condition, market.operator, market.threshold);
  const totalPool = market.totalYesPool + market.totalNoPool;
  const isOpen = market.status === MarketStatus.OPEN;
  const hasUserBet = userBet && userBet.amount > 0n;

  const statusBadge = () => {
    if (market.status === MarketStatus.OPEN) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yes/15 text-yes border border-yes/30">
          OPEN
        </span>
      );
    }
    if (market.status === MarketStatus.RESOLVED) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand/15 text-brand border border-brand/30">
          RESOLVED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
        CANCELLED
      </span>
    );
  };

  const isResolved = market.status === MarketStatus.RESOLVED;

  return (
    <div className="space-y-6">
      {/* Resolved Banner */}
      {isResolved && (
        <div
          className={`rounded-xl border-2 p-4 text-center font-bold text-lg ${
            market.outcome
              ? "bg-yes/10 border-yes/40 text-yes"
              : "bg-no/10 border-no/40 text-no"
          }`}
        >
          Market Resolved: {market.outcome ? "YES" : "NO"} won
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <p className="text-sm font-medium text-slate-400">{market.city}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {question}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge()}
          {isOpen && (
            <span className="text-sm font-medium text-yes/80">{countdown}</span>
          )}
        </div>
      </div>

      {/* Large Odds Bar */}
      <div>
        <OddsBar
          yesPercent={odds.yesPercent}
          noPercent={odds.noPercent}
          yesPool={formatMON(market.totalYesPool)}
          noPool={formatMON(market.totalNoPool)}
        />
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-bg-hover rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Pool</p>
          <p className="text-lg font-bold text-white">
            {formatMON(totalPool)} <span className="text-brand text-sm">MON</span>
          </p>
        </div>
        <div className="bg-bg-hover rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">YES Pool</p>
          <p className="text-lg font-bold text-yes">
            {formatMON(market.totalYesPool)} <span className="text-sm opacity-70">MON</span>
          </p>
        </div>
        <div className="bg-bg-hover rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">NO Pool</p>
          <p className="text-lg font-bold text-no">
            {formatMON(market.totalNoPool)} <span className="text-sm opacity-70">MON</span>
          </p>
        </div>
        <div className="bg-bg-hover rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bettors</p>
          <p className="text-lg font-bold text-slate-200">--</p>
        </div>
      </div>

      {/* Bet Buttons or User Position */}
      {hasUserBet ? (
        <div className="bg-bg-hover rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Your Position</h3>
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                userBet.isYes
                  ? "bg-yes/15 text-yes border border-yes/30"
                  : "bg-no/15 text-no border border-no/30"
              }`}
            >
              {userBet.isYes ? "YES" : "NO"}
            </span>
            <span className="text-lg font-semibold text-white">
              {formatMON(userBet.amount)} MON
            </span>
            {userBet.claimed && (
              <span className="text-xs text-slate-500">(Claimed)</span>
            )}
          </div>
        </div>
      ) : isOpen ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onBet(true)}
            className="flex-1 py-4 rounded-xl bg-yes/15 border-2 border-yes/40 text-yes text-lg font-bold hover:bg-yes/25 hover:border-yes/60 transition-all duration-200 active:scale-[0.98]"
          >
            Bet YES
          </button>
          <button
            onClick={() => onBet(false)}
            className="flex-1 py-4 rounded-xl bg-no/15 border-2 border-no/40 text-no text-lg font-bold hover:bg-no/25 hover:border-no/60 transition-all duration-200 active:scale-[0.98]"
          >
            Bet NO
          </button>
        </div>
      ) : null}
    </div>
  );
}
