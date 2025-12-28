"use client";

import { motion } from "framer-motion";

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

interface DonorStats {
  wallet: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
}

interface TopDonorsProps {
  donations: Donation[];
  limit?: number;
}

export default function TopDonors({ donations, limit = 5 }: TopDonorsProps) {
  const donorStats = donations.reduce(
    (acc, donation) => {
      const wallet = donation.donor_wallet;
      const amount = parseFloat(donation.amount);

      if (!acc[wallet]) {
        acc[wallet] = {
          wallet,
          totalAmount: 0,
          donationCount: 0,
          lastDonation: donation.created_at,
        };
      }

      acc[wallet].totalAmount += amount;
      acc[wallet].donationCount += 1;

      if (new Date(donation.created_at) > new Date(acc[wallet].lastDonation)) {
        acc[wallet].lastDonation = donation.created_at;
      }

      return acc;
    },
    {} as Record<string, DonorStats>,
  );

  const topDonors = Object.values(donorStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);

  if (topDonors.length === 0) {
    return null;
  }

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-[#FDCB6E] border-[#E67E22]";
    if (index === 1) return "bg-gray-200 border-gray-400";
    if (index === 2) return "bg-orange-200 border-orange-400";
    return "bg-white border-black";
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-brutal p-6 bg-white"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🏆</span> Top Donadores
      </h2>
      <div className="space-y-3">
        {topDonors.map((donor, index) => (
          <motion.div
            key={donor.wallet}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 border-3 ${getRankStyle(index)} flex items-center gap-4`}
          >
            {/* Rank */}
            <div className="w-10 h-10 border-3 border-black bg-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {getRankEmoji(index)}
            </div>

            {/* Donor Info */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm truncate">
                {donor.wallet.substring(0, 8)}...
                {donor.wallet.substring(donor.wallet.length - 8)}
              </p>
              <p className="text-xs text-gray-500">
                {donor.donationCount} donación{donor.donationCount !== 1 ? "es" : ""}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className={`font-bold text-lg ${index === 0 ? "text-[#E67E22]" : "text-black"}`}>
                {donor.totalAmount.toFixed(2)} XLM
              </p>
              <p className="font-mono text-xs text-gray-400">
                {new Date(donor.lastDonation).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {topDonors.length >= limit && donations.length > limit && (
        <p className="mt-4 text-center font-mono text-xs text-gray-500">
          Mostrando top {limit} de {Object.keys(donorStats).length} donadores únicos
        </p>
      )}
    </motion.div>
  );
}
