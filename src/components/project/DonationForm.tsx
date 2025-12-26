"use client";

import { useDonation } from "@/lib/hooks/useDonation";
import { useWallet } from "@/lib/hooks/WalletProvider";
import WalletConnect from "@/components/WalletConnect";

interface DonationFormProps {
  projectId: string;
  projectTitle: string;
  projectWallet: string | null;
  onSuccess: () => void;
}

export default function DonationForm({
  projectId,
  projectTitle,
  projectWallet,
  onSuccess,
}: DonationFormProps) {
  const { isConnected, publicKey } = useWallet();
  const { amount, setAmount, asset, setAsset, donating, donate, canDonate } =
    useDonation();

  const handleDonate = async () => {
    if (!projectWallet) {
      alert("This project doesn't have a wallet address configured");
      return;
    }

    try {
      const result = await donate(projectId, projectTitle, projectWallet);

      alert(
        `✅ Donation successful!\n\nAmount: ${result.amount} ${result.asset}\nTransaction: ${result.hash.substring(0, 8)}...${result.hash.substring(result.hash.length - 8)}\n\nThank you for supporting this project!`,
      );

      onSuccess();
    } catch (error) {
      alert(
        `❌ Donation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div
      style={{
        background: "#f9f9f9",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "30px",
      }}
    >
      <h3 style={{ marginBottom: "15px" }}>Support This Project</h3>

      <WalletConnect />

      <div style={{ marginTop: "15px" }}>
        <label
          htmlFor="donationAsset"
          style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
        >
          Asset
        </label>
        <select
          id="donationAsset"
          value={asset}
          onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <option value="XLM">XLM (Stellar Lumens)</option>
          <option value="USDC">USDC (USD Coin)</option>
        </select>
      </div>

      <div style={{ marginTop: "15px" }}>
        <label
          htmlFor="donationAmount"
          style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
        >
          Amount ({asset})
        </label>
        <input
          id="donationAmount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          min="0.0000001"
          step="0.1"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleDonate}
        disabled={!canDonate || donating}
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "18px",
          background: !canDonate || donating ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: !canDonate || donating ? "not-allowed" : "pointer",
          marginTop: "15px",
        }}
      >
        {donating ? "Processing..." : `Donate ${amount || "0"} ${asset}`}
      </button>

      <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
        💡 Donations are sent directly to the project creator's Stellar wallet.
        No platform fees. Network: Testnet
      </p>
    </div>
  );
}
