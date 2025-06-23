// src/components/BankingAccounts.tsx
import React, { useState } from "react";
import { fetchFynapseAccounts, fetchSaltEdgeAccounts } from "../lib/banking";

type Props = {
  token: string;
};

export function BankingAccounts({ token }: Props) {
  const [fynapseResult, setFynapseResult] = useState<string | null>(null);
  const [saltEdgeResult, setSaltEdgeResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    setFynapseResult(null);
    setSaltEdgeResult(null);
    try {
      const fynapse = await fetchFynapseAccounts(token);
      setFynapseResult(JSON.stringify(fynapse));
    } catch (e: any) {
      setFynapseResult(e.message || "Fynapse error");
    }
    try {
      const saltEdge = await fetchSaltEdgeAccounts(token);
      setSaltEdgeResult(JSON.stringify(saltEdge));
    } catch (e: any) {
      setSaltEdgeResult(e.message || "Salt Edge error");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20 mt-8">
      <h2 className="font-bold mb-2">Banking Accounts (Open Banking API Demo)</h2>
      <input
        type="text"
        placeholder="API Token"
        value={token}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <button
        onClick={fetchAccounts}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Loading..." : "Fetch Accounts"}
      </button>
      <div className="mt-2">
        <strong>Fynapse:</strong> {fynapseResult}
      </div>
      <div className="mt-2">
        <strong>Salt Edge:</strong> {saltEdgeResult}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
