import { useState, useEffect } from "react";
import type { Market, Bet, WalletState } from "../types";
import { useContract } from "../hooks/useContract";
import { formatMON, getMarketQuestion } from "../lib/formatters";

interface ExitInfo {
  exitValue: bigint;
  feePercent: number;
  payout: bigint;
}

interface ExitModalProps {
  isOpen: boolean;
  market: Market;
  userBet: Bet;
  exitInfo: ExitInfo;
  wallet: WalletState;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalState = "preview" | "confirming" | "success" | "error";

function getFeeBadge(feePercent: number): { label: string; colorClass: string } {
  if (feePercent <= 3) {
    return { label: "Low Fee", colorClass: "bg-green-500/15 text-green-400 border-green-500/30" };
  }
  if (feePercent <= 5) {
    return { label: "Medium Fee", colorClass: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  }
  return { label: "High Fee", colorClass: "bg-red-500/15 text-red-400 border-red-500/30" };
}

export default function ExitModal({ isOpen, market, userBet, exitInfo, wallet, onClose, onSuccess }: ExitModalProps) {
  const { exitPosition } = useContract();
  const [modalState, setModalState] = useState<ModalState>("preview");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationTime, setConfirmationTime] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalState("preview");
      setErrorMessage("");
      setConfirmationTime(0);
    }
  }, [isOpen]);

  const handleExit = async () => {
    if (!wallet.signer) return;

    setModalState("confirming");
    try {
      const result = await exitPosition(wallet.signer, market.id);
      setConfirmationTime(result.confirmationTime);
      setModalState("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.reason || err.message || "Transaction failed");
      setModalState("error");
    }
  };

  const handleRetry = () => {
    setModalState("preview");
    setErrorMessage("");
  };

  if (!isOpen) return null;

  const question = getMarketQuestion(market.city, market.condition, market.operator, market.threshold);
  const sideLabel = userBet.isYes ? "YES" : "NO";
  const sideColor = userBet.isYes ? "yes" : "no";
  const feeBadge = getFeeBadge(exitInfo.feePercent);

  // Calculate potential win amount (if user's side wins, they get proportional share of total pool)
  const totalPool = market.totalYesPool + market.totalNoPool;
  const userPool = userBet.isYes ? market.totalYesPool : market.totalNoPool;
  const potentialWin = userPool > 0n
    ? (userBet.amount * totalPool) / userPool
    : 0n;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={modalState === "preview" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-white">Exit Position</h2>
          {modalState === "preview" && (
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
          {/* Preview State */}
          {modalState === "preview" && (
            <>
              {/* Market info */}
              <div>
                <p className="text-sm text-slate-400 mb-2">{question}</p>
              </div>

              {/* Current position */}
              <div className="py-3 px-4 rounded-lg bg-bg-hover border border-border">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Your Position</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-${sideColor}/15 text-${sideColor} border border-${sideColor}/30`}
                  >
                    {sideLabel}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {formatMON(userBet.amount)} <span className="text-brand">MON</span>
                  </span>
                </div>
              </div>

              {/* Fee tier badge */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg-hover border border-border">
                <span className="text-sm text-slate-400">Exit Fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{exitInfo.feePercent}%</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${feeBadge.colorClass}`}
                  >
                    {feeBadge.label}
                  </span>
                </div>
              </div>

              {/* Comparison breakdown */}
              <div className="rounded-lg bg-bg-hover border border-border overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Outcome Comparison</p>
                </div>
                <div className="divide-y divide-border">
                  {/* Exit now */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm text-slate-300">Exit now</span>
                    </div>
                    <span className="text-sm font-bold text-brand">
                      {formatMON(exitInfo.payout)} MON
                    </span>
                  </div>
                  {/* Potential win */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-yes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-300">Potential win</span>
                    </div>
                    <span className="text-sm font-bold text-yes">
                      {formatMON(potentialWin)} MON
                    </span>
                  </div>
                  {/* If you lose */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-no" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-slate-300">If you lose</span>
                    </div>
                    <span className="text-sm font-bold text-no">
                      0 MON
                    </span>
                  </div>
                </div>
              </div>

              {/* Exit payout highlight */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-brand/5 border border-brand/20">
                <span className="text-sm text-slate-400">You will receive</span>
                <span className="text-lg font-bold text-brand">
                  {formatMON(exitInfo.payout)} MON
                </span>
              </div>

              {/* Exit button */}
              <button
                onClick={handleExit}
                className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-lg transition-all duration-200 active:scale-[0.98]"
              >
                Exit Position
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
              <p className="text-lg font-semibold text-white">Exiting Position...</p>
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
              <p className="text-lg font-bold text-white">Position Exited!</p>
              <p className="text-sm text-slate-400 mt-1">
                Confirmed in <span className="text-brand font-semibold">{confirmationTime}ms</span>
              </p>
              <p className="text-sm text-slate-300 mt-2">
                Received <span className="font-bold text-brand">{formatMON(exitInfo.payout)} MON</span>
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
