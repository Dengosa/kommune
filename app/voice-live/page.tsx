"use client";

/**
 * Kommune — Lawyer Demo (voice-wrapped, real backend)
 *
 * SCRIPTED FLOW, REAL ACTIONS:
 * - Speech-to-text and text-to-speech are browser-native (Web Speech API) —
 *   not Deepgram/ElevenLabs. That pipeline is still being built separately.
 * - Every agent response comes from the real, live /chat/stream backend.
 *   Nothing about the conversation content is scripted or faked.
 * - After the 2nd real user turn, this page triggers ONE scripted action
 *   beat: a real WhatsApp send (POST /demo/send-checklist) and a real
 *   drafted email shown on screen (POST /demo/draft-email). Both hit real
 *   backend endpoints using the same tools that power production.
 *
 * This is deliberately NOT a general-purpose "agent decides what to do"
 * system — for a live demo in front of lawyers, a guaranteed, rehearsed
 * trigger point is more trustworthy than letting the model decide live
 * whether to fire a real action.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { streamKommuneChat, type KommuneState } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Phase = "idle" | "listening" | "thinking" | "speaking" | "action" | "done";

type Turn = {
  role: "user" | "assistant";
  content: string;
};

export default function LawyerDemoPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [whatsappStatus, setWhatsappStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(null);
  const [demoPhone, setDemoPhone] = useState("");

  const recognitionRef = useRef<any>(null);
  const userTurnCountRef = useRef(0);

  // --- Speak text aloud using the browser's built-in TTS ---
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => onDone?.();
    utterance.onerror = () => onDone?.();
    window.speechSynthesis.speak(utterance);
  }, []);

  // --- Trigger the scripted action beat (real WhatsApp + real drafted email) ---
  const triggerActionBeat = useCallback(async () => {
    setPhase("action");

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
      if (data.subject && data.body) {
        setEmailDraft({ subject: data.subject, body: data.body });
      }
    } catch {
      // silent — the checklist send is the primary proof point, email is bonus
    }

    setPhase("done");
  }, [demoPhone]);

  // --- Send a completed user utterance to the real backend ---
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
          const delta =
            (chunk as KommuneState)?.delta ?? "";
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
        if (userTurnCountRef.current >= 2) {
          triggerActionBeat();
        } else {
          setPhase("idle");
        }
      });
    },
    [turns, speak, triggerActionBeat]
  );

  // --- Set up browser speech recognition once ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("This browser doesn't support voice input. Use Chrome or Edge for the demo.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setLiveTranscript(final || interim);
      if (final) {
        recognition.stop();
        sendToAgent(final);
      }
    };

    recognition.onerror = () => {
      setPhase("idle");
    };

    recognition.onend = () => {
      setPhase((p) => (p === "listening" ? "idle" : p));
    };

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendToAgent]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setError(null);
    setLiveTranscript("");
    setPhase("listening");
    recognitionRef.current.start();
  };

  const phaseLabel: Record<Phase, string> = {
    idle: "Tap to speak",
    listening: "Listening…",
    thinking: "Kommune is thinking…",
    speaking: "Kommune is speaking…",
    action: "Sending real WhatsApp + drafting email…",
    done: "Demo complete",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#f5f5f5",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 2,
              color: "#b8ff57",
              marginBottom: 8,
            }}
          >
            KOMMUNE — LIVE DEMO
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Speak to Kommune
          </h1>
        </div>

        {/* Demo phone number input (for the WhatsApp send target) */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#999",
              marginBottom: 6,
            }}
          >
            WhatsApp number for this demo (E.164, no +, e.g. 27821234567)
          </label>
          <input
            type="text"
            value={demoPhone}
            onChange={(e) => setDemoPhone(e.target.value)}
            placeholder="27821234567"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "#f5f5f5",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 14,
            }}
          />
        </div>

        {/* Mic button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <button
            onClick={startListening}
            disabled={phase !== "idle" && phase !== "listening"}
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: "none",
              background:
                phase === "listening"
                  ? "#b8ff57"
                  : phase === "idle"
                  ? "#1a1a1a"
                  : "#2a2a2a",
              color: phase === "listening" ? "#0f0f0f" : "#f5f5f5",
              fontSize: 32,
              cursor: phase === "idle" ? "pointer" : "default",
              transition: "all 0.2s ease",
              boxShadow: phase === "listening" ? "0 0 0 8px rgba(184,255,87,0.15)" : "none",
            }}
          >
            🎙️
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "#999",
            marginBottom: 32,
          }}
        >
          {phaseLabel[phase]}
        </div>

        {liveTranscript && phase === "listening" && (
          <div style={{ textAlign: "center", fontStyle: "italic", color: "#ccc", marginBottom: 24 }}>
            "{liveTranscript}"
          </div>
        )}

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: 13, textAlign: "center", marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Conversation log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {turns.map((t, i) => (
            <div
              key={i}
              style={{
                alignSelf: t.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: 12,
                background: t.role === "user" ? "#b8ff57" : "#1a1a1a",
                color: t.role === "user" ? "#0f0f0f" : "#f5f5f5",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {t.content}
            </div>
          ))}
        </div>

        {/* Action beat: real WhatsApp + real drafted email */}
        {(whatsappStatus !== "idle" || emailDraft) && (
          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                letterSpacing: 1,
                color: "#b8ff57",
              }}
            >
              LIVE ACTIONS
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>
                {whatsappStatus === "sending" ? "⏳" : whatsappStatus === "sent" ? "✅" : "⚠️"}
              </span>
              <span style={{ fontSize: 14 }}>
                {whatsappStatus === "sending" && "Sending checklist to WhatsApp…"}
                {whatsappStatus === "sent" && "Checklist sent — check the phone in the room."}
                {whatsappStatus === "error" && "WhatsApp send failed — check server logs."}
              </span>
            </div>

            {emailDraft && (
              <div style={{ padding: 16, borderRadius: 10, background: "#1a1a1a" }}>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>DRAFTED EMAIL</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{emailDraft.subject}</div>
                <div style={{ fontSize: 14, color: "#ccc", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {emailDraft.body}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
