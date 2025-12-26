"use client";

import { useState, useCallback, useEffect } from "react";
import {
  WalletType,
  WalletConnection,
  WALLET_INFO,
} from "../stellar/wallet-types";
import {
  connectFreighter,
  isFreighterAvailable,
  signFreighterTransaction,
} from "../stellar/freighter-connector";
import {
  connectAlbedo,
  isAlbedoAvailable,
  signAlbedoTransaction,
} from "../stellar/albedo-connector";
import {
  connectXBull,
  isXBullAvailable,
  signXBullTransaction,
  disconnectXBull,
} from "../stellar/xbull-connector";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  walletType: WalletType | null;
  isLoading: boolean;
  error: string | null;
  availableWallets: WalletType[];
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);

  // Check which wallets are available
  const checkAvailableWallets = useCallback(async () => {
    const available: WalletType[] = [];

    // Albedo is always available (web-based)
    if (await isAlbedoAvailable()) {
      available.push(WalletType.ALBEDO);
    }

    // Check Freighter
    if (await isFreighterAvailable()) {
      available.push(WalletType.FREIGHTER);
    }

    // Check xBull
    if (await isXBullAvailable()) {
      available.push(WalletType.XBULL);
    }

    setAvailableWallets(available);
    return available;
  }, []);

  // Connect to a specific wallet
  const connect = useCallback(async (type: WalletType) => {
    setIsLoading(true);
    setError(null);

    try {
      let connection: WalletConnection;

      switch (type) {
        case WalletType.FREIGHTER:
          connection = await connectFreighter();
          break;
        case WalletType.ALBEDO:
          connection = await connectAlbedo();
          break;
        case WalletType.XBULL:
          connection = await connectXBull();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${type}`);
      }

      console.log("✅ Wallet connected:", connection.publicKey.substring(0, 8));

      // Update all state individually to trigger re-render
      setIsConnected(true);
      setPublicKey(connection.publicKey);
      setNetwork(connection.network);
      setWalletType(connection.walletType);
      setIsLoading(false);

      console.log(
        "📝 State updated - isConnected: true, publicKey:",
        connection.publicKey.substring(0, 8),
      );

      // Save wallet address to user profile
      try {
        const { supabase } = await import("@/lib/supabase/client");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from("users")
            .update({ wallet_address: connection.publicKey } as never)
            .eq("id", user.id);
        }
      } catch (dbError) {
        // Don't fail the connection if DB save fails
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";

      setIsConnected(false);
      setPublicKey(null);
      setNetwork(null);
      setWalletType(null);
      setIsLoading(false);
      setError(errorMessage);

      return false;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    if (walletType === WalletType.XBULL) {
      disconnectXBull();
    }

    setIsConnected(false);
    setPublicKey(null);
    setNetwork(null);
    setWalletType(null);
    setIsLoading(false);
    setError(null);
  }, [walletType]);

  // Sign transaction with current wallet
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string) => {
      if (!isConnected || !walletType) {
        throw new Error("Wallet is not connected");
      }

      try {
        let signedXdr: string;

        switch (walletType) {
          case WalletType.FREIGHTER:
            signedXdr = await signFreighterTransaction(xdr, {
              networkPassphrase,
            });
            break;
          case WalletType.ALBEDO:
            signedXdr = await signAlbedoTransaction(xdr, {
              networkPassphrase,
            });
            break;
          case WalletType.XBULL:
            signedXdr = await signXBullTransaction(xdr, {
              networkPassphrase,
            });
            break;
          default:
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }

        return signedXdr;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign transaction",
        );
      }
    },
    [isConnected, walletType],
  );

  // Get wallet info
  const getWalletInfo = useCallback((walletType: WalletType) => {
    return WALLET_INFO[walletType];
  }, []);

  // Check available wallets on mount
  useEffect(() => {
    checkAvailableWallets();
  }, [checkAvailableWallets]);

  return {
    isConnected,
    publicKey,
    network,
    walletType,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
    signTransaction,
    checkAvailableWallets,
    getWalletInfo,
  };
}
