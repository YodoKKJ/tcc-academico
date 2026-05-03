import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "./Icon";
import useTheme from "../useTheme";
import { APP_VERSION } from "../version";

const MOBILE_CSS = `
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 60px;
    background: var(--panel);
    border-top: 1px solid var(--line);
    z-index: 150;
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .mobile-nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-3);
    font-size: 9px;
    font-weight: 600;
    font-family: inherit;
    letter-spacing: .03em;
    text-transform: uppercase;
    padding: 6px 4px;
    -webkit-tap-highlight-color: transparent;
    transition: color .12s;
  }
  .mobile-nav-btn.active { color: var(--accent); }

  @media (max-width: 767px) {
    .topbar-row { height: 52px; padding: 0 14px; }
    .brand-sub  { display: none !important; }
    .topnav { display: none !important; }
    .about-wrap { display: none !important; }
    .subnav {
      padding: 6px 12px;
      gap: 6px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .subnav::-webkit-scrollbar { display: none; }
    .snav { flex-shrink: 0; font-size: 12px; }
    main { padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)) !important; }
    .mobile-bottom-nav { display: flex !important; }
  }
`;

const NAV = [
  { id: "inicio",      label: "Início",      icon: "home" },
  { id: "academico",   label: "Acadêmico",   icon: "school",    hasSub: true },
  { id: "pessoas",     label: "Pessoas",     icon: "users",     hasSub: true },
  { id: "lancamentos", label: "Lançamentos", icon: "edit",      hasSub: true },
];

const SUBNAV = {
  academico: [
    { id: "turmas",    label: "Turmas",    icon: "users",     path: "/turmas" },
    { id: "series",    label: "Séries",    icon: "book",      path: "/series" },
    { id: "materias",  label: "Matérias",  icon: "clipboard", path: "/materias" },
    { id: "vinculos",  label: "Vínculos",  icon: "chart",     path: "/vinculos" },
  ],
  pessoas: [
    { id: "alunos",      label: "Alunos",      icon: "users",  path: "/alunos" },
    { id: "professores", label: "Professores", icon: "school", path: "/professores" },
  ],
  lancamentos: [
    { id: "avaliacoes", label: "Avaliações", icon: "clipboard", path: "/avaliacoes" },
    { id: "notas",      label: "Notas",      icon: "edit",      path: "/notas" },
    { id: "chamada",    label: "Chamada",    icon: "check",     path: "/chamada" },
    { id: "boletim",    label: "Boletim",    icon: "chart",     path: "/boletim" },
  ],
};

const SECTION_DEFAULT = {
  inicio:      "/",
  academico:   "/turmas",
  pessoas:     "/alunos",
  lancamentos: "/avaliacoes",
};

const PATH_SECTION = {
  "/":            "inicio",
  "/turmas":      "academico",
  "/series":      "academico",
  "/materias":    "academico",
  "/vinculos":    "academico",
  "/alunos":      "pessoas",
  "/professores": "pessoas",
  "/avaliacoes":  "lancamentos",
  "/notas":       "lancamentos",
  "/chamada":     "lancamentos",
  "/boletim":     "lancamentos",
};

function AboutPopover({ onClose }) {
  const env = window.location.hostname.includes("homolog") ? "Homologação" : "Produção";
  return (
    <div
      style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
        width: 260, background: "var(--panel)", border: "1px solid var(--line)",
        borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,.18)", overflow: "hidden",
      }}
    >
      <div style={{ background: "var(--ink)", padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logo.svg" alt="Acadêmico" style={{ width: 22, height: 22, borderRadius: 4 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: ".02em" }}>Sistema Acadêmico</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontFamily: "var(--font-mono)", letterSpacing: ".08em", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ok)", display: "inline-block" }} />
            v{APP_VERSION}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "grid", gap: 8 }}>
        {[
          { label: "Versão",    value: `v${APP_VERSION}` },
          { label: "Ambiente",  value: env },
          { label: "Build",     value: "2025" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.label}</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-2)", fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: ".06em", display: "flex", justifyContent: "space-between" }}>
        <span>TCC — Gestão Escolar</span>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 10, padding: 0 }}>fechar</button>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef(null);

  const section = PATH_SECTION[location.pathname] || "inicio";
  const page = location.pathname === "/" ? null : location.pathname.slice(1);
  const subs = SUBNAV[section] || [];

  useEffect(() => {
    if (!aboutOpen) return;
    const handler = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [aboutOpen]);

  const handleNav = (n) => {
    const target = SECTION_DEFAULT[n.id] || "/";
    navigate(target);
  };

  return (
    <>
      <style>{MOBILE_CSS}</style>
      <div className="skolyo-ui" data-theme={theme}>
        <header className="topbar">
          <div className="topbar-row">
            <div className="brand">
              <img src="/logo.svg" alt="Acadêmico" />
              <div>
                <div className="brand-name">Acadêmico</div>
                <div className="brand-sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ok)", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>v{APP_VERSION}</span>
                </div>
              </div>
            </div>
            <nav className="topnav">
              {NAV.map(n => (
                <button
                  key={n.id}
                  type="button"
                  className={`tnav ${section === n.id ? "active" : ""}`}
                  onClick={() => handleNav(n)}
                >
                  <Icon name={n.icon} />
                  {n.label}
                  {n.hasSub && <Icon name="chevDown" size={10} />}
                </button>
              ))}
            </nav>
            <div className="top-right">
              <button
                className="icon-btn"
                title={theme === "light" ? "Tema escuro" : "Tema claro"}
                onClick={toggle}
                type="button"
              >
                <Icon name={theme === "light" ? "moon" : "sun"} />
              </button>
              <div ref={aboutRef} style={{ position: "relative" }} className="about-wrap">
                <button
                  className={`icon-btn ${aboutOpen ? "active" : ""}`}
                  title="Sobre"
                  type="button"
                  onClick={() => setAboutOpen(v => !v)}
                >
                  <Icon name="settings" />
                </button>
                {aboutOpen && <AboutPopover onClose={() => setAboutOpen(false)} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--panel)" }}>
                <div className="avatar" style={{ flexShrink: 0 }}>AD</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.1, color: "var(--ink)" }}>Administrador</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</div>
                </div>
              </div>
            </div>
          </div>
          {subs.length > 0 && (
            <div className="subnav">
              {subs.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`snav ${page === s.id ? "active" : ""}`}
                  onClick={() => navigate(s.path)}
                >
                  <Icon name={s.icon} size={13} />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </header>
        <main>{children}</main>
        <nav className="mobile-bottom-nav" aria-label="Navegação principal">
          {NAV.map(n => (
            <button
              key={n.id}
              type="button"
              className={`mobile-nav-btn ${section === n.id ? "active" : ""}`}
              onClick={() => handleNav(n)}
            >
              <Icon name={n.icon} size={22} />
              <span>{n.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
