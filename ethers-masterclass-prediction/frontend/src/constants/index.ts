// import multicallabi from "../abi/multicall2.json";
// import erc20abi from "../abi/erc20.json";

// export { multicallabi, erc20abi };
export const EIP6963AnnounceProvider = "eip6963:announceProvider";
export const EIP6963RequestProvider = "eip6963:requestProvider";
export const rpc_url = "https://ethereum-sepolia-rpc.publicnode.com";

export type SupportedChain = {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
};

export const SUPPORTED_CHAINS: Record<number, SupportedChain> = {
  11155111: {
    id: 11155111,
    name: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorer: "https://sepolia.etherscan.io",
  },
};
