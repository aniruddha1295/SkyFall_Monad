import { useEffect, useState } from "react";
import { ETHEREUM_AVG_CONFIRMATION_MS } from "../lib/constants";

interface SpeedDemoProps {
  confirmationTime: number | null;
}

export default function SpeedDemo({ confirmationTime }: SpeedDemoProps) {
  const [animatedTime, setAnimatedTime] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (confirmationTime === null) {
      setAnimatedTime(0);
      setAnimationDone(false);
      return;
    }

    setAnimatedTime(0);
    setAnimationDone(false);

    const duration = 1000; // animation takes 1 second
    const startTime = Date.now();
    const target = confirmationTime;

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setAnimatedTime(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setAnimationDone(true);
      }
    };

    requestAnimationFrame(frame);
  }, [confirmationTime]);

  const speedMultiplier = confirmationTime
    ? Math.round(ETHEREUM_AVG_CONFIRMATION_MS / confirmationTime)
    : null;

  const monadBarWidth = confirmationTime
    ? Math.max((confirmationTime / ETHEREUM_AVG_CONFIRMATION_MS) * 100, 5)
    : 0;

  return (
    <div className="bg-bg-surface border border-brand/30 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">&#9889;</span>
        <h3 className="text-lg font-bold text-white">Monad Speed</h3>
      </div>

      {confirmationTime !== null ? (
        <div className="space-y-4">
          {/* Animated counter */}
          <div className="text-center">
            <span className="text-4xl font-bold text-brand tabular-nums">
              {animatedTime}
            </span>
            <span className="text-lg text-slate-400 ml-1">ms</span>
          </div>

          {/* Comparison bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Monad</span>
                <span className="text-xs font-bold text-yes">{confirmationTime}ms</span>
              </div>
              <div className="w-full h-3 bg-bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-yes rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${monadBarWidth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-400">Ethereum</span>
                <span className="text-xs font-bold text-slate-500">~{ETHEREUM_AVG_CONFIRMATION_MS.toLocaleString()}ms</span>
              </div>
              <div className="w-full h-3 bg-bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Speed comparison text */}
          {animationDone && speedMultiplier && (
            <p className="text-center text-sm">
              <span className="text-brand font-bold">{confirmationTime}ms</span>
              <span className="text-slate-400"> vs </span>
              <span className="text-slate-500 font-bold">~{ETHEREUM_AVG_CONFIRMATION_MS.toLocaleString()}ms</span>
              <span className="text-slate-400"> - That's </span>
              <span className="text-yes font-bold">{speedMultiplier}x faster!</span>
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-500">Place a bet to see Monad speed</p>
        </div>
      )}
    </div>
  );
}
