
function IphoneMockup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current,
      "KOMMUNE PROOF\nHolder: Khaya, 22\nStatus: Asylum Seeker Renewal - Under Review\nRef: HA-2026-48391\nVerified Documents: 4",
      { width: 120, margin: 1, color: { dark: "#f5f5f5", light: "#1a1a1a" } },
      () => {}
    );
  }, [showQR]);

  return (
    <div style={{ position: "relative", width: 260, height: 540, margin: "0 auto" }}>
      <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 24, background: "#555", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: -3, top: 112, width: 3, height: 38, background: "#555", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", right: -3, top: 130, width: 3, height: 60, background: "#555", borderRadius: "0 2px 2px 0" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#2a2a2a,#0f0f0f)", borderRadius: 42, boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", inset: 5, background: "#0f0f0f", borderRadius: 38, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#0f0f0f", height: 26, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 3, flexShrink: 0 }}>
          <div style={{ width: 88, height: 20, background: "#000", borderRadius: "0 0 14px 14px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 0", fontSize: 11, fontWeight: 700, color: "#f5f5f5", flexShrink: 0 }}>
          <span>9:41</span><span>▲▲</span>
        </div>
        <div style={{ padding: "10px 14px 6px", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", letterSpacing: -0.5 }}>Journey</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Your progress, your proof</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current Status</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 }}>Asylum Seeker Renewal</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 999, background: "rgba(255,191,0,0.15)", color: "#ffc107", border: "0.5px solid rgba(255,191,0,0.3)" }}>Under Review</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>HA-2026-48391</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              {timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {t.done ? <CheckCircle style={{ width: 10, height: 10, color: "#b8ff57", flexShrink: 0 }} /> : t.active ? <Clock style={{ width: 10, height: 10, color: "#ffc107", flexShrink: 0 }} /> : <Circle style={{ width: 10, height: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />}
                  <span style={{ fontSize: 9.5, color: t.done ? "#f5f5f5" : t.active ? "#ffc107" : "rgba(255,255,255,0.3)" }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Verified Documents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {documents.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < documents.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none", paddingBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <FileText style={{ width: 9, height: 9, color: "#b8ff57" }} />
                    <span style={{ fontSize: 9.5, color: "#f5f5f5" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 8, color: "#b8ff57" }}>Verified</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(184,255,87,0.05)", border: "0.5px solid rgba(184,255,87,0.15)", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "#b8ff57", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Case Summary</div>
            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: "0 0 6px" }}>Your renewal is under review. Your Home Affairs receipt has been securely stored. Attend any scheduled appointments and keep your supporting documents available.</p>
          </div>
          {!showQR ? (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Secure Share</div>
              <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.4, margin: "0 0 8px" }}>Generate a private QR to share selected documents with lawyers or support organisations.</p>
              <button onClick={() => setShowQR(true)} style={{ width: "100%", height: 28, background: "rgba(184,255,87,0.15)", border: "0.5px solid rgba(184,255,87,0.3)", borderRadius: 999, fontSize: 9.5, color: "#b8ff57", cursor: "pointer", fontWeight: 600 }}>Generate QR</button>
              <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: "4px 0 0" }}>You control exactly what others can see.</p>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(184,255,87,0.2)", borderRadius: 12, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 9, color: "#b8ff57", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Your Proof QR</div>
              <div style={{ background: "#1a1a1a", padding: 6, borderRadius: 8 }}>
                <canvas ref={canvasRef} />
              </div>
              <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: "6px 0 0" }}>Scan to read offline. No internet needed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function JourneyPage() {
  return (
    <main className="relative min-h-screen bg-[#0f0f0f]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <span className="inline-block text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-[#b8ff57]/30 text-[#b8ff57] mb-6">New</span>
            <h1 className="font-serif text-5xl lg:text-6xl font-normal text-[#f5f5f5] leading-tight mb-4">
              Your Journey.<br />Your Proof.
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-4 max-w-lg">
              Every receipt, permit, letter and milestone — securely organised in one place and available whenever you need it.
            </p>
            <p className="text-sm text-white/35 leading-relaxed mb-8 max-w-lg">
              Kommune transforms scattered paperwork into a living digital journey. Upload your documents once, understand where you stand, and securely share only what you choose through a private QR profile.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/activate" className="inline-flex items-center h-12 px-6 rounded-full bg-[#b8ff57] text-[#0f0f0f] text-sm font-semibold">
                Explore the Vault
              </Link>
              <button className="inline-flex items-center h-12 px-6 rounded-full border border-white/15 text-white/70 text-sm">
                See how sharing works
              </button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <IphoneMockup />
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#b8ff57]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#b8ff57]" />
                  </div>
                  <div className="text-sm font-semibold text-[#f5f5f5] mb-2">{f.title}</div>
                  <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
