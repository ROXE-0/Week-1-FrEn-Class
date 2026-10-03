import React, { useState } from "react";
import { Header } from "./components/Header";
import { MarketCard } from "./components/MarketCard";
import { useWalletConnection } from "./hooks/useWalletConnection";
import { usePredictionMarket } from "./hooks/useWeb3Prediction";
import { PredictionMarketData, MarketOutcome } from "./types/prediction";
import {
  AlertCircle,
  Plus,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  TrendingUp,
  Compass,
} from "lucide-react";

export function App() {
  const { wallet, connectWallet } = useWalletConnection();
  const { markets, isLoading, error, placeBet, claimWinnings, createMarket } =
    usePredictionMarket(wallet.address);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const mockMarkets: PredictionMarketData[] = [
    {
      id: 0,
      title: "Will ETH reach $4,500 by end of quarter?",
      category: "Crypto & DeFi",
      endTime: Math.floor(Date.now() / 1000) + 7200,
      outcome: MarketOutcome.PENDING,
      totalYesPool: "2.50",
      totalNoPool: "1.20",
      resolved: false,
      userYesBet: "0.00",
      userNoBet: "0.00",
      userClaimed: false,
      userEstimatedWinnings: "0.00",
      isExpired: false,
    },
    {
      id: 1,
      title: "Will Gemini 3.5 Ultra rank #1 on Chatbot Arena?",
      category: "AI & Tech",
      endTime: Math.floor(Date.now() / 1000) + 86400,
      outcome: MarketOutcome.PENDING,
      totalYesPool: "5.00",
      totalNoPool: "4.80",
      resolved: false,
      userYesBet: "0.00",
      userNoBet: "0.00",
      userClaimed: false,
      userEstimatedWinnings: "0.00",
      isExpired: false,
    },
    {
      id: 2,
      title: "Will Ethereum average gas drop below 5 Gwei this week?",
      category: "Ethereum",
      endTime: Math.floor(Date.now() / 1000) + 259200,
      outcome: MarketOutcome.PENDING,
      totalYesPool: "1.80",
      totalNoPool: "3.10",
      resolved: false,
      userYesBet: "0.00",
      userNoBet: "0.00",
      userClaimed: false,
      userEstimatedWinnings: "0.00",
      isExpired: false,
    },
  ];

  const displayMarkets = markets.length > 0 ? markets : mockMarkets;

  const filteredMarkets =
    activeCategory === "ALL"
      ? displayMarkets
      : displayMarkets.filter((m) =>
          m.category.toUpperCase().includes(activeCategory),
        );

  const totalVolume = displayMarkets
    .reduce(
      (acc, m) =>
        acc + (parseFloat(m.totalYesPool) + parseFloat(m.totalNoPool)),
      0,
    )
    .toFixed(2);

  return (
    <div className="min-h-screen subtle-mesh-bg text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header wallet={wallet} onConnect={connectWallet} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hero Section with Subsurface Card Elevation */}
        <div className="surface-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-indigo-50/80 border border-indigo-200/80 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Ethers.js
                Student Practical Assignment
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Decentralized Prediction Market & Oracle Hub
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Connect your Web3 wallet to inspect prediction liquidity pools,
                place binary bets with native ETH, and claim proportional
                contract payouts.
              </p>
            </div>

            {/* Protocol Metrics Grid with Depth */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50/90 border border-slate-200/80 p-4 rounded-2xl shrink-0 shadow-inner">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />{" "}
                  Protocol Volume
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono block">
                  {totalVolume} ETH
                </span>
              </div>
              <div className="space-y-1 pl-3 border-l border-slate-200/80">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Active
                  Markets
                </span>
                <span className="text-xl font-bold text-indigo-600 font-mono block">
                  {displayMarkets.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Navigation Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "CRYPTO", "AI", "ETHEREUM"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeCategory === category
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {markets.length === 0 && !isLoading && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
              Preview Mode (Connect your Web3 hook to load live data)
            </span>
          )}
        </div>

        {/* Markets Grid Section */}
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 surface-card rounded-3xl">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-900 tracking-tight">
                Loading Prediction Markets...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fetching live market state from Sepolia testnet
              </p>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-20 surface-card rounded-3xl">
              <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">
                No Markets Found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please connect to Sepolia testnet or check your contract address
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  isConnected={wallet.isConnected}
                  onPlaceBet={placeBet}
                  onClaim={claimWinnings}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            <span className="font-bold text-slate-800">Oracle Hub</span> •
            Modern Web3 Fintech Interface
          </div>
          <div>Built with React 19, Ethers.js v6 & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
