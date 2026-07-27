"use client";

/**
 * Kommune — "Talk to Kommune" value explainer + real paywall
 *
 * Three screens explaining value, then a genuine gate: voice only unlocks
 * after real activation (reusing the existing /activate/request flow),
 * not a free-for-anyone button. This matters because voice has real
 * per-minute costs (Deepgram + ElevenLabs) unlike text chat.
 */

import { useState } from "react";
import { requestActivation } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Screen = 0 | 1 | 2 | 3;

const SLIDES = [
  {
    title: "Meet Kommune",
    body: "A voice you can actually talk to — about your legal status, your documents, your next step. Real answers, not a script.",
  },
  {
    title: "It listens and responds in real time",
    body: "Speak naturally. Kommune understands, thinks, and replies out loud — like a conversation, not a search bar.",
  },
  {
    title: "It can take real action",
    body: "Draft a real email. Send a real WhatsApp checklist. Kommune doesn't just talk — it helps you get things done.",
  },
];

export default function TalkToKommunePage() {
  const [screen, setScreen] = useState<Screen>(0);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationInfo, setActivationInfo] = useState<{
    reference: string;
    amount_zar: number;
    qr_code_url: string;
    instructions: string;
  } | null>(null);

  const handleActivate = async () => {
    if (!email && !whatsapp) {
      setError("Enter an email or WhatsApp number to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await requestActivation({
        email: email || undefined,
        whatsapp_number: whatsapp || undefined,
      });
      setActivationInfo(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        background: "linear-gradient(180deg, #dce6fb 0%, #e8eefb 55%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Poppins', 'Quicksand', system-ui, -apple-system, sans-serif",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: i === screen ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === screen ? "#4a7fe8" : "#c8d6f2",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Screens 0-2: value explainer */}
      {screen < 3 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(207,232,255,0.7) 25%, rgba(126,195,245,0.55) 55%, rgba(61,143,224,0.45) 100%)",
              backdropFilter: "blur(8px)",
              margin: "0 auto 32px",
              boxShadow: "0 8px 40px rgba(74,127,232,0.3)",
            }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#2b3a6b", marginBottom: 16 }}>
            {SLIDES[screen].title}
          </h1>
          <p style={{ fontSize: 15, color: "#5a6a9a", lineHeight: 1.6 }}>{SLIDES[screen].body}</p>
        </div>
      )}

      {/* Screen 3: the actual gate - real activation, not a free unlock */}
      {screen === 3 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {!activationInfo ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2b3a6b", marginBottom: 8, textAlign: "center" }}>
                Activate to start talking
              </h1>
              <p style={{ fontSize: 14, color: "#5a6a9a", textAlign: "center", marginBottom: 28 }}>
                A once-off R300 unlocks voice, plus every Kommune agent, your Vault, and a free pass for someone else.
              </p>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d8e2f5",
                  background: "#ffffff",
                  fontSize: 15,
                  marginBottom: 10,
                }}
              />
              <input
                type="text"
                placeholder="WhatsApp number (optional)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                inputMode="numeric"
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d8e2f5",
                  background: "#ffffff",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              />

              {error && (
                <p style={{ color: "#c0392b", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</p>
              )}

              <button
                onClick={handleActivate}
                disabled={loading}
                style={{
                  padding: "14px",
                  borderRadius: 30,
                  border: "none",
                  background: "linear-gradient(135deg, #4a7fe8, #6a9ff0)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Setting up…" : "Activate for R300"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: "#2b3a6b", marginBottom: 16 }}>
                Almost there
              </h1>
              {activationInfo.qr_code_url && (
                <img
                  src={activationInfo.qr_code_url}
                  alt="Payment QR code"
                  style={{ width: 180, height: 180, margin: "0 auto 16px", borderRadius: 12 }}
                />
              )}
              <p style={{ fontSize: 14, color: "#2b3a6b", marginBottom: 8 }}>{activationInfo.instructions}</p>
              <p style={{ fontSize: 12, color: "#8fa0c8" }}>Reference: {activationInfo.reference}</p>
              <p style={{ fontSize: 12, color: "#8fa0c8", marginTop: 16 }}>
                Once payment is confirmed, you'll get access to voice within 24 hours.
              </p>
              <a
                href="https://kommune-voice.vercel.app"
                style={{
                  display: "inline-block",
                  marginTop: 24,
                  padding: "12px 28px",
                  borderRadius: 30,
                  background: "linear-gradient(135deg, #4a7fe8, #6a9ff0)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Go to Kommune Voice →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {screen < 3 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            onClick={() => setScreen((s) => Math.max(0, s - 1) as Screen)}
            style={{
              padding: "10px 20px",
              borderRadius: 30,
              border: "none",
              background: "transparent",
              color: screen === 0 ? "transparent" : "#5a6a9a",
              fontSize: 14,
              cursor: screen === 0 ? "default" : "pointer",
            }}
          >
            Back
          </button>
          <button
            onClick={() => setScreen((s) => (s + 1) as Screen)}
            style={{
              padding: "12px 28px",
              borderRadius: 30,
              border: "none",
              background: "linear-gradient(135deg, #4a7fe8, #6a9ff0)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(74,127,232,0.25)",
            }}
          >
            {screen === 2 ? "Continue" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
