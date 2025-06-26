import { useWallet } from "@/hooks/wallet/useWallet";
import { Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const ConnectWallet = () => {
  const { isConnected, address, openConnectModal } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      openConnectModal();
    } catch (error) {
      console.info("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatAddress = (walletAddress: string) =>
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <>
      {!isConnected && (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors font-medium text-sm"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
        </Button>
      )}

      {isConnected && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleConnect}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
          >
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="font-mono text-xs">
              {formatAddress(address ?? "")}
            </span>
          </Button>
          {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          className={cn(
            "pl-0 relative h-9  w-9 rounded-full transition-all duration-300 hover:bg-accent/50 icon-hover",
          )}
        >
          <div className="relative h-[1.2rem] w-[1.2rem]">
            <LogOut className="absolute h-[1.2rem] w-[1.2rem] scale-100 transition-all duration-300 dark:scale-100" />
          </div>
        </Button> */}
        </div>
      )}
    </>
  );
};

export default ConnectWallet;
