import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTemplate } from "./templateData";
import "./pagecraftThemes.css";
import "./PublicPortfolio.css";

const API = "http://localhost:5000/api/portfolios";
const SOCIAL_LINKS = ["github", "instagram", "linkedin", "youtube"];

// Templates may share a visual theme while retaining their own portfolio type.
// Keep this mapping aligned with the template IDs in Templates.jsx.
const TEMPLATE_THEME_BY_ID = {
  teacher: "professional",
  student: "student",
  fresher: "minimal",
  "working-professional": "professional",
  entrepreneur: "startup",
  "uiux": "creative",
  "graphic-designer": "creative",
  photographer: "minimal",
  marketing: "startup",
  architect: "minimal",
  writer: "minimal",
  developer: "developer",
  "content-creator": "creative",
};

function safeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function ExternalLink({ href, children }) {
  const url = safeUrl(href);
  return url ? <a href={url} target="_blank" rel="noreferrer">{children}</a> : null;
}

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPortfolio = useCallback(async () => {
    if (!slug) { setError("Portfolio slug is missing."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API}/public/${encodeURIComponent(slug)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Portfolio not found.");
      const item = result?.portfolio ?? result?.data?.portfolio ?? result?.data ?? result;
      if (!item || typeof item !== "object" || !item.title) {
        console.error("Unexpected public portfolio response:", result);
        throw new Error("The server returned incomplete portfolio data.");
      }
      setPortfolio(item);
    } catch (err) {
      console.error("Public portfolio error:", err);
      setError(err.message || "Unable to load portfolio. Please try again.");
    } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  if (loading) return <div className="public-page-message"><h2>Loading portfolio...</h2><p>Please wait.</p></div>;
  if (error || !portfolio) return <div className="public-page-message"><h1>Portfolio not found</h1><p>{error || "This portfolio is unavailable."}</p></div>;

  const content = portfolio.content || {};
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];
  const profile = content.profile || {};
  // `profession` stores the exact selected template ID; `theme` stores its shared
  // color/font theme. Preserve both so the public page knows which preset was chosen.
  const templateId = String(profile.profession || "developer").toLowerCase();
  const themeId = portfolio.theme || TEMPLATE_THEME_BY_ID[templateId] || "developer";
  const design = getTemplate(themeId);
  const theme = design?.theme || {};
  const profileImage = profile.profileImage || blocks.find((b) => b?.type === "hero")?.data?.profileImage || "";
  const profileLinks = profile.links || {};

  const renderBlock = (block, index) => {
    if (!block?.type) return null;
    const data = block.data || {};
    const cls = `pagecraft-block ${block.type}-block`;
    const key = block.id || `${block.type}-${index}`;
    if (block.type === "experience" && data.hidden) return null;

    if (block.type === "hero") {
      const photo = data.profileImage || profileImage;
      const name = data.name || profile.displayName || "Portfolio";
      return <section className={cls} key={key}><div className="hero-content">
        {photo && <div className="hero-photo-area"><img className="hero-profile-image" src={photo} alt={`${name} profile`} /></div>}
        <div className="hero-text"><p className="block-label">HELLO, I'M</p><h1 className="hero-name">{name}</h1>
          {data.role && <h2 className="hero-role">{data.role}</h2>}
          {(data.introduction || data.description) && <p className="hero-description">{data.introduction || data.description}</p>}
          {data.buttonText && <a className="hero-button" href="#contact">{data.buttonText}</a>}
          <div className="hero-public-links">{SOCIAL_LINKS.map((s) => <ExternalLink key={s} href={data.links?.[s] || profileLinks[s]}>{s}</ExternalLink>)}</div>
        </div></div></section>;
    }
    if (block.type === "about") return <section className={cls} key={key}><div className="section-content"><p className="block-label">ABOUT ME</p><h2 className="section-title">{data.title || "About Me"}</h2><p className="section-description">{data.description}</p></div></section>;
    if (block.type === "skills") {
      const skills = String(data.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
      return <section className={cls} key={key}><div className="section-content"><p className="block-label">SKILLS &amp; EXPERTISE</p><h2 className="section-title">{data.title || "Skills & Expertise"}</h2><div className="skills-list">{skills.map((s, i) => <span key={`${s}-${i}`}>{s}</span>)}</div></div></section>;
    }
    if (block.type === "projects") {
      const projects = Array.isArray(data.projects) ? data.projects : [];
      return <section className={cls} key={key}><div className="section-content"><p className="block-label">SELECTED WORK</p><h2 className="section-title">{data.title || "Projects"}</h2>{data.description && <p className="section-description">{data.description}</p>}
        <div className="public-project-grid">{projects.map((p, i) => <article className="public-project-card" key={p.id || i}>
          {p.image && <img className="public-project-image" src={p.image} alt={p.title || "Project"} />}
          <div className="public-project-body"><h3>{p.title || "Project"}</h3>{p.description && <p>{p.description}</p>}
            <div className="public-project-links"><ExternalLink href={p.url}>View project</ExternalLink><ExternalLink href={p.repository}>GitHub repository</ExternalLink></div>
          </div></article>)}</div></div></section>;
    }
    if (block.type === "experience") return <section className={cls} key={key}><div className="section-content"><p className="block-label">EXPERIENCE</p><h2 className="section-title">{data.title || "Experience"}</h2>{data.role && <h3>{data.role}</h3>}{data.company && <h4>{data.company}</h4>}{(data.startDate || data.endDate) && <p>{[data.startDate, data.endDate].filter(Boolean).join(" – ")}</p>}{data.description && <p className="section-description">{data.description}</p>}</div></section>;
    if (block.type === "contact") {
      const links = { ...profileLinks, ...data };
      return <section className={cls} id="contact" key={key}><div className="section-content"><p className="block-label">GET IN TOUCH</p><h2 className="section-title">{data.title || "Let's Connect"}</h2><div className="contact-public-links">
        {data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}{data.phone && <a href={`tel:${data.phone}`}>{data.phone}</a>}{data.location && <span>{data.location}</span>}
        <ExternalLink href={data.website}>Website</ExternalLink>{SOCIAL_LINKS.map((s) => <ExternalLink key={s} href={links[s]}>{s.charAt(0).toUpperCase() + s.slice(1)}</ExternalLink>)}
        </div>{data.footerText && <p className="section-description">{data.footerText}</p>}</div></section>;
    }
    return null;
  };

  return <div className={`public-portfolio pagecraft-template-${templateId}`} data-template={templateId}>
    <header className="public-navbar"><div className="public-brand">Page<span>Craft</span></div><div className="public-portfolio-title">{portfolio.title}</div></header>
    <main className={`public-content portfolio-preview pagecraft-theme-${design?.id || "developer"} pagecraft-template-${templateId}`} data-template={templateId} style={{
      "--primary-color": theme.primary || "#6554d9", "--secondary-color": theme.secondary || "#eae7ff",
      "--background-color": theme.background || "#fff", "--surface-color": theme.surface || "#fff",
      "--text-color": theme.text || "#20283a", "--muted-color": theme.muted || "#7b8496",
      "--portfolio-radius": theme.radius || "14px", fontFamily: theme.font || "Inter, sans-serif"
    }}>
      {blocks.map(renderBlock)}
      <footer className="portfolio-footer">{profile.footer || blocks.find((b) => b?.type === "contact")?.data?.footerText || "Thank you for visiting my portfolio."}<span> · Built with PageCraft</span></footer>
    </main></div>;
}
