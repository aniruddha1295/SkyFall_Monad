import { useState } from "react";

interface OddsBarProps {
  yesPercent: number;
  noPercent: number;
  yesPool?: string;
  noPool?: string;
}

export default function OddsBar({ yesPercent, noPercent, yesPool, noPool }: OddsBarProps) {
  const [hoveredSide, setHoveredSide] = useState<"yes" | "no" | null>(null);

  const safeYes = Math.max(yesPercent, 2);
  const safeNo = Math.max(noPercent, 2);
  const total = safeYes + safeNo;
  const yesWidth = (safeYes / total) * 100;
  const noWidth = (safeNo / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex w-full h-8 rounded-lg overflow-hidden relative">
        {/* YES side */}
        <div
          className="relative flex items-center justify-center transition-all duration-500 ease-out bg-yes/80 hover:bg-yes cursor-default"
          style={{ width: `${yesWidth}%` }}
          onMouseEnter={() => setHoveredSide("yes")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <span className="text-xs font-bold text-white drop-shadow-sm">
            YES {yesPercent}%
          </span>

          {/* YES tooltip */}
          {hoveredSide === "yes" && yesPool && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-bg-surface border border-border text-xs text-slate-300 whitespace-nowrap shadow-lg z-10">
              YES Pool: {yesPool} MON
            </div>
          )}
        </div>

        {/* NO side */}
        <div
          className="relative flex items-center justify-center transition-all duration-500 ease-out bg-no/80 hover:bg-no cursor-default"
          style={{ width: `${noWidth}%` }}
          onMouseEnter={() => setHoveredSide("no")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <span className="text-xs font-bold text-white drop-shadow-sm">
            NO {noPercent}%
          </span>

          {/* NO tooltip */}
          {hoveredSide === "no" && noPool && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-bg-surface border border-border text-xs text-slate-300 whitespace-nowrap shadow-lg z-10">
              NO Pool: {noPool} MON
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
