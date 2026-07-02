"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check, Loader2 } from "lucide-react";

const WHATSAPP_NUMBER = "27796463376";
const WHATSAPP_MSG = encodeURIComponent("Hi Kommune, I want to activate my account.");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kommune.onrender.com";

const BANK = {
  bank: "FNB",
  name: "Tina Ngoy",
  account: "63067960048",
  branch: "250655",
  amount: "R300",
};

export function ActivateBox() {
  const [step, setStep] = useState<"options" | "collect" | "eft">("options");
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(val: string, key: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handlePay() {
    if (!email) { setError("Please enter your email or WhatsApp number first."); return; }
    setLoading(true);
    setError(null);
    try {
      const isEmail = email.includes("@");
      const body = isEmail ? { email } : { whatsapp_number: email };
      const res = await fetch(`${API_URL}/activate/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Could not create activation request");
      const data = await res.json();
      setRef(data.reference);
      setStep("eft");
    } catch {
      setError("Something went wrong. Please try again or message us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  }
  if (step === "eft") {
    const proofMsg = encodeURIComponent(`Hi Kommune, I have paid R300 via EFT. My reference is ${ref}.`);
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-black/8">
          <button onClick={() => setStep("collect")} className="text-black/40 hover:text-black transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-sm font-semibold text-[#0f0f0f]">Pay R300 via EFT</span>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700 leading-relaxed">
            Use your unique reference below when making the EFT. We activate your account within 24 hours of confirmation.
          </div>
          <div className="text-[10px] font-semibold text-black/40 uppercase tracking-widest mb-3">Banking details</div>
          <div className="flex flex-col gap-2 mb-5">
            {[
              { label: "Bank", val: BANK.bank },
              { label: "Account name", val: BANK.name },
              { label: "Account number", val: BANK.account },
              { label: "Branch code", val: BANK.branch },
              { label: "Amount", val: BANK.amount },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center border-b border-black/6 pb-2">
                <span className="text-xs text-black/50">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0f0f0f]">{row.val}</span>
                  <button onClick={() => copy(row.val, row.label)} className="text-black/30 hover:text-black/60">
                    {copied === row.label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-black/50">Your reference</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0f0f0f] font-mono">{ref}</span>
                <button onClick={() => copy(ref, "ref")} className="text-black/30 hover:text-black/60">
                  {copied === "ref" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${proofMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[#0f0f0f] text-white text-sm font-medium mb-3">
            I have paid — send proof
          </a>
          <p className="text-[10.5px] text-black/40 text-center leading-relaxed">After paying, tap above to send us proof on WhatsApp. We activate within 24 hours.</p>
        </div>
      </div>
    );
  }
  if (step === "collect") {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-black/8">
          <button onClick={() => setStep("options")} className="text-black/40 hover:text-black transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-sm font-semibold text-[#0f0f0f]">Your contact</span>
        </div>
        <div className="p-6">
          <p className="text-xs text-black/50 mb-4 leading-relaxed">Enter your email or WhatsApp number so we can send your activation confirmation.</p>
          <input type="text" placeholder="email or WhatsApp number" value={email} onChange={e => { setEmail(e.target.value); setError(null); }} className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none bg-black/[0.02] mb-3" />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button onClick={handlePay} disabled={loading} className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#0f0f0f] text-white text-sm font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get my banking details"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <span className="font-medium text-[#0f0f0f]">Kommune</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#0f0f0f] text-white">Made for you</span>
      </div>
      <h1 className="font-serif text-3xl text-center leading-snug text-[#0f0f0f] mb-2">One conversation,<br />every system involved.</h1>
      <p className="text-center text-sm text-black/50 mb-6">Legal, credit, health and education assistants working for you from day one.</p>
      <div className="bg-black/[0.03] rounded-xl p-4 mb-4 flex gap-3">
        <span className="text-black/20 text-lg leading-none">&ldquo;</span>
        <div>
          <p className="text-xs text-[#0f0f0f] leading-relaxed">While I wait, Kommune got me into school and helped me open a bank account without an ID. I am not stuck anymore.</p>
          <p className="text-[10.5px] text-black/40 mt-1">Khaya, 22 — South Africa</p>
        </div>
      </div>
      <div className="bg-white border border-black/10 rounded-xl px-4 py-3 flex justify-between items-center mb-4">
        <div>
          <div className="text-xs text-black/50">One-time activation</div>
          <div className="text-[10.5px] text-black/40 mt-0.5">EFT · 5 assistants · 1 SpotMe pass</div>
        </div>
        <span className="text-xl font-medium text-[#0f0f0f]">R300</span>
      </div>
      <button onClick={() => setStep("collect")} className="flex items-center justify-center w-full h-12 rounded-full bg-[#0f0f0f] text-white text-sm font-medium mb-3">Pay R300 via EFT</button>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-10 rounded-full border border-black/10 text-[#0f0f0f] text-sm">Message us first</a>
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-black/30" />
        <p className="text-[11px] text-black/40">Pay directly or message us — your choice.</p>
      </div>
    </div>
  );
}
