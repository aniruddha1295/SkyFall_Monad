import { useState } from "react";
import { Link } from "react-router-dom";
import type { WalletState } from "../types";
import { formatAddress } from "../lib/formatters";

interface NavbarProps {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  hasMetaMask: boolean;
  isConnecting: boolean;
}

export default function Navbar({ wallet, connect, disconnect: _disconnect, hasMetaMask, isConnecting }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bg-surface/95 backdrop-blur-sm border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">&#9889;</span>
            <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
              WeatherBets
            </span>
          </Link>

          {/* Center: Navigation links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Markets
            </Link>
            <Link
              to="/my-bets"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              My Bets
            </Link>
            <Link
              to="/api"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              API
            </Link>
          </div>

          {/* Right: Wallet (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!hasMetaMask ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 font-medium text-sm transition-colors"
              >
                Install MetaMask
              </a>
            ) : !wallet.isConnected ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-4 py-2 rounded-lg bg-light text-bg hover:bg-light/90 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            ) : !wallet.isCorrectNetwork ? (
              <button
                onClick={connect}
                className="px-4 py-2 rounded-lg bg-no/20 text-no hover:bg-no/30 font-medium text-sm transition-colors"
              >
                Switch to Monad
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-bg-hover border border-border text-sm">
                  <span className="text-slate-400">{wallet.balance}</span>
                  <span className="text-primary ml-1 font-medium">MON</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-bg-hover border border-border text-sm font-mono text-slate-300">
                  {formatAddress(wallet.address!)}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-bg-hover transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-out nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 border-t border-border bg-bg-surface space-y-3">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-bg-hover font-medium transition-colors"
          >
            Markets
          </Link>
          <Link
            to="/my-bets"
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-bg-hover font-medium transition-colors"
          >
            My Bets
          </Link>
          <Link
            to="/api"
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-bg-hover font-medium transition-colors"
          >
            API
          </Link>

          <div className="pt-2 border-t border-border">
            {!hasMetaMask ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 px-3 rounded-lg bg-primary/20 text-primary font-medium text-sm"
              >
                Install MetaMask
              </a>
            ) : !wallet.isConnected ? (
              <button
                onClick={() => {
                  connect();
                  setMobileOpen(false);
                }}
                disabled={isConnecting}
                className="w-full py-2 px-3 rounded-lg bg-light text-bg hover:bg-light/90 font-medium text-sm transition-colors disabled:opacity-50 shadow-lg"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : !wallet.isCorrectNetwork ? (
              <button
                onClick={() => {
                  connect();
                  setMobileOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-no/20 text-no font-medium text-sm"
              >
                Switch to Monad
              </button>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <span className="text-sm text-slate-400">{wallet.balance} MON</span>
                <span className="text-sm font-mono text-slate-300">
                  {formatAddress(wallet.address!)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
