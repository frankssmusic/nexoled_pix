import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "admin9999";

const G = {
  bg: "#0a0a0f", surface: "#12121a", border: "#1e1e2e",
  cyan: "#00f5ff", magenta: "#ff00aa", cyanDim: "#00f5ff22",
  magentaDim: "#ff00aa22", text: "#e8e8f0", muted: "#666680",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; color: ${G.text}; font-family: 'Exo 2', sans-serif; }
  .logo { font-family:'Exo 2'; font-weight:900; font-size:20px; background:linear-gradient(90deg,${G.cyan},${G.magenta}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:2px; }
  .logo-sub { font-size:9px; letter-spacing:4px; color:${G.muted}; font-family:'Space Mono'; }
  .card { background:${G.surface}; border:1px solid ${G.border}; border-radius:14px; padding:22px; }
  .btn { padding:10px 20px; border-radius:9px; border:none; font-family:'Exo 2'; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.2s; }
  .btn-cyan { background:linear-gradient(135deg,${G.cyan},#0088aa); color:#000; }
  .btn-cyan:hover { transform:translateY(-1px); box-shadow:0 0 20px ${G.cyan}44; }
  .btn-magenta { background:linear-gradient(135deg,${G.magenta},#aa0066); color:#fff; }
  .btn-outline { background:transparent; border:1px solid ${G.border}; color:${G.muted}; }
  .btn-outline:hover { border-color:${G.muted}; color:${G.text}; }
  .btn-danger { background:linear-gradient(135deg,#ff3355,#aa0022); color:#fff; }
  .btn-success { background:linear-gradient(135deg,#00ff88,#00aa55); color:#000; }
  .btn-sm { padding:7px 14px; font-size:12px; border-radius:7px; }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .input { width:100%; padding:11px 14px; border-radius:9px; border:1px solid ${G.border}; background:${G.bg}; color:${G.text}; font-family:'Exo 2'; font-size:13px; outline:none; transition:border-color 0.2s; }
  .input:focus { border-color:${G.cyan}; box-shadow:0 0 0 3px ${G.cyanDim}; }
  .input::placeholder { color:${G.muted}; }
  .badge { display:inline-block; padding:2px 9px; border-radius:20px; font-size:10px; font-weight:700; font-family:'Space Mono'; }
  .badge-pending { background:#ff990022; color:#ff9900; border:1px solid #ff990044; }
  .badge-approved { background:#00ff8822; color:#00ff88; border:1px solid #00ff8844; }
  .badge-rejected { background:#ff335522; color:#ff3355; border:1px solid #ff335544; }
  .photo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }
  .photo-card { border-radius:10px; overflow:hidden; border:2px solid ${G.border}; cursor:pointer; transition:all 0.2s; position:relative; background:${G.bg}; }
  .photo-card:hover { border-color:${G.cyan}55; transform:translateY(-2px); }
  .photo-card.selected { border-color:${G.cyan}; box-shadow:0 0 0 3px ${G.cyanDim}; }
  .photo-card img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .photo-check { position:absolute; top:7px; right:7px; width:22px; height:22px; border-radius:50%; border:2px solid #fff; background:transparent; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
  .photo-card.selected .photo-check { background:${G.cyan}; border-color:${G.cyan}; }
  .photo-meta { padding:8px 10px; }
  .photo-time { font-size:10px; color:${G.muted}; font-family:'Space Mono'; }
  .slideshow-wrap { position:fixed; inset:0; background:#000; display:flex; flex-direction:column; z-index:50; }
  .slideshow-bar { height:52px; background:#000; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid #1a1a1a; flex-shrink:0; }
  .slideshow-body { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
  .slideshow-img { max-width:100%; max-height:100%; object-fit:contain; animation:fadeIn 0.7s ease; }
  .tag { display:inline-block; padding:2px 8px; border-radius:4px; font-size:10px; font-family:'Space Mono'; font-weight:700; background:${G.cyanDim}; color:${G.cyan}; border:1px solid ${G.cyan}33; margin-bottom:6px; }
  .status-dot { width:7px; height:7px; border-radius:50%; display:inline-block; margin-right:5px; }
  .dot-live { background:#00ff88; animation:pulse 2s infinite; }
  .upload-zone { border:2px dashed ${G.border}; border-radius:14px; padding:36px 20px; text-align:center; cursor:pointer; transition:all 0.3s; position:relative; }
  .upload-zone:hover { border-color:${G.cyan}; background:${G.cyanDim}; }
  .upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:${G.surface}; border:1px solid ${G.cyan}; color:${G.text}; padding:10px 22px; border-radius:9px; font-size:13px; z-index:999; animation:slideUp 0.3s ease; box-shadow:0 0 16px ${G.cyanDim}; white-space:nowrap; }
  .nav-bar { display:flex; gap:6px; padding:12px 16px; background:${G.surface}cc; backdrop-filter:blur(10px); border-bottom:1px solid ${G.border}; flex-wrap:wrap; position:sticky; top:0; z-index:40; }
  .nav-btn { padding:5px 12px; border-radius:6px; border:1px solid ${G.border}; background:transparent; color:${G.muted}; cursor:pointer; font-family:'Exo 2'; font-size:11px; font-weight:600; transition:all 0.2s; }
  .nav-btn:hover { border-color:${G.cyan}; color:${G.cyan}; }
  .nav-btn.active { background:${G.cyanDim}; border-color:${G.cyan}; color:${G.cyan}; }
  .noise { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(${G.cyanDim} 1px,transparent 1px),linear-gradient(90deg,${G.cyanDim} 1px,transparent 1px); background-size:40px 40px; }
  .orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(70px); opacity:0.12; }
  .wrap { position:relative; z-index:1; }
  @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes animUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .anim-up { animation:animUp 0.35s ease forwards; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:${G.border}; border-radius:2px; }
  .spinner { width:32px; height:32px; border:3px solid ${G.border}; border-top-color:${G.cyan}; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{msg}</div>;
}

function Logo({ size = 20 }) {
  return <div><div className="logo" style={{ fontSize: size }}>NEXOLED</div><div className="logo-sub">PIX</div></div>;
}

// ─── ASISTENTE ───────────────────────────────────────────────────────────────
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
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(filename, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(filename);

      const { error: dbError } = await supabase
        .from("fotos")
        .insert({ evento_id: evento.id, url: urlData.publicUrl, status: "pending" });
      if (dbError) throw dbError;

      setStep("sent");
    } catch (e) {
      alert("Error al enviar la foto. Intenta de nuevo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!evento) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: G.muted }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div>No hay evento activo en este momento.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Logo size={24} />
          <div style={{ color: G.muted, fontSize: 12, marginTop: 8 }}>{evento.nombre}</div>
        </div>

        {step === "upload" && (
          <div className="card anim-up">
            <div className="tag">EVENTO ACTIVO</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Sube tu foto</h2>
            <p style={{ color: G.muted, fontSize: 12, marginBottom: 18 }}>Tu foto aparecerá en la pantalla LED tras ser aprobada.</p>
            <div
              className="upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={e => handleFile(e.target.files[0])}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              />
              <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Toca para seleccionar</div>
              <div style={{ color: G.muted, fontSize: 12 }}>JPG, PNG, HEIC</div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="card anim-up">
            <div className="tag">PREVISUALIZACIÓN</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>¿Lista para enviar?</h2>
            <img src={preview} alt="" style={{ width: "100%", borderRadius: 10, aspectRatio: "4/3", objectFit: "cover", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setStep("upload"); setPreview(null); setFile(null); }} disabled={loading}>Cambiar</button>
              <button className="btn btn-cyan btn-sm" style={{ flex: 1 }} onClick={handleSend} disabled={loading}>
                {loading ? "Enviando..." : "Enviar ✨"}
              </button>
            </div>
          </div>
        )}

        {step === "sent" && (
          <div className="card anim-up" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <div className="tag">ENVIADA</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>¡Foto en camino!</h2>
            <p style={{ color: G.muted, fontSize: 13, marginBottom: 20 }}>El operador revisará tu foto. Si es aprobada, ¡aparecerá en la pantalla!</p>
            <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => { setStep("upload"); setPreview(null); setFile(null); }}>Enviar otra foto</button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 20, color: G.muted, fontSize: 10, fontFamily: "Space Mono" }}>POWERED BY NEXOLED · PUNTA ARENAS</div>
      </div>
    </div>
  );
}

// ─── OPERADOR ────────────────────────────────────────────────────────────────
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

  const bulkApprove = async () => {
    await updateStatus(selected, "approved");
    setToast(`✅ ${selected.length} foto(s) aprobadas`);
    setSelected([]);
  };

  const bulkReject = async () => {
    await updateStatus(selected, "rejected");
    setToast(`❌ ${selected.length} rechazadas`);
    setSelected([]);
  };

  const handleLogin = () => {
    if (!evento) return;
    if (pass === evento.clave_operador || pass === ADMIN_PASSWORD) {
      setLoggedIn(true); setError("");
    } else setError("Clave incorrecta");
  };

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div className="card anim-up">
          <div style={{ textAlign: "center", marginBottom: 20 }}><Logo /><div style={{ color: G.muted, fontSize: 12, marginTop: 6 }}>Panel de Operador</div></div>
          <div className="tag">ACCESO RESTRINGIDO</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Ingresa tu clave</h2>
          <input className="input" type="password" placeholder="Clave del evento" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ marginBottom: 10 }} />
          {error && <div style={{ color: "#ff3355", fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-cyan" style={{ width: "100%" }} onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 18, maxWidth: 860, margin: "0 auto" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="status-dot dot-live"></span>
          <span style={{ fontSize: 12, color: G.muted }}>{evento?.nombre}</span>
          <button className="btn btn-sm btn-outline" onClick={onRefresh}>↻ Actualizar</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {[["En espera", fotos.filter(p => p.status === "pending").length, "#ff9900"],
          ["Aprobadas", fotos.filter(p => p.status === "approved").length, "#00ff88"],
          ["Rechazadas", fotos.filter(p => p.status === "rejected").length, "#ff3355"]].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: "Space Mono" }}>{v}</div>
            <div style={{ fontSize: 11, color: G.muted }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["pending", "approved", "rejected"].map(f => (
          <button key={f} className="btn btn-sm btn-outline"
            style={filter === f ? { borderColor: G.cyan, color: G.cyan, background: G.cyanDim } : {}}
            onClick={() => setFilter(f)}>
            {f === "pending" ? "En espera" : f === "approved" ? "Aprobadas" : "Rechazadas"}
          </button>
        ))}
      </div>

      {filter === "pending" && pending.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-sm btn-outline" onClick={toggleAll}>
            {selected.length === pending.length ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>
          {selected.length > 0 && <>
            <span style={{ color: G.muted, fontSize: 12 }}>{selected.length} seleccionada(s)</span>
            <button className="btn btn-sm btn-success" onClick={bulkApprove}>✅ Aprobar selección</button>
            <button className="btn btn-sm btn-danger" onClick={bulkReject}>❌ Rechazar selección</button>
          </>}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: G.muted }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 13 }}>No hay fotos en esta categoría</div>
        </div>
      ) : (
        <div className="photo-grid">
          {visible.map(photo => (
            <div key={photo.id}
              className={`photo-card ${selected.includes(photo.id) ? "selected" : ""}`}
              onClick={() => filter === "pending" && toggleSelect(photo.id)}
              style={{ cursor: filter === "pending" ? "pointer" : "default" }}>
              <img src={photo.url} alt="" />
              {filter === "pending" && (
                <div className="photo-check">
                  {selected.includes(photo.id) && <span style={{ fontSize: 12, color: "#000", fontWeight: 900 }}>✓</span>}
                </div>
              )}
              <div className="photo-meta">
                <span className={`badge badge-${photo.status}`}>
                  {photo.status === "pending" ? "PENDIENTE" : photo.status === "approved" ? "APROBADA" : "RECHAZADA"}
                </span>
                <div className="photo-time">{new Date(photo.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</div>
                {filter === "pending" && !selected.includes(photo.id) && (
                  <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                    <button className="btn btn-sm btn-success" style={{ flex: 1, padding: "6px" }}
                      onClick={e => { e.stopPropagation(); updateStatus([photo.id], "approved"); setToast("✅ Aprobada"); }}>✓</button>
                    <button className="btn btn-sm btn-danger" style={{ flex: 1, padding: "6px" }}
                      onClick={e => { e.stopPropagation(); updateStatus([photo.id], "rejected"); setToast("❌ Rechazada"); }}>✕</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PANTALLA LED ─────────────────────────────────────────────────────────────
function ViewPantalla({ fotos, onExit }) {
  const approved = fotos.filter(p => p.status === "approved");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (approved.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % approved.length), 7000);
    return () => clearInterval(t);
  }, [approved.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { if (current >= approved.length && approved.length > 0) setCurrent(0); }, [approved.length]);
  return (
    <div className="slideshow-wrap">
      <div className="slideshow-bar">
        <Logo size={16} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="status-dot dot-live"></span>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "Space Mono" }}>EN VIVO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "Space Mono" }}>{approved.length} FOTO{approved.length !== 1 ? "S" : ""}</span>
          <button className="btn btn-sm btn-outline" style={{ fontSize: 10 }} onClick={onExit}>← Salir</button>
        </div>
      </div>
      <div className="slideshow-body">
        {approved.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#333" }}>
            <div style={{ fontSize: 44 }}>📺</div>
            <div style={{ fontFamily: "Space Mono", fontSize: 13 }}>Esperando fotos aprobadas...</div>
          </div>
        ) : (
          <img key={current} src={approved[current]?.url} alt="" className="slideshow-img" />
        )}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function ViewAdmin({ evento, fotos, onRefresh }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [eventName, setEventName] = useState(evento?.nombre || "");
  const [opPass, setOpPass] = useState(evento?.clave_operador || "nexo2024");

  useEffect(() => {
    if (evento) { setEventName(evento.nombre); setOpPass(evento.clave_operador); }
  }, [evento]);

  const handleSave = async () => {
    if (!evento) return;
    await supabase.from("eventos").update({ nombre: eventName, clave_operador: opPass }).eq("id", evento.id);
    setToast("✅ Configuración guardada");
    onRefresh();
  };

  const handleClear = async () => {
    if (!evento) return;
    if (!window.confirm("¿Borrar todas las fotos del evento?")) return;
    const { data: fotosData } = await supabase.from("fotos").select("url").eq("evento_id", evento.id);
    if (fotosData) {
      const paths = fotosData.map(f => f.url.split("/fotos/")[1]).filter(Boolean);
      if (paths.length) await supabase.storage.from("fotos").remove(paths);
    }
    await supabase.from("fotos").delete().eq("evento_id", evento.id);
    setToast("🗑️ Fotos eliminadas");
    onRefresh();
  };

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div className="card anim-up">
          <div style={{ textAlign: "center", marginBottom: 20 }}><Logo /><div style={{ color: G.muted, fontSize: 12, marginTop: 6 }}>Panel Administrador</div></div>
          <div className="tag">SOLO ADMIN</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Clave de administrador</h2>
          <input className="input" type="password" placeholder="Clave admin" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && (pass === ADMIN_PASSWORD ? (setLoggedIn(true), setError("")) : setError("Clave incorrecta"))}
            style={{ marginBottom: 10 }} />
          {error && <div style={{ color: "#ff3355", fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-magenta" style={{ width: "100%" }}
            onClick={() => { if (pass === ADMIN_PASSWORD) { setLoggedIn(true); setError(""); } else setError("Clave incorrecta"); }}>
            Entrar como Admin
          </button>
          <div style={{ marginTop: 10, fontSize: 10, color: G.muted, textAlign: "center", fontFamily: "Space Mono" }}>(demo: admin9999)</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 18, maxWidth: 640, margin: "0 auto" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div style={{ marginBottom: 22 }}><div className="tag">ADMINISTRADOR</div><Logo size={22} /></div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⚙️ Configuración del evento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div><label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 5 }}>Nombre del evento</label>
            <input className="input" value={eventName} onChange={e => setEventName(e.target.value)} /></div>
          <div><label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 5 }}>Clave del operador</label>
            <input className="input" value={opPass} onChange={e => setOpPass(e.target.value)} /></div>
          <button className="btn btn-cyan btn-sm" onClick={handleSave}>Guardar configuración</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📊 Estado del evento</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[["Total", fotos.length, G.cyan],
            ["Aprobadas", fotos.filter(p => p.status === "approved").length, "#00ff88"],
            ["Pendientes", fotos.filter(p => p.status === "pending").length, "#ff9900"]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", padding: 12, background: G.bg, borderRadius: 9 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: c, fontFamily: "Space Mono" }}>{v}</div>
              <div style={{ fontSize: 10, color: G.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🛠️ Acciones</h3>
        <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={handleClear}>
          🗑️ Borrar todas las fotos del evento
        </button>
        <div style={{ marginTop: 14, padding: 12, background: G.bg, borderRadius: 8, fontSize: 11, color: G.muted }}>
          <strong style={{ color: G.text }}>Info del evento activo</strong><br />
          Clave operador: <span style={{ color: G.magenta, fontFamily: "Space Mono" }}>{opPass}</span>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
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

  // Realtime — escucha cambios en fotos
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
    { key: "pantalla", label: "📺 Pantalla LED" },
    { key: "admin", label: "⚙️ Admin" },
  ];

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div className="spinner"></div>
        <div style={{ color: G.muted, fontSize: 13, fontFamily: "Space Mono" }}>Cargando NexoLED Pix...</div>
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
      <div className="noise"></div>
      <div className="orb" style={{ background: G.cyan, width: 300, height: 300, top: -80, right: -80 }}></div>
      <div className="orb" style={{ background: G.magenta, width: 220, height: 220, bottom: -60, left: -60 }}></div>
      <div className="wrap">
        <nav className="nav-bar">
          <span style={{ color: G.muted, fontSize: 10, alignSelf: "center", fontFamily: "Space Mono", marginRight: 6 }}>NEXOLED PIX:</span>
          {views.map(v => (
            <button key={v.key} className={`nav-btn ${view === v.key ? "active" : ""}`} onClick={() => setView(v.key)}>{v.label}</button>
          ))}
          {fotos.filter(p => p.status === "pending").length > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#ff9900", alignSelf: "center", fontFamily: "Space Mono" }}>
              ● {fotos.filter(p => p.status === "pending").length} pendiente(s)
            </span>
          )}
        </nav>
        {view === "asistente" && <ViewAsistente evento={evento} />}
        {view === "operador" && <ViewOperador evento={evento} fotos={fotos} onRefresh={fetchData} />}
        {view === "admin" && <ViewAdmin evento={evento} fotos={fotos} onRefresh={fetchData} />}
      </div>
    </>
  );
}