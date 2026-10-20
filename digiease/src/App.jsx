
import React, { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "senior", icon: "☀", title: "Senior citizens", desc: "A simpler, more comfortable digital experience.", color: "#91F2D5", settings: ["Large text", "Voice guidance", "Simple navigation"] },
  { id: "vision", icon: "◉", title: "Low vision", desc: "Make websites easier to see and navigate.", color: "#A8C7FF", settings: ["High contrast", "Magnification", "Reading assistance"] },
  { id: "students", icon: "✳", title: "Students", desc: "Read smarter and understand content faster.", color: "#D5B8FF", settings: ["Reading ruler", "Bionic reading", "AI summaries"] },
  { id: "other", icon: "✦", title: "Other users", desc: "Personalize your experience for your needs.", color: "#FFCFaa", settings: ["Custom themes", "Language", "Personal settings"] },
];

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German"];

const initialSettings = {
  fontSize: 18,
  contrast: "normal",
  theme: "dark",
  ruler: false,
  mask: false,
  bionic: false,
  lineSpacing: 1.7,
};

export default function App() {
  const [category, setCategory] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("accessibility");
  const [language, setLanguage] = useState("English");
  const [text, setText] = useState("Welcome to DigiEase! This is your accessible reading space. Adjust the text size, try different themes, or use the reading ruler to make reading more comfortable.");
  const [summary, setSummary] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [rulerY, setRulerY] = useState(200);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const update = (key, value) =>
    setSettings((previous) => ({ ...previous, [key]: value }));

  const selectedCategory = CATEGORIES.find((item) => item.id === category);

  useEffect(() => {
    const move = (event) => setRulerY(event.clientY);
    if (settings.ruler || settings.mask) {
      window.addEventListener("mousemove", move);
    }
    return () => window.removeEventListener("mousemove", move);
  }, [settings.ruler, settings.mask]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const readAloud = () => {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech reading is not supported in this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "Hindi" ? "hi-IN" :
        language === "Spanish" ? "es-ES" :
          language === "French" ? "fr-FR" :
            language === "German" ? "de-DE" : "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const makeSummary = () => {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const result = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 3))).join(" ").trim();
    setSummary(result || "Add some text first to create a summary.");
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSummary("");
    if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      setMessage("Text document loaded successfully.");
    } else {
      setMessage("This demo reads TXT files. PDF and DOCX support can be added next.");
    }
  };

  const bionicText = (value) =>
    value.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      const cut = Math.max(1, Math.ceil(word.length / 2));
      return (
        <React.Fragment key={index}>
          <strong>{word.slice(0, cut)}</strong>{word.slice(cut)}
        </React.Fragment>
      );
    });

  const palette = settings.theme === "light"
    ? { bg: "#F5F7FC", panel: "#FFFFFF", text: "#17233A", muted: "#586780", border: "#DDE4EF" }
    : settings.contrast === "high"
      ? { bg: "#000000", panel: "#080808", text: "#FFFFFF", muted: "#FFFFFF", border: "#FFFFFF" }
      : { bg: "#07111F", panel: "#0D1A2C", text: "#EDF2FF", muted: "#9AAAC2", border: "#23334A" };

  const css = `
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, Arial, sans-serif; }
    button, input, select, textarea { font: inherit; }
    button, select, input[type="range"], input[type="file"] { cursor: pointer; }
    button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid #91F2D5; outline-offset: 3px; }
    .de-root {min-height: 100vh;background: ${palette.bg};color: ${palette.text};transition: background .2s, color .2s;}
    .de-root :is(p, h1, h2, h3, a, button, label, li, small, .de-muted, .de-kicker, .de-tag, .de-mini-row, .de-footer) {line-height: ${settings.lineSpacing} !important;}
    .de-wrap { max-width: 1240px; margin: auto; padding: 0 28px; }
    .de-header { display:flex; justify-content:space-between; align-items:center; gap:18px; min-height:78px; border-bottom:1px solid ${palette.border}; }
    .de-brand { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:800; letter-spacing:-1px; }
    .de-logo {
  display: block;
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
}
    .de-nav { display:flex; gap:20px; flex-wrap:wrap; }
    .de-nav button { border:0; background:none; color:${palette.muted}; font-size:13px; padding:10px 0; }
    .de-nav button.active { color:${palette.text}; border-bottom:2px solid #91F2D5; }
    .de-btn { border:1px solid ${palette.border}; border-radius:10px; padding:11px 15px; background:${palette.panel}; color:${palette.text}; }
    .de-btn.primary { background:#91F2D5; border-color:#91F2D5; color:#07111F; font-weight:700; }
    .de-hero { display:grid; grid-template-columns:1.15fr .85fr; align-items:center; gap:36px; padding:66px 0; }
    .de-kicker { color:#65DDBB; font-size:11px; font-weight:800; letter-spacing:1.8px; }
    .de-title { font-size:clamp(38px,5vw,64px); line-height:1.12; letter-spacing:-3px; margin:18px 0; }
    .de-accent { color:#91F2D5; }
    .de-desc { color:${palette.muted}; line-height:1.8; font-size:15px; max-width:560px; }
    .de-hero-card { padding:27px; border:1px solid ${palette.border}; background:${palette.panel}; border-radius:22px; box-shadow:0 20px 60px #00000014; }
    .de-hero-card h3 { margin:0 0 10px; font-size:20px; }
    .de-mini-row { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:15px 0; border-bottom:1px solid ${palette.border}; }
    .de-mini-row:last-child { border:0; }
    .de-dot { width:9px; height:9px; border-radius:50%; background:#91F2D5; display:inline-block; margin-right:8px; }
    .de-section { padding:34px 0 54px; border-top:1px solid ${palette.border}; }
    .de-section h2 { font-size:clamp(24px,3vw,34px); letter-spacing:-1px; margin:8px 0; }
    .de-muted { color:${palette.muted}; line-height:1.7; }
    .de-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-top:25px; }
    .de-category { text-align:left; display:flex; flex-direction:column; min-height:235px; padding:19px; border:1px solid ${palette.border}; border-radius:16px; background:${palette.panel}; color:${palette.text}; transition:transform .2s,border .2s; }
    .de-category:hover { transform:translateY(-3px); }
    .de-category.selected { border:2px solid #91F2D5; padding:18px; }
    .de-cat-icon { width:44px; height:44px; display:grid; place-items:center; border-radius:13px; font-size:22px; margin-bottom:19px; }
    .de-category h3 { margin:0 0 9px; font-size:16px; }
    .de-category p { margin:0; color:${palette.muted}; font-size:12px; line-height:1.7; }
    .de-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:14px; }
    .de-tag { padding:6px 8px; border:1px solid ${palette.border}; border-radius:7px; font-size:10px; color:${palette.muted}; }
    .de-bottom { display:flex; justify-content:space-between; gap:10px; align-items:center; margin-top:auto; padding-top:17px; font-size:12px; }
    .de-layout { display:grid; grid-template-columns:250px minmax(0,1fr); gap:20px; padding:35px 0 60px; }
    .de-sidebar { align-self:start; background:${palette.panel}; border:1px solid ${palette.border}; border-radius:16px; padding:15px; }
    .de-side-button { width:100%; display:flex; align-items:center; gap:10px; text-align:left; border:0; border-radius:9px; padding:12px; color:${palette.muted}; background:transparent; margin:3px 0; }
    .de-side-button.active { background:${settings.theme === "light" ? "#E9F8F3" : "#17382F"}; color:${palette.text}; }
    .de-main { min-width:0; }
    .de-panel { border:1px solid ${palette.border}; background:${palette.panel}; border-radius:16px; padding:23px; margin-bottom:16px; }
    .de-panel h3 { margin:0 0 8px; }
    .de-controls { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px; margin-top:18px; }
    .de-control { padding:15px; border:1px solid ${palette.border}; border-radius:12px; min-width:0; }
    .de-control label { display:block; font-weight:600; font-size:13px; margin-bottom:10px; }
    .de-control select { width:100%; padding:9px; border:1px solid ${palette.border}; border-radius:8px; background:${palette.bg}; color:${palette.text}; }
    .de-control input[type=range] { width:100%; accent-color:#65DDBB; }
    .de-switch { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 0; border-bottom:1px solid ${palette.border}; font-size:13px; }
    .de-switch:last-child { border:0; }
    .de-switch input { width:18px; height:18px; accent-color:#65DDBB; }
    .de-reader { border:1px solid ${palette.border}; border-radius:12px; padding:22px; margin-top:15px; overflow-wrap:anywhere; }
    .de-reader p { margin:0; }
    .de-reader textarea { width:100%; min-height:130px; resize:vertical; padding:12px; border-radius:9px; border:1px solid ${palette.border}; color:${palette.text}; background:${palette.bg}; line-height:1.7; }
    .de-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    .de-status { padding:12px 15px; border-radius:10px; background:${settings.theme === "light" ? "#E7F7F0" : "#122B2B"}; color:${palette.text}; margin-bottom:15px; font-size:13px; }
    .de-footer { border-top:1px solid ${palette.border}; padding:26px 0; color:${palette.muted}; font-size:12px; display:flex; justify-content:space-between; gap:15px; flex-wrap:wrap; }
    .de-ruler { position:fixed; z-index:20; left:0; right:0; height:38px; transform:translateY(-50%); top:${rulerY}px; pointer-events:none; border-top:2px solid #91F2D5; border-bottom:2px solid #91F2D5; background:#91F2D520; }
    .de-mask { position:fixed; z-index:19; left:0; right:0; top:0; height:${Math.max(0, rulerY - 90)}px; background:#00000080; pointer-events:none; }
    @media(max-width:900px) { .de-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .de-hero { grid-template-columns:1fr; padding:45px 0; } .de-layout { grid-template-columns:1fr; } .de-sidebar { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media(max-width:560px) { .de-wrap { padding:0 17px; } .de-header { flex-wrap:wrap; padding:13px 0; } .de-nav { order:3; width:100%; gap:15px; } .de-nav button { font-size:12px; } .de-grid { grid-template-columns:1fr; } .de-category { min-height:210px; } .de-controls { grid-template-columns:1fr; } .de-sidebar { grid-template-columns:1fr 1fr; } .de-title { letter-spacing:-2px; } }
  `;

  const tools = [
    ["Aa", "Text & font", "accessibility"],
    ["◐", "Themes & contrast", "accessibility"],
    ["↔", "Reading ruler", "accessibility"],
    ["▤", "Reading mask", "accessibility"],
    ["B", "Bionic reading", "accessibility"],
    ["♫", "Read aloud", "accessibility"],
    ["文", "Language", "language"],
    ["✧", "Document summary", "documents"],
  ];

  return (
    <div
      className="de-root"
      style={{
        color: palette.text,
        zoom: settings.fontSize / 18
      }}
    >
      <style>{css}</style>

      {(settings.ruler || settings.mask) && (
        <>
          {settings.mask && <div className="de-mask" style={{ height: Math.max(0, rulerY - 20) }} />}
          {settings.ruler && <div className="de-ruler" />}
        </>
      )}

      <div className="de-wrap">
        <header className="de-header">

          <a className="de-brand" href="#home" aria-label="DigiEase home">
            <img
              className="de-logo"
              src="/DigiEase-logo.png"
              alt="DigiEase logo"
              width="44"
              height="44"
            />
            <span>DigiEase<span className="de-accent">.</span></span>
          </a>

          <nav className="de-nav" aria-label="Main navigation">
            <button onClick={() => setActiveTab("accessibility")} className={activeTab === "accessibility" ? "active" : ""}>Accessibility</button>
            <button onClick={() => setActiveTab("language")} className={activeTab === "language" ? "active" : ""}>Language</button>
            <button onClick={() => setActiveTab("documents")} className={activeTab === "documents" ? "active" : ""}>Documents & AI</button>
          </nav>
          <button className="de-btn" onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}>Open dashboard ↗</button>
        </header>

        <section className="de-hero" id="home">
          <div>
            <div className="de-kicker">✦ ACCESSIBILITY, MADE PERSONAL</div>
            <h1 className="de-title">The internet,<br /><span className="de-accent">on your terms.</span></h1>
            <p className="de-desc">A more comfortable digital world starts with you. Personalize how you see, read, hear, and understand the websites you use every day.</p>
            <button className="de-btn primary" onClick={() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })}>Find your experience →</button>
            <p className="de-muted" style={{ fontSize: 12, marginTop: 22 }}>Designed for different needs. Made for everyone.</p>
          </div>
          <div className="de-hero-card">
            <div className="de-kicker">YOUR PERSONAL TOOLKIT</div>
            <h3 style={{ marginTop: 12 }}>A little easier. A lot more accessible.</h3>
            <p className="de-muted" style={{ fontSize: 13 }}>Your settings, your comfort, your way.</p>
            {["Comfortable reading", "Personalized contrast", "Tools for understanding"].map((item) => (
              <div className="de-mini-row" key={item}><span><span className="de-dot" />{item}</span><span>✓</span></div>
            ))}
          </div>
        </section>

        <section className="de-section" id="experience">
          <div className="de-kicker">YOUR JOURNEY STARTS HERE</div>
          <h2>How would you like to use DigiEase?</h2>
          <p className="de-muted">Choose a starting experience. You can change your settings at any time.</p>
          <div className="de-grid">
            {CATEGORIES.map((item) => (
              <button key={item.id} className={`de-category ${category === item.id ? "selected" : ""}`} onClick={() => { setCategory(item.id); if (item.id === "senior") update("fontSize", 22); if (item.id === "vision") update("contrast", "high"); if (item.id === "students") update("bionic", true); }} aria-pressed={category === item.id}>
                <span className="de-cat-icon" style={{ color: item.color, background: `${item.color}18` }}>{item.icon}</span>
                <h3>{item.title}</h3><p>{item.desc}</p>
                <div className="de-tags">{item.settings.map((setting) => <span className="de-tag" key={setting}>{setting}</span>)}</div>
                <div className="de-bottom"><span>{category === item.id ? "Selected ✓" : "Choose experience"}</span><span>→</span></div>
              </button>
            ))}
          </div>
        </section>

        <section className="de-layout" id="dashboard">
          <aside className="de-sidebar" aria-label="Dashboard tools">
            {[["accessibility", "◉", "Accessibility"], ["language", "文", "Language"], ["documents", "▤", "Documents & AI"]].map(([id, icon, label]) => (
              <button key={id} className={`de-side-button ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}><span>{icon}</span>{label}</button>
            ))}
            <div style={{ padding: "15px 10px 5px", fontSize: 11, color: palette.muted }}>YOUR EXPERIENCE</div>
            <div style={{ padding: "5px 10px 10px", fontSize: 13 }}>{selectedCategory ? selectedCategory.title : "Choose a category above"}</div>
          </aside>

          <div className="de-main">
            {message && <div className="de-status" role="status">{message} <button onClick={() => setMessage("")} style={{ float: "right", background: "none", border: 0, color: "inherit" }}>Dismiss</button></div>}

            {activeTab === "accessibility" && <>
              <div className="de-panel">
                <div className="de-kicker">PERSONALIZE YOUR EXPERIENCE</div>
                <h2 style={{ fontSize: 26, marginTop: 8 }}>Accessibility controls</h2>
                <p className="de-muted" style={{ fontSize: 13 }}>Try these controls on the reading sample below. The extension will be needed to apply them to other websites.</p>
                <div className="de-controls">
                  <div className="de-control">
                    <label htmlFor="font-size">Text size: {settings.fontSize}px</label>
                    <input id="font-size" type="range" min="12" max="36" value={settings.fontSize} onChange={(e) => update("fontSize", Number(e.target.value))} />
                    <div className="de-row"><button className="de-btn" onClick={() => update("fontSize", Math.max(12, settings.fontSize - 2))}>A−</button><button className="de-btn" onClick={() => update("fontSize", Math.min(36, settings.fontSize + 2))}>A+</button><button className="de-btn" onClick={() => update("fontSize", 18)}>Reset</button></div>
                  </div>
                  <div className="de-control">
                    <label htmlFor="theme">Display theme</label>
                    <select id="theme" value={settings.theme} onChange={(e) => update("theme", e.target.value)}><option value="dark">Dark navy</option><option value="light">Light theme</option></select>
                    <label htmlFor="contrast" style={{ marginTop: 14 }}>Contrast</label>
                    <select id="contrast" value={settings.contrast} onChange={(e) => update("contrast", e.target.value)}><option value="normal">Standard</option><option value="high">High contrast</option></select>
                  </div>
                  <div className="de-control">
                    <label htmlFor="spacing">Line spacing: {settings.lineSpacing.toFixed(1)}</label>
                    <input id="spacing" type="range" min="1.2" max="2.5" step="0.1" value={settings.lineSpacing} onChange={(e) => update("lineSpacing", Number(e.target.value))} />
                  </div>
                  <div className="de-control">
                    <label>Reading aids</label>
                    {[["ruler", "Reading ruler"], ["mask", "Reading mask"], ["bionic", "Bionic reading"]].map(([key, label]) => <div className="de-switch" key={key}><label htmlFor={key} style={{ margin: 0 }}>{label}</label><input id={key} type="checkbox" checked={settings[key]} onChange={(e) => update(key, e.target.checked)} /></div>)}
                  </div>
                </div>
              </div>

              <div className="de-panel">
                <h3>Try your reading experience</h3>
                <p className="de-muted" style={{ fontSize: 12 }}>Edit this text to preview your settings.</p>
                <div
                  className="de-reader"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineSpacing,
                    filter: settings.contrast === "high" ? "contrast(1.2)" : "none"
                  }}
                >
                  <p
                    style={{
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      margin: 0
                    }}
                  >
                    {settings.bionic ? bionicText(text) : text}
                  </p>
                </div>
                <textarea aria-label="Edit reading sample" value={text} onChange={(e) => setText(e.target.value)} style={{ marginTop: 15 }} />
                <div className="de-row" style={{ marginTop: 12 }}>
                  <button className="de-btn primary" onClick={readAloud}>{speaking ? "■ Stop reading" : "♫ Read aloud"}</button>
                  <button className="de-btn" onClick={() => { update("ruler", !settings.ruler); update("mask", false); }}>{settings.ruler ? "Turn ruler off" : "↔ Turn ruler on"}</button>
                  <button className="de-btn" onClick={() => { update("mask", !settings.mask); update("ruler", false); }}>{settings.mask ? "Turn mask off" : "▤ Turn mask on"}</button>
                </div>
              </div>
            </>}

            {activeTab === "language" && <div className="de-panel">
              <div className="de-kicker">LANGUAGE & UNDERSTANDING</div><h2 style={{ fontSize: 26, marginTop: 8 }}>Your language, your way</h2>
              <p className="de-muted" style={{ fontSize: 13 }}>Choose a language for speech output. Translating website text requires a translation engine, which we can connect later.</p>
              <label htmlFor="language-select" style={{ display: "block", margin: "20px 0 8px", fontWeight: 600 }}>Preferred language</label>
              <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: 12, width: "100%", maxWidth: 350, borderRadius: 9, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}` }}>{LANGUAGES.map((lang) => <option key={lang}>{lang}</option>)}</select>
              <div className="de-reader" style={{ marginTop: 20 }}><h3>Speech language</h3><p className="de-muted">Your selected language is {language}. Available voices depend on the browser and operating system.</p><button className="de-btn primary" onClick={readAloud}>♫ Test voice</button></div>
            </div>}

            {activeTab === "documents" && <div className="de-panel">
              <div className="de-kicker">READ LESS. UNDERSTAND MORE.</div><h2 style={{ fontSize: 26, marginTop: 8 }}>Document reader & summaries</h2>
              <p className="de-muted" style={{ fontSize: 13 }}>Upload a plain-text document or paste content to try the local summary demo. AI-generated summaries and PDF/DOCX support are not connected yet.</p>
              <label htmlFor="document-upload" style={{ display: "block", margin: "20px 0 10px", fontWeight: 600 }}>Upload a TXT document</label>
              <input id="document-upload" type="file" accept=".txt,text/plain" onChange={handleFile} />
              {fileName && <p className="de-muted" style={{ fontSize: 12 }}>Selected file: {fileName}</p>}
              <label htmlFor="document-text" style={{ display: "block", margin: "20px 0 8px", fontWeight: 600 }}>Document text</label>
              <textarea id="document-text" value={text} onChange={(e) => setText(e.target.value)} />
              <div className="de-row" style={{ marginTop: 12 }}><button className="de-btn primary" onClick={makeSummary}>Create quick summary</button><button className="de-btn" onClick={readAloud}>♫ Read document aloud</button></div>
              {summary && <div className="de-reader" aria-live="polite"><h3>Quick summary</h3><p>{summary}</p><p className="de-muted" style={{ fontSize: 11, marginTop: 12 }}>This is a simple local text preview, not an AI-generated summary.</p></div>}
            </div>}
          </div>
        </section>

        <footer className="de-footer"><span><strong>DigiEase.</strong> A more accessible internet, one person at a time.</span><span>Built for everyone ♡</span></footer>
      </div>
    </div>
  );
}
