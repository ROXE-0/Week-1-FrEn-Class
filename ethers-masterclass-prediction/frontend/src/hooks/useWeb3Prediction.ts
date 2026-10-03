import { useEffect, useState } from "react";

import { PredictionMarketData, WalletState } from "../types/prediction";

import { Contract, BrowserProvider, formatEther, parseEther } from "ethers";

import {
  PREDICTION_HUB_ADDRESS,
  PREDICTION_HUB_ABI,
} from "../contracts/predictionConfig";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWeb3Wallet = () => {
  // TODO FOR ASSIGNMENT:
  // 1. Detect window.ethereum
  // 2. Connect via ethers.BrowserProvider
  // 3. Keep track of address, network chainId, and ETH balance
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: "0.00",
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWallet((prev) => ({
        ...prev,
        error: "No Ethereum wallet detected",
      }));

      return;
    }

    try {
      setWallet((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      const provider = new BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      const address = accounts[0];

      const network = await provider.getNetwork();

      const balance = await provider.getBalance(address);

      setWallet({
        address,
        chainId: Number(network.chainId),
        balance: formatEther(balance),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Wallet connection failed:", err);

      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err?.message || "Failed to connect wallet",
      }));
    }
  };

  return {
    wallet,
    connectWallet,
  };
};

export const usePredictionMarket = (walletAddress: string | null) => {
  // TODO FOR ASSIGNMENT:
  // 1. Connect to PredictionMarketOracleHub contract using ethers.Contract
  // 2. Fetch all markets using getAllMarkets()
  // 3. For each market, read calculateWinnings() and userBets() for connected user
  // 4. Implement event listeners for MarketCreated, BetPlaced, MarketResolved, WinningsClaimed
  // 5. Implement placeBet(), claimWinnings(), and createMarket() (Owner mode)

  const [markets, setMarkets] = useState<PredictionMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provider for reading from the blockchain
  const provider = new BrowserProvider(window.ethereum);

  // Contract connected to the provider.
  // This is used for read-only functions.
  const contract = new Contract(
    PREDICTION_HUB_ADDRESS,
    PREDICTION_HUB_ABI,
    provider,
  );

  const fetchAllMarkets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allMarkets = await contract.getAllMarkets();

      console.log("Markets from blockchain:", allMarkets);

      const formattedMarkets: PredictionMarketData[] = await Promise.all(
        allMarkets.map(async (market: any) => {
          const userBet = walletAddress
            ? await contract.userBets(market.id, walletAddress)
            : null;

          const winnings = walletAddress
            ? await contract.calculateWinnings(market.id, walletAddress)
            : 0n;

          return {
            id: Number(market.id),
            title: market.title,
            category: market.category,
            endTime: Number(market.endTime),
            outcome: Number(market.outcome),

            totalYesPool: formatEther(market.totalYesPool),
            totalNoPool: formatEther(market.totalNoPool),

            userYesBet: userBet ? formatEther(userBet.yesAmount) : "0",

            userNoBet: userBet ? formatEther(userBet.noAmount) : "0",

            userClaimed: userBet ? userBet.claimed : false,

            userEstimatedWinnings: formatEther(winnings),

            isExpired: Number(market.endTime) < Math.floor(Date.now() / 1000),

            resolved: market.resolved,
          };
        }),
      );

      setMarkets(formattedMarkets);
    } catch (err: any) {
      console.error("Failed to fetch markets:", err);

      setError(err?.message || "Failed to fetch markets");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch markets when the hook loads
  // and whenever the connected wallet changes.
  useEffect(() => {
    fetchAllMarkets();
  }, [walletAddress]);

  // Blockchain event listeners
  useEffect(() => {
    const handleBetPlaced = (
      marketId: bigint,
      user: string,
      isYes: boolean,
      amount: bigint,
    ) => {
      console.log("BetPlaced event:", {
        marketId: Number(marketId),
        user,
        isYes,
        amount: formatEther(amount),
      });

      fetchAllMarkets();
    };

    const handleMarketCreated = (
      marketId: bigint,
      title: string,
      category: string,
      endTime: bigint,
    ) => {
      console.log("MarketCreated event:", {
        marketId: Number(marketId),
        title,
        category,
        endTime: Number(endTime),
      });

      fetchAllMarkets();
    };

    const handleMarketResolved = (marketId: bigint, outcome: bigint) => {
      console.log("MarketResolved event:", {
        marketId: Number(marketId),
        outcome: Number(outcome),
      });

      fetchAllMarkets();
    };

    const handleWinningsClaimed = (
      marketId: bigint,
      user: string,
      amount: bigint,
    ) => {
      console.log("WinningsClaimed event:", {
        marketId: Number(marketId),
        user,
        amount: formatEther(amount),
      });

      fetchAllMarkets();
    };

    contract.on("BetPlaced", handleBetPlaced);
    contract.on("MarketCreated", handleMarketCreated);
    contract.on("MarketResolved", handleMarketResolved);
    contract.on("WinningsClaimed", handleWinningsClaimed);

    return () => {
      contract.off("BetPlaced", handleBetPlaced);
      contract.off("MarketCreated", handleMarketCreated);
      contract.off("MarketResolved", handleMarketResolved);
      contract.off("WinningsClaimed", handleWinningsClaimed);
    };
  }, [walletAddress]);

  // Place a YES or NO bet
  const placeBet = async (
    marketId: number,
    isYes: boolean,
    amountEth: string,
  ) => {
    try {
      const signer = await provider.getSigner();

      // Create a contract connected to the user's wallet.
      const contractWithSigner = new Contract(
        PREDICTION_HUB_ADDRESS,
        PREDICTION_HUB_ABI,
        signer,
      );

      const tx = await contractWithSigner.placeBet(marketId, isYes, {
        value: parseEther(amountEth),
      });

      await tx.wait();

      await fetchAllMarkets();
    } catch (err: any) {
      console.error("Failed to place bet:", err);

      setError(err?.message || "Failed to place bet");
    }
  };

  // Claim winnings from a resolved market
  const claimWinnings = async (marketId: number) => {
    try {
      const signer = await provider.getSigner();

      const contractWithSigner = new Contract(
        PREDICTION_HUB_ADDRESS,
        PREDICTION_HUB_ABI,
        signer,
      );

      const tx = await contractWithSigner.claimWinnings(marketId);

      await tx.wait();

      await fetchAllMarkets();
    } catch (err: any) {
      console.error("Failed to claim winnings:", err);

      setError(err?.message || "Failed to claim winnings");
    }
  };

  // Create a new prediction market.
  // This can only succeed if the connected wallet
  // is the contract owner.
  const createMarket = async (
    title: string,
    category: string,
    durationSeconds: number,
  ) => {
    try {
      const signer = await provider.getSigner();

      const contractWithSigner = new Contract(
        PREDICTION_HUB_ADDRESS,
        PREDICTION_HUB_ABI,
        signer,
      );

      const tx = await contractWithSigner.createMarket(
        title,
        category,
        durationSeconds,
      );

      await tx.wait();

      await fetchAllMarkets();
    } catch (err: any) {
      console.error("Failed to create market:", err);

      setError(err?.message || "Failed to create market");
    }
  };

  return {
    markets,
    isLoading,
    error,
    placeBet,
    claimWinnings,
    createMarket,
  };
};
