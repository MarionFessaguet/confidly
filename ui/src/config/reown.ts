// src/config/appkit.ts
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  polygon,
  base,
  optimism,
  type AppKitNetwork,
  defineChain,
} from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_REOWN_PROJECT_ID is not set");
}

const metadata = {
  name: "Your App Name",
  description: "Your App Description",
  url: "https://your-app-url.com", // Must match your domain
  icons: ["https://your-app-url.com/icon.png"],
};

const iexecSidechain = defineChain({
  id: 134,
  chainNamespace: "eip155",
  caipNetworkId: "eip155:134",
  name: "iExec Sidechain",
  nativeCurrency: { name: "xRLC", symbol: "xRLC", decimals: 9 },
  rpcUrls: {
    default: {
      http: ["https://bellecour.iex.ec"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-bellecour.iex.ec",
      apiUrl: "https://blockscout-bellecour.iex.ec/api",
    },
  },
  testnet: false,
});
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet as AppKitNetwork,
  arbitrum as AppKitNetwork,
  polygon as AppKitNetwork,
  base as AppKitNetwork,
  optimism as AppKitNetwork,
  iexecSidechain as AppKitNetwork,
];

export const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Set to true if using SSR
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - Enable analytics
    email: true, // Optional - Enable email login
    socials: ["google", "x", "github", "discord"], // Optional - Social logins
    emailShowWallets: true, // Optional - Show wallets in email flow
  },
});

export { wagmiAdapter };
