PageCraft targeted patch (not a complete 13-layout redesign)

Files included:
- PublicPortfolio.patched.jsx: retains the saved template identity as a CSS class on the public portfolio.
- Editor.patched.jsx: retains the saved template identity in the editor preview and removes forced white print backgrounds that can hide theme backgrounds.

Apply safely:
1. Back up client/src/PublicPortfolio.jsx and client/src/Editor.jsx.
2. Replace PublicPortfolio.jsx with PublicPortfolio.patched.jsx contents.
3. Replace Editor.jsx with Editor.patched.jsx contents. The patch is based on the uploaded Editor(20261021-081440).jsx; confirm it is the same version currently in your local project before replacing.
4. Restart the client and test one newly created portfolio and one existing portfolio.

Important limitation:
Templates.jsx defines 13 presets (content defaults and a shared theme ID), but not 13 separate layout/render components. Several presets share one of six theme IDs. This patch preserves each preset ID in the DOM and improves print background handling; it does NOT create 13 distinct visual layouts by itself. To complete that requirement, the project needs template-specific layout rules/components for all 13 IDs and the editor/public renderers must both use the same layout mapping.

No database records or saved portfolio data were changed by creating these patch files. No runtime/browser tests were run here.
