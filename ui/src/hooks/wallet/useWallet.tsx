import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import { wagmiAdapter } from "@/config/reown";
import { useAccount } from 'wagmi';

export function useWallet() {
  const { open } = useAppKit();
  const { connector } = useAccount();
  const { address, isConnected } = useAppKitAccount();
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const { disconnect } = useDisconnect();
  const { caipNetwork, caipNetworkId, chainId, switchNetwork } =
    useAppKitNetwork();

  useEffect(() => {
    if (address) {
      console.log("address", address);
    } else {
      setDisplayAddress("");
    }
  }, [address]);

  const openConnectModal = async () => {
    try {
      await open();
    } catch (error) {
      console.info("Failed to open wallet connection:", error);
      toast({
        title: "Connection Error",
        description: "Failed to open wallet connection",
        variant: "destructive",
      });
    }
  };

  // TODO: Add function to switch accounts

  return {
    chainId,
    isConnected,
    address,
    displayAddress,
    openConnectModal,
    disconnect,
    caipNetwork,
    caipNetworkId,
    switchNetwork,
    connector,
    supportedNetworks: wagmiAdapter.networks,
  };
}
