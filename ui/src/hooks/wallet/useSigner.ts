import { useState, useEffect } from "react";
import { getEthersSigner } from "@/lib/wagmi-adapter/client-to-signer";
import { useConfig } from "wagmi";
import type { Signer } from "ethers";

export function useSigner() {
  const config = useConfig();
  const [signer, setSigner] = useState<Signer | null>(null);

  useEffect(() => {
    const initSigner = async () => {
      try {
        const s = await getEthersSigner(config);
        if (!s) {
          console.warn("Failed to initialize signer");
          return;
        }
        setSigner(s);
      } catch (error) {
        console.error("Error initializing signer:", error);
      }
    };
    initSigner();
  }, [config]);

  return { signer };
}
