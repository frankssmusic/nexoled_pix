import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "admin9999";

function getRoute() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (path === "operador") return "operador";
  if (path === "admin") return "admin";
  if (path === "pantalla") return "pantalla";
  return "asistente";
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cossette+Titre:wght@400;700&family=Cossette+Texte:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060810; color: #e8eaf6; font-family: 'Cossette Texte', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .bokeh-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: radial-gradient(ellipse at 20% 50%, #0a0520 0%, #060810 60%); }
  .bokeh-bg::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 15% 25%, #ff00aa22 0%, transparent 35%), radial-gradient(circle at 85% 15%, #00f5ff18 0%, transparent 30%), radial-gradient(circle at 70% 80%, #ff00aa15 0%, transparent 40%), radial-gradient(circle at 30% 75%, #00f5ff12 0%, transparent 35%); }
  .bokeh-orb { position: absolute; border-radius: 50%; filter: blur(60px); animation: floatOrb linear infinite; }
  @keyframes floatOrb { 0%{transform:translateY(0) scale(1);opacity:.6} 33%{transform:translateY(-30px) scale(1.05);opacity:.8} 66%{transform:translateY(15px) scale(.95);opacity:.5} 100%{transform:translateY(0) scale(1);opacity:.6} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes ledGlow { 0%,100%{box-shadow:0 0 12px #00f5ff,0 0 30px #00f5ff44,inset 0 0 20px #00f5ff11} 50%{box-shadow:0 0 6px #00f5ff,0 0 15px #00f5ff22,inset 0 0 10px #00f5ff08} }
  @keyframes logoGlow { 0%,100%{filter:drop-shadow(0 0 8px #00f5ff66)} 50%{filter:drop-shadow(0 0 16px #00f5ffaa)} }
  .app-wrap { position: relative; z-index: 1; min-height: 100vh; }
  .logo-main { font-family:'Cossette Titre',sans-serif; font-weight:700; background:linear-gradient(135deg,#60ffff 0%,#00f5ff 40%,#ff00aa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:3px; animation:logoGlow 3s ease-in-out infinite; }
  .logo-pix { font-family:'Cossette Texte'; font-weight:700; color:#ff00aa; letter-spacing:6px; font-size:9px; text-transform:uppercase; margin-top:-2px; }
  .card { background:#131628; border:1px solid #1a1d35; border-radius:14px; padding:20px; }
  .btn { padding:10px 20px; border-radius:9px; border:none; font-family:'Cossette Texte'; font-weight:700; font-size:14px; cursor:pointer; transition:all 0.2s; letter-spacing:1px; text-transform:uppercase; }
  .btn-cyan { background:linear-gradient(135deg,#00f5ff,#0099bb); color:#000; box-shadow:0 4px 16px #00f5ff44; }
  .btn-cyan:hover { transform:translateY(-2px); }
  .btn-magenta { background:linear-gradient(135deg,#ff00aa,#aa0066); color:#fff; }
  .btn-outline { background:transparent; border:1px solid #252850; color:#8890c0; }
  .btn-outline:hover { border-color:#00f5ff66; color:#00f5ff; background:#00f5ff18; }
  .btn-danger { background:linear-gradient(135deg,#ff3355,#aa0022); color:#fff; }
  .btn-success { background:linear-gradient(135deg,#00ff88,#00aa55); color:#000; }
  .btn-warning { background:linear-gradient(135deg,#ff9900,#cc6600); color:#000; }
  .btn-sm { padding:7px 14px; font-size:12px; border-radius:8px; }
  .btn:disabled { opacity:.35; cursor:not-allowed; transform:none !important; }
  .input { width:100%; padding:11px 14px; border-radius:9px; border:1px solid #1a1d35; background:#060810; color:#e8eaf6; font-family:'Cossette Texte'; font-size:14px; font-weight:700; outline:none; transition:all 0.2s; }
  .input:focus { border-color:#00f5ff; box-shadow:0 0 0 3px #00f5ff18; }
  .input::placeholder { color:#5a5f85; }
  .tag { display:inline-block; padding:2px 8px; border-radius:4px; font-size:8px; font-family:'Cossette Titre'; font-weight:700; background:#00f5ff18; color:#00f5ff; border:1px solid #00f5ff33; letter-spacing:2px; }
  .tag-presenta { display:inline-block; padding:2px 8px; border-radius:4px; font-size:8px; font-family:'Cossette Titre'; font-weight:700; background:#ffffff15; color:#ffffff; border:1px solid #ffffff33; letter-spacing:2px; }
  .tag-magenta { background:#ff00aa18; color:#ff00aa; border-color:#ff00aa33; }
  .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:9px; font-weight:700; font-family:'Cossette Titre'; letter-spacing:1px; }
  .badge-pending { background:#ff990018; color:#ff9900; border:1px solid #ff990033; }
  .badge-approved { background:#00ff8818; color:#00ff88; border:1px solid #00ff8833; }
  .badge-rejected { background:#ff335518; color:#ff3355; border:1px solid #ff335533; }
  .asistente-header { text-align:center; padding:16px 0 8px; }
  .evento-presenta-wrap { margin-bottom:4px; }
  .evento-nombre { font-family:'Cossette Titre'; font-weight:700; font-size:22px; background:linear-gradient(135deg,#60ffff,#ff60cc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.2; margin-top:6px; }
  .totem-center { display:flex; flex-direction:column; align-items:center; gap:12px; margin:12px 0; }
  .totem-logo-top { width:135px; }
  .totem-logo-top img { width:100%; border-radius:8px; }
  .totem-outer { display:flex; flex-direction:column; align-items:center; gap:0; width:100%; }
  .totem-screen { position:relative; width:min(75vw, 280px); aspect-ratio:0.45/1; border-radius:10px 10px 2px 2px; overflow:hidden; cursor:pointer; border:2px solid #00f5ff88; animation:ledGlow 3s ease-in-out infinite; transition:all 0.3s; }
  .totem-screen:hover { border-color:#00f5ff; transform:scale(1.02) translateY(-3px); }
  .totem-screen input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; z-index:2; }
  .totem-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(180deg,#080c20 0%,#0d1030 100%); gap:10px; padding:14px; }
  .totem-icon { font-size:40px; filter:drop-shadow(0 0 10px #00f5ff); }
  .totem-text { font-family:'Cossette Titre'; font-weight:700; font-size:15px; color:#fff; letter-spacing:1px; text-align:center; text-shadow:0 0 10px #00f5ff,0 0 20px #00f5ff; line-height:1.3; }
  .totem-sub { font-size:11px; color:#8890c0; font-family:'Cossette Texte'; font-weight:700; letter-spacing:1px; text-align:center; }
  .totem-screen::before,.totem-screen::after { content:''; position:absolute; width:5px; height:5px; border-radius:50%; background:#00f5ff; box-shadow:0 0 6px #00f5ff; z-index:3; }
  .totem-screen::before { top:5px; left:5px; }
  .totem-screen::after { top:5px; right:5px; }
  .totem-base { display:flex; justify-content:center; gap:28px; margin-top:0; }
  .totem-leg { width:8px; height:18px; background:linear-gradient(180deg,#00f5ff44,#00f5ff22); border:1px solid #00f5ff55; border-top:none; border-radius:0 0 3px 3px; box-shadow:0 4px 8px #00f5ff22; }
  .photo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
  .photo-card { border-radius:10px; overflow:hidden; border:2px solid #1a1d35; cursor:pointer; transition:all 0.2s; position:relative; background:#060810; }
  .photo-card:hover { border-color:#00f5ff55; transform:translateY(-3px); }
  .photo-card.selected { border-color:#00f5ff; box-shadow:0 0 0 3px #00f5ff18; }
  .photo-card img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .photo-check { position:absolute; top:7px; right:7px; width:22px; height:22px; border-radius:50%; border:2px solid rgba(255,255,255,.6); background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; }
  .photo-card.selected .photo-check { background:#00f5ff; border-color:#00f5ff; }
  .photo-meta { padding:8px 10px; background:#131628; }
  .photo-time { font-size:10px; color:#5a5f85; font-family:'Cossette Titre'; letter-spacing:1px; margin-top:4px; }
  .slideshow-wrap { position:fixed; inset:0; background:#000; display:flex; flex-direction:column; z-index:50; }
  .slideshow-bar { height:52px; background:#000; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid #111; flex-shrink:0; }
  .slideshow-body { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
  .slideshow-img { width:100%; height:100%; object-fit:contain; animation:fadeInUp 0.8s ease; }
  .dot { width:7px; height:7px; border-radius:50%; display:inline-block; margin-right:6px; }
  .dot-live { background:#00ff88; animation:pulse 2s infinite; box-shadow:0 0 6px #00ff88; }
  .dot-closed { background:#ff3355; box-shadow:0 0 6px #ff3355; }
  .toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#131628; border:1px solid #00f5ff66; color:#e8eaf6; padding:10px 22px; border-radius:9px; font-size:13px; z-index:999; animation:fadeInUp 0.3s ease; white-space:nowrap; font-family:'Cossette Texte'; font-weight:700; }
  .spinner { width:34px; height:34px; border:3px solid #1a1d35; border-top-color:#00f5ff; border-radius:50%; animation:spin 0.8s linear infinite; }
  .stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .stat-card { background:#060810; border:1px solid #1a1d35; border-radius:10px; padding:12px; text-align:center; }
  .stat-val { font-family:'Cossette Titre'; font-weight:700; font-size:24px; }
  .stat-label { font-size:10px; color:#5a5f85; margin-top:2px; font-family:'Cossette Texte'; letter-spacing:1px; }
  .filter-tabs { display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap; }
  .filter-tab { padding:5px 12px; border-radius:7px; border:1px solid #1a1d35; background:transparent; color:#5a5f85; cursor:pointer; font-family:'Cossette Texte'; font-size:12px; font-weight:700; transition:all 0.2s; }
  .filter-tab.active { background:#00f5ff18; border-color:#00f5ff; color:#00f5ff; }
  .section-title { font-family:'Cossette Titre'; font-weight:700; font-size:15px; margin-bottom:14px; letter-spacing:1px; }
  .field-label { font-size:11px; color:#5a5f85; display:block; margin-bottom:5px; font-family:'Cossette Texte'; font-weight:700; letter-spacing:1px; }
  .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1a1d35; }
  .toggle-label { font-size:13px; font-weight:700; color:#e8eaf6; }
  .toggle-desc { font-size:11px; color:#5a5f85; margin-top:2px; }
  .toggle-switch { width:44px; height:24px; border-radius:12px; background:#1a1d35; position:relative; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
  .toggle-switch.active { background:#00f5ff; }
  .toggle-switch::after { content:''; position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:#fff; transition:all 0.2s; }
  .toggle-switch.active::after { left:22px; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:#1a1d35; border-radius:2px; }
  @media (max-width:480px) {
    .card { padding:16px; }
    .stat-val { font-size:20px; }
    .evento-nombre { font-size:20px; }
    .totem-logo-top { width:120px; }
    .photo-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); }
  }
`;

function BokehBg() {
  const orbs = [
    {w:200,h:200,top:"10%",left:"5%",color:"#ff00aa",opacity:.12,dur:"12s"},
    {w:300,h:300,top:"-5%",right:"10%",color:"#00f5ff",opacity:.10,dur:"15s"},
    {w:150,h:150,top:"60%",left:"15%",color:"#00f5ff",opacity:.08,dur:"10s"},
    {w:250,h:250,bottom:"5%",right:"5%",color:"#ff00aa",opacity:.10,dur:"18s"},
  ];
  return (
    <div className="bokeh-bg">
      {orbs.map((o,i) => (
        <div key={i} className="bokeh-orb" style={{width:o.w,height:o.h,top:o.top,left:o.left,right:o.right,bottom:o.bottom,background:o.color,opacity:o.opacity,animationDuration:o.dur,animationDelay:`${i*1.5}s`}} />
      ))}
    </div>
  );
}

function Toast({msg,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,2500);return()=>clearTimeout(t);},[onDone]);
  return <div className="toast">{msg}</div>;
}

function Logo({size=20}) {
  return (
    <div style={{textAlign:"center"}}>
      <div className="logo-main" style={{fontSize:size}}>NEXOLED</div>
      <div className="logo-pix">PIX</div>
    </div>
  );
}

// =============================================
// VISTA ASISTENTE (público — sube fotos)
// =============================================
function ViewAsistente({evento}) {
  const [step,setStep] = useState("upload");
  const [preview,setPreview] = useState(null);
  const [file,setFile] = useState(null);
  const [loading,setLoading] = useState(false);
  const [autorizada,setAutorizada] = useState(true);
  const fileRef = useRef();

  const mensajeSubida = evento?.mensaje_subida || "SUBIR FOTO";

  const handleFile = (f) => {
    if(!f||!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {setPreview(e.target.result);setStep("preview");};
    reader.readAsDataURL(f);
  };

  const comprimirImagen = (file) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1080;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    };
    img.src = url;
  });

  const handleSend = async () => {
    if(!file||!evento) return;
    setLoading(true);
    try {
      const compressed = await comprimirImagen(file);
      const filename = `${Date.now()}.jpg`;
      const {error:uploadError} = await supabase.storage.from("fotos").upload(filename, compressed, {contentType:"image/jpeg"});
      if(uploadError) throw uploadError;
      const {data:urlData} = supabase.storage.from("fotos").getPublicUrl(filename);
      const {error:dbError} = await supabase.from("fotos").insert({evento_id:evento.id,url:urlData.publicUrl,status:"pending",autorizada});
      if(dbError) throw dbError;
      setStep("sent");
    } catch(e) {
      alert("Error al enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {setStep("upload");setPreview(null);setFile(null);setAutorizada(true);};

  const Banner = () => (
    <a href="https://nexoled.vercel.app" target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block",marginTop:16}}>
      <div style={{padding:"14px",background:"#131628",border:"1px solid #ff00aa33",borderRadius:12,textAlign:"center"}}>
        <div style={{fontSize:14,fontFamily:"Cossette Texte",fontWeight:700,color:"#e8eaf6",marginBottom:4}}>¿Quieres que tu evento tenga momentos así de geniales?</div>
        <div style={{fontSize:12,color:"#5a5f85",marginBottom:10,lineHeight:1.4}}>Visita nuestros servicios y personaliza tu fiesta 🎉</div>
        <div style={{display:"inline-block",padding:"7px 18px",background:"linear-gradient(135deg,#ff00aa,#aa0066)",borderRadius:20,fontSize:12,fontFamily:"Cossette Texte",fontWeight:700,color:"#fff",letterSpacing:1}}>VISITAR NEXOLED →</div>
      </div>
    </a>
  );

  if(!evento || evento.evento_cerrado) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{textAlign:"center",color:"#5a5f85"}}>
        <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
        <div style={{fontFamily:"Cossette Texte",fontSize:16}}>No hay evento activo.</div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 12px 32px"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div className="asistente-header">
          <div className="evento-presenta-wrap">
            <span className="tag-presenta">NEXOLED PRESENTA</span>
          </div>
          <div className="evento-nombre">{evento.nombre}</div>
        </div>

        {step === "upload" && (
          <div style={{animation:"fadeInUp 0.4s ease"}}>
            <div style={{textAlign:"center",marginBottom:10}}>
              <span className="tag" style={{fontSize:"7px"}}>EVENTO ACTIVO</span>
              <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:17,marginTop:6,marginBottom:4,color:"#fff"}}>¡Comparte tu momento!</h2>
              <p style={{color:"#5a5f85",fontSize:13,fontWeight:700}}>Tu foto se agregará a la fila!</p>
            </div>
            <div className="totem-center">
              <div className="totem-logo-top">
                <img src="/nexoled_logo.png" alt="NexoLED" />
              </div>
              <div className="totem-outer">
                <div className="totem-screen">
                  <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} />
                  <div className="totem-inner">
                    <div className="totem-icon">📸</div>
                    <div className="totem-text">{mensajeSubida}</div>
                    <div className="totem-sub">JPG · PNG · HEIC</div>
                  </div>
                </div>
                <div className="totem-base">
                  <div className="totem-leg"></div>
                  <div className="totem-leg"></div>
                </div>
              </div>
            </div>
            <Banner />
          </div>
        )}

        {step === "preview" && (
          <div style={{animation:"fadeInUp 0.4s ease"}}>
            <div className="card">
              <span className="tag">PREVISUALIZACIÓN</span>
              <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:16,marginTop:6,marginBottom:12,color:"#fff"}}>¿Lista para enviar?</h2>
              <img src={preview} alt="" style={{width:"100%",borderRadius:10,aspectRatio:"4/3",objectFit:"cover",marginBottom:14,border:"1px solid #1a1d35"}} />

              <div onClick={()=>setAutorizada(!autorizada)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",marginBottom:12,cursor:"pointer",userSelect:"none"}}>
                <div style={{width:22,height:22,borderRadius:5,border:autorizada?"2px solid #00f5ff":"2px solid #333",background:autorizada?"#00f5ff":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                  {autorizada&&<span style={{fontSize:13,color:"#000",fontWeight:700}}>✓</span>}
                </div>
                <span style={{fontSize:12,color:"#8890c0",lineHeight:1.4}}>Autorizo a NexoPix a utilizar esta foto con fines publicitarios</span>
              </div>

              <div style={{display:"flex",gap:10}}>
                <button className="btn btn-outline" style={{flex:1}} onClick={reset} disabled={loading}>Cambiar</button>
                <button className="btn btn-cyan" style={{flex:1}} onClick={handleSend} disabled={loading}>{loading?"Enviando...":"Enviar ✨"}</button>
              </div>
            </div>
            <Banner />
          </div>
        )}

        {step === "sent" && (
          <div style={{animation:"fadeInUp 0.4s ease"}}>
            <div className="card" style={{textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12}}>🎉</div>
              <span className="tag">ENVIADA</span>
              <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:16,marginTop:6,marginBottom:8,color:"#fff"}}>¡Foto en camino!</h2>
              <p style={{color:"#5a5f85",fontSize:13,marginBottom:20,lineHeight:1.4}}>El operador revisará tu foto. Si es aprobada, ¡aparecerá en la pantalla LED!</p>
              <button className="btn btn-outline" style={{width:"100%"}} onClick={reset}>Enviar otra foto</button>
            </div>
            <Banner />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// VISTA OPERADOR (modera fotos + descarga)
// =============================================
function ViewOperador({evento,fotos,onRefreshFotos,onUpdateEvento}) {
  const [loggedIn, setLoggedIn] = useState(() => {
    const saved = sessionStorage.getItem("op_auth");
    if (!saved) return false;
    const { ts, sv } = JSON.parse(saved);
    if (Date.now() - ts > 8 * 60 * 60 * 1000) return false;
    if (evento && sv !== evento.session_version) return false;
    return true;
  });
  const [registroStep, setRegistroStep] = useState(() => {
    const saved = sessionStorage.getItem("op_auth");
    if (!saved) return "login";
    const { ts, sv } = JSON.parse(saved);
    if (Date.now() - ts > 8 * 60 * 60 * 1000) return "login";
    if (evento && sv !== evento.session_version) return "login";
    return "panel";
  });
  const [pass,setPass] = useState("");
  const [error,setError] = useState("");
  const [opNombre,setOpNombre] = useState("");
  const [opRut,setOpRut] = useState("");
  const [selected,setSelected] = useState([]);
  const [toast,setToast] = useState(null);
  const [filter,setFilter] = useState("pending");
  const [downloading,setDownloading] = useState(false);
  const [editMensaje,setEditMensaje] = useState(evento?.mensaje_subida || "SUBIR FOTO");
  const [mensajeGuardado,setMensajeGuardado] = useState(true);
  const [showOpTerms,setShowOpTerms] = useState(false);

  const opTermsText = `TÉRMINOS Y CONDICIONES PARA OPERADORES — NEXOPIX

Al registrarse como operador de un evento NexoPix, usted declara conocer y aceptar las siguientes condiciones:

1. RESPONSABILIDAD DE MODERACIÓN
Como operador, usted es el responsable directo de aprobar o rechazar las fotografías subidas por los asistentes al evento. Debe rechazar toda imagen que contenga contenido sexual, explícito o inapropiado; imágenes que involucren a menores de edad en contextos inadecuados; contenido que atente contra la moral, honra o dignidad de cualquier persona; imágenes de figuras públicas sin su consentimiento; o cualquier contenido que pueda constituir delito según la legislación chilena.

2. REGISTRO DE IDENTIDAD
Su nombre y RUT quedan registrados como respaldo legal del evento. Esta información podrá ser utilizada como antecedente en caso de que se expongan fotografías constituyentes de delito o que generen perjuicio a terceros.

3. DESCARGA DE FOTOGRAFÍAS
Si el administrador habilita la descarga, usted dispone de un plazo máximo de 24 horas desde la finalización del evento para descargar las fotos. Se recomienda realizar la descarga antes del cierre del evento. NexoPix no garantiza la disponibilidad posterior.

4. USO DE IMÁGENES
NexoPix y NexoLED podrán utilizar las fotografías aprobadas durante su operación con fines promocionales, previo acuerdo con el cliente contratante.

5. ACCIONES LEGALES
NexoPix se reserva el derecho de iniciar acciones legales contra el operador registrado si se demuestra negligencia en la moderación de contenido que resulte en la exhibición de material ilegal o perjudicial, pudiendo entregar los antecedentes a las autoridades competentes.

6. LEGISLACIÓN APLICABLE
Estos términos se rigen por las leyes de la República de Chile, bajo la jurisdicción de los tribunales ordinarios de Punta Arenas.

Última actualización: Mayo 2026`;

  const pending = fotos.filter(p=>p.status==="pending");
  const visible = fotos.filter(p=>p.status===filter);

  const toggleSelect = (id) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const toggleAll = () => {const ids=pending.map(p=>p.id);setSelected(s=>s.length===ids.length?[]:ids);};

  const updateStatus = async (ids,status) => {
    await supabase.from("fotos").update({status}).in("id",ids);
    onRefreshFotos();
  };

  const bulkApprove = async () => {await updateStatus(selected,"approved");setToast(`✅ ${selected.length} foto(s) aprobadas`);setSelected([]);};
  const bulkReject = async () => {await updateStatus(selected,"rejected");setToast(`❌ ${selected.length} rechazadas`);setSelected([]);};

  const handleSaveMensaje = async () => {
    if(!evento) return;
    const {error:saveError} = await supabase.from("eventos").update({mensaje_subida:editMensaje}).eq("id",evento.id);
    if(saveError){setToast("❌ Error al guardar");return;}
    setToast("✅ Mensaje actualizado");
    setMensajeGuardado(true);
    onUpdateEvento({...evento, mensaje_subida:editMensaje});
  };

  const handleDownload = async () => {
    const approved = fotos.filter(p=>p.status==="approved");
    if(approved.length===0){setToast("No hay fotos aprobadas para descargar");return;}
    setDownloading(true);
    try {
      const JSZip = (await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm")).default;
      const zip = new JSZip();
      for(let i=0;i<approved.length;i++){
        const resp = await fetch(approved[i].url);
        const blob = await resp.blob();
        const suffix = approved[i].autorizada === false ? "_NO_AUTORIZADA" : "";
        zip.file(`foto_${i+1}${suffix}.jpg`, blob);
      }
      const content = await zip.generateAsync({type:"blob"});
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${evento?.nombre || "evento"}_fotos.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(`📦 ${approved.length} fotos descargadas`);
    } catch(e) {
      setToast("❌ Error al descargar");
    } finally {
      setDownloading(false);
    }
  };

  const handleLogin = () => {
    if(!evento) return;
    if(evento.evento_cerrado){setError("Evento cerrado. Contacta al administrador.");return;}
    if(pass===evento.clave_operador||pass===ADMIN_PASSWORD){
      setError("");
      if(pass===ADMIN_PASSWORD){
        sessionStorage.setItem("op_auth", JSON.stringify({ ts: Date.now(), sv: evento.session_version||1 }));
        setLoggedIn(true);
        setRegistroStep("panel");
      } else {
        setRegistroStep("terms");
      }
    }
    else setError("Clave incorrecta");
  };

  const validarRut = (rut) => {
    const clean = rut.replace(/\./g,"").trim();
    if(!/^\d{7,8}-[\dkK]$/.test(clean)) return {ok:false,msg:"Formato inválido. Usa: 12345678-9 (sin puntos, con guión)"};
    const [cuerpo, dv] = clean.split("-");
    let suma = 0, mult = 2;
    for(let i=cuerpo.length-1;i>=0;i--){
      suma += parseInt(cuerpo[i]) * mult;
      mult = mult === 7 ? 2 : mult + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalc = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);
    if(dv.toUpperCase() !== dvCalc) return {ok:false,msg:"Dígito verificador incorrecto. Revisa tu RUT"};
    return {ok:true,clean};
  };

  const handleRegistro = async () => {
    if(!opNombre.trim()||!opRut.trim()){setError("Nombre y RUT son obligatorios");return;}
    const rutCheck = validarRut(opRut);
    if(!rutCheck.ok){setError(rutCheck.msg);return;}
    const {error:regError} = await supabase.from("operadores").insert({
      evento_id:evento.id,
      nombre:opNombre.trim(),
      rut:rutCheck.clean
    });
    if(regError){setError("Error al registrar. Intenta de nuevo.");return;}
    sessionStorage.setItem("op_auth", JSON.stringify({ ts: Date.now(), sv: evento.session_version||1 }));
    setLoggedIn(true);
    setRegistroStep("panel");
  };

  if(!loggedIn && registroStep === "login") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:360,animation:"fadeInUp 0.4s ease"}}>
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}><Logo size={20}/><div style={{color:"#5a5f85",fontSize:11,marginTop:6,fontFamily:"Cossette Texte",letterSpacing:2}}>PANEL DE OPERADOR</div></div>
          <span className="tag">ACCESO RESTRINGIDO</span>
          <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:16,marginTop:6,marginBottom:14,color:"#fff"}}>Ingresa tu clave</h2>
          <input className="input" type="password" placeholder="Clave del evento" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{marginBottom:10}} />
          {error&&<div style={{color:"#ff3355",fontSize:12,marginBottom:10}}>{error}</div>}
          <button className="btn btn-cyan" style={{width:"100%"}} onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    </div>
  );

  if(!loggedIn && registroStep === "terms") return (
    <>
      {showOpTerms && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowOpTerms(false)}>
          <div style={{width:"100%",maxWidth:480,maxHeight:"85vh",background:"#131628",border:"1px solid #1a1d35",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #1a1d35",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span className="tag tag-magenta">DOCUMENTO LEGAL — OPERADOR</span>
              <button style={{background:"none",border:"none",color:"#5a5f85",fontSize:20,cursor:"pointer",padding:4}} onClick={()=>setShowOpTerms(false)}>✕</button>
            </div>
            <div style={{padding:"20px",overflowY:"auto",flex:1}}>
              <pre style={{fontFamily:"Cossette Texte",fontSize:12,color:"#c0c4e0",lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0}}>{opTermsText}</pre>
            </div>
          </div>
        </div>
      )}
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{width:"100%",maxWidth:360,animation:"fadeInUp 0.4s ease"}}>
          <div className="card" style={{textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>⚖️</div>
            <span className="tag tag-magenta">ANTES DE CONTINUAR</span>
            <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:17,marginTop:8,marginBottom:10,color:"#fff"}}>Responsabilidad del operador</h2>
            <p style={{color:"#8890c0",fontSize:12,lineHeight:1.6,marginBottom:12,textAlign:"left"}}>
              Como operador, eres responsable de moderar las fotos del evento. Debes rechazar contenido sexual, explícito, que involucre menores, o que dañe la honra de cualquier persona. Tu nombre y RUT quedan registrados como respaldo legal.
            </p>
            <p style={{color:"#8890c0",fontSize:12,lineHeight:1.6,marginBottom:16,textAlign:"left"}}>
              NexoPix se reserva el derecho de iniciar acciones legales en caso de negligencia en la moderación.
            </p>
            <button style={{background:"none",border:"none",color:"#00f5ff",fontSize:12,cursor:"pointer",marginBottom:18,textDecoration:"underline",fontFamily:"Cossette Texte",fontWeight:700}} onClick={()=>setShowOpTerms(true)}>Leer términos completos</button>
            <button className="btn btn-cyan" style={{width:"100%"}} onClick={()=>setRegistroStep("registro")}>Acepto las condiciones</button>
            <button className="btn btn-outline" style={{width:"100%",marginTop:8}} onClick={()=>{setRegistroStep("login");setPass("");setError("");}}>← Volver</button>
          </div>
        </div>
      </div>
    </>
  );

  if(!loggedIn && registroStep === "registro") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:360,animation:"fadeInUp 0.4s ease"}}>
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}><Logo size={20}/><div style={{color:"#5a5f85",fontSize:11,marginTop:6,fontFamily:"Cossette Texte",letterSpacing:2}}>REGISTRO DE OPERADOR</div></div>
          <span className="tag tag-magenta">DATOS OBLIGATORIOS</span>
          <p style={{color:"#5a5f85",fontSize:12,marginTop:8,marginBottom:14,lineHeight:1.5}}>Por seguridad, necesitamos registrar tus datos antes de acceder al panel. Esta información se guarda como respaldo legal del evento.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <label className="field-label">Nombre completo</label>
              <input className="input" placeholder="Ej: Juan Pérez González" value={opNombre} onChange={e=>setOpNombre(e.target.value)} />
            </div>
            <div>
              <label className="field-label">RUT (sin puntos, con guión)</label>
              <input className="input" placeholder="Ej: 12345678-9" value={opRut} onChange={e=>setOpRut(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleRegistro()} />
              <div style={{fontSize:10,color:"#5a5f85",marginTop:4}}>Se valida formato y dígito verificador</div>
            </div>
          </div>
          {error&&<div style={{color:"#ff3355",fontSize:12,marginTop:8}}>{error}</div>}
          <button className="btn btn-cyan" style={{width:"100%",marginTop:14}} onClick={handleRegistro}>Registrarme y entrar</button>
          <button className="btn btn-outline" style={{width:"100%",marginTop:8}} onClick={()=>{setRegistroStep("login");setPass("");setError("");}}>← Volver</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{padding:"16px",maxWidth:900,margin:"0 auto"}}>
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div><Logo size={16}/><div style={{color:"#5a5f85",fontSize:11,marginTop:3,fontFamily:"Cossette Texte",letterSpacing:1}}>{evento?.nombre}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className={`dot ${evento?.evento_cerrado?"dot-closed":"dot-live"}`}></span>
          <span style={{fontSize:11,color:"#5a5f85",fontFamily:"Cossette Texte"}}>{evento?.evento_cerrado?"CERRADO":"EN VIVO"}</span>
          <button className="btn btn-sm btn-outline" onClick={onRefreshFotos} style={{fontWeight:700,fontSize:16,color:"#ffffff"}}>↻</button>
          <button className="btn btn-sm btn-danger" onClick={()=>{sessionStorage.removeItem("op_auth");setLoggedIn(false);setRegistroStep("login");setPass("");}}>Salir</button>
        </div>
      </div>

      <div className="stat-grid" style={{marginBottom:16}}>
        {[["En espera",fotos.filter(p=>p.status==="pending").length,"#ff9900"],["Aprobadas",fotos.filter(p=>p.status==="approved").length,"#00ff88"],["Rechazadas",fotos.filter(p=>p.status==="rejected").length,"#ff3355"]].map(([l,v,c])=>(
          <div key={l} className="stat-card"><div className="stat-val" style={{color:c}}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>

      <div className="card" style={{marginBottom:12}}>
        <h3 className="section-title">✏️ Personalizar pantalla</h3>
        <label className="field-label">Mensaje del botón de subida</label>
        <div style={{display:"flex",gap:8}}>
          <input className="input" value={editMensaje} onChange={e=>{setEditMensaje(e.target.value);setMensajeGuardado(false);}} placeholder="SUBIR FOTO" />
          <button className="btn btn-sm btn-cyan" onClick={handleSaveMensaje} disabled={mensajeGuardado} style={{whiteSpace:"nowrap"}}>Guardar</button>
        </div>
        <div style={{fontSize:11,color:"#5a5f85",marginTop:6}}>Los asistentes verán este mensaje en la pantalla de subida</div>
      </div>

      {evento?.descarga_habilitada && (
        <div className="card" style={{marginBottom:12}}>
          <h3 className="section-title">📥 Descargar fotos</h3>
          <p style={{fontSize:12,color:"#5a5f85",marginBottom:10}}>Descarga todas las fotos aprobadas en un archivo ZIP</p>
          <button className="btn btn-cyan" style={{width:"100%"}} onClick={handleDownload} disabled={downloading||fotos.filter(p=>p.status==="approved").length===0}>
            {downloading?"Preparando descarga...":"📦 Descargar fotos aprobadas"}
          </button>
        </div>
      )}

      <div className="filter-tabs">
        {["pending","approved","rejected"].map(f=>(
          <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f==="pending"?"En espera":f==="approved"?"Aprobadas":"Rechazadas"}
          </button>
        ))}
      </div>
      {filter==="pending"&&pending.length>0&&(
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <button className="btn btn-sm btn-outline" onClick={toggleAll}>{selected.length===pending.length?"Deseleccionar todo":"Seleccionar todo"}</button>
          {selected.length>0&&<>
            <span style={{color:"#5a5f85",fontSize:12}}>{selected.length} seleccionada(s)</span>
            <button className="btn btn-sm btn-success" onClick={bulkApprove}>✅ Aprobar</button>
            <button className="btn btn-sm btn-danger" onClick={bulkReject}>❌ Rechazar</button>
          </>}
        </div>
      )}
      {visible.length===0?(
        <div className="card" style={{textAlign:"center",padding:40,color:"#5a5f85"}}>
          <div style={{fontSize:32,marginBottom:10}}>📭</div>
          <div style={{fontFamily:"Cossette Texte",fontSize:14}}>No hay fotos en esta categoría</div>
        </div>
      ):(
        <div className="photo-grid">
          {visible.map(photo=>(
            <div key={photo.id} className={`photo-card ${selected.includes(photo.id)?"selected":""}`} onClick={()=>filter==="pending"&&toggleSelect(photo.id)} style={{cursor:filter==="pending"?"pointer":"default"}}>
              <img src={photo.url} alt=""/>
              {filter==="pending"&&<div className="photo-check">{selected.includes(photo.id)&&<span style={{fontSize:11,color:"#000",fontWeight:700}}>✓</span>}</div>}
              <div className="photo-meta">
                <span className={`badge badge-${photo.status}`}>{photo.status==="pending"?"PENDIENTE":photo.status==="approved"?"APROBADA":"RECHAZADA"}</span>
                <div className="photo-time">{new Date(photo.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</div>
                {filter==="pending"&&!selected.includes(photo.id)&&(
                  <div style={{display:"flex",gap:5,marginTop:7}}>
                    <button className="btn btn-sm btn-success" style={{flex:1,padding:"6px"}} onClick={e=>{e.stopPropagation();updateStatus([photo.id],"approved");setToast("✅ Aprobada");}}>✓</button>
                    <button className="btn btn-sm btn-danger" style={{flex:1,padding:"6px"}} onClick={e=>{e.stopPropagation();updateStatus([photo.id],"rejected");setToast("❌ Rechazada");}}>✕</button>
                  </div>
                )}
                {(filter==="approved"||filter==="rejected")&&(
                  <button className="btn btn-sm btn-warning" style={{width:"100%",marginTop:7,padding:"6px",fontSize:11}} onClick={e=>{e.stopPropagation();updateStatus([photo.id],"pending");setToast("↩️ Enviada a revisión");}}>↩ Revertir</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// VISTA PANTALLA (slideshow fullscreen)
// =============================================
function ViewPantalla({fotos}) {
  const approved = fotos.filter(p=>p.status==="approved");

  const slides = approved.reduce((acc, foto, i) => {
    acc.push({ type: "foto", data: foto });
    if (approved.length >= 6 && (i + 1) % 6 === 0) acc.push({ type: "qr" });
    return acc;
  }, []);
  if (approved.length > 0 && approved.length < 6) slides.push({ type: "qr" });

  const [current,setCurrent] = useState(0);

  useEffect(()=>{
    if(slides.length<=1) return;
    const t=setInterval(()=>setCurrent(c=>(c+1)%slides.length),5000);
    return()=>clearInterval(t);
  },[slides.length]);

  useEffect(()=>{if(current>=slides.length&&slides.length>0)setCurrent(0);},[slides.length, current]);

  return (
    <div className="slideshow-wrap">
      <div className="slideshow-bar">
        <Logo size={14}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span className="dot dot-live"></span>
          <span style={{fontSize:10,color:"#444",fontFamily:"Cossette Titre",letterSpacing:2}}>EN VIVO</span>
        </div>
        <span style={{fontSize:10,color:"#333",fontFamily:"Cossette Titre"}}>{approved.length} FOTO{approved.length!==1?"S":""}</span>
      </div>
      <div className="slideshow-body">
        {approved.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,color:"#222"}}>
            <div style={{fontSize:44}}>📺</div>
            <div style={{fontFamily:"Cossette Titre",fontSize:11,letterSpacing:2}}>Esperando fotos aprobadas...</div>
          </div>
        ) : slides[current]?.type==="qr" ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",background:"#060810",gap:24}}>
            <div style={{background:"#ffffff",padding:20,borderRadius:20,boxShadow:"0 0 60px #00f5ff44"}}>
              <QRCodeSVG
                value="https://pix.nexoled.cl"
                size={260}
                bgColor="#ffffff"
                fgColor="#060810"
                level="H"
              />
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#00f5ff",fontFamily:"Cossette Titre",fontSize:18,letterSpacing:4,marginBottom:8}}>¡SUBE TU FOTO!</div>
              <div style={{color:"#5a5f85",fontFamily:"Cossette Texte",fontSize:12,letterSpacing:2}}>pix.nexoled.cl</div>
            </div>
          </div>
        ) : (
          <img key={current} src={slides[current]?.data?.url} alt="" className="slideshow-img"/>
        )}
      </div>
    </div>
  );
}

// =============================================
// VISTA ADMIN
// =============================================
function ViewAdmin({evento,fotos,onRefreshFotos,onUpdateEvento}) {
  const [loggedIn,setLoggedIn] = useState(false);
  const [pass,setPass] = useState("");
  const [error,setError] = useState("");
  const [toast,setToast] = useState(null);
  const [editNombre,setEditNombre] = useState(evento?.nombre||"");
  const [editClave,setEditClave] = useState(evento?.clave_operador||"");
  const [editMensaje,setEditMensaje] = useState(evento?.mensaje_subida||"SUBIR FOTO");
  const [descargaHabilitada,setDescargaHabilitada] = useState(evento?.descarga_habilitada||false);
  const [eventoCerrado,setEventoCerrado] = useState(evento?.evento_cerrado||false);
  const [operadores,setOperadores] = useState([]);
  const [showOps,setShowOps] = useState(false);
  const [selectedOps,setSelectedOps] = useState([]);
  const [eventosHist,setEventosHist] = useState([]);
  const [showHist,setShowHist] = useState(false);
  const [creatingEvento,setCreatingEvento] = useState(false);

  useEffect(()=>{
    if(!evento) return;
    setEditNombre(evento.nombre||"");
    setEditClave(evento.clave_operador||"");
    setEditMensaje(evento.mensaje_subida||"SUBIR FOTO");
    setDescargaHabilitada(evento.descarga_habilitada||false);
    setEventoCerrado(evento.evento_cerrado||false);
  },[evento]);

  const fetchOperadores = async () => {
    const {data} = await supabase
      .from("operadores")
      .select("*, eventos(nombre)")
      .order("created_at",{ascending:false});
    setOperadores(data||[]);
    setSelectedOps([]);
  };

  const fetchEventosHistorial = async () => {
    const {data} = await supabase.from("eventos").select("*").eq("activo",false).order("created_at",{ascending:false});
    setEventosHist(data||[]);
  };

  const toggleSelectOp = (id) => setSelectedOps(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const toggleAllOps = () => setSelectedOps(s=>s.length===operadores.length?[]:operadores.map(o=>o.id));

  const deleteSelectedOps = async () => {
    if(!selectedOps.length||!window.confirm(`¿Eliminar ${selectedOps.length} operador(es) del historial?`)) return;
    await supabase.from("operadores").delete().in("id",selectedOps);
    setToast(`🗑️ ${selectedOps.length} registro(s) eliminado(s)`);
    setSelectedOps([]);
    fetchOperadores();
  };

  const exportOperadoresExcel = async () => {
    if(operadores.length===0){setToast("No hay operadores para exportar");return;}
    try {
      const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
      const data = operadores.map(op=>({
        Nombre: op.nombre,
        RUT: op.rut,
        Fecha: new Date(op.created_at).toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit",year:"numeric"}),
        Hora: new Date(op.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"}),
        Evento: op.eventos?.nombre || "Evento eliminado"
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [{wch:25},{wch:14},{wch:12},{wch:8},{wch:25}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Operadores");
      XLSX.writeFile(wb, `operadores_todos_los_eventos.xlsx`);
      setToast(`📊 ${operadores.length} registros exportados`);
    } catch(e) {
      setToast("❌ Error al exportar");
    }
  };

  const handleSave = async () => {
    if(!evento) return;
    const {error:saveError} = await supabase.from("eventos").update({
      nombre:editNombre,
      clave_operador:editClave,
      mensaje_subida:editMensaje
    }).eq("id",evento.id);
    if(saveError){setToast("❌ Error al guardar");return;}
    setToast("✅ Configuración guardada");
    onUpdateEvento({...evento,nombre:editNombre,clave_operador:editClave,mensaje_subida:editMensaje});
  };

  const handleToggleDescarga = async () => {
    const newVal = !descargaHabilitada;
    const {error:err} = await supabase.from("eventos").update({descarga_habilitada:newVal}).eq("id",evento.id);
    if(err){setToast("❌ Error");return;}
    setDescargaHabilitada(newVal);
    setToast(newVal?"📥 Descarga habilitada para operador":"🔒 Descarga deshabilitada");
    onUpdateEvento({...evento,descarga_habilitada:newVal});
  };

  const handleToggleCerrar = async () => {
    const newVal = !eventoCerrado;
    let updates = {evento_cerrado:newVal};

    if(newVal) {
      updates.descarga_habilitada = false;
      updates.session_version = (evento.session_version||1) + 1;
    } else {
      const nuevaClave = Math.random().toString(36).slice(2,8);
      updates.clave_operador = nuevaClave;
      updates.descarga_habilitada = false;
      updates.session_version = (evento.session_version||1) + 1;
      setEditClave(nuevaClave);
    }

    const {error:err} = await supabase.from("eventos").update(updates).eq("id",evento.id);
    if(err){setToast("❌ Error");return;}
    setEventoCerrado(newVal);
    setDescargaHabilitada(false);
    setToast(newVal?"🔒 Evento cerrado — sesiones expiradas":"🔓 Evento reabierto — nueva clave generada");
    onUpdateEvento({...evento,...updates});
  };

  const handleClear = async () => {
    if(!evento||!window.confirm("¿Borrar todas las fotos del evento?")) return;
    const {data:fotosData} = await supabase.from("fotos").select("url").eq("evento_id",evento.id);
    if(fotosData){
      const paths = fotosData.map(f=>f.url.split("/fotos/")[1]).filter(Boolean);
      if(paths.length) await supabase.storage.from("fotos").remove(paths);
    }
    await supabase.from("fotos").delete().eq("evento_id",evento.id);
    setToast("🗑️ Evento limpiado");onRefreshFotos();
  };

  const handleCrearEvento = async () => {
    if(!evento) return;
    if(!evento.evento_cerrado){setToast("⚠️ Cierra el evento actual antes de crear uno nuevo");return;}
    if(!window.confirm("¿Crear un nuevo evento? El evento actual pasará al historial.")) return;
    setCreatingEvento(true);
    try {
      await supabase.from("eventos").update({activo:false}).eq("id",evento.id);

      const nuevaClave = Math.random().toString(36).slice(2,8);
      const {data:nuevoEvento,error:createErr} = await supabase.from("eventos").insert({
        nombre:"TU EVENTO",
        clave_operador:nuevaClave,
        activo:true,
        evento_cerrado:false,
        descarga_habilitada:false,
        mensaje_subida:"SUBIR FOTO",
        session_version:1
      }).select().single();

      if(createErr) throw createErr;

      setEditNombre("TU EVENTO");
      setEditClave(nuevaClave);
      setEditMensaje("SUBIR FOTO");
      setDescargaHabilitada(false);
      setEventoCerrado(false);
      onUpdateEvento(nuevoEvento);
      onRefreshFotos();
      setToast("🎉 Nuevo evento creado — configura el nombre y la clave");
    } catch(e) {
      setToast("❌ Error al crear evento");
    } finally {
      setCreatingEvento(false);
    }
  };

  const handleDownloadHistFotos = async (hist) => {
    const {data:fotosHist} = await supabase.from("fotos").select("*").eq("evento_id",hist.id).eq("status","approved");
    if(!fotosHist||fotosHist.length===0){setToast("No hay fotos aprobadas en ese evento");return;}
    setToast("📦 Preparando descarga...");
    try {
      const JSZip = (await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm")).default;
      const zip = new JSZip();
      for(let i=0;i<fotosHist.length;i++){
        const resp = await fetch(fotosHist[i].url);
        const blob = await resp.blob();
        const suffix = fotosHist[i].autorizada === false ? "_NO_AUTORIZADA" : "";
        zip.file(`foto_${i+1}${suffix}.jpg`, blob);
      }
      const content = await zip.generateAsync({type:"blob"});
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${hist.nombre||"evento"}_fotos.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(`📦 ${fotosHist.length} fotos descargadas`);
    } catch(e) {
      setToast("❌ Error al descargar");
    }
  };

  const handleDeleteHistEvento = async (hist) => {
    if(!window.confirm(`¿Eliminar "${hist.nombre}" y todas sus fotos permanentemente?`)) return;
    const {data:fotosHist} = await supabase.from("fotos").select("url").eq("evento_id",hist.id);
    if(fotosHist){
      const paths = fotosHist.map(f=>f.url.split("/fotos/")[1]).filter(Boolean);
      if(paths.length) await supabase.storage.from("fotos").remove(paths);
    }
    await supabase.from("fotos").delete().eq("evento_id",hist.id);
    await supabase.from("operadores").delete().eq("evento_id",hist.id);
    await supabase.from("eventos").delete().eq("id",hist.id);
    setToast(`🗑️ "${hist.nombre}" eliminado`);
    fetchEventosHistorial();
  };

  if(!loggedIn) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:360,animation:"fadeInUp 0.4s ease"}}>
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}><Logo size={20}/><div style={{color:"#5a5f85",fontSize:11,marginTop:6,fontFamily:"Cossette Texte",letterSpacing:2}}>PANEL ADMINISTRADOR</div></div>
          <span className="tag tag-magenta">SOLO ADMIN</span>
          <h2 style={{fontFamily:"Cossette Titre",fontWeight:700,fontSize:16,marginTop:6,marginBottom:14,color:"#fff"}}>Clave de administrador</h2>
          <input className="input" type="password" placeholder="Clave admin" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pass===ADMIN_PASSWORD?(setLoggedIn(true),setError("")):setError("Clave incorrecta"))} style={{marginBottom:10}} />
          {error&&<div style={{color:"#ff3355",fontSize:12,marginBottom:10}}>{error}</div>}
          <button className="btn btn-magenta" style={{width:"100%"}} onClick={()=>{if(pass===ADMIN_PASSWORD){setLoggedIn(true);setError("");}else setError("Clave incorrecta");}}>Entrar como Admin</button>
        </div>
      </div>
    </div>
  );

  const operadoresPorEvento = operadores.reduce((acc, op) => {
    const eventoNombre = op.eventos?.nombre || "Evento eliminado";
    const eventoId = op.evento_id;
    if (!acc[eventoId]) acc[eventoId] = { nombre: eventoNombre, ops: [] };
    acc[eventoId].ops.push(op);
    return acc;
  }, {});

  return (
    <div style={{padding:"16px",maxWidth:640,margin:"0 auto"}}>
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      <div style={{marginBottom:20}}>
        <span className="tag tag-magenta">ADMINISTRADOR</span>
        <div style={{marginTop:6}}><Logo size={20}/></div>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <h3 className="section-title">📡 Estado del evento</h3>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span className={`dot ${eventoCerrado?"dot-closed":"dot-live"}`} style={{width:10,height:10}}></span>
          <span style={{fontFamily:"Cossette Titre",fontSize:14,color:eventoCerrado?"#ff3355":"#00ff88"}}>{eventoCerrado?"CERRADO":"EN VIVO"}</span>
        </div>
        <div className="stat-grid">
          {[["Total",fotos.length,"#00f5ff"],["Aprobadas",fotos.filter(p=>p.status==="approved").length,"#00ff88"],["Pendientes",fotos.filter(p=>p.status==="pending").length,"#ff9900"]].map(([l,v,c])=>(
            <div key={l} className="stat-card"><div className="stat-val" style={{color:c,fontSize:20}}>{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>

        {eventoCerrado && (
          <button className="btn btn-magenta" style={{width:"100%",marginTop:14}} onClick={handleCrearEvento} disabled={creatingEvento}>
            {creatingEvento?"Creando...":"✨ CREAR NUEVO EVENTO"}
          </button>
        )}
      </div>

      <div className="card" style={{marginBottom:12}}>
        <h3 className="section-title">⚙️ Configuración del evento</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <label className="field-label">Nombre del evento</label>
            <input className="input" value={editNombre} onChange={e=>setEditNombre(e.target.value)} placeholder="Ej: Boda de Javier y Paola"/>
          </div>
          <div>
            <label className="field-label">Clave del operador</label>
            <input className="input" value={editClave} onChange={e=>setEditClave(e.target.value)}/>
          </div>
          <div>
            <label className="field-label">Mensaje pantalla de subida</label>
            <input className="input" value={editMensaje} onChange={e=>setEditMensaje(e.target.value)} placeholder="SUBIR FOTO"/>
            <div style={{fontSize:10,color:"#5a5f85",marginTop:4}}>Se muestra en la pantalla del asistente. Default: SUBIR FOTO</div>
          </div>
          <button className="btn btn-cyan btn-sm" onClick={handleSave}>Guardar configuración</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <h3 className="section-title">🎛️ Controles</h3>

        <div className="toggle-row">
          <div>
            <div className="toggle-label">📥 Descarga de fotos</div>
            <div className="toggle-desc">Permite al operador descargar las fotos aprobadas</div>
          </div>
          <div className={`toggle-switch ${descargaHabilitada?"active":""}`} onClick={handleToggleDescarga}></div>
        </div>

        <div className="toggle-row" style={{borderBottom:"none"}}>
          <div>
            <div className="toggle-label">{eventoCerrado?"🔒 Evento cerrado":"🔓 Evento activo"}</div>
            <div className="toggle-desc">{eventoCerrado?"La clave del operador está expirada":"Al cerrar, la clave expira y la descarga se desactiva"}</div>
          </div>
          <div className={`toggle-switch ${eventoCerrado?"active":""}`} onClick={handleToggleCerrar}></div>
        </div>

        {eventoCerrado && (
          <div style={{marginTop:12,padding:10,background:"#ff335510",border:"1px solid #ff335533",borderRadius:8,fontSize:12,color:"#ff9999",lineHeight:1.6}}>
            ⚠️ Evento cerrado. Los asistentes no pueden subir fotos y las sesiones de operadores están expiradas. Puedes crear un nuevo evento arriba o reabrir este.
          </div>
        )}
      </div>

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <h3 className="section-title" style={{marginBottom:0}}>👤 Historial de operadores</h3>
          <button className="btn btn-sm btn-outline" onClick={()=>{setShowOps(!showOps);if(!showOps)fetchOperadores();}}>{showOps?"Ocultar":"Ver historial"}</button>
        </div>
        {showOps && (
          operadores.length===0 ? (
            <div style={{textAlign:"center",color:"#5a5f85",padding:16,fontSize:13}}>No hay operadores registrados aún</div>
          ) : (
            <>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                <button className="btn btn-sm btn-outline" onClick={toggleAllOps}>{selectedOps.length===operadores.length?"Deseleccionar":"Seleccionar todo"}</button>
                {selectedOps.length>0&&(
                  <button className="btn btn-sm btn-danger" onClick={deleteSelectedOps}>🗑️ Eliminar ({selectedOps.length})</button>
                )}
                <button className="btn btn-sm btn-success" onClick={exportOperadoresExcel}>📊 Exportar Excel</button>
              </div>
              <div style={{fontSize:11,color:"#5a5f85",marginBottom:10}}>{operadores.length} operador(es) en {Object.keys(operadoresPorEvento).length} evento(s)</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {Object.entries(operadoresPorEvento).map(([eventoId, grupo]) => (
                  <div key={eventoId}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontSize:12,fontFamily:"Cossette Titre",fontWeight:700,color:"#ff00aa",letterSpacing:1}}>{grupo.nombre}</span>
                      <span style={{fontSize:10,color:"#5a5f85"}}>({grupo.ops.length})</span>
                      {evento && eventoId === String(evento.id) && <span className="tag" style={{fontSize:"7px"}}>ACTUAL</span>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {grupo.ops.map(op=>(
                        <div key={op.id} onClick={()=>toggleSelectOp(op.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:selectedOps.includes(op.id)?"#00f5ff10":"#060810",borderRadius:8,border:selectedOps.includes(op.id)?"1px solid #00f5ff55":"1px solid #1a1d35",cursor:"pointer",transition:"all 0.2s"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:20,height:20,borderRadius:4,border:selectedOps.includes(op.id)?"2px solid #00f5ff":"2px solid #333",background:selectedOps.includes(op.id)?"#00f5ff":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {selectedOps.includes(op.id)&&<span style={{fontSize:11,color:"#000",fontWeight:700}}>✓</span>}
                            </div>
                            <div>
                              <div style={{fontSize:13,fontWeight:700,color:"#e8eaf6"}}>{op.nombre}</div>
                              <div style={{fontSize:11,color:"#5a5f85"}}>RUT: {op.rut}</div>
                            </div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:10,color:"#5a5f85",fontFamily:"Cossette Titre",letterSpacing:1}}>
                              {new Date(op.created_at).toLocaleDateString("es-CL",{day:"2-digit",month:"short",year:"numeric"})}
                            </div>
                            <div style={{fontSize:9,color:"#444",fontFamily:"Cossette Texte"}}>
                              {new Date(op.created_at).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <h3 className="section-title" style={{marginBottom:0}}>📁 Historial de eventos</h3>
          <button className="btn btn-sm btn-outline" onClick={()=>{setShowHist(!showHist);if(!showHist)fetchEventosHistorial();}}>{showHist?"Ocultar":"Ver historial"}</button>
        </div>
        {showHist && (
          eventosHist.length===0 ? (
            <div style={{textAlign:"center",color:"#5a5f85",padding:16,fontSize:13}}>No hay eventos anteriores</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {eventosHist.map(hist=>(
                <div key={hist.id} style={{padding:"12px",background:"#060810",borderRadius:10,border:"1px solid #1a1d35"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#e8eaf6",fontFamily:"Cossette Titre"}}>{hist.nombre}</div>
                      <div style={{fontSize:10,color:"#5a5f85",marginTop:2}}>
                        Creado: {new Date(hist.created_at).toLocaleDateString("es-CL",{day:"2-digit",month:"short",year:"numeric"})}
                      </div>
                    </div>
                    <span className="badge badge-rejected">CERRADO</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-sm btn-cyan" style={{flex:1,fontSize:10}} onClick={()=>handleDownloadHistFotos(hist)}>📥 Descargar fotos</button>
                    <button className="btn btn-sm btn-danger" style={{flex:1,fontSize:10}} onClick={()=>handleDeleteHistEvento(hist)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="card">
        <h3 className="section-title">🛠️ Acciones</h3>
        <button className="btn btn-danger btn-sm" style={{width:"100%"}} onClick={handleClear}>🗑️ Borrar todas las fotos del evento actual</button>
        <div style={{marginTop:12,padding:10,background:"#060810",borderRadius:8,fontSize:11,color:"#5a5f85",lineHeight:1.8}}>
          <strong style={{color:"#e8eaf6",fontFamily:"Cossette Texte"}}>URLs</strong><br/>
          Asistente: <span style={{color:"#00f5ff",fontFamily:"Cossette Titre",fontSize:9}}>pix.nexoled.cl</span><br/>
          Operador: <span style={{color:"#00f5ff",fontFamily:"Cossette Titre",fontSize:9}}>pix.nexoled.cl/operador</span><br/>
          Admin: <span style={{color:"#00f5ff",fontFamily:"Cossette Titre",fontSize:9}}>pix.nexoled.cl/admin</span><br/>
          Pantalla: <span style={{color:"#00f5ff",fontFamily:"Cossette Titre",fontSize:9}}>pix.nexoled.cl/pantalla</span><br/>
          Clave op: <span style={{color:eventoCerrado?"#ff3355":"#ff00aa",fontFamily:"Cossette Titre",fontSize:9}}>{eventoCerrado?"EXPIRADA":editClave}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// APP ROOT
// =============================================
export default function App() {
  const [view] = useState(getRoute);
  const [evento,setEvento] = useState(null);
  const [fotos,setFotos] = useState([]);
  const [loading,setLoading] = useState(true);
  const eventoIdRef = useRef(null);

  const fetchFotos = useCallback(async (eventoId) => {
    const {data:ft} = await supabase.from("fotos").select("*").eq("evento_id",eventoId).order("created_at",{ascending:false});
    setFotos(ft||[]);
  },[]);

  const handleUpdateEvento = useCallback((newEvento) => {
    setEvento(newEvento);
    if(newEvento && newEvento.id !== eventoIdRef.current) {
      eventoIdRef.current = newEvento.id;
      fetchFotos(newEvento.id);
    }
  },[fetchFotos]);

  useEffect(()=>{
    const init = async () => {
      const {data:ev} = await supabase.from("eventos").select("*").eq("activo",true).single();
      if(ev){
        setEvento(ev);
        eventoIdRef.current = ev.id;
        await fetchFotos(ev.id);
      }
      setLoading(false);
    };
    init();
  },[fetchFotos]);

  useEffect(()=>{
    if(!evento) return;
    const id = eventoIdRef.current;

    if(view === "pantalla") {
      const t = setInterval(()=>fetchFotos(id), 15000);
      return()=>clearInterval(t);
    } else {
      const channel = supabase.channel("fotos-"+id)
        .on("postgres_changes",{event:"*",schema:"public",table:"fotos"},()=>fetchFotos(id))
        .subscribe();
      return()=>supabase.removeChannel(channel);
    }
  },[fetchFotos, view, evento]);

  if(view==="pantalla") return (
    <>
      <style>{css}</style>
      <ViewPantalla fotos={fotos}/>
    </>
  );

  if(loading) return (
    <>
      <style>{css}</style>
      <BokehBg/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:18}}>
        <div className="spinner"></div>
        <div style={{color:"#5a5f85",fontSize:11,fontFamily:"Cossette Titre",letterSpacing:3}}>CARGANDO NEXOLED PIX</div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <BokehBg/>
      <div className="app-wrap">
        {view==="asistente"&&<ViewAsistente evento={evento}/>}
        {view==="operador"&&<ViewOperador evento={evento} fotos={fotos} onRefreshFotos={()=>fetchFotos(eventoIdRef.current)} onUpdateEvento={handleUpdateEvento}/>}
        {view==="admin"&&<ViewAdmin evento={evento} fotos={fotos} onRefreshFotos={()=>fetchFotos(eventoIdRef.current)} onUpdateEvento={handleUpdateEvento}/>}
      </div>
    </>
  );
}