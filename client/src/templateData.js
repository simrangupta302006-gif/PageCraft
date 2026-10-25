export const templateData = {
  developer: {
    id: "developer",
    name: "Developer",
    description: "Modern portfolio for software developers and engineers.",
    theme: {
      primary: "#2563eb",
      secondary: "#0f172a",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      font: "Inter",
      radius: "16px",
      spacing: "normal",
    },
    hero: {
      layout: "center",
      style: "dark",
    },
  },

  creative: {
    id: "creative",
    name: "Creative",
    description:
      "Bold and colorful portfolio for designers and creative professionals.",
    theme: {
      primary: "#c026d3",
      secondary: "#581c87",
      background: "#fdf4ff",
      surface: "#ffffff",
      text: "#3b0764",
      muted: "#86198f",
      font: "Poppins",
      radius: "24px",
      spacing: "large",
    },
    hero: {
      layout: "center",
      style: "gradient",
    },
  },

  student: {
    id: "student",
    name: "Student",
    description: "Clean portfolio designed for students and freshers.",
    theme: {
      primary: "#2563eb",
      secondary: "#1e3a8a",
      background: "#eff6ff",
      surface: "#ffffff",
      text: "#172554",
      muted: "#475569",
      font: "Inter",
      radius: "14px",
      spacing: "normal",
    },
    hero: {
      layout: "center",
      style: "blue",
    },
  },

  professional: {
    id: "professional",
    name: "Professional",
    description:
      "Elegant portfolio for professionals and working individuals.",
    theme: {
      primary: "#0f766e",
      secondary: "#134e4a",
      background: "#f0fdfa",
      surface: "#ffffff",
      text: "#134e4a",
      muted: "#64748b",
      font: "Inter",
      radius: "12px",
      spacing: "normal",
    },
    hero: {
      layout: "left",
      style: "teal",
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Simple black and white portfolio with a clean layout.",
    theme: {
      primary: "#171717",
      secondary: "#404040",
      background: "#fafafa",
      surface: "#ffffff",
      text: "#171717",
      muted: "#737373",
      font: "Inter",
      radius: "8px",
      spacing: "compact",
    },
    hero: {
      layout: "left",
      style: "minimal",
    },
  },

  startup: {
    id: "startup",
    name: "Startup",
    description:
      "Energetic portfolio style for startup builders and founders.",
    theme: {
      primary: "#ea580c",
      secondary: "#431407",
      background: "#fff7ed",
      surface: "#ffffff",
      text: "#431407",
      muted: "#9a3412",
      font: "Poppins",
      radius: "18px",
      spacing: "large",
    },
    hero: {
      layout: "center",
      style: "orange",
    },
  },
};

export const getTemplate = (templateId) => {
  return templateData[templateId] || templateData.developer;
};

export const getTemplateList = () => {
  return Object.values(templateData);
};