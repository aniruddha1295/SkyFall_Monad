import { useState, useEffect } from "react";
import type { Market, WalletState } from "../types";
import { useContract } from "../hooks/useContract";
import { getMarketQuestion } from "../lib/formatters";
import { BET_QUICK_AMOUNTS } from "../lib/constants";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  isYes: boolean;
  wallet: WalletState;
  onSuccess: (confirmationTime: number) => void;
}

type ModalState = "input" | "confirming" | "success" | "error";

export default function BetModal({ isOpen, onClose, market, isYes, wallet, onSuccess }: BetModalProps) {
  const { placeBet, getPotentialPayout } = useContract();
  const [amount, setAmount] = useState("");
  const [potentialPayout, setPotentialPayout] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationTime, setConfirmationTime] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setPotentialPayout(null);
      setModalState("input");
      setErrorMessage("");
      setConfirmationTime(0);
    }
  }, [isOpen]);

  // Fetch potential payout when amount changes
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setPotentialPayout(null);
      return;
    }
    const timeout = setTimeout(() => {
      getPotentialPayout(market.id, isYes, amount)
        .then(setPotentialPayout)
        .catch(() => setPotentialPayout(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [amount, market.id, isYes, getPotentialPayout]);

  const handlePlaceBet = async () => {
    if (!wallet.signer || !amount || parseFloat(amount) <= 0) return;

    setModalState("confirming");
    try {
      const result = await placeBet(wallet.signer, market.id, isYes, amount);
      setConfirmationTime(result.confirmationTime);
      setModalState("success");
      setTimeout(() => {
        onSuccess(result.confirmationTime);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.reason || err.message || "Transaction failed");
      setModalState("error");
    }
  };

  const handleRetry = () => {
    setModalState("input");
    setErrorMessage("");
  };

  if (!isOpen) return null;

  const question = getMarketQuestion(market.city, market.condition, market.operator, market.threshold);
  const sideColor = isYes ? "yes" : "no";
  const sideLabel = isYes ? "YES" : "NO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={modalState === "input" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-white">Place Bet</h2>
          {modalState === "input" && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-bg-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Input State */}
          {modalState === "input" && (
            <>
              {/* Market info */}
              <div>
                <p className="text-sm text-slate-400 mb-2">{question}</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-${sideColor}/15 text-${sideColor} border border-${sideColor}/30`}
                >
                  {sideLabel}
                </span>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Bet Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.01"
                    className="w-full bg-bg-hover border border-border rounded-xl px-4 py-3 pr-16 text-white text-lg font-medium placeholder-slate-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand">
                    MON
                  </span>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {BET_QUICK_AMOUNTS.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      amount === quickAmount
                        ? "bg-brand/20 border-brand/40 text-brand"
                        : "bg-bg-hover border-border text-slate-400 hover:text-white hover:border-slate-500"
                    }`}
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>

              {/* Potential payout */}
              {potentialPayout && (
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg-hover border border-border">
                  <span className="text-sm text-slate-400">Potential Payout</span>
                  <span className="text-sm font-bold text-yes">
                    {parseFloat(potentialPayout).toFixed(4)} MON
                  </span>
                </div>
              )}

              {/* Place Bet button */}
              <button
                onClick={handlePlaceBet}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isYes
                    ? "bg-yes hover:bg-yes/90 active:scale-[0.98]"
                    : "bg-no hover:bg-no/90 active:scale-[0.98]"
                }`}
              >
                Place {sideLabel} Bet
              </button>
            </>
          )}

          {/* Confirming State */}
          {modalState === "confirming" && (
            <div className="flex flex-col items-center py-8">
              <svg className="animate-spin h-12 w-12 text-brand mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-lg font-semibold text-white">Confirming Transaction...</p>
              <p className="text-sm text-slate-400 mt-1">Waiting for Monad confirmation</p>
            </div>
          )}

          {/* Success State */}
          {modalState === "success" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-yes/20 flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-8 h-8 text-yes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-bold text-white">Bet Confirmed!</p>
              <p className="text-sm text-slate-400 mt-1">
                Confirmed in <span className="text-brand font-semibold">{confirmationTime}ms</span>
              </p>
            </div>
          )}

          {/* Error State */}
          {modalState === "error" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-no/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-no" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-white mb-2">Transaction Failed</p>
              <p className="text-sm text-slate-400 text-center mb-4 max-w-xs break-words">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
