import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "admin9999";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060810; color: #e8eaf6; font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .bokeh-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: radial-gradient(ellipse at 20% 50%, #0a0520 0%, #060810 60%); }
  .bokeh-bg::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 15% 25%, #ff00aa22 0%, transparent 35%), radial-gradient(circle at 85% 15%, #00f5ff18 0%, transparent 30%), radial-gradient(circle at 70% 80%, #ff00aa15 0%, transparent 40%), radial-gradient(circle at 30% 75%, #00f5ff12 0%, transparent 35%); }
  .bokeh-orb { position: absolute; border-radius: 50%; filter: blur(60px); animation: floatOrb linear infinite; }
  @keyframes floatOrb { 0% { transform: translateY(0px) scale(1); opacity: 0.6; } 33% { transform: translateY(-30px) scale(1.05); opacity: 0.8; } 66% { transform: translateY(15px) scale(0.95); opacity: 0.5; } 100% { transform: translateY(0px) scale(1); opacity: 0.6; } }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes ledGlow { 0%,100%{ box-shadow: 0 0 12px #00f5ff, 0 0 30px #00f5ff44, inset 0 0 20px #00f5ff11; } 50%{ box-shadow: 0 0 6px #00f5ff, 0 0 15px #00f5ff22, inset 0 0 10px #00f5ff08; } }
  @keyframes logoGlow { 0%,100%{filter:drop-shadow(0 0 8px #00f5ff66)} 50%{filter:drop-shadow(0 0 16px #00f5ffaa)} }
  .app-wrap { position: relative; z-index: 1; min-height: 100vh; }
  .logo-main { font-family: 'Orbitron', monospace; font-weight: 900; background: linear-gradient(135deg, #60ffff 0%, #00f5ff 40%, #ff00aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 3px; animation: logoGlow 3s ease-in-out infinite; }
  .logo-pix { font-family: 'Rajdhani'; font-weight: 700; color: #ff00aa; letter-spacing: 6px; font-size: 10px; text-transform: uppercase; margin-top: -2px; }
  .nav-bar { display: flex; gap: 4px; padding: 10px 16px; background: #0d0f1aee; backdrop-filter: blur(20px); border-bottom: 1px solid #1a1d35; position: sticky; top: 0; z-index: 40; flex-wrap: wrap; align-items: center; }
  .nav-label { color: #5a5f85; font-size: 9px; font-family: 'Orbitron'; margin-right: 8px; letter-spacing: 2px; }
  .nav-btn { padding: 5px 12px; border-radius: 6px; border: 1px solid #1a1d35; background: transparent; color: #5a5f85; cursor: pointer; font-family: 'Rajdhani'; font-size: 12px; font-weight: 600; transition: all 0.2s; }
  .nav-btn:hover { border-color: #00f5ff66; color: #00f5ff; background: #00f5ff18; }
  .nav-btn.active { background: linear-gradient(135deg, #00f5ff18, #ff00aa18); border-color: #00f5ff; color: #60ffff; }
  .pending-badge { margin-left: auto; font-size: 10px; color: #ff9900; font-family: 'Orbitron'; letter-spacing: 1px; background: #ff990015; border: 1px solid #ff990033; padding: 3px 10px; border-radius: 20px; }
  .card { background: #131628; border: 1px solid #1a1d35; border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); }
  .btn { padding: 11px 22px; border-radius: 10px; border: none; font-family: 'Rajdhani'; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; text-transform: uppercase; }
  .btn-cyan { background: linear-gradient(135deg, #00f5ff, #0099bb); color: #000; box-shadow: 0 4px 20px #00f5ff44; }
  .btn-cyan:hover { transform: translateY(-2px); box-shadow: 0 8px 30px #00f5ff66; }
  .btn-magenta { background: linear-gradient(135deg, #ff00aa, #aa0066); color: #fff; box-shadow: 0 4px 20px #ff00aa44; }
  .btn-outline { background: transparent; border: 1px solid #252850; color: #8890c0; }
  .btn-outline:hover { border-color: #00f5ff66; color: #00f5ff; background: #00f5ff18; }
  .btn-danger { background: linear-gradient(135deg, #ff3355, #aa0022); color: #fff; }
  .btn-success { background: linear-gradient(135deg, #00ff88, #00aa55); color: #000; }
  .btn-warning { background: linear-gradient(135deg, #ff9900, #cc6600); color: #000; }
  .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }
  .input { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #1a1d35; background: #060810; color: #e8eaf6; font-family: 'Inter'; font-size: 14px; outline: none; transition: all 0.2s; }
  .input:focus { border-color: #00f5ff; box-shadow: 0 0 0 3px #00f5ff18; }
  .input::placeholder { color: #5a5f85; }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 9px; font-family: 'Orbitron'; font-weight: 700; background: #00f5ff18; color: #00f5ff; border: 1px solid #00f5ff33; margin-bottom: 10px; letter-spacing: 2px; }
  .tag-magenta { background: #ff00aa18; color: #ff00aa; border-color: #ff00aa33; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; font-family: 'Orbitron'; letter-spacing: 1px; }
  .badge-pending { background: #ff990018; color: #ff9900; border: 1px solid #ff990033; }
  .badge-approved { background: #00ff8818; color: #00ff88; border: 1px solid #00ff8833; }
  .badge-rejected { background: #ff335518; color: #ff3355; border: 1px solid #ff335533; }
  .totem-wrap { display: flex; flex-direction: row; align-items: flex-end; justify-content: center; gap: 16px; margin: 8px 0; }
  .totem-screen { position: relative; width: 110px; aspect-ratio: 0.4 / 1; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid #00f5ff88; animation: ledGlow 3s ease-in-out infinite; transition: all 0.3s; flex-shrink: 0; }
  .totem-screen:hover { border-color: #00f5ff; transform: scale(1.03) translateY(-4px); }
  .totem-screen input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 2; }
  .totem-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(180deg, #080c20 0%, #0d1030 100%); gap: 10px; padding: 12px; }
  .totem-icon { font-size: 32px; filter: drop-shadow(0 0 10px #00f5ff); }
  .totem-text { font-family: 'Orbitron'; font-weight: 900; font-size: 11px; color: #ffffff; letter-spacing: 1px; text-align: center; text-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff; line-height: 1.4; }
  .totem-sub { font-size: 9px; color: #8890c0; font-family: 'Rajdhani'; font-weight: 700; letter-spacing: 1px; text-align: center; }
  .totem-screen::before, .totem-screen::after { content: ''; position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #00f5ff; box-shadow: 0 0 6px #00f5ff; z-index: 3; }
  .totem-screen::before { top: 5px; left: 5px; }
  .totem-screen::after { top: 5px; right: 5px; }
  .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .photo-card { border-radius: 10px; overflow: hidden; border: 2px solid #1a1d35; cursor: pointer; transition: all 0.2s; position: relative; background: #060810; }
  .photo-card:hover { border-color: #00f5ff55; transform: translateY(-3px); box-shadow: 0 8px 24px #00f5ff18; }
  .photo-card.selected { border-color: #00f5ff; box-shadow: 0 0 0 3px #00f5ff18; }
  .photo-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }
  .photo-check { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.6); background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .photo-card.selected .photo-check { background: #00f5ff; border-color: #00f5ff; }
  .photo-meta { padding: 8px 10px; background: #131628; }
  .photo-time { font-size: 10px; color: #5a5f85; font-family: 'Orbitron'; letter-spacing: 1px; margin-top: 4px; }
  .slideshow-wrap { position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; z-index: 50; }
  .slideshow-bar { height: 56px; background: #000; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid #111; flex-shrink: 0; }
  .slideshow-body { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .slideshow-img { max-width: 100%; max-height: 100%; object-fit: contain; animation: fadeInUp 0.8s ease; }
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 6px; }
  .dot-live { background: #00ff88; animation: pulse 2s infinite; box-shadow: 0 0 6px #00ff88; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #131628; border: 1px solid #00f5ff66; color: #e8eaf6; padding: 12px 24px; border-radius: 10px; font-size: 13px; z-index: 999; animation: fadeInUp 0.3s ease; box-shadow: 0 8px 30px #00f5ff18; white-space: nowrap; font-family: 'Rajdhani'; font-weight: 600; }
  .spinner { width: 36px; height: 36px; border: 3px solid #1a1d35; border-top-color: #00f5ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stat-card { background: #060810; border: 1px solid #1a1d35; border-radius: 10px; padding: 14px; text-align: center; }
  .stat-val { font-family: 'Orbitron'; font-weight: 900; font-size: 26px; }
  .stat-label { font-size: 10px; color: #5a5f85; margin-top: 2px; font-family: 'Rajdhani'; letter-spacing: 1px; }
  .evento-header { text-align: center; padding: 32px 20px 20px; }
  .evento-presenta { font-family: 'Rajdhani'; font-size: 12px; color: #5a5f85; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px; }
  .evento-nombre { font-family: 'Orbitron'; font-weight: 700; font-size: 18px; background: linear-gradient(135deg, #60ffff, #ff60cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.3; }
  .filter-tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
  .filter-tab { padding: 6px 14px; border-radius: 7px; border: 1px solid #1a1d35; background: transparent; color: #5a5f85; cursor: pointer; font-family: 'Rajdhani'; font-size: 12px; font-weight: 600; transition: all 0.2s; }
  .filter-tab.active { background: #00f5ff18; border-color: #00f5ff; color: #00f5ff; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1a1d35; border-radius: 2px; }
  @media (max-width: 480px) { .nav-btn { padding: 4px 8px; font-size: 10px; } .card { padding: 16px; } .stat-val { font-size: 20px; } .evento-nombre { font-size: 15px; } .totem-screen { width: 90px; } .photo-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); } }
`;

function BokehBg() {
  const orbs = [
    { w: 200, h: 200, top: "10%", left: "5%", color: "#ff00aa", opacity: 0.12, dur: "12s" },
    { w: 300, h: 300, top: "-5%", right: "10%", color: "#00f5ff", opacity: 0.10, dur: "15s" },
    { w: 150, h: 150, top: "60%", left: "15%", color: "#00f5ff", opacity: 0.08, dur: "10s" },
    { w: 250, h: 250, bottom: "5%", right: "5%", color: "#ff00aa", opacity: 0.10, dur: "18s" },
    { w: 100, h: 100, top: "40%", left: "50%", color: "#ff60cc", opacity: 0.06, dur: "8s" },
  ];
  return (
    <div className="bokeh-bg">
      {orbs.map((o, i) => (
        <div key={i} className="bokeh-orb" style={{ width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom, background: o.color, opacity: o.opacity, animationDuration: o.dur, animationDelay: `${i * 1.5}s` }} />
      ))}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{msg}</div>;
}

function Logo({ size = 20 }) {
  return (
    <div>
      <div className="logo-main" style={{ fontSize: size }}>NEXOLED</div>
      <div className="logo-pix">PIX</div>
    </div>
  );
}

function ViewAsistente({ evento }) {
  const [step, setStep] = useState("upload");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target.result); setStep("preview"); };
    reader.readAsDataURL(f);
  };

  const handleSend = async () => {
    if (!file || !evento) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("fotos").upload(filename, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(filename);
      const { error: dbError } = await supabase.from("fotos").insert({ evento_id: evento.id, url: urlData.publicUrl, status: "pending" });
      if (dbError) throw dbError;
      setStep("sent");
    } catch (e) {
      alert("Error al enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep("upload"); setPreview(null); setFile(null); };

  const NexoledBanner = () => (
    <a href="https://nexoled.vercel.app" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block", marginTop: 24 }}>
      <div style={{ padding: "16px", background: "#131628", border: "1px solid #ff00aa33", borderRadius: 12, textAlign: "center", cursor: "pointer" }}>
        <div style={{ fontSize: 13, fontFamily: "Rajdhani", fontWeight: 700, color: "#e8eaf6", marginBottom: 6 }}>¿Quieres proyectar tus momentos en tu evento?</div>
        <div style={{ fontSize: 12, color: "#5a5f85", fontFamily: "Inter", marginBottom: 10, lineHeight: 1.5 }}>Visita nuestros servicios y contáctanos para personalizar tu fiesta 🎉</div>
        <div style={{ display: "inline-block", padding: "6px 16px", background: "linear-gradient(135deg, #ff00aa, #aa0066)", borderRadius: 20, fontSize: 11, fontFamily: "Rajdhani", fontWeight: 700, color: "#fff", letterSpacing: 1 }}>VISITAR NEXOLED →</div>
      </div>
    </a>
  );

  if (!evento) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#5a5f85" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: "Rajdhani", fontSize: 16 }}>No hay evento activo.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 40px" }}>
      <div className="evento-header">
        <div className="evento-presenta">NexoLED presenta</div>
        <div className="evento-nombre">{evento.nombre}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {step === "upload" && (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div className="card">
              <div className="tag">EVENTO ACTIVO</div>
              <h2 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 20, marginBottom: 6, letterSpacing: 1 }}>Comparte tu momento</h2>
              <p style={{ color: "#5a5f85", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Tu foto aparecerá en la pantalla LED tras ser aprobada.</p>
              <div className="totem-wrap">
                <div className="totem-screen">
                  <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                  <div className="totem-inner">
                    <div className="totem-icon">📸</div>
                    <div className="totem-text">SUBIR FOTO</div>
                    <div className="totem-sub">JPG · PNG · HEIC</div>
                  </div>
                </div>
                <div style={{ width: 75, display: "flex", alignItems: "flex-end", justifyContent: "center", flexShrink: 0 }}>
                  <img src="/nexoled_logo.png" alt="NexoLED" style={{ width: "100%", borderRadius: 8 }} />
                </div>
              </div>
            </div>
            <NexoledBanner />
          </div>
        )}
        {step === "preview" && (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div className="card">
              <div className="tag">PREVISUALIZACIÓN</div>
              <h2 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 20, marginBottom: 14 }}>¿Lista para enviar?</h2>
              <img src={preview} alt="" style={{ width: "100%", borderRadius: 10, aspectRatio: "4/3", objectFit: "cover", marginBottom: 16, border: "1px solid #1a1d35" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={reset} disabled={loading}>Cambiar</button>
                <button className="btn btn-cyan" style={{ flex: 1 }} onClick={handleSend} disabled={loading}>{loading ? "Enviando..." : "Enviar ✨"}</button>
              </div>
            </div>
            <NexoledBanner />
          </div>
        )}
        {step === "sent" && (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <div className="tag">ENVIADA</div>
              <h2 style={{ fontFamily: "Orbitron", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>¡Foto en camino!</h2>
              <p style={{ color: "#5a5f85", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>El operador revisará tu foto. Si es aprobada, aparecerá en la pantalla LED.</p>
              <button className="btn btn-outline" style={{ width: "100%" }} onClick={reset}>Enviar otra foto</button>
            </div>
            <NexoledBanner />
          </div>
        )}
      </div>
    </div>
  );
}

function ViewOperador({ evento, fotos, onRefresh }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("pending");

  const pending = fotos.filter(p => p.status === "pending");
  const visible = fotos.filter(p => p.status === filter);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => { const ids = pending.map(p => p.id); setSelected(s => s.length === ids.length ? [] : ids); };

  const updateStatus = async (ids, status) => {
    await supabase.from("fotos").update({ status }).in("id", ids);
    onRefresh();
  };

  const bulkApprove = async () => { await updateStatus(selected, "approved"); setToast(`✅ ${selected.length} foto(s) aprobadas`); setSelected([]); };
  const bulkReject = async () => { await updateStatus(selected, "rejected"); setToast(`❌ ${selected.length} rechazadas`); setSelected([]); };

  const handleLogin = () => {
    if (!evento) return;
    if (pass === evento.clave_operador || pass === ADMIN_PASSWORD) { setLoggedIn(true); setError(""); }
    else setError("Clave incorrecta");
  };

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, animation: "fadeInUp 0.4s ease" }}>
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: 24 }}><Logo size={22} /><div style={{ color: "#5a5f85", fontSize: 12, marginTop: 8, fontFamily: "Rajdhani", letterSpacing: 2 }}>PANEL DE OPERADOR</div></div>
          <div className="tag">ACCESO RESTRINGIDO</div>
          <h2 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Ingresa tu clave</h2>
          <input className="input" type="password" placeholder="Clave del evento" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ marginBottom: 12 }} />
          {error && <div style={{ color: "#ff3355", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-cyan" style={{ width: "100%" }} onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "18px 16px", maxWidth: 900, margin: "0 auto" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div><Logo size={18} /><div style={{ color: "#5a5f85", fontSize: 11, marginTop: 4, fontFamily: "Rajdhani", letterSpacing: 1 }}>{evento?.nombre}</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot dot-live"></span>
          <span style={{ fontSize: 11, color: "#5a5f85", fontFamily: "Rajdhani" }}>EN VIVO</span>
          <button className="btn btn-sm btn-outline" onClick={onRefresh}>↻</button>
        </div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 18 }}>
        {[["En espera", fotos.filter(p => p.status === "pending").length, "#ff9900"], ["Aprobadas", fotos.filter(p => p.status === "approved").length, "#00ff88"], ["Rechazadas", fotos.filter(p => p.status === "rejected").length, "#ff3355"]].map(([l, v, c]) => (
          <div key={l} className="stat-card"><div className="stat-val" style={{ color: c }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="filter-tabs">
        {["pending", "approved", "rejected"].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "pending" ? "En espera" : f === "approved" ? "Aprobadas" : "Rechazadas"}
          </button>
        ))}
      </div>
      {filter === "pending" && pending.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-sm btn-outline" onClick={toggleAll}>{selected.length === pending.length ? "Deseleccionar todo" : "Seleccionar todo"}</button>
          {selected.length > 0 && <>
            <span style={{ color: "#5a5f85", fontSize: 12, fontFamily: "Rajdhani" }}>{selected.length} seleccionada(s)</span>
            <button className="btn btn-sm btn-success" onClick={bulkApprove}>✅ Aprobar</button>
            <button className="btn btn-sm btn-danger" onClick={bulkReject}>❌ Rechazar</button>
          </>}
        </div>
      )}
      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "#5a5f85" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontFamily: "Rajdhani", fontSize: 15 }}>No hay fotos en esta categoría</div>
        </div>
      ) : (
        <div className="photo-grid">
          {visible.map(photo => (
            <div key={photo.id} className={`photo-card ${selected.includes(photo.id) ? "selected" : ""}`} onClick={() => filter === "pending" && toggleSelect(photo.id)} style={{ cursor: filter === "pending" ? "pointer" : "default" }}>
              <img src={photo.url} alt="" />
              {filter === "pending" && (
                <div className="photo-check">{selected.includes(photo.id) && <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span>}</div>
              )}
              <div className="photo-meta">
                <span className={`badge badge-${photo.status}`}>{photo.status === "pending" ? "PENDIENTE" : photo.status === "approved" ? "APROBADA" : "RECHAZADA"}</span>
                <div className="photo-time">{new Date(photo.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</div>
                {filter === "pending" && !selected.includes(photo.id) && (
                  <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                    <button className="btn btn-sm btn-success" style={{ flex: 1, padding: "6px" }} onClick={e => { e.stopPropagation(); updateStatus([photo.id], "approved"); setToast("✅ Aprobada"); }}>✓</button>
                    <button className="btn btn-sm btn-danger" style={{ flex: 1, padding: "6px" }} onClick={e => { e.stopPropagation(); updateStatus([photo.id], "rejected"); setToast("❌ Rechazada"); }}>✕</button>
                  </div>
                )}
                {(filter === "approved" || filter === "rejected") && (
                  <button className="btn btn-sm btn-warning" style={{ width: "100%", marginTop: 7, padding: "6px", fontSize: 11 }} onClick={e => { e.stopPropagation(); updateStatus([photo.id], "pending"); setToast("↩️ Enviada a revisión"); }}>↩ Revertir</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewPantalla({ fotos, onExit }) {
  const approved = fotos.filter(p => p.status === "approved");
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (approved.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % approved.length), 8000);
    return () => clearInterval(t);
  }, [approved.length]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (current >= approved.length && approved.length > 0) setCurrent(0); }, [approved.length]);

  return (
    <div className="slideshow-wrap">
      <div className="slideshow-bar">
        <Logo size={16} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="dot dot-live"></span>
          <span style={{ fontSize: 10, color: "#444", fontFamily: "Orbitron", letterSpacing: 2 }}>EN VIVO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: "#333", fontFamily: "Orbitron" }}>{approved.length} FOTO{approved.length !== 1 ? "S" : ""}</span>
          <button className="btn btn-sm btn-outline" style={{ fontSize: 10 }} onClick={onExit}>← Salir</button>
        </div>
      </div>
      <div className="slideshow-body">
        {approved.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#222" }}>
            <div style={{ fontSize: 48 }}>📺</div>
            <div style={{ fontFamily: "Orbitron", fontSize: 12, letterSpacing: 2 }}>Esperando fotos aprobadas...</div>
          </div>
        ) : (
          <img key={current} src={approved[current]?.url} alt="" className="slideshow-img" />
        )}
      </div>
    </div>
  );
}

// Admin usa campos controlados directamente desde evento prop — sin useState local para nombre/clave
function ViewAdmin({ evento, fotos, onRefresh }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editClave, setEditClave] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (evento && !initialized) {
      setEditNombre(evento.nombre);
      setEditClave(evento.clave_operador);
      setInitialized(true);
    }
  }, [evento, initialized]);

  const handleSave = async () => {
    if (!evento) return;
    await supabase.from("eventos").update({ nombre: editNombre, clave_operador: editClave }).eq("id", evento.id);
    setToast("✅ Configuración guardada");
    setInitialized(false); // fuerza re-sync con datos frescos
    await onRefresh();
  };

  const handleClear = async () => {
    if (!evento || !window.confirm("¿Borrar todas las fotos del evento?")) return;
    const { data: fotosData } = await supabase.from("fotos").select("url").eq("evento_id", evento.id);
    if (fotosData) {
      const paths = fotosData.map(f => f.url.split("/fotos/")[1]).filter(Boolean);
      if (paths.length) await supabase.storage.from("fotos").remove(paths);
    }
    await supabase.from("fotos").delete().eq("evento_id", evento.id);
    setToast("🗑️ Evento limpiado"); onRefresh();
  };

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, animation: "fadeInUp 0.4s ease" }}>
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: 24 }}><Logo size={22} /><div style={{ color: "#5a5f85", fontSize: 12, marginTop: 8, fontFamily: "Rajdhani", letterSpacing: 2 }}>PANEL ADMINISTRADOR</div></div>
          <div className="tag tag-magenta">SOLO ADMIN</div>
          <h2 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Clave de administrador</h2>
          <input className="input" type="password" placeholder="Clave admin" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && (pass === ADMIN_PASSWORD ? (setLoggedIn(true), setError("")) : setError("Clave incorrecta"))} style={{ marginBottom: 12 }} />
          {error && <div style={{ color: "#ff3355", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-magenta" style={{ width: "100%" }} onClick={() => { if (pass === ADMIN_PASSWORD) { setLoggedIn(true); setError(""); } else setError("Clave incorrecta"); }}>Entrar como Admin</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "18px 16px", maxWidth: 640, margin: "0 auto" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div style={{ marginBottom: 24 }}><div className="tag tag-magenta">ADMINISTRADOR</div><Logo size={22} /></div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 16, marginBottom: 16, letterSpacing: 1 }}>⚙️ Configuración del evento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={{ fontSize: 11, color: "#5a5f85", display: "block", marginBottom: 6, fontFamily: "Orbitron", letterSpacing: 1 }}>Nombre del evento</label><input className="input" value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Ej: Boda de Javier y Paola" /></div>
          <div><label style={{ fontSize: 11, color: "#5a5f85", display: "block", marginBottom: 6, fontFamily: "Orbitron", letterSpacing: 1 }}>Clave del operador</label><input className="input" value={editClave} onChange={e => setEditClave(e.target.value)} /></div>
          <button className="btn btn-cyan btn-sm" onClick={handleSave}>Guardar configuración</button>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 16, marginBottom: 14, letterSpacing: 1 }}>📊 Estado del evento</h3>
        <div className="stat-grid">
          {[["Total", fotos.length, "#00f5ff"], ["Aprobadas", fotos.filter(p => p.status === "approved").length, "#00ff88"], ["Pendientes", fotos.filter(p => p.status === "pending").length, "#ff9900"]].map(([l, v, c]) => (
            <div key={l} className="stat-card"><div className="stat-val" style={{ color: c, fontSize: 22 }}>{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 16, marginBottom: 14, letterSpacing: 1 }}>🛠️ Acciones</h3>
        <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={handleClear}>🗑️ Borrar todas las fotos del evento</button>
        <div style={{ marginTop: 14, padding: 12, background: "#060810", borderRadius: 8, fontSize: 11, color: "#5a5f85", lineHeight: 1.8 }}>
          <strong style={{ color: "#e8eaf6", fontFamily: "Rajdhani" }}>Acceso rápido</strong><br />
          URL: <span style={{ color: "#00f5ff", fontFamily: "Orbitron", fontSize: 10 }}>nexoledpix.vercel.app</span><br />
          Clave operador: <span style={{ color: "#ff00aa", fontFamily: "Orbitron", fontSize: 10 }}>{editClave}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("asistente");
  const [evento, setEvento] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: ev } = await supabase.from("eventos").select("*").eq("activo", true).single();
    setEvento(ev);
    if (ev) {
      const { data: ft } = await supabase.from("fotos").select("*").eq("evento_id", ev.id).order("created_at", { ascending: false });
      setFotos(ft || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!evento) return;
    const channel = supabase.channel("fotos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "fotos" }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [evento]);

  const views = [
    { key: "asistente", label: "📱 Asistente" },
    { key: "operador", label: "🎛️ Operador" },
    { key: "pantalla", label: "📺 Pantalla" },
    { key: "admin", label: "⚙️ Admin" },
  ];

  if (loading) return (
    <>
      <style>{css}</style>
      <BokehBg />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div className="spinner"></div>
        <div style={{ color: "#5a5f85", fontSize: 11, fontFamily: "Orbitron", letterSpacing: 3 }}>CARGANDO NEXOLED PIX</div>
      </div>
    </>
  );

  if (view === "pantalla") return (
    <>
      <style>{css}</style>
      <ViewPantalla fotos={fotos} onExit={() => setView("operador")} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <BokehBg />
      <div className="app-wrap">
        <nav className="nav-bar">
          <span className="nav-label">PIX</span>
          {views.map(v => (
            <button key={v.key} className={`nav-btn ${view === v.key ? "active" : ""}`} onClick={() => setView(v.key)}>{v.label}</button>
          ))}
          {fotos.filter(p => p.status === "pending").length > 0 && (
            <div className="pending-badge">● {fotos.filter(p => p.status === "pending").length} pendiente(s)</div>
          )}
        </nav>
        {view === "asistente" && <ViewAsistente evento={evento} />}
        {view === "operador" && <ViewOperador evento={evento} fotos={fotos} onRefresh={fetchData} />}
        {view === "admin" && <ViewAdmin evento={evento} fotos={fotos} onRefresh={fetchData} />}
      </div>
    </>
  );
}