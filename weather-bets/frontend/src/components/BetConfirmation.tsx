import { useEffect, useState } from "react";

interface BetConfirmationProps {
  confirmationTime: number;
  isVisible: boolean;
}

export default function BetConfirmation({ confirmationTime, isVisible }: BetConfirmationProps) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setFadeOut(false);
      const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
      const hideTimer = setTimeout(() => setShow(false), 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShow(false);
      setFadeOut(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Confetti dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => {
          const colors = ["bg-yes", "bg-brand", "bg-yellow-400", "bg-blue-400", "bg-pink-400"];
          const color = colors[i % colors.length];
          const left = `${Math.random() * 100}%`;
          const size = `${Math.random() * 8 + 4}px`;
          const delay = `${Math.random() * 0.5}s`;
          const duration = `${Math.random() * 1.5 + 1}s`;

          return (
            <div
              key={i}
              className={`absolute rounded-full ${color} animate-confetti-fall`}
              style={{
                left,
                top: "-10px",
                width: size,
                height: size,
                animationDelay: delay,
                animationDuration: duration,
                animationTimingFunction: "ease-in",
                animationFillMode: "forwards",
                animationName: "confettiFall",
              }}
            />
          );
        })}
      </div>

      {/* Confirmation card */}
      <div
        className={`relative bg-bg-surface border border-yes/30 rounded-2xl p-8 shadow-2xl shadow-yes/10 text-center transition-transform duration-500 ${
          fadeOut ? "scale-90" : "scale-100 animate-scale-up"
        }`}
      >
        {/* Checkmark */}
        <div className="w-20 h-20 mx-auto rounded-full bg-yes/20 flex items-center justify-center mb-4 animate-scale-up">
          <svg className="w-10 h-10 text-yes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Bet Confirmed!</h2>
        <p className="text-slate-400">
          Confirmed in{" "}
          <span className="text-brand font-bold text-lg">{confirmationTime}ms</span>
        </p>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleUp {
          0% { transform: scale(0); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-confetti-fall {
          animation: confettiFall 2s ease-in forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
