import { Outlet } from "react-router";
import { Footer } from "@/components/layout/footer";
import { useWallet } from "@/hooks/wallet/useWallet";
import ConnectWallet from "@/components/wallet/connectWallet";

export function MainLayout() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-0">
          {!isConnected && (
            <div>
              <div className="flex flex-col space-y-6 items-center justify-center h-[calc(100vh-16rem)] p-4 text-center">
                <div className="item-max-w-md space-y-6">
                  <h1 className="text-2xl mb-0 font-bold tracking-tight">
                    Connect your wallet to access this page
                  </h1>
                  <p className="text-muted-foreground">
                    This content requires a connected wallet to view
                  </p>
                </div>
                <ConnectWallet />
              </div>
            </div>
          )}
          {isConnected && <Outlet />}
        </main>
      </div>
      <Footer />
    </div>
  );
}
