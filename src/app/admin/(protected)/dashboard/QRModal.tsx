"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRModalProps {
  eventId: string;
  eventTitle: string;
}

export function QRModal({ eventId, eventTitle }: QRModalProps) {
  const [open, setOpen] = useState(false);

  const voteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/event/${eventId}`;

  function handleDownload() {
    const svg = document.getElementById(`qr-${eventId}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${eventTitle}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-indigo-600"
      >
        QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl w-80 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 text-center">{eventTitle}</h3>
            <div className="p-3 bg-white border border-gray-100 rounded-xl">
              <QRCodeSVG
                id={`qr-${eventId}`}
                value={voteUrl}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-400 break-all text-center">{voteUrl}</p>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                ダウンロード
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(voteUrl); }}
                className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                URLコピー
              </button>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
