// src/components/RiskAnalysis.tsx
import React, { useState } from "react";
import { analyzeWalletRisk, getTokenVolatility, scanSmartContract } from "../lib/risk";

type Props = {
  address: string;
  tokenAddress: string;
};

export function RiskAnalysis({ address, tokenAddress }: Props) {
  const [riskResult, setRiskResult] = useState<string | null>(null);
  const [volatilityResult, setVolatilityResult] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setRiskResult(null);
    setVolatilityResult(null);
    setScanResult(null);
    try {
      const risk = await analyzeWalletRisk(address);
      setRiskResult(JSON.stringify(risk));
    } catch (e: any) {
      setRiskResult(e.message || "Risk analysis error");
    }
    try {
      const vol = await getTokenVolatility(tokenAddress);
      setVolatilityResult(JSON.stringify(vol));
    } catch (e: any) {
      setVolatilityResult(e.message || "Volatility error");
    }
    try {
      const scan = await scanSmartContract(address);
      setScanResult(JSON.stringify(scan));
    } catch (e: any) {
      setScanResult(e.message || "Scan error");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20 mt-8">
      <h2 className="font-bold mb-2">Risk Analysis Engine (Demo)</h2>
      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="Token address"
        value={tokenAddress}
        readOnly
        className="mb-2 p-2 border rounded w-full"
      />
      <button
        onClick={analyze}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Analyzing..." : "Run Risk Analysis"}
      </button>
      <div className="mt-2">
        <strong>Wallet Risk:</strong> {riskResult}
      </div>
      <div className="mt-2">
        <strong>Token Volatility:</strong> {volatilityResult}
      </div>
      <div className="mt-2">
        <strong>Contract Scan:</strong> {scanResult}
      </div>
    </div>
  );
}
