"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

interface QRCodeDisplayProps {
  url: string;
  title?: string;
}

export function QRCodeDisplay({ url, title }: QRCodeDisplayProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${title ?? "vote"}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={svgRef} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <QRCodeSVG
          value={url}
          size={200}
          level="M"
          includeMargin={true}
        />
      </div>

      <p className="text-xs text-gray-400 break-all text-center max-w-xs">{url}</p>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          SVGダウンロード
        </button>
        <button
          onClick={handleCopyUrl}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          URLをコピー
        </button>
      </div>
    </div>
  );
}
