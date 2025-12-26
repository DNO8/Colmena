"use client";

import { useState, useEffect, useCallback } from "react";

// Freighter API types
interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (
    xdr: string,
    opts?: { network?: string; networkPassphrase?: string },
  ) => Promise<string>;
  getNetwork: () => Promise<string>;
  isAllowed: () => Promise<boolean>;
  setAllowed: () => Promise<void>;
}

declare global {
  interface Window {
    freighterApi?: FreighterAPI;
  }
}

export interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: true,
    error: null,
  });

  // Check if Freighter is installed - Multiple detection methods
  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    // Method 1: Direct window.freighterApi
    const hasFreighterApi = !!window.freighterApi;

    // Method 2: window.stellar (alternative injection)
    const hasStellar = !!(window as any).stellar;

    // Method 3: Check if Freighter extension is installed (works even if not injected yet)
    const hasFreighterExtension =
      typeof window !== "undefined" &&
      (document.querySelector('meta[name="freighter-extension"]') !== null ||
        document.documentElement.getAttribute("data-freighter-installed") ===
          "true");

    const installed = hasFreighterApi || hasStellar || hasFreighterExtension;

    console.log("🔍 Freighter Detection (Multiple Methods):");
    console.log("  - Method 1 (window.freighterApi):", hasFreighterApi);
    console.log("  - Method 2 (window.stellar):", hasStellar);
    console.log("  - Method 3 (extension meta):", hasFreighterExtension);
    console.log(
      "  - Window keys with 'freighter':",
      Object.keys(window).filter((k) => k.toLowerCase().includes("freighter")),
    );
    console.log("  - Final result:", installed);

    setState((prev) => ({ ...prev, isInstalled: installed, isLoading: false }));
    return installed;
  }, []);

  // Connect to Freighter wallet - Try to trigger injection if not available
  const connect = useCallback(async () => {
    console.log("🔗 Attempting to connect to Freighter...");

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Wait a bit for Freighter to inject if it hasn't yet
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const freighter = window.freighterApi || (window as any).stellar;

      if (freighter) {
        console.log("  - Freighter API found after", attempts, "attempts");

        try {
          // Request permission
          console.log("  - Checking permission...");
          const isAllowed = await freighter.isAllowed();
          console.log("  - isAllowed:", isAllowed);

          if (!isAllowed) {
            console.log("  - Requesting permission...");
            await freighter.setAllowed();
          }

          // Get public key
          console.log("  - Getting public key...");
          const publicKey = await freighter.getPublicKey();
          console.log("  - Public key:", publicKey?.substring(0, 8) + "...");

          // Get network
          console.log("  - Getting network...");
          const network = await freighter.getNetwork();
          console.log("  - Network:", network);

          setState({
            isInstalled: true,
            isConnected: true,
            publicKey,
            network,
            isLoading: false,
            error: null,
          });

          console.log("✅ Wallet connected successfully");
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to connect to Freighter";

          console.error("❌ Connection error:", errorMessage);
          console.error("   Full error:", error);

          setState((prev) => ({
            ...prev,
            isConnected: false,
            publicKey: null,
            network: null,
            isLoading: false,
            error: errorMessage,
          }));

          return false;
        }
      }

      // Wait 100ms before next attempt
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
      console.log("  - Waiting for Freighter injection, attempt", attempts);
    }

    // If we get here, Freighter never injected
    console.error(
      "❌ Freighter API not available after",
      maxAttempts,
      "attempts",
    );
    console.error(
      "   Please ensure Freighter extension is installed and has permissions for this site",
    );

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isLoading: false,
      error: "Freighter is not responding. Please check extension permissions.",
    }));

    return false;
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      publicKey: null,
      network: null,
      error: null,
    }));
  }, []);

  // Sign transaction
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      const freighter = window.freighterApi || (window as any).stellar;

      if (!freighter) {
        throw new Error("Freighter wallet is not installed");
      }

      if (!state.isConnected) {
        throw new Error("Wallet is not connected");
      }

      try {
        const signedXdr = await freighter.signTransaction(xdr, {
          networkPassphrase,
        });
        return signedXdr;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign transaction",
        );
      }
    },
    [state.isConnected],
  );

  // Check connection on mount with multiple attempts
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15; // Intentar durante 1.5 segundos

    console.log("🔄 Starting Freighter detection...");

    const checkWithRetry = () => {
      const installed = checkInstalled();

      if (!installed && attempts < maxAttempts) {
        attempts++;
        console.log(`  - Retry ${attempts}/${maxAttempts}...`);
        setTimeout(checkWithRetry, 100);
      } else if (!installed) {
        console.log("⚠️ Freighter not detected after", maxAttempts, "attempts");
        console.log(
          "   This is OK - user can still click 'Connect' button to trigger connection",
        );
      } else {
        console.log("✅ Freighter detected on page load");
      }
    };

    // Iniciar verificación
    checkWithRetry();
  }, [checkInstalled]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    checkInstalled,
  };
}
