import type { WalletState } from "../types";
import MyBets from "../components/MyBets";

interface MyBetsPageProps {
  wallet: WalletState;
}

export default function MyBetsPage({ wallet }: MyBetsPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Bets</h1>

      {!wallet.isConnected ? (
        <div className="text-center py-20 rounded-xl border border-border bg-bg-surface">
          <p className="text-slate-400 text-lg">
            Connect wallet to view your bets
          </p>
        </div>
      ) : (
        <MyBets wallet={wallet} />
      )}
    </div>
  );
}
