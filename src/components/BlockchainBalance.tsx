// src/components/BlockchainBalance.tsx
import React, { useState } from "react";
import { getEthBalance } from "../lib/blockchain";

type Props = {
  address: string;
  rpcUrl: string;
};

export function BlockchainBalance({ address, rpcUrl }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const bal = await getEthBalance(address, rpcUrl);
      setBalance(bal);
    } catch (e: unknown) {
      setError((e as Error).message || "Error fetching balance");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20">
      <h2 className="font-bold mb-2">Blockchain ETH Balance</h2>
      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="RPC URL"
        value={rpcUrl}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <button
        onClick={fetchBalance}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Loading..." : "Fetch Balance"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {balance && (
        <div className="mt-2">
          <strong>ETH:</strong> {balance}
        </div>
      )}
    </div>
  );
}
