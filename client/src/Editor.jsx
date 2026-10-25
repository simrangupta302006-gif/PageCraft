
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplate } from "./templateData";
import "./pagecraftThemes.css";
import "./Editor.css";

const API = "http://localhost:5000/api/portfolios";

const SOCIAL_LINKS = ["github", "instagram", "linkedin", "youtube"];

const themeOptions = [
  { id: "developer", name: "Developer", color: "#172033" },
  { id: "creative", name: "Creative", color: "#a34e80" },
  { id: "student", name: "Student", color: "#3478c8" },
  { id: "professional", name: "Professional", color: "#246b75" },
  { id: "minimal", name: "Minimal", color: "#4c4943" },
  { id: "startup", name: "Startup", color: "#168778" }
];

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createBlock = (type) => {
  const defaults = {
    hero: {
      name: "Your Name",
      role: "Your Professional Title",
      description: "Introduce yourself and explain what you do.",
      introduction: "Welcome to my portfolio.",
      buttonText: "Contact Me",
      profileImage: "",
      links: {
        github: "",
        instagram: "",
        linkedin: "",
        youtube: ""
      }
    },
    about: {
      title: "About Me",
      description: "Tell visitors about yourself, your background and your goals."
    },
    skills: {
      title: "Skills & Expertise",
      skills: "Add your skills, separated by commas."
    },
    projects: {
      title: "Featured Projects",
      description: "Showcase your best work.",
      projects: [
        {
          id: createId(),
          title: "Project One",
          description: "Describe your project.",
          image: "",
          url: "",
          repository: ""
        }
      ]
    },
    experience: {
      title: "Experience",
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      hidden: false
    },
    contact: {
      title: "Let's Connect",
      email: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      footerText: "Thank you for visiting my portfolio."
    }
  };

  return {
    id: createId(),
    type,
    data: structuredClone(defaults[type] || {})
  };
};

async function imageToDataUrl(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Please choose an image smaller than 12 MB.");
  }

  const image = new Image();
  const source = URL.createObjectURL(file);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = source;
    });

    const maxDimension = 1200;
    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to process this image.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const result = canvas.toDataURL("image/jpeg", 0.78);

    if (result.length > 2_000_000) {
      throw new Error(
        "This image is still too large. Please select a smaller image."
      );
    }

    return result;
  } finally {
    URL.revokeObjectURL(source);
  }
}

function safeUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function ExternalLink({ href, children }) {
  const url = safeUrl(href);

  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const profilePhotoInput = useRef(null);
  const projectPhotoInput = useRef(null);

  const [portfolio, setPortfolio] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [themeId, setThemeId] = useState("developer");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [photoTarget, setPhotoTarget] = useState(null);

  const [profile, setProfile] = useState({
    profession: "",
    displayName: "",
    profileImage: "",
    links: {
      github: "",
      instagram: "",
      linkedin: "",
      youtube: ""
    },
    footer: ""
  });

  const token = () => localStorage.getItem("token");

  const getAuthHeaders = (json = false) => ({
    Authorization: `Bearer ${token()}`,
    ...(json ? { "Content-Type": "application/json" } : {})
  });

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setHydrated(false);
    setError("");

    try {
      const response = await fetch(API, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load your portfolios.");
      }

      const list = Array.isArray(data) ? data : data.portfolios || [];
      const current = list.find((item) => item._id === id);

      if (!current) {
        throw new Error(
          "Portfolio not found. Return to the dashboard and try again."
        );
      }

      setPortfolio(current);
      setThemeId(current.theme || "developer");

      const content = current.content || {};
      const loadedBlocks = Array.isArray(content.blocks)
        ? content.blocks
        : [];

      const normalizedBlocks = loadedBlocks.map((block) => ({
        ...block,
        id: block.id || createId(),
        data: block.data || {}
      }));

      setBlocks(normalizedBlocks);

      setProfile({
        profession: content.profile?.profession || "",
        displayName: content.profile?.displayName || "",
        profileImage: content.profile?.profileImage || "",
        links: Object.fromEntries(
          SOCIAL_LINKS.map((key) => [
            key,
            content.profile?.links?.[key] || ""
          ])
        ),
        footer: content.profile?.footer || ""
      });

      setActiveBlockId(normalizedBlocks[0]?.id || "");
      setHydrated(true);
    } catch (err) {
      setError(err.message || "Unable to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!token()) {
      navigate("/login");
      return;
    }

    loadPortfolio();
  }, [loadPortfolio, navigate]);

  const updateBlock = (blockId, field, value) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              data: { ...block.data, [field]: value }
            }
          : block
      )
    );
  };

  const updateProject = (blockId, projectId, field, value) => {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId) return block;

        const projects = Array.isArray(block.data.projects)
          ? block.data.projects
          : [];

        return {
          ...block,
          data: {
            ...block.data,
            projects: projects.map((project) =>
              project.id === projectId
                ? { ...project, [field]: value }
                : project
            )
          }
        };
      })
    );
  };

  const updateProfileLink = (field, value) => {
    setProfile((current) => ({
      ...current,
      links: { ...current.links, [field]: value }
    }));
  };

  const addBlock = (type, index = blocks.length) => {
    const block = createBlock(type);

    setBlocks((current) => {
      const next = [...current];
      next.splice(index, 0, block);
      return next;
    });

    setActiveBlockId(block.id);
    setNotice(`${type.charAt(0).toUpperCase() + type.slice(1)} section added.`);
    setError("");
  };

  const deleteBlock = (blockId) => {
    if (!window.confirm("Delete this section from your portfolio?")) return;

    setBlocks((current) => current.filter((block) => block.id !== blockId));

    if (activeBlockId === blockId) {
      setActiveBlockId("");
    }
  };

  const duplicateBlock = (block) => {
    const copy = structuredClone(block);
    copy.id = createId();

    setBlocks((current) => {
      const index = current.findIndex((item) => item.id === block.id);
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });

    setActiveBlockId(copy.id);
  };

  const moveBlock = (blockId, direction) => {
    setBlocks((current) => {
      const from = current.findIndex((block) => block.id === blockId);
      const to = from + direction;

      if (from < 0 || to < 0 || to >= current.length) return current;

      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const onBlockDragStart = (event, blockId) => {
    event.dataTransfer.setData("pagecraft/block-id", blockId);
    event.dataTransfer.effectAllowed = "move";
  };

  // Scroll the document while a dragged block is near the top or bottom edge.
  // The editor canvas itself is not a scroll container, so the document is the target.
  const handleBlockDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isNewSection = Array.from(event.dataTransfer.types || []).includes(
      "pagecraft/new-type"
    );
    event.dataTransfer.dropEffect = isNewSection ? "copy" : "move";

    const edgeSize = 100;
    const maxSpeed = 22;
    const pointerY = event.clientY;
    const viewportHeight = window.innerHeight;

    if (pointerY < edgeSize) {
      const speed = Math.max(2, Math.ceil(maxSpeed * (1 - pointerY / edgeSize)));
      window.scrollBy({ top: -speed, behavior: "auto" });
    } else if (pointerY > viewportHeight - edgeSize) {
      const distance = viewportHeight - pointerY;
      const speed = Math.max(2, Math.ceil(maxSpeed * (1 - distance / edgeSize)));
      window.scrollBy({ top: speed, behavior: "auto" });
    }
  };

  const onBlockDrop = (event, targetId) => {
    event.preventDefault();
    event.stopPropagation();

    const newType = event.dataTransfer.getData("pagecraft/new-type");
    const targetElement = event.currentTarget;
    const targetRect = targetElement.getBoundingClientRect();
    const insertAfter = event.clientY >= targetRect.top + targetRect.height / 2;

    if (newType) {
      const targetIndex = blocks.findIndex((block) => block.id === targetId);
      const insertIndex = targetIndex === -1
        ? blocks.length
        : targetIndex + (insertAfter ? 1 : 0);

      addBlock(newType, insertIndex);
      return;
    }

    const draggedId = event.dataTransfer.getData("pagecraft/block-id");
    if (!draggedId || draggedId === targetId) return;

    setBlocks((current) => {
      const fromIndex = current.findIndex((block) => block.id === draggedId);
      if (fromIndex === -1) return current;

      const next = [...current];
      const [movedBlock] = next.splice(fromIndex, 1);
      const targetIndexAfterRemoval = next.findIndex((block) => block.id === targetId);
      if (targetIndexAfterRemoval === -1) {
        next.push(movedBlock);
        return next;
      }

      const insertIndex = targetIndexAfterRemoval + (insertAfter ? 1 : 0);
      next.splice(insertIndex, 0, movedBlock);
      return next;
    });
  };
  

  const handleImageUpload = async (event, target) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setNotice("");

    try {
      const image = await imageToDataUrl(file);

      if (target.kind === "profile") {
        setProfile((current) => ({
          ...current,
          profileImage: image
        }));

        setBlocks((current) =>
          current.map((block) =>
            block.type === "hero"
              ? {
                  ...block,
                  data: { ...block.data, profileImage: image }
                }
              : block
          )
        );
      } else {
        updateProject(target.blockId, target.projectId, "image", image);
      }

      setNotice("Image added. Save your portfolio to keep the change.");
    } catch (err) {
      setError(err.message || "Could not process the image.");
    }
  };

  const removeProfilePhoto = () => {
    setProfile((current) => ({ ...current, profileImage: "" }));

    setBlocks((current) =>
      current.map((block) =>
        block.type === "hero"
          ? { ...block, data: { ...block.data, profileImage: "" } }
          : block
      )
    );
  };

  const savePortfolio = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const hero = blocks.find((block) => block.type === "hero");

      const content = {
        blocks,
        profile: {
          ...profile,
          displayName: hero?.data?.name || profile.displayName,
          profileImage:
            hero?.data?.profileImage || profile.profileImage
        }
      };

      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          title: portfolio?.title || "My Portfolio",
          theme: themeId,
          content
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save portfolio.");
      }

      const savedPortfolio = data.portfolio || data;

      setPortfolio((current) => ({
        ...current,
        ...savedPortfolio,
        content,
        theme: themeId
      }));

      setNotice("Portfolio saved successfully.");
      return true;
    } catch (err) {
      setError(err.message || "Unable to save portfolio.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Automatically persist edits after the user pauses typing/changing settings.
  // This keeps edits when navigating away and reopening the same portfolio.
  useEffect(() => {
    if (!hydrated || loading || !id || !token()) return undefined;

    const timeoutId = window.setTimeout(async () => {
      const hero = blocks.find((block) => block.type === "hero");
      const content = {
        blocks,
        profile: {
          ...profile,
          displayName: hero?.data?.name || profile.displayName,
          profileImage: hero?.data?.profileImage || profile.profileImage
        }
      };

      setSaving(true);
      try {
        const response = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            title: portfolio?.title || "My Portfolio",
            theme: themeId,
            content
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Automatic save failed.");
        }
        setError("");
        setNotice("All changes saved automatically.");
      } catch (err) {
        setError(err.message || "Automatic save failed. Please click Save.");
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [blocks, profile, themeId, hydrated, loading, id, portfolio?.title]);

  const publishPortfolio = async () => {
    setPublishing(true);
    setError("");
    setNotice("");

    try {
      const saved = await savePortfolio();
      if (!saved) return;

      const response = await fetch(`${API}/${id}/publish`, {
        method: "PUT",
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to publish portfolio.");
      }

      const published = data.portfolio || data;
      setPortfolio((current) => ({ ...current, ...published }));

      const publicUrl =
        `${window.location.origin}/portfolio/${published.slug}`;

      setNotice(`Published successfully. Public URL: ${publicUrl}`);

      try {
        await navigator.clipboard.writeText(publicUrl);
      } catch {
        window.prompt("Copy your public portfolio URL:", publicUrl);
      }
    } catch (err) {
      setError(err.message || "Unable to publish portfolio.");
    } finally {
      setPublishing(false);
    }
  };

  

const exportPdf = () => {
  // Print only the portfolio, leaving the editor untouched.
  const preview = document.querySelector(".portfolio-preview");
  if (!preview) {
    setError("Could not find the portfolio to export.");
    return;
  }

  // Make a temporary printable copy so inputs display their current values.
  const printable = preview.cloneNode(true);
  printable.querySelectorAll(".editor-field").forEach((field) => {
    const control = field.querySelector("input, textarea, select");
    if (!control) return;
    const value = document.createElement("div");
    value.className = "print-field-value";
    value.textContent = control.value || "";
    field.replaceWith(value);
  });
  printable.querySelectorAll(
    ".no-print, .block-toolbar, .hero-photo-actions, .project-image-actions"
  ).forEach((element) => element.remove());

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    setError("Your browser blocked the print window. Allow pop-ups for localhost and try again.");
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join("\n");

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${(portfolio?.title || "Portfolio").replace(/[<>]/g, "")}</title>${styles}
<style>
@page { size: A4; margin: 10mm; }
html, body { margin: 0 !important; padding: 0 !important; width: 100%; background: transparent !important; }
body { background: transparent !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
.pagecraft-editor { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
.portfolio-preview { display:block !important; width:100% !important; max-width:none !important; height:auto !important; min-height:0 !important; overflow:visible !important; margin:0 !important; padding:0 !important; border:0 !important; box-shadow:none !important; }
.portfolio-preview, .portfolio-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
.print-field-value { display:block !important; white-space:pre-wrap !important; overflow-wrap:anywhere !important; margin:0 0 13px !important; padding:0 !important; border:0 !important; background:transparent !important; color:inherit !important; font:inherit !important; line-height:1.6 !important; }
/* Shared PDF layout: each portfolio section starts on a fresh A4 page.
   This affects only the temporary print document, not the editor or published site. */
/* Each block is wrapped by .portfolio-print-block in the editor.
   Apply the page break to those sibling wrappers, not to the nested
   .pagecraft-block sections. This is the shared PDF rule for every template. */
.portfolio-preview .portfolio-print-block {
  break-inside: auto !important;
  page-break-inside: auto !important;
  break-after: auto !important;
  page-break-after: auto !important;
}
.portfolio-preview .portfolio-print-block + .portfolio-print-block {
  break-before: page !important;
  page-break-before: always !important;
}
.portfolio-preview .portfolio-print-block > .pagecraft-block {
  break-inside: auto !important;
  page-break-inside: auto !important;
}
/* PDF-only correction: template styles define large min-heights for hero and
   content sections. Keep those heights on the live portfolio, but let each
   section shrink to its actual content in the temporary print document. */
.portfolio-preview .portfolio-print-block,
.portfolio-preview .portfolio-print-block > .pagecraft-block,
.portfolio-preview .pagecraft-block {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
}
.portfolio-preview .portfolio-print-block {
  flex: 0 0 auto !important;
  align-self: stretch !important;
}
/* Keep contact details and the footer grouped with their contact section. */
.portfolio-preview .pagecraft-block.contact-block {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.project-editor-card, .block-card, .project-card, .portfolio-footer {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
img { max-width:100% !important; height:auto; }
</style></head><body></body></html>`);
  printWindow.document.close();
  const printRoot = printWindow.document.createElement("div");
  printRoot.className = "pagecraft-editor";
  printRoot.appendChild(printable);
  printWindow.document.body.appendChild(printRoot);

  const printWhenReady = () => {
    printWindow.focus();
    printWindow.print();
    // Keep the print window open so the browser can complete the print dialog.
  };

  const images = Array.from(printWindow.document.images);
  Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
    image.onload = resolve;
    image.onerror = resolve;
  }))).then(() => printWindow.setTimeout(printWhenReady, 300));
};


  const design = getTemplate(themeId) || getTemplate("minimal");

  const renderField = (label, value, onChange, options = {}) => {
    // The section update callback expects (fieldName, value), while custom
    // callbacks expect only the new value. Route each form field correctly.
    const fieldByLabel = {
      "Your name": "name",
      "Professional title": "role",
      "Introduction": "description",
      "Button text": "buttonText",
      "Section heading": "title",
      "About me": "description",
      "Skills": "skills",
      "Project name": "title",
      "Project description": "description",
      "Live project URL": "url",
      "Repository URL": "repository",
      "Role / position": "role",
      "Company / organization": "company",
      "Start date": "startDate",
      "End date": "endDate",
      "Responsibilities and achievements": "description",
      "Email": "email",
      "Phone": "phone",
      "Location": "location",
      "Website": "website",
      "Footer text": "footerText"
    };

    const handleChange = (nextValue) => {
      if (onChange.length >= 2) {
        const field = options.field || fieldByLabel[label];
        if (field) onChange(field, nextValue);
      } else {
        onChange(nextValue);
      }
    };

    return (
      <label className="editor-field" key={options.key || label}>
        <span>{label}</span>

        {options.multiline ? (
          <textarea
            value={value ?? ""}
            rows={options.rows || 4}
            placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
            onChange={(event) => handleChange(event.target.value)}
          />
        ) : (
          <input
            type={options.type || "text"}
            value={value ?? ""}
            placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
            onChange={(event) => handleChange(event.target.value)}
          />
        )}
      </label>
    );
  };

  const renderBlock = (block) => {
    const data = block.data || {};
    const update = (field, value) =>
      updateBlock(block.id, field, value);

    return (
      <section
        className={`pagecraft-block ${block.type}-block`}
        key={block.id}
      >
        <div className="block-toolbar no-print">
          <strong title="Drag this section by its toolbar to reorder it">
            ⠿ {block.type.charAt(0).toUpperCase() + block.type.slice(1)} · Drag to move
          </strong>

          <div>
            <button type="button" onClick={() => moveBlock(block.id, -1)}>
              ↑
            </button>
            <button type="button" onClick={() => moveBlock(block.id, 1)}>
              ↓
            </button>
            <button type="button" onClick={() => duplicateBlock(block)}>
              Duplicate
            </button>
            <button type="button" onClick={() => deleteBlock(block.id)}>
              Delete
            </button>
          </div>
        </div>

        {block.type === "hero" && (
          <div className="hero-content">
            <div className="hero-photo-area">
              {profile.profileImage || data.profileImage ? (
                <img
                  className="hero-profile-image"
                  src={profile.profileImage || data.profileImage}
                  alt="Profile"
                />
              ) : (
                <div className="hero-profile-placeholder">
                  {String(data.name || "Y").trim().charAt(0).toUpperCase()}
                </div>
              )}

              <div className="no-print hero-photo-actions">
                <button
                  type="button"
                  onClick={() => profilePhotoInput.current?.click()}
                >
                  {profile.profileImage || data.profileImage
                    ? "Change photo"
                    : "Upload profile photo"}
                </button>

                {(profile.profileImage || data.profileImage) && (
                  <button type="button" onClick={removeProfilePhoto}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="hero-text">
              <p className="block-label">HELLO, I'M</p>

              {renderField("Your name", data.name, update, {
                placeholder: "Your full name"
              })}

              {renderField("Professional title", data.role, update, {
                placeholder: "Software Developer, Teacher, Designer..."
              })}

              {renderField(
                "Introduction",
                data.introduction ?? data.description,
                (value) => {
                  update("introduction", value);
                  update("description", value);
                },
                { multiline: true, rows: 3 }
              )}

              {renderField("Button text", data.buttonText, update)}
            </div>
          </div>
        )}

        {block.type === "about" && (
          <div className="section-content">
            <p className="block-label">ABOUT ME</p>
            {renderField("Section heading", data.title, update)}
            {renderField("About me", data.description, update, {
              multiline: true,
              rows: 6
            })}
          </div>
        )}

        {block.type === "skills" && (
          <div className="section-content">
            <p className="block-label">SKILLS & EXPERTISE</p>
            {renderField("Section heading", data.title, update)}
            {renderField("Skills", data.skills, update, {
              multiline: true,
              rows: 4,
              placeholder: "React, Java, UI Design, Communication..."
            })}

            <div className="skills-list">
              {String(data.skills || "")
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
                .map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
            </div>
          </div>
        )}

        {block.type === "projects" && (
          <div className="section-content">
            <p className="block-label">SELECTED WORK</p>
            {renderField("Section heading", data.title, update)}
            {renderField("Introduction", data.description, update, {
              multiline: true,
              rows: 3
            })}

            {(Array.isArray(data.projects) ? data.projects : []).map(
              (project) => (
                <article className="project-editor-card" key={project.id}>
                  <div className="project-image-preview">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title || "Project"}
                      />
                    ) : (
                      <div className="project-image-placeholder">
                        Project image
                      </div>
                    )}
                  </div>

                  <div className="project-editor-fields">
                    {renderField("Project name", project.title, (value) =>
                      updateProject(block.id, project.id, "title", value)
                    )}

                    {renderField(
                      "Project description",
                      project.description,
                      (value) =>
                        updateProject(
                          block.id,
                          project.id,
                          "description",
                          value
                        ),
                      { multiline: true, rows: 3 }
                    )}

                    {renderField("Live project URL", project.url, (value) =>
                      updateProject(block.id, project.id, "url", value),
                      { placeholder: "https://..." }
                    )}

                    {renderField(
                      "Repository URL",
                      project.repository,
                      (value) =>
                        updateProject(
                          block.id,
                          project.id,
                          "repository",
                          value
                        ),
                      { placeholder: "https://github.com/..." }
                    )}

                    <div className="no-print project-image-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoTarget({
                            kind: "project",
                            blockId: block.id,
                            projectId: project.id
                          });
                          projectPhotoInput.current?.click();
                        }}
                      >
                        {project.image ? "Change image" : "Upload project image"}
                      </button>

                      {project.image && (
                        <button
                          type="button"
                          onClick={() =>
                            updateProject(
                              block.id,
                              project.id,
                              "image",
                              ""
                            )
                          }
                        >
                          Remove image
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "projects",
                            (data.projects || []).filter(
                              (item) => item.id !== project.id
                            )
                          )
                        }
                      >
                        Delete project
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}

            <button
              className="secondary-action no-print"
              type="button"
              onClick={() =>
                update("projects", [
                  ...(data.projects || []),
                  {
                    id: createId(),
                    title: "New Project",
                    description: "",
                    image: "",
                    url: "",
                    repository: ""
                  }
                ])
              }
            >
              + Add project
            </button>
          </div>
        )}

        {block.type === "experience" && (
          <div className="section-content">
            <div className="section-heading-row">
              <p className="block-label">EXPERIENCE</p>

              <label className="hide-section-control no-print">
                <input
                  type="checkbox"
                  checked={Boolean(data.hidden)}
                  onChange={(event) =>
                    update("hidden", event.target.checked)
                  }
                />
                Hide section
              </label>
            </div>

            {!data.hidden && (
              <>
                {renderField("Section heading", data.title, update)}
                {renderField("Role / position", data.role, update)}
                {renderField("Company / organization", data.company, update)}

                <div className="editor-two-columns">
                  {renderField("Start date", data.startDate, update, {
                    placeholder: "Jan 2024"
                  })}
                  {renderField("End date", data.endDate, update, {
                    placeholder: "Present"
                  })}
                </div>

                {renderField(
                  "Responsibilities and achievements",
                  data.description,
                  update,
                  { multiline: true, rows: 5 }
                )}
              </>
            )}
          </div>
        )}

        {block.type === "contact" && (
          <div className="section-content">
            <p className="block-label">GET IN TOUCH</p>
            {renderField("Section heading", data.title, update)}

            <div className="editor-two-columns">
              {renderField("Email", data.email, update, { type: "email" })}
              {renderField("Phone", data.phone, update, { type: "tel" })}
              {renderField("Location", data.location, update)}
              {renderField("Website", data.website, update, {
                placeholder: "https://..."
              })}
            </div>

            <div className="social-link-fields no-print">
              <h4>Social and professional links</h4>

              {SOCIAL_LINKS.map((field) =>
                renderField(
                  field.charAt(0).toUpperCase() + field.slice(1),
                  data[field] ?? profile.links?.[field] ?? "",
                  (value) => {
                    update(field, value);
                    updateProfileLink(field, value);
                  },
                  {
                    key: field,
                    placeholder: "https://..."
                  }
                )
              )}
            </div>

            <div className="contact-public-links">
              {data.email && (
                <a href={`mailto:${data.email}`}>{data.email}</a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`}>{data.phone}</a>
              )}
              {data.location && <span>{data.location}</span>}

              {SOCIAL_LINKS.map((field) => (
                <ExternalLink key={field} href={data[field] || profile.links?.[field]}>
                  {field}
                </ExternalLink>
              ))}

              <ExternalLink href={data.website}>Website</ExternalLink>
            </div>

            {renderField(
              "Footer text",
              data.footerText ?? profile.footer,
              (value) => {
                update("footerText", value);
                setProfile((current) => ({
                  ...current,
                  footer: value
                }));
              },
              { multiline: true, rows: 2 }
            )}
          </div>
        )}
      </section>
    );
  };

  if (loading) {
    return <div className="editor-loading">Loading your portfolio...</div>;
  }

  if (!portfolio) {
    return (
      <div className="editor-loading">
        <p>{error || "Portfolio could not be loaded."}</p>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const templateTheme = design?.theme || {};

  return (
    <div className={`pagecraft-editor ${previewMode ? "preview-mode" : ""}`}>
      <style>{`
        .pagecraft-editor {
          min-height: 100vh;
          color: #20283a;
          background: #f5f6fa;
          font-family: Inter, "Segoe UI", sans-serif;
        }

        .editor-navbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 22px;
          border-bottom: 1px solid #e5e7ef;
          background: #fff;
        }

        .editor-brand {
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .editor-brand span { color: #6554d9; }

        .editor-title {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .editor-title span {
          color: #7b8496;
          font-size: 11px;
        }

        .editor-title strong {
          max-width: 250px;
          overflow: hidden;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .editor-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .editor-actions button,
        .editor-loading button {
          padding: 10px 13px;
          border: 1px solid #e0e4ed;
          border-radius: 9px;
          background: #fff;
          color: #343c4d;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .editor-actions .save-button,
        .editor-actions .publish-button {
          border-color: #6554d9;
          background: #6554d9;
          color: #fff;
        }

        .editor-actions button:disabled {
          cursor: wait;
          opacity: .65;
        }

        .editor-workspace {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) 240px;
          gap: 16px;
          align-items: start;
          padding: 18px;
        }

        .editor-sidebar,
        .editor-settings,
        .editor-canvas {
          min-width: 0;
          border: 1px solid #e6e8f0;
          border-radius: 14px;
          background: #fff;
        }

        .editor-sidebar,
        .editor-settings {
          position: sticky;
          top: 91px;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
        }

        .sidebar-heading,
        .settings-heading {
          padding: 18px;
          border-bottom: 1px solid #edf0f5;
        }

        .sidebar-heading p,
        .settings-heading p,
        .canvas-header p {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .sidebar-heading span,
        .settings-heading span,
        .canvas-header span {
          color: #7a8497;
          font-size: 11px;
          line-height: 1.5;
        }

        .block-library {
          display: grid;
          gap: 7px;
          padding: 12px;
        }

        .library-block {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e9ebf2;
          border-radius: 10px;
          background: #fff;
          text-align: left;
          cursor: grab;
        }

        .library-block:hover {
          border-color: #a69bee;
          background: #f8f7ff;
        }

        .library-block[draggable="true"] { cursor: grab; }
        .library-block[draggable="true"]:active { cursor: grabbing; }
        .pagecraft-editor .portfolio-print-block[draggable="true"] { cursor: grab; }
        .pagecraft-editor .portfolio-print-block[draggable="true"]:active { cursor: grabbing; }

        .library-icon {
          display: grid;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 8px;
          background: #f0edff;
          color: #6554d9;
          font-weight: 800;
        }

        .library-block strong,
        .library-block small { display: block; }

        .library-block strong { font-size: 12px; }

        .library-block small {
          margin-top: 3px;
          color: #8790a1;
          font-size: 10px;
        }

        .editor-canvas { overflow: hidden; }

        .canvas-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .desktop-badge {
          padding: 6px 9px;
          border-radius: 7px;
          background: #f0edff;
          color: #6554d9 !important;
          font-size: 10px !important;
          font-weight: 800;
        }

        .portfolio-preview {
          min-width: 0;
          padding: 18px;
          overflow: hidden;
          background: var(--background-color, #fff);
          color: var(--text-color, #20283a);
        }

        .pagecraft-block {
          position: relative;
          min-width: 0;
          margin-bottom: 20px;
          padding: clamp(16px, 3vw, 30px);
          border: 1px solid #eceef4;
          border-radius: 14px;
          background: var(--surface-color, #fff);
          color: var(--text-color, #20283a);
        }

        .block-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: -12px -12px 18px;
          padding: 8px;
          border-radius: 8px;
          background: #f4f5fa;
        }

        .block-toolbar strong {
          color: #657084;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .block-toolbar div {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .block-toolbar button,
        .secondary-action,
        .hero-photo-actions button,
        .project-image-actions button {
          padding: 7px 9px;
          border: 1px solid #e0e4ed;
          border-radius: 7px;
          background: #fff;
          color: #4e586b;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .hero-content {
          display: grid;
          grid-template-columns: minmax(110px, 170px) minmax(0, 1fr);
          align-items: start;
          gap: 24px;
        }

        .hero-photo-area {
          display: grid;
          justify-items: center;
          gap: 10px;
        }

        .hero-profile-image,
        .hero-profile-placeholder {
          width: min(100%, 170px);
          aspect-ratio: 1;
          border-radius: 50%;
          object-fit: cover;
        }

        .hero-profile-placeholder {
          display: grid;
          place-items: center;
          background: #eae7ff;
          color: #6554d9;
          font-size: 54px;
          font-weight: 800;
        }

        .hero-photo-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 5px;
        }

        .hero-text { min-width: 0; }

        .block-label {
          margin: 0 0 12px;
          color: var(--primary-color, #6554d9);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.6px;
        }

        .editor-field {
          display: block;
          min-width: 0;
          margin-bottom: 13px;
        }

        .editor-field > span {
          display: block;
          margin-bottom: 6px;
          color: #7b8496;
          font-size: 10px;
          font-weight: 750;
        }

        .editor-field input,
        .editor-field textarea {
          box-sizing: border-box;
          display: block;
          width: 100%;
          min-width: 0;
          padding: 10px 11px;
          border: 1px solid #e0e4ed;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #20283a;
          font: inherit;
          font-size: 12px;
          line-height: 1.6;
        }

        .editor-field input:focus,
        .editor-field textarea:focus {
          border-color: #8b7de8;
          box-shadow: 0 0 0 3px rgb(101 84 217 / 9%);
        }

        .editor-field textarea { resize: vertical; }

        .section-content { min-width: 0; }

        .section-content > .editor-field:first-of-type input {
          font-size: 17px;
          font-weight: 800;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 15px;
        }

        .skills-list span {
          padding: 7px 10px;
          border-radius: 7px;
          background: #eeecff;
          color: #5141ba;
          font-size: 11px;
        }

        .project-editor-card {
          display: grid;
          grid-template-columns: minmax(0, 150px) minmax(0, 1fr);
          gap: 15px;
          margin: 18px 0;
          padding: 14px;
          border: 1px solid #e6e8f0;
          border-radius: 12px;
          background: #fff;
        }

        .project-image-preview img,
        .project-image-placeholder {
          display: grid;
          width: 100%;
          aspect-ratio: 4 / 3;
          place-items: center;
          border-radius: 8px;
          object-fit: cover;
        }

        .project-image-placeholder {
          background: #f0f1f6;
          color: #7c8495;
          font-size: 11px;
        }

        .project-editor-fields { min-width: 0; }

        .project-image-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .secondary-action { padding: 10px 13px; }

        .section-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hide-section-control {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7487;
          font-size: 11px;
        }

        .editor-two-columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 12px;
        }

        .social-link-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 10px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #eceef4;
        }

        .social-link-fields h4 {
          grid-column: 1 / -1;
          margin: 0 0 12px;
          font-size: 12px;
        }

        .hero-public-links,
        .contact-public-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .contact-public-links a,
        .contact-public-links span {
          overflow-wrap: anywhere;
          color: var(--primary-color, #6554d9);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        }

        .settings-section {
          padding: 16px;
          border-bottom: 1px solid #edf0f5;
        }

        .settings-section h3 {
          margin: 0 0 14px;
          font-size: 12px;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 12px 0;
          font-size: 11px;
        }

        .setting-row span { color: #7a8497; }

        .setting-row strong {
          max-width: 140px;
          overflow-wrap: anywhere;
          text-align: right;
        }

        .theme-options {
          display: grid;
          gap: 8px;
        }

        .theme-option {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px;
          border: 1px solid #e4e7ef;
          border-radius: 9px;
          background: #fff;
          text-align: left;
          cursor: pointer;
        }

        .theme-option.active {
          border-color: #6554d9;
          background: #f8f7ff;
        }

        .theme-swatch {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          border-radius: 7px;
        }

        .theme-option strong { font-size: 11px; }

        .editor-status,
        .editor-error {
          margin: 0 18px 18px;
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .editor-status {
          background: #eefbf3;
          color: #18794e;
        }

        .editor-error {
          background: #fff0f0;
          color: #b42318;
        }

        .editor-loading {
          display: grid;
          min-height: 60vh;
          place-content: center;
          justify-items: center;
          gap: 12px;
          padding: 24px;
          color: #525c70;
        }

        .portfolio-footer {
          padding: 18px 8px;
          color: var(--muted-color, #7b8496);
          font-size: 12px;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .preview-mode .editor-sidebar,
        .preview-mode .editor-settings,
        .preview-mode .canvas-header,
        .preview-mode .block-toolbar,
        .preview-mode .no-print {
          display: none !important;
        }

        .preview-mode .editor-workspace {
          display: block;
          max-width: 1050px;
          margin: auto;
        }

        .preview-mode .pagecraft-block { border-color: transparent; }

        @media (max-width: 1100px) {
          .editor-workspace {
            grid-template-columns: 190px minmax(0, 1fr);
          }

          .editor-settings {
            position: static;
            grid-column: 1 / -1;
            max-height: none;
          }

          .theme-options {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .editor-navbar {
            position: static;
            padding: 13px;
          }

          .editor-title {
            order: 3;
            width: 100%;
          }

          .editor-workspace {
            display: flex;
            flex-direction: column;
            padding: 10px;
          }

          .editor-sidebar,
          .editor-settings,
          .editor-canvas {
            position: static;
            width: 100%;
            max-height: none;
            box-sizing: border-box;
          }

          .block-library {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-content,
          .project-editor-card {
            grid-template-columns: 1fr;
          }

          .hero-photo-area { justify-items: start; }

          .hero-profile-image,
          .hero-profile-placeholder {
            width: 112px;
          }

          .project-image-preview { max-width: 230px; }

          .social-link-fields,
          .editor-two-columns {
            grid-template-columns: 1fr;
          }

          .theme-options {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Layout safety: keep every portfolio section and its form controls full-width.
           These rules are scoped to the editor so they do not alter the 13 template designs. */
        .pagecraft-editor,
        .pagecraft-editor *,
        .pagecraft-editor *::before,
        .pagecraft-editor *::after {
          box-sizing: border-box;
        }

        .pagecraft-editor .editor-canvas,
        .pagecraft-editor .portfolio-preview {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .pagecraft-editor .portfolio-preview > div,
        .pagecraft-editor .portfolio-preview > div > .pagecraft-block,
        .pagecraft-editor .portfolio-preview .pagecraft-block,
        .pagecraft-editor .pagecraft-block > .section-content,
        .pagecraft-editor .pagecraft-block > .hero-content {
          min-width: 0;
          max-width: 100%;
        }

        .pagecraft-editor .portfolio-preview > div {
          display: block;
          width: 100%;
        }

        .pagecraft-editor .pagecraft-block {
          display: block;
          width: 100%;
        }

        .pagecraft-editor .editor-field,
        .pagecraft-editor .editor-field input,
        .pagecraft-editor .editor-field textarea {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .pagecraft-editor .section-content > .editor-field,
        .pagecraft-editor .hero-text > .editor-field,
        .pagecraft-editor .project-editor-fields > .editor-field {
          display: block;
          width: 100%;
        }

        .pagecraft-editor .editor-two-columns,
        .pagecraft-editor .social-link-fields,
        .pagecraft-editor .project-editor-card {
          min-width: 0;
        }

        @media (max-width: 1200px) {
          .pagecraft-editor .editor-workspace {
            grid-template-columns: 180px minmax(0, 1fr);
          }

          .pagecraft-editor .editor-settings {
            grid-column: 1 / -1;
            position: static;
            max-height: none;
          }
        }

        @media (max-width: 850px) {
          .pagecraft-editor .editor-workspace {
            display: flex;
            flex-direction: column;
          }

          .pagecraft-editor .editor-sidebar,
          .pagecraft-editor .editor-canvas,
          .pagecraft-editor .editor-settings {
            width: 100%;
            max-width: 100%;
          }

          .pagecraft-editor .hero-content,
          .pagecraft-editor .project-editor-card {
            grid-template-columns: minmax(0, 1fr);
          }

          .pagecraft-editor .editor-two-columns,
          .pagecraft-editor .social-link-fields {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* Correct canvas flow: sections must be siblings in a vertical stack. */
        .pagecraft-editor .portfolio-preview {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          gap: 0 !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }

        .pagecraft-editor .portfolio-preview > .portfolio-print-block,
        .pagecraft-editor .portfolio-preview > .empty-preview {
          position: relative !important;
          inset: auto !important;
          float: none !important;
          flex: 0 0 auto !important;
          align-self: stretch !important;
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          margin: 0 0 20px !important;
          transform: none !important;
          clear: both !important;
        }

        .pagecraft-editor .portfolio-preview > .empty-preview {
          position: relative !important;
          width: 100% !important;
          max-width: 100% !important;
          flex: 0 0 auto !important;
        }

        /* Interactive fields must remain clickable inside draggable section wrappers. */
        .pagecraft-editor:not(.preview-mode) .portfolio-preview input,
        .pagecraft-editor:not(.preview-mode) .portfolio-preview textarea,
        .pagecraft-editor:not(.preview-mode) .portfolio-preview select,
        .pagecraft-editor:not(.preview-mode) .portfolio-preview button,
        .pagecraft-editor:not(.preview-mode) .portfolio-preview a,
        .pagecraft-editor:not(.preview-mode) .portfolio-preview label {
          pointer-events: auto;
          user-select: text;
          -webkit-user-select: text;
        }

        .pagecraft-editor .pagecraft-block .block-toolbar {
          position: relative !important;
          inset: auto !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 0 18px !important;
        }

        .pagecraft-editor .pagecraft-block .block-toolbar > div {
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 6px !important;
          max-width: 100% !important;
        }

        .pagecraft-editor .pagecraft-block .section-content,
        .pagecraft-editor .pagecraft-block .hero-content,
        .pagecraft-editor .pagecraft-block .hero-text,
        .pagecraft-editor .pagecraft-block .hero-photo-area {
          min-width: 0 !important;
          max-width: 100% !important;
        }

        
        
@media print {
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: transparent !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .editor-navbar, .editor-sidebar, .editor-settings, .canvas-header,
  .block-toolbar, .no-print, .editor-status, .editor-error {
    display: none !important;
  }
  .pagecraft-editor, .editor-workspace, .editor-canvas, .portfolio-preview {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
  }
  .portfolio-preview, .portfolio-preview * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .pagecraft-block { break-inside: avoid; page-break-inside: avoid; }
  .print-field-value {
    display: block !important;
    white-space: pre-wrap !important;
    overflow-wrap: anywhere !important;
    color: inherit !important;
    font: inherit !important;
  }
  img { max-width: 100% !important; }
}
      `}</style>

      <header className="editor-navbar no-print">
        <div className="editor-brand">
          Page<span>Craft</span>
        </div>

        <div className="editor-title">
          <span>Editing portfolio</span>
          <strong>{portfolio.title || "My Portfolio"}</strong>
        </div>

        <div className="editor-actions">
          <button type="button" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode((value) => !value)}
          >
            {previewMode ? "Exit Preview" : "Preview"}
          </button>

          <button type="button" onClick={exportPdf}>
            Export PDF
          </button>

          <button
            type="button"
            className="publish-button"
            onClick={publishPortfolio}
            disabled={publishing || saving}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>

          <button
            type="button"
            className="save-button"
            onClick={savePortfolio}
            disabled={saving || publishing}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <input
        ref={profilePhotoInput}
        className="no-print"
        type="file"
        accept="image/*"
        hidden
        onChange={(event) =>
          handleImageUpload(event, { kind: "profile" })
        }
      />

      <input
        ref={projectPhotoInput}
        className="no-print"
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          if (photoTarget) {
            handleImageUpload(event, photoTarget);
          }
          setPhotoTarget(null);
        }}
      />

      {error && <div className="editor-error no-print">{error}</div>}
      {notice && <div className="editor-status no-print">{notice}</div>}

      <div className="editor-workspace">
        <aside className="editor-sidebar no-print">
          <div className="sidebar-heading">
            <p>BLOCK LIBRARY</p>
            <span>Add sections to your portfolio</span>
          </div>

          <div className="block-library">
            {[
              ["hero", "✦", "Hero"],
              ["about", "A", "About Me"],
              ["skills", "◆", "Skills"],
              ["projects", "▣", "Projects"],
              ["experience", "◈", "Experience"],
              ["contact", "✉", "Contact"]
            ].map(([type, icon, title]) => (
              <button
                type="button"
                className="library-block"
                key={type}
                onClick={() => addBlock(type)}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("pagecraft/new-type", type);
                  event.dataTransfer.effectAllowed = "copy";
                }}
              >
                <span className="library-icon">{icon}</span>
                <span>
                  <strong>{title}</strong>
                  <small>Click to add section</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="editor-canvas">
          <div className="canvas-header no-print">
            <div>
              <p>PORTFOLIO CANVAS</p>
              <span>Edit your content directly in the canvas</span>
            </div>
            <span className="desktop-badge">{blocks.length} sections</span>
          </div>

          <div
            className={`portfolio-preview ${
              design ? `pagecraft-theme-${design.id}` : ""
            } pagecraft-template-${profile.profession || "legacy"}`}
            style={{
              "--primary-color": templateTheme.primary || "#6554d9",
              "--secondary-color": templateTheme.secondary || "#eae7ff",
              "--background-color": templateTheme.background || "#fff",
              "--surface-color": templateTheme.surface || "#fff",
              "--text-color": templateTheme.text || "#20283a",
              "--muted-color": templateTheme.muted || "#7b8496",
              "--portfolio-radius": templateTheme.radius || "14px"
            }}
            onDragOver={(event) => {
              event.preventDefault();
              // Allow drops on the blank canvas area to append new sections.
              if (event.dataTransfer.types.includes("pagecraft/new-type")) {
                event.dataTransfer.dropEffect = "copy";
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();

              const type = event.dataTransfer.getData("pagecraft/new-type");
              if (type) addBlock(type);
            }}
          >
            {blocks.length === 0 ? (
              <div className="empty-preview">
                <h2>Start building your portfolio</h2>
                <p>
                  Add a hero section, introduce yourself, showcase your work
                  and provide contact links.
                </p>
                <button
                  type="button"
                  className="secondary-action no-print"
                  onClick={() => addBlock("hero")}
                >
                  + Add hero section
                </button>
              </div>
            ) : (
              blocks
                .filter(
                  (block) =>
                    !(block.type === "experience" && block.data?.hidden)
                )
                .map((block) => (
                  <div
  key={block.id}
  className="portfolio-print-block"
  draggable={!previewMode}
  onDragStart={(event) => {
    if (
      event.target.closest(
        "input, textarea, select, button, a, label, [contenteditable='true']"
      )
    ) {
      event.preventDefault();
      return;
    }
    onBlockDragStart(event, block.id);
  }}
  
onDragOver={handleBlockDragOver}
onDrop={(event) => onBlockDrop(event, block.id)}

  onClick={() => setActiveBlockId(block.id)}
  style={
    activeBlockId === block.id && !previewMode
      ? {
          outline: "2px solid #b5abf5",
          outlineOffset: "2px",
          borderRadius: "14px"
        }
      : {}
  }
>
  {renderBlock(block)}
</div>
                ))
            )}

            <footer className="portfolio-footer">
              {profile.footer ||
                blocks.find((block) => block.type === "contact")?.data
                  ?.footerText ||
                "Thank you for visiting my portfolio."}
              <span> · Built with PageCraft</span>
            </footer>
          </div>
        </main>

        <aside className="editor-settings no-print">
          <div className="settings-heading">
            <p>PORTFOLIO SETTINGS</p>
            <span>Customize your portfolio</span>
          </div>

          <div className="settings-section">
            <h3>Portfolio details</h3>

            <div className="setting-row">
              <span>Name</span>
              <strong>{portfolio.title || "My Portfolio"}</strong>
            </div>

            <div className="setting-row">
              <span>Status</span>
              <strong>{portfolio.published ? "Published" : "Draft"}</strong>
            </div>

            {portfolio.slug && (
              <div className="setting-row">
                <span>Public slug</span>
                <strong>{portfolio.slug}</strong>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>Choose a theme</h3>

            <div className="theme-options">
              {themeOptions.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  className={
                    themeId === theme.id
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() => setThemeId(theme.id)}
                >
                  <span
                    className="theme-swatch"
                    style={{ background: theme.color }}
                  />
                  <strong>{theme.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Profile information</h3>

            {renderField("Profession", profile.profession, (value) =>
              setProfile((current) => ({
                ...current,
                profession: value
              }))
            )}

            {renderField("Footer text", profile.footer, (value) =>
              setProfile((current) => ({
                ...current,
                footer: value
              }))
            )}
          </div>

          <div className="settings-section">
            <h3>Quick actions</h3>

            <button
              type="button"
              className="secondary-action"
              onClick={() => addBlock("projects")}
            >
              + Add a project
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() => addBlock("experience")}
            >
              + Add experience
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() => addBlock("contact")}
            >
              + Add contact section
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
