// src/components/PrivacyDemo.tsx
import React, { useState } from "react";
import { generateZKProof, verifyZKProof } from "../lib/privacy";

export function PrivacyDemo() {
  const [proofResult, setProofResult] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProof = async () => {
    setLoading(true);
    setProofResult(null);
    setVerifyResult(null);
    try {
      const proof = await generateZKProof({ value: 42 });
      setProofResult(JSON.stringify(proof));
    } catch (e: any) {
      setProofResult(e.message || "Proof error");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setVerifyResult(null);
    try {
      const verified = await verifyZKProof({ proof: "demo" });
      setVerifyResult(verified ? "Valid" : "Invalid");
    } catch (e: any) {
      setVerifyResult(e.message || "Verify error");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-black/20 mt-8">
      <h2 className="font-bold mb-2">Privacy & ZK-SNARKs (Demo)</h2>
      <button
        onClick={handleProof}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
      >
        {loading ? "Generating..." : "Generate ZK-Proof"}
      </button>
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Verifying..." : "Verify ZK-Proof"}
      </button>
      <div className="mt-2">
        <strong>Proof:</strong> {proofResult}
      </div>
      <div className="mt-2">
        <strong>Verification:</strong> {verifyResult}
      </div>
    </div>
  );
}
