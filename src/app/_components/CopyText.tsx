"use client";
import React, { useState } from "react";

interface CopyTextProps {
  value: string;
}

const CopyText: React.FC<CopyTextProps> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div onClick={handleCopy} style={{ cursor: "pointer" }}>
      <div title={"click to copy"}>
        {copied ? (
          <span className="rounded border border-white/30 bg-white/30 px-2 py-1 text-white/60">
            copied
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

export default CopyText;
