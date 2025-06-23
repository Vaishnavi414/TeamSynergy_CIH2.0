// src/components/ScoringDemo.tsx
import React, { useState } from "react";
import { calculateVaR, calculateSharpe, analyzeSentiment } from "../lib/scoring";

type Props = {
  address: string;
  token: string;
};

export function ScoringDemo({ address, token }: Props) {
  const [varResult, setVarResult] = useState<string | null>(null);
  const [sharpeResult, setSharpeResult] = useState<string | null>(null);
  const [sentimentResult, setSentimentResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setVarResult(null);
    setSharpeResult(null);
    setSentimentResult(null);
    try {
      const v = await calculateVaR(address);
      setVarResult(JSON.stringify(v));
    } catch (e: any) {
      setVarResult(e.message || "VaR error");
    }
    try {
      const s = await calculateSharpe(address);
      setSharpeResult(JSON.stringify(s));
    } catch (e: any) {
      setSharpeResult(e.message || "Sharpe error");
    }
    try {
      const sent = await analyzeSentiment(token);
      setSentimentResult(JSON.stringify(sent));
    } catch (e: any) {
      setSentimentResult(e.message || "Sentiment error");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20 mt-8">
      <h2 className="font-bold mb-2">Predictive Risk Scoring (Demo)</h2>
      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="Token"
        value={token}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <button
        onClick={analyze}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Analyzing..." : "Run Scoring"}
      </button>
      <div className="mt-2">
        <strong>VaR:</strong> {varResult}
      </div>
      <div className="mt-2">
        <strong>Sharpe Ratio:</strong> {sharpeResult}
      </div>
      <div className="mt-2">
        <strong>Sentiment:</strong> {sentimentResult}
      </div>
    </div>
  );
}
