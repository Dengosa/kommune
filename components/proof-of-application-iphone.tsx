"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";

export type ApplicationRecord = {
  type: string;
  appliedOn: string;
  status: "Submitted" | "Pending" | "Under Review" | "Approved" | "Denied";
  reference?: string;
};

interface Props {
  holderName: string;
  records: ApplicationRecord[];
}

function encodeProof(holderName: string, records: ApplicationRecord[]): string {
  return [
    `KOMMUNE PROOF OF APPLICATION`,
    `Holder: ${holderName}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `---`,
    ...records.map(r => `${r.type} | Applied: ${r.appliedOn} | Status: ${r.status}${r.reference ? ` | Ref: ${r.reference}` : ""}`),
  ].join("\n");
}

function statusColor(status: string) {
  if (status === "Approved") return { bg: "#e8f5e9", text: "#1b5e20" };
  if (status === "Denied") return { bg: "#fdecea", text: "#b71c1c" };
  return { bg: "#fff8e1", text: "#b85c00" };
}

export function ProofOfApplicationIphone({ holderName, records }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const payload = encodeProof(holderName, records);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, { width: 140, margin: 1 }, (err) => {
      if (err) setError("QR data too large.");
    });
  }, [payload]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `kommune-proof-${holderName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  function handlePrint() {
    if (!canvasRef.current) return;
    const qrDataUrl = canvasRef.current.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = records.map(r => `<tr><td>${r.type}</td><td>${r.appliedOn}</td><td>${r.status}</td><td>${r.reference ?? "—"}</td></tr>`).join("");
    win.document.write(`<html><head><title>Kommune Proof — ${holderName}</title><style>body{font-family:sans-serif;padding:32px;max-width:700px;margin:0 auto}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;padding:6px 10px;border-bottom:2px solid #111;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#666}td{padding:8px 10px;border-bottom:1px solid #eee}.qr{text-align:center;margin-top:28px}.notice{background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;margin:16px 0;font-size:12px}</style></head><body><h2>Kommune Proof of Application</h2><p>Holder: ${holderName} &nbsp;|&nbsp; Generated: ${new Date().toISOString().slice(0, 10)}</p><div class="notice">Self-reported snapshot — not an official government record.</div><table><thead><tr><th>Application</th><th>Date Applied</th><th>Status</th><th>Reference</th></tr></thead><tbody>${rows}</tbody></table><div class="qr"><img src="${qrDataUrl}" width="180"/><p style="font-size:11px;color:#888">Scan to read this record offline.</p></div></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      {/* Left: description */}
      <div className="flex-1">
        <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3">Proof of application</div>
        <h2 className="text-2xl font-display mb-3">Your scannable record</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          A QR code encoding everything you have applied for, and when. Show it to a landlord, employer, or official as proof you have an active case. Works offline — no internet needed to scan.
        </p>
        <div className="flex flex-col gap-3">
          {records.map((r, i) => {
            const { bg, text } = statusColor(r.status);
            return (
              <div key={i} className="flex items-center justify-between rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{r.type}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Applied {r.appliedOn}{r.reference ? ` · Ref: ${r.reference}` : ""}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: bg, color: text }}>{r.status}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Save to phone
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium">
            <Printer className="w-4 h-4" /> Print copy
          </button>
        </div>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">Self-reported snapshot, not an official record. Supporting evidence only.</p>
      </div>

      {/* Right: iPhone mockup */}
      <div className="flex-shrink-0 flex justify-center">
        <div style={{ position: "relative", width: 240, height: 500 }}>
          {/* Side buttons */}
          <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 24, background: "#a0a0a0", borderRadius: "2px 0 0 2px" }} />
          <div style={{ position: "absolute", left: -3, top: 112, width: 3, height: 38, background: "#a0a0a0", borderRadius: "2px 0 0 2px" }} />
          <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 56, background: "#a0a0a0", borderRadius: "0 2px 2px 0" }} />
          {/* Body */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#2a2a2a,#111)", borderRadius: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }} />
          {/* Screen */}
          <div style={{ position: "absolute", inset: 5, background: "#fff", borderRadius: 36, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Dynamic Island */}
            <div style={{ background: "#111", height: 26, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 3, flexShrink: 0 }}>
              <div style={{ width: 88, height: 20, background: "#111", borderRadius: "0 0 14px 14px" }} />
            </div>
            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 0", fontSize: 11, fontWeight: 700, color: "#111", flexShrink: 0 }}>
              <span>9:41</span><span>▲▲ 🔋</span>
            </div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 6px", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Proof of application</span>
              <button onClick={handleDownload} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Download style={{ width: 16, height: 16, color: "#111" }} />
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#888", padding: "0 14px", margin: "0 0 10px", lineHeight: 1.5 }}>Show this offline — no internet needed.</p>
            {/* QR */}
            <div style={{ display: "flex", justifyContent: "center", padding: "0 14px", flexShrink: 0 }}>
              <div style={{ background: "#f9f9f9", padding: 8, borderRadius: 8 }}>
                <canvas ref={canvasRef} />
              </div>
            </div>
            {/* Records */}
            <div style={{ padding: "10px 14px 0", display: "flex", flexDirection: "column", gap: 5, flex: 1, overflowY: "auto" }}>
              {records.map((r, i) => {
                const { bg, text } = statusColor(r.status);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid #eee", paddingBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#555" }}>{r.type}</span>
                    <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 999, background: bg, color: text }}>{r.status}</span>
                  </div>
                );
              })}
            </div>
            {/* Bottom button */}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 14px 20px", flexShrink: 0 }}>
              <button onClick={handlePrint} style={{ background: "#111", color: "#fff", border: "none", borderRadius: 999, padding: "8px 24px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                Print copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
