"use client";

/**
 * Kommune — Lawyer Demo (mobile-first, ChatGPT-voice-mode-style UI)
 *
 * Designed to run directly on a real Android phone in Chrome - the phone
 * itself IS the frame, so no mockup chrome is drawn. Full-screen orb,
 * mic + close buttons at the bottom, no visible transcript.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { streamKommuneChat, type KommuneState } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Phase = "idle" | "listening" | "thinking" | "speaking" | "action" | "done";
type Turn = { role: "user" | "assistant"; content: string };

export default function LawyerDemoPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [demoPhone, setDemoPhone] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [whatsappStatus, setWhatsappStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(null);
  const [showActions, setShowActions] = useState(false);

  const recognitionRef = useRef<any>(null);
  const userTurnCountRef = useRef(0);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => onDone?.();
    utterance.onerror = () => onDone?.();
    window.speechSynthesis.speak(utterance);
  }, []);

  const triggerActionBeat = useCallback(async () => {
    setPhase("action");
    setShowActions(true);

    setWhatsappStatus("sending");
    try {
      const res = await fetch(`${API_URL}/demo/send-checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: demoPhone || undefined }),
      });
      const data = await res.json();
      setWhatsappStatus(data.status === "sent" ? "sent" : "error");
    } catch {
      setWhatsappStatus("error");
    }

    try {
      const res = await fetch(`${API_URL}/demo/draft-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.subject && data.body) setEmailDraft({ subject: data.subject, body: data.body });
    } catch {}

    setPhase("done");
  }, [demoPhone]);

  const sendToAgent = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setPhase("idle");
        return;
      }
      setPhase("thinking");
      const nextTurns: Turn[] = [...turns, { role: "user", content: text }];
      setTurns(nextTurns);
      userTurnCountRef.current += 1;

      let assistantText = "";
      try {
        for await (const chunk of streamKommuneChat(
          {
            message: text,
            history: nextTurns.map((t) => ({ role: t.role, content: t.content })),
            session_id: "lawyer-demo",
          },
          undefined
        )) {
          const delta = (chunk as KommuneState)?.delta ?? "";
          if (typeof delta === "string") assistantText += delta;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase("idle");
        return;
      }

      setTurns((prev) => [...prev, { role: "assistant", content: assistantText }]);
      setPhase("speaking");

      speak(assistantText, () => {
        if (userTurnCountRef.current >= 2) triggerActionBeat();
        else setPhase("idle");
      });
    },
    [turns, speak, triggerActionBeat]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript) sendToAgent(transcript);
    };
    recognition.onerror = () => setPhase("idle");
    recognition.onend = () => setPhase((p) => (p === "listening" ? "idle" : p));

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendToAgent]);

  const startListening = () => {
    if (!recognitionRef.current || phase !== "idle") return;
    setError(null);
    setPhase("listening");
    recognitionRef.current.start();
  };

  const stopSession = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setPhase("idle");
    setTurns([]);
    setShowActions(false);
    setWhatsappStatus("idle");
    setEmailDraft(null);
    userTurnCountRef.current = 0;
  };

  const orbAnimation =
    phase === "listening"
      ? "orbPulse 1.2s ease-in-out infinite"
      : phase === "thinking"
      ? "orbSpin 2.5s linear infinite"
      : phase === "speaking"
      ? "orbWave 0.8s ease-in-out infinite"
      : "orbIdle 6s ease-in-out infinite";

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        background: "#0a1a33",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflowY: "auto",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes orbIdle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.03) rotate(8deg); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes orbSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbWave {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      {/* Status row */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px 0" }}>
        <div onClick={() => setShowSettings((s) => !s)} style={{ fontSize: 22, color: "#7ba8dd", padding: 8 }}>
          ⚙
        </div>
      </div>

      {showSettings && (
        <div
          style={{
            margin: "0 20px",
            background: "#122a4f",
            border: "1px solid #1e3a63",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <label style={{ fontSize: 12, color: "#8fb0dd", display: "block", marginBottom: 6 }}>
            WhatsApp number for this demo
          </label>
          <input
            value={demoPhone}
            onChange={(e) => setDemoPhone(e.target.value)}
            placeholder="27821234567"
            inputMode="numeric"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #2a4a7a",
              background: "#0d2140",
              color: "#f0f4fa",
              fontSize: 16,
            }}
          />
        </div>
      )}

      {/* Orb — the full-screen focal point */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
        }}
      >
        <div
          style={{
            width: "min(65vw, 220px)",
            height: "min(65vw, 220px)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, #ffffff 0%, #cfe8ff 25%, #7ec3f5 55%, #3d8fe0 80%, #2166b5 100%)",
            animation: orbAnimation,
            boxShadow: "0 0 60px rgba(80,160,240,0.5)",
          }}
        />
      </div>

      {error && (
        <div style={{ padding: "0 24px 12px", color: "#c0392b", fontSize: 13, textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* Bottom controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 48px 28px",
        }}
      >
        <button
          onClick={startListening}
          disabled={phase !== "idle"}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "none",
            background: "#122a4f",
            fontSize: 26,
            cursor: phase === "idle" ? "pointer" : "default",
          }}
        >
          🎙️
        </button>

        <div style={{ width: 100, height: 4, background: "#2a4a7a", borderRadius: 2 }} />

        <button
          onClick={stopSession}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "none",
            background: "#122a4f",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Live actions panel */}
      {showActions && (
        <div
          style={{
            margin: "0 20px 32px",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 1, color: "#3d8fe0", fontWeight: 700, marginBottom: 12 }}>
            LIVE ACTIONS
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: emailDraft ? 14 : 0 }}>
            <span style={{ fontSize: 18 }}>
              {whatsappStatus === "sending" ? "⏳" : whatsappStatus === "sent" ? "✅" : "⚠️"}
            </span>
            <span style={{ fontSize: 14, color: "#333" }}>
              {whatsappStatus === "sending" && "Sending checklist to WhatsApp…"}
              {whatsappStatus === "sent" && "Checklist sent — check the phone."}
              {whatsappStatus === "error" && "WhatsApp send failed."}
            </span>
          </div>

          {emailDraft && (
            <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>DRAFTED EMAIL</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#111" }}>
                {emailDraft.subject}
              </div>
              <div style={{ fontSize: 13, color: "#555", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {emailDraft.body}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
