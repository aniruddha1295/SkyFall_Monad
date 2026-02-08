import { Routes, Route } from "react-router-dom";
import { useWallet } from "./hooks/useWallet";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import MyBetsPage from "./pages/MyBetsPage";
import ApiPage from "./pages/ApiPage";

export default function App() {
  const { wallet, connect, disconnect, isConnecting, hasMetaMask } = useWallet();

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Navbar
        wallet={wallet}
        connect={connect}
        disconnect={disconnect}
        isConnecting={isConnecting}
        hasMetaMask={hasMetaMask}
      />
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage wallet={wallet} />} />
          <Route path="/market/:id" element={<MarketPage wallet={wallet} />} />
          <Route path="/my-bets" element={<MyBetsPage wallet={wallet} />} />
          <Route path="/api" element={<ApiPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
