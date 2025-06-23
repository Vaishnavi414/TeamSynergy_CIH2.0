// src/components/ComplianceDemo.tsx
import React, { useState } from "react";
import { checkCompliance, mintCreditScoreNFT } from "../lib/compliance";

export function ComplianceDemo() {
  const [complianceResult, setComplianceResult] = useState<string | null>(null);
  const [nftResult, setNftResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompliance = async () => {
    setLoading(true);
    setComplianceResult(null);
    try {
      const result = await checkCompliance("0x0000000000000000000000000000000000000000");
      setComplianceResult(JSON.stringify(result));
    } catch (e: any) {
      setComplianceResult(e.message || "Compliance error");
    }
    setLoading(false);
  };

  const handleMintNFT = async () => {
    setLoading(true);
    setNftResult(null);
    try {
      const result = await mintCreditScoreNFT("0x0000000000000000000000000000000000000000", 750);
      setNftResult(JSON.stringify(result));
    } catch (e: any) {
      setNftResult(e.message || "NFT mint error");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20 mt-8">
      <h2 className="font-bold mb-2">Compliance & NFT Credit Score (Demo)</h2>
      <button
        onClick={handleCompliance}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
      >
        {loading ? "Checking..." : "Check Compliance"}
      </button>
      <button
        onClick={handleMintNFT}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Minting..." : "Mint Credit Score NFT"}
      </button>
      <div className="mt-2">
        <strong>Compliance:</strong> {complianceResult}
      </div>
      <div className="mt-2">
        <strong>NFT Mint:</strong> {nftResult}
      </div>
    </div>
  );
}
