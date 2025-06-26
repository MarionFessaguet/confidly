import { Check, Copy, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useState } from "react";

export function WalletInfo() {
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy address", err);
      }
    }
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
        <Wallet className="h-4 w-4 text-green-600" />
        <span className="font-mono text-xs">
          {truncateAddress(address || "")}
        </span>
        <button
          onClick={copyAddress}
          className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Copier l'adresse"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-gray-500" />
          )}
        </button>
      </div>

      <Button
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
      </Button>
    </div>
  );
}
