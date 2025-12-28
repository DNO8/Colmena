"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/lib/hooks/WalletProvider";
import { sendPayment } from "@/lib/stellar/payment";
import { useProject } from "@/lib/hooks/useProject";
import RecentDonations from "@/components/project/RecentDonations";
import TopDonors from "@/components/project/TopDonors";
import LoadingBee from "@/components/LoadingBee";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");
  const [donating, setDonating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const { isConnected, publicKey, signTransaction } = useWallet();

  const {
    project,
    galleryImages,
    roadmapItems,
    donations,
    isOwner,
    loading,
    error,
  } = useProject(String(params.id));

  const handlePublish = async () => {
    if (!project) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert("✅ Project published successfully!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        if (errorData.message) {
          alert(`❌ ${errorData.error}\n\n${errorData.message}`);
        } else {
          alert(`❌ Error: ${errorData.error || "Failed to publish project"}`);
        }
      }
    } catch (error) {
      alert("❌ Failed to publish project. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!isConnected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    if (!project?.wallet_address) {
      alert("This project doesn't have a wallet address configured");
      return;
    }

    setDonating(true);

    try {
      const result = await sendPayment(
        {
          sourcePublicKey: publicKey,
          destinationPublicKey: project.wallet_address,
          amount: amount,
          asset: asset,
          memo: `Donation to ${project.title}`,
          network: "TESTNET",
        },
        signTransaction,
      );

      if (!result.success) {
        throw new Error("Transaction failed on Stellar network");
      }

      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          donorWallet: publicKey,
          amount: amount,
          asset: asset,
          txHash: result.hash,
          network: "TESTNET",
        }),
      });

      alert(
        `✅ Donation successful!\n\nAmount: ${amount} ${asset}\nTransaction: ${result.hash.substring(0, 8)}...${result.hash.substring(result.hash.length - 8)}\n\nThank you for supporting this project!`,
      );

      window.location.reload();
    } catch (error) {
      alert(
        `❌ Donation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return <LoadingBee text="Cargando proyecto..." />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen hex-pattern flex items-center justify-center">
        <div className="card-brutal p-8 bg-white text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-gray-600">{error || "This project doesn't exist"}</p>
        </div>
      </div>
    );
  }

  const totalNeeded = roadmapItems.reduce((sum, item) => {
    const cost = parseFloat(item.estimated_cost || "0");
    return sum + cost;
  }, 0);
  const currentAmount = parseFloat(project.current_amount || "0");
  const percentage = totalNeeded > 0 ? (currentAmount / totalNeeded) * 100 : 0;

  return (
    <div className="min-h-screen hex-pattern">
      {/* Hero Cover */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[400px] relative overflow-hidden border-b-4 border-black"
        >
          <img
            src={project.cover_image_url}
            alt={project.title}
            onClick={() => {
              setLightboxIndex(-1);
              setLightboxOpen(true);
            }}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {project.generated_cover && (
              <span className="badge-brutal badge-brutal-secondary">✨ AI Generated</span>
            )}
            <span className={`badge-brutal ${project.status === "published" ? "badge-brutal-primary" : "bg-yellow-400 text-black border-black"}`}>
              {project.status === "published" ? "🟢 Live" : "📝 Draft"}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg"
            >
              {project.title}
            </motion.h1>
            <p className="text-xl text-white/90 max-w-2xl">{project.short_description}</p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Owner Actions */}
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                  className="btn-brutal btn-brutal-primary"
                >
                  ✏️ Edit Project
                </button>
                <button
                  onClick={() => router.push(`/projects/${project.id}/roadmap`)}
                  className="btn-brutal btn-brutal-secondary"
                >
                  📋 Manage Roadmap
                </button>
              </motion.div>
            )}

            {/* Draft Warning */}
            {project.status === "draft" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-brutal p-6 bg-[#FDCB6E]"
              >
                <h3 className="text-xl font-bold mb-3">⚠️ Draft Mode</h3>
                <div className="space-y-2 mb-4">
                  {roadmapItems.length === 0 && (
                    <p className="text-sm">📋 Add at least one roadmap item before publishing</p>
                  )}
                  {!project.wallet_address && (
                    <p className="text-sm">💳 Add a Stellar wallet address to receive donations</p>
                  )}
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing || roadmapItems.length === 0 || !project.wallet_address}
                  className={`btn-brutal ${
                    roadmapItems.length === 0 || !project.wallet_address
                      ? "bg-gray-300 cursor-not-allowed"
                      : "btn-brutal-dark"
                  }`}
                >
                  {publishing ? "Publishing..." : "🚀 Publish Project"}
                </button>
              </motion.div>
            )}

            {/* About */}
            {project.full_description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-brutal p-6 bg-white"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📖</span> About
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.full_description}
                </p>
              </motion.div>
            )}

            {/* Roadmap */}
            {roadmapItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-brutal p-6 bg-white"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span>🗺️</span> Roadmap
                </h2>
                <div className="space-y-4">
                  {roadmapItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#FDCB6E] border-3 border-black flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        {index < roadmapItems.length - 1 && (
                          <div className="w-1 flex-1 bg-black mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="p-4 border-3 border-black bg-gray-50 hover:bg-[#FDCB6E]/20 transition-colors">
                          <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          )}
                          {item.estimated_cost && (
                            <span className="badge-brutal badge-brutal-secondary text-xs">
                              💰 {item.estimated_cost} XLM
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-brutal p-6 bg-white"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🖼️</span> Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square overflow-hidden border-3 border-black cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Donations Lists */}
            <TopDonors donations={donations} limit={5} />
            <RecentDonations donations={donations} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-brutal p-6 bg-white sticky top-24"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span> Funding Progress
              </h2>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-3xl font-bold text-[#E67E22]">
                    {currentAmount.toFixed(2)} XLM
                  </span>
                </div>
                {totalNeeded > 0 && (
                  <>
                    <div className="h-4 bg-gray-200 border-2 border-black overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${percentage >= 100 ? "bg-green-500" : "bg-[#FDCB6E]"}`}
                      />
                    </div>
                    <p className="font-mono text-sm text-gray-600">
                      {percentage.toFixed(1)}% of {totalNeeded.toFixed(2)} XLM goal
                    </p>
                  </>
                )}
              </div>

              <div className="border-t-2 border-black pt-4 mt-4">
                <h3 className="font-bold mb-3">🐝 Support This Project</h3>
                
                <WalletConnect />

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block font-mono text-sm mb-2">Asset</label>
                    <select
                      value={asset}
                      onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
                      className="input-brutal"
                    >
                      <option value="XLM">XLM (Stellar Lumens)</option>
                      <option value="USDC">USDC (USD Coin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-sm mb-2">Amount ({asset})</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10"
                      min="0.0000001"
                      step="0.1"
                      className="input-brutal"
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(String(val))}
                        className="flex-1 py-2 border-2 border-black font-mono text-sm hover:bg-[#FDCB6E] transition-colors"
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDonate}
                    disabled={!isConnected || donating || !amount}
                    className={`w-full btn-brutal ${
                      !isConnected || donating || !amount
                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                        : "btn-brutal-primary animate-pulse-glow"
                    }`}
                  >
                    {donating ? "Processing..." : `🍯 Donate ${amount || "0"} ${asset}`}
                  </motion.button>

                  <p className="text-xs text-gray-500 font-mono">
                    💡 Direct to creator's wallet • No fees • Testnet
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex === -1 ? 0 : lightboxIndex + 1}
        slides={[
          { src: project.cover_image_url },
          ...galleryImages.map((img) => ({ src: img.url })),
        ]}
      />
    </div>
  );
}
