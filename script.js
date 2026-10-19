/* ============================================================
   Markdown Studio — application script
   ============================================================ */

const SAMPLE_MARKDOWN = `# Enterprise Specification: ClipForge Architecture

> **Notice:** This document specifies the core microservices architecture, mathematical models, and database topology for ClipForge, a high-throughput, browser-native video node.

---

## 1. System Processing Pipeline

ClipForge processes high-definition video buffers in real time using WebAssembly and WebCodecs API threads.

### Primary Capabilities
- **Zero-Latency Demuxing:** Parallel worker threads for incoming streams.
- **Hardware Rendering:** WebGPU-accelerated canvas context bindings.
- **Resilient Pipeline:** Self-healing diagram nodes handle dropped keyframes.

---

## 2. Ingestion Sequence Workflow

Below is the execution flow for stream ingestion and frame rendering:

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client as Web Application
    participant Demux as WASM Worker
    participant GPU as WebGPU Canvas
    participant Storage as Cloud Storage

    Client->>Demux: Ingest Raw Video Stream
    Demux-->>Client: Stream Keyframe Fragments
    Client->>GPU: Dispatch WebCodecs Hardware Render
    GPU->>Storage: Store Transcoded Chunk
    Storage-->>Client: Return Signed Resource URL
\`\`\`

---

## 3. Database Entity Topology

\`\`\`mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    PROJECT ||--|{ ASSET : contains
    PROJECT ||--o{ RENDER_JOB : executes

    USER {
        string id PK
        string email
        string org_role
    }
    PROJECT {
        string id PK
        string name
        datetime created_at
    }
    ASSET {
        string id PK
        string byte_hash
        int size_bytes
    }
\`\`\`

---

## 4. Algorithmic Speedup & Mathematical Model

The theoretical latency speedup $S_{\\text{latency}}$ across parallel WebAssembly worker nodes is calculated using Amdahl's Law:

$$S_{\\text{latency}}(s) = \\frac{1}{(1 - p) + \\frac{p}{s}}$$

Where:
- $p$ represents the parallel proportion of the stream demuxer.
- $s$ is the worker thread concurrency limit.

---

## 5. Ingestion Engine Implementation

The worker module below demonstrates video frame decoding logic:

\`\`\`typescript
import { VideoDecoder, EncodedVideoChunk } from '@clipforge/core';

export class IngestionEngine {
  private decoder: VideoDecoder;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.decoder = new VideoDecoder({
      output: (frame) => this.renderFrameToGPU(frame),
      error: (err) => console.error('VideoDecoder Failure:', err),
    });
  }

  public async initialize(config: VideoDecoderConfig): Promise<void> {
    console.log('Initializing hardware-accelerated video pipeline...');
    await this.decoder.configure(config);
  }

  private renderFrameToGPU(frame: VideoFrame): void {
    // WebGPU Draw Call
    frame.close();
  }
}
\`\`\`

---

## 6. System Resource Allocation

| Microservice | Min Worker Threads | Memory Quota | Target Latency |
| :--- | :--- | :--- | :--- |
| **Stream Demuxer** | 2 Workers | 512 MB | < 12ms |
| **WebCodecs Engine** | 4 Workers | 2048 MB | < 4ms |
| **Canvas Synthesizer** | GPU Dedicated | VRAM Reserved | < 16ms (60FPS) |

---

> [!TIP]
> Always enable \`Cross-Origin-Opener-Policy: same-origin\` on edge servers to unlock shared memory allocations.
`;

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  const hexToRgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const isDark = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b < 140;
  };
  const rgba = (hex, a) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };

  // ---------- CONFIG ----------
  const DEFAULT_CONFIG = {
    // bodyFont: "Inter, sans-serif",
    bodyFont: "'Times New Roman', Times, serif",
    headingFont: "'Times New Roman', Times, serif",

    // headingFont: "Lexend, sans-serif",
    codeFont: "'Fira Code', monospace",
    fontSize: 14,
    lineHeight: 1.6,
    paraSpacing: 1.0,
    bgColor: "#ffffff",
    textColor: "#1e293b",
    headingColor: "#0f172a",
    accentColor: "#2563eb",
    codeBg: "#0f172a",
    tableHeaderBg: "#f1f5f9",
    coverEnabled: false,
    coverTitle: "Web Engineering",
    coverSubtitle: "Lab 04 Task Report",
    coverTeacher: "Dr Sidra Shafi",
    coverAuthor: "Muhammad Abdul Rahim Attari",
    coverRoll: "24-SE-27",
    coverLogo: "",
    coverLogoSize: 160,
    coverTheme: "clean-white",
    pageSize: "A4",
    maxWidth: 800,
    pageMargin: 15,
  };

  const THEMES = {
    light: {
      bgColor: "#ffffff",
      textColor: "#1e293b",
      headingColor: "#0f172a",
      accentColor: "#2563eb",
      codeBg: "#0f172a",
      tableHeaderBg: "#f1f5f9",
    },
    dark: {
      bgColor: "#0f172a",
      textColor: "#e2e8f0",
      headingColor: "#38bdf8",
      accentColor: "#38bdf8",
      codeBg: "#020617",
      tableHeaderBg: "#1e293b",
    },
    solarized: {
      bgColor: "#fdf6e3",
      textColor: "#586e75",
      headingColor: "#b58900",
      accentColor: "#268bd2",
      codeBg: "#eee8d5",
      tableHeaderBg: "#eee8d5",
    },
    contrast: {
      bgColor: "#ffffff",
      textColor: "#000000",
      headingColor: "#000000",
      accentColor: "#0000cc",
      codeBg: "#f0f0f0",
      tableHeaderBg: "#e5e5e5",
    },
  };

  const PRESETS = {
    "tech-spec": {
      theme: "light",
      bodyFont: "Inter, sans-serif",
      headingFont: "Lexend, sans-serif",
      fontSize: 14,
      lineHeight: 1.6,
    },
    academic: {
      theme: "light",
      bodyFont: "Merriweather, serif",
      headingFont: "'Playfair Display', serif",
      textColor: "#111827",
      fontSize: 15,
      lineHeight: 1.8,
    },
    minimalist: {
      theme: "light",
      bodyFont: "Inter, sans-serif",
      headingFont: "Inter, sans-serif",
      bgColor: "#fafafa",
      textColor: "#27272a",
      headingColor: "#18181b",
      accentColor: "#52525b",
      tableHeaderBg: "#f4f4f5",
      fontSize: 14,
      lineHeight: 1.7,
    },
    "dark-dev": {
      theme: "dark",
      bodyFont: "'Fira Code', monospace",
      headingFont: "Outfit, sans-serif",
      fontSize: 13,
      lineHeight: 1.7,
    },
  };

  const COVER_THEMES = {
    "dark-slate": ["#0f172a", "#ffffff"],
    "modern-blue": ["#1e3a8a", "#ffffff"],
    "minimalist-gray": ["#18181b", "#ffffff"],
    "clean-white": ["#ffffff", "#0f172a"],
  };

  // [element id, config key, value-label id, label formatter, numeric?, checkbox?]
  const CONTROLS = [
    ["opt-body-font", "bodyFont"],
    ["opt-heading-font", "headingFont"],
    ["opt-code-font", "codeFont"],
    ["opt-font-size", "fontSize", "val-font-size", (v) => v + "px", true],
    ["opt-line-height", "lineHeight", "val-line-height", (v) => v, true],
    [
      "opt-para-spacing",
      "paraSpacing",
      "val-para-spacing",
      (v) => Number(v).toFixed(1) + "rem",
      true,
    ],
    ["opt-color-bg", "bgColor"],
    ["opt-color-text", "textColor"],
    ["opt-color-heading", "headingColor"],
    ["opt-color-accent", "accentColor"],
    ["opt-color-code-bg", "codeBg"],
    ["opt-color-table-header", "tableHeaderBg"],
    ["cover-input-title", "coverTitle"],
    ["cover-input-subtitle", "coverSubtitle"],
    ["cover-input-teacher", "coverTeacher"],
    ["cover-input-author", "coverAuthor"],
    ["cover-input-roll", "coverRoll"],
    ["opt-logo-size", "coverLogoSize", "val-logo-size", (v) => v + "px", true],
    ["cover-theme-select", "coverTheme"],
    ["opt-page-size", "pageSize"],
    ["opt-max-width", "maxWidth", "val-max-width", (v) => v + "px", true],
    ["opt-page-margin", "pageMargin", "val-page-margin", (v) => v + "mm", true],
    ["opt-cover-toggle", "coverEnabled", null, null, false, true],
  ];

  // ---------- STATE ----------
  const STORE_KEY = "markdownStudio.v2";
  const readStore = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || null;
    } catch (e) {
      return null;
    }
  };
  const writeStore = () => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          markdown: state.markdown,
          title: state.title,
          config: state.config,
        }),
      );
      return true;
    } catch (e) {
      return false;
    }
  };

  const saved = readStore();
  const state = {
    markdown:
      saved && typeof saved.markdown === "string"
        ? saved.markdown
        : SAMPLE_MARKDOWN,
    title: (saved && saved.title) || "Assignment_Untitled",
    viewMode: "split",
    mobileTab: "editor",
    config: Object.assign({}, DEFAULT_CONFIG, saved && saved.config),
  };

  const els = {
    textarea: $("markdown-textarea"),
    body: $("markdown-body"),
    title: $("document-title"),
    paper: $("document-paper"),
    cover: $("cover-page-render"),
    printStyle: $("print-page-style"),
    editorPanel: $("editor-panel"),
    previewPanel: $("preview-panel"),
    leftSidebar: $("left-sidebar"),
    rightSidebar: $("right-sidebar"),
    dropOverlay: $("drag-drop-overlay"),
    exportMenu: $("export-menu"),
    printModal: $("print-modal"),
    hljsDark: $("hljs-theme-dark"),
    hljsLight: $("hljs-theme-light"),
  };
  const mq = window.matchMedia("(max-width: 767px)");
  let renderToken = 0,
    lastDark = null,
    started = false;

  // ---------- TOAST ----------
  function toast(msg) {
    let t = $("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "no-print";
      t.style.cssText =
        "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1f2937;color:#f3f4f6;border:1px solid #374151;padding:8px 14px;border-radius:8px;font-size:12px;z-index:100;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:opacity .2s";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._h);
    t._h = setTimeout(() => {
      t.style.opacity = "0";
    }, 2600);
  }

  // ---------- MARKDOWN PIPELINE ----------
  // Protect code from the math pass, render math to placeholders so marked can't mangle it.
   function protectMath(src) {
     const codes = [],
       maths = [];

     // Pandoc exports wrap raw TeX as `\sum`{=tex}; unwrap so it isn't treated as inline code
     src = src.replace(/`([^`\n]*)`\{=tex\}/g, "$1");

     let t = src.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, (m) => {
       codes.push(m);
       return `MSCODE${codes.length - 1}END`;
     });
     t = t.replace(/`[^`\n]+`/g, (m) => {
       codes.push(m);
       return `MSCODE${codes.length - 1}END`;
     });

     const stash = (formula, display) => {
       let html;
       formula = formula.replace(/\\_/g, "_");
       if (typeof katex === "undefined") html = `<code>${esc(formula)}</code>`;
       else {
         try {
           html = katex.renderToString(formula.trim(), {
             displayMode: display,
             throwOnError: false,
           });
         } catch (e) {
           html = `<span class="mermaid-error">${esc(e.message)}</span>`;
         }
       }
       if (display) html = `<div class="math-block">${html}</div>`;
       maths.push(html);
       return `MSMATH${maths.length - 1}END`;
     };

     // Order matters: bracket delimiters first, then $$, then inline $
     t = t.replace(/\\\[([\s\S]+?)\\\]/g, (m, f) => stash(f, true));
     t = t.replace(/\\\(([\s\S]+?)\\\)/g, (m, f) => stash(f, false));
     t = t.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => stash(f, true));
     t = t.replace(
       /(?<![\\$])\$(?![\s$])([^$\n]+?)(?<![\s\\])\$(?!\d)/g,
       (m, f) => stash(f, false),
     );
     t = t.replace(/MSCODE(\d+)END/g, (m, i) => codes[i]);

     return {
       text: t,
       restore: (html) =>
         html
           .replace(/<p>\s*MSMATH(\d+)END\s*<\/p>/g, (m, i) => maths[i])
           .replace(/MSMATH(\d+)END/g, (m, i) => maths[i]),
     };
   }

  const CALLOUTS = {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    important: "Important",
    caution: "Caution",
  };
  function decorateCallouts() {
    els.body.querySelectorAll("blockquote").forEach((bq) => {
      const p = bq.querySelector(":scope > p");
      if (!p) return;
      const m = p.innerHTML.match(
        /^\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(?:<br\s*\/?>|\n)?/i,
      );
      if (!m) return;
      const kind = m[1].toLowerCase();
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.textContent.trim() && !p.children.length) p.remove();
      bq.classList.add("callout", "callout-" + kind);
      const title = document.createElement("div");
      title.className = "callout-title";
      title.textContent = CALLOUTS[kind];
      bq.prepend(title);
    });
  }

  function highlightCode() {
    if (typeof hljs === "undefined") return;
    els.body.querySelectorAll("pre > code").forEach((code) => {
      if (code.classList.contains("language-mermaid")) return;
      const cls = [...code.classList].find((c) => c.startsWith("language-"));
      if (!cls || !hljs.getLanguage(cls.slice(9))) {
        if (cls) code.classList.remove(cls);
        code.classList.add("language-plaintext");
      }
      hljs.highlightElement(code);
    });
  }

  // ---------- MERMAID ----------
  const mermaidCache = new Map();
  let mermaidSeq = 0,
    mermaidTheme = null;

  async function renderMermaid(token) {
    const blocks = [
      ...els.body.querySelectorAll("pre > code.language-mermaid"),
    ];
    if (!blocks.length) return;
    if (typeof mermaid === "undefined") {
      blocks.forEach((c) =>
        c.parentElement.insertAdjacentHTML(
          "beforebegin",
          '<div class="mermaid-error">Mermaid library failed to load (check your internet connection).</div>',
        ),
      );
      return;
    }
    const theme = isDark(state.config.bgColor) ? "dark" : "default";
    if (theme !== mermaidTheme) {
      mermaid.initialize({
        startOnLoad: false,
        theme,
        securityLevel: "strict",
        fontFamily: "Inter, sans-serif",
        flowchart: { htmlLabels: false },
        htmlLabels: false,
      });
      mermaidTheme = theme;
    }
    for (const code of blocks) {
      if (token !== renderToken) return;
      const src = code.textContent.trim();
      const pre = code.parentElement;
      const holder = document.createElement("div");
      holder.className = "mermaid-container";
      const key = theme + "|" + src;
      const id = "mmd-" + ++mermaidSeq;
      try {
        let svg = mermaidCache.get(key);
        if (!svg) {
          ({ svg } = await mermaid.render(id, src));
          mermaidCache.set(key, svg);
          if (mermaidCache.size > 60)
            mermaidCache.delete(mermaidCache.keys().next().value);
        }
        holder.innerHTML = svg;
      } catch (err) {
        [id, "d" + id].forEach((x) => {
          const n = document.getElementById(x);
          if (n) n.remove();
        });
        holder.className = "mermaid-error";
        holder.innerHTML = `<strong>Mermaid diagram error:</strong> ${esc((err && err.message) || "Invalid syntax")}<pre>${esc(src)}</pre>`;
      }
      if (token !== renderToken) return;
      pre.replaceWith(holder);
    }
  }

  async function renderMarkdown() {
    const token = ++renderToken;
    const raw = els.textarea.value;
    state.markdown = raw;
    if (typeof marked === "undefined") {
      els.body.innerHTML =
        '<div class="mermaid-error">The Markdown parser failed to load (check your internet connection).</div>';
      return;
    }
    const { text, restore } = protectMath(raw);
    let html;
    try {
      html = marked.parse(text);
    } catch (e) {
      html = `<div class="mermaid-error">${esc(e.message)}</div>`;
    }
    els.body.innerHTML = restore(html);
    decorateCallouts();
    highlightCode();
    updateStats(raw);
    await renderMermaid(token);
    if (token === renderToken) autosave();
  }
  const scheduleRender = debounce(renderMarkdown, 200);
  const autosave = debounce(writeStore, 600);

  // ---------- STATS ----------
  function updateStats(text) {
    const clean = text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#*`~>|]/g, " ")
      .replace(/(^|\s)-+(?=\s|$)/g, " ")
      .trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    $("stat-words").textContent = words.toLocaleString();
    $("stat-chars").textContent = text.length.toLocaleString();
    $("stat-time").textContent = `${Math.max(1, Math.ceil(words / 200))} min`;
  }

  // ---------- CONFIG -> DOM ----------
  function applyConfig() {
    const c = state.config,
      s = (k, v) => els.paper.style.setProperty(k, v);
    const dark = isDark(c.bgColor);
    s("--doc-body-font", c.bodyFont);
    s("--doc-heading-font", c.headingFont);
    s("--doc-code-font", c.codeFont);
    s("--doc-base-size", c.fontSize + "px");
    s("--doc-line-height", c.lineHeight);
    s("--doc-para-spacing", c.paraSpacing + "rem");
    s("--doc-bg-color", c.bgColor);
    s("--doc-text-color", c.textColor);
    s("--doc-heading-color", c.headingColor);
    s("--doc-accent-color", c.accentColor);
    s("--doc-code-bg", c.codeBg);
    s("--doc-table-header-bg", c.tableHeaderBg);
    s("--doc-code-text", isDark(c.codeBg) ? "#f1f5f9" : "#1e293b");
    s("--doc-border-color", dark ? "rgba(255,255,255,.18)" : "#e2e8f0");
    s("--doc-blockquote-bg", rgba(c.accentColor, 0.08));
    s("--doc-blockquote-border", c.accentColor);
    s("--doc-max-width", c.maxWidth + "px");
    const pageH = c.pageSize === "A4" ? 297 : 279.4;
    s("--doc-cover-h", (pageH - 2 * c.pageMargin - 4).toFixed(1) + "mm");

    // Real @page rule (var() does not work inside @page)
    els.printStyle.textContent = `@page { size: ${c.pageSize === "A4" ? "A4" : "letter"} portrait; margin: ${c.pageMargin}mm; }`;

    // Pick the highlight.js theme that matches the code-block background
    const codeDark = isDark(c.codeBg);
    els.hljsDark.disabled = !codeDark;
    els.hljsLight.disabled = codeDark;

    // Cover page
    els.cover.classList.toggle("hidden", !c.coverEnabled);
    if (c.coverEnabled) {
      const [bg, fg] = COVER_THEMES[c.coverTheme] || COVER_THEMES["dark-slate"];
      els.cover.style.backgroundColor = bg;
      els.cover.style.color = fg;
      els.cover.style.border =
        c.coverTheme === "clean-white" ? "1px solid #e2e8f0" : "0";

      $("cover-title-text").textContent = c.coverTitle;
      $("cover-subtitle-text").textContent = c.coverSubtitle;
      $("cover-teacher-text").textContent = c.coverTeacher;
      $("cover-author-text").textContent = c.coverAuthor;
      $("cover-roll-text").textContent = c.coverRoll;

      if (c.coverLogo) {
        $("cover-logo-img").src = c.coverLogo;
        $("cover-logo-img").style.maxHeight = c.coverLogoSize + "px";
        $("cover-logo-img").classList.remove("hidden");
      } else {
        $("cover-logo-img").classList.add("hidden");
      }
    }

    // Diagram theme follows paper brightness
    if (lastDark !== null && lastDark !== dark && started) scheduleRender();
    lastDark = dark;
  }

  function syncControls() {
    for (const [id, key, labelId, fmt, , checkbox] of CONTROLS) {
      const el = $(id);
      if (!el) continue;
      if (checkbox) el.checked = !!state.config[key];
      else el.value = state.config[key];
      if (labelId) $(labelId).textContent = fmt(state.config[key]);
    }
  }

  function patchConfig(patch) {
    Object.assign(state.config, patch);
    syncControls();
    applyConfig();
    autosave();
  }

  function applyTheme(name) {
    patchConfig(THEMES[name]);
  }
  function applyPreset(name) {
    const { theme, ...rest } = PRESETS[name];
    patchConfig(Object.assign({}, THEMES[theme], rest));
  }

  // ---------- VIEW MODES ----------
  function setViewMode(mode) {
    state.viewMode = mode;
    const on = ["bg-brand-600", "text-white", "shadow"];
    [
      ["split", "btn-view-split"],
      ["editor", "btn-view-editor"],
      ["preview", "btn-view-preview"],
    ].forEach(([m, id]) => {
      const b = $(id);
      b.classList.remove(...on);
      b.classList.add("text-gray-400");
      if (m === mode) {
        b.classList.add(...on);
        b.classList.remove("text-gray-400");
      }
    });
    els.editorPanel.classList.toggle("hidden", mode === "preview");
    els.previewPanel.classList.toggle("hidden", mode === "editor");
  }

  function setMobileTab(tab) {
    state.mobileTab = tab;
    els.editorPanel.classList.toggle("hidden", tab !== "editor");
    els.previewPanel.classList.toggle("hidden", tab !== "preview");
    els.rightSidebar.classList.toggle("mobile-open", tab === "settings");
    els.leftSidebar.classList.remove("mobile-open");
    ["editor", "preview", "settings"].forEach((t) => {
      const b = $("m-btn-" + t);
      b.classList.toggle("bg-brand-600", t === tab);
      b.classList.toggle("text-white", t === tab);
      b.classList.toggle("text-gray-400", t !== tab);
    });
  }

  function layoutForViewport() {
    if (mq.matches) setMobileTab(state.mobileTab);
    else {
      els.leftSidebar.classList.remove("mobile-open");
      els.rightSidebar.classList.remove("mobile-open");
      setViewMode(state.viewMode);
    }
  }

  function toggleSidebar(el) {
    el.classList.toggle(mq.matches ? "mobile-open" : "collapsed");
  }

  // ---------- FILE HELPERS ----------
  function loadMarkdownText(text, name) {
    els.textarea.value = text;
    if (name) {
      state.title = name.replace(/\.[^/.]+$/, "");
      els.title.value = state.title;
      patchConfig({ coverTitle: state.title });
    }
    renderMarkdown();
  }
  function loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = (e) =>
        insertAtCursor(`\n![${file.name}](${e.target.result})\n`);
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) =>
        loadMarkdownText(String(e.target.result), file.name);
      reader.readAsText(file);
    }
  }
  function insertAtCursor(text) {
    const ta = els.textarea;
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
    renderMarkdown();
  }

  // ---------- PDF (client-side) ----------
  async function exportClientPDF() {
    if (typeof html2pdf === "undefined")
      return toast(
        "PDF library failed to load. Use Browser Print / PDF instead.",
      );
    const c = state.config,
      m = Number(c.pageMargin),
      a4 = c.pageSize === "A4";
    const pageW = a4 ? 210 : 215.9,
      mmPx = 96 / 25.4;

    const wrap = document.createElement("div");
    wrap.className = "no-print";
    wrap.style.cssText = `position:absolute;left:-99999px;top:0;width:${Math.round((pageW - 2 * m) * mmPx)}px`;
    const clone = els.paper.cloneNode(true);
    clone.classList.add("pdf-export");
    Object.assign(clone.style, {
      maxWidth: "none",
      width: "100%",
      margin: "0",
      padding: "0",
      boxShadow: "none",
      borderRadius: "0",
    });

    // Give diagrams explicit pixel widths so html2canvas rasterises them correctly
    const orig = els.paper.querySelectorAll(".mermaid-container svg"),
      cl = clone.querySelectorAll(".mermaid-container svg");
    orig.forEach((o, i) => {
      const r = o.getBoundingClientRect();
      if (cl[i] && r.width) cl[i].setAttribute("width", Math.round(r.width));
    });

    wrap.appendChild(clone);
    document.body.appendChild(wrap);
    const btn = $("btn-client-pdf");
    btn.disabled = true;
    toast("Generating PDF...");
    try {
      await html2pdf()
        .set({
          margin: [m, m, m, m],
          filename:
            (state.title || "document")
              .toLowerCase()
              .replace(/[^\w]+/g, "-")
              .replace(/^-|-$/g, "") + ".pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
          jsPDF: {
            unit: "mm",
            format: a4 ? "a4" : "letter",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["css", "legacy"],
            before: ".page-break-before",
            after: ".cover-page-box",
            avoid: [
              "pre",
              "tr",
              "blockquote",
              "img",
              ".mermaid-container",
              ".math-block",
              "h1",
              "h2",
              "h3",
              "h4",
            ],
          },
        })
        .from(clone)
        .save();
      toast("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast("PDF export failed. Try Browser Print / PDF instead.");
    } finally {
      wrap.remove();
      btn.disabled = false;
    }
  }

  // ---------- EVENTS ----------
  function setupEvents() {
    els.textarea.addEventListener("input", scheduleRender);

    // Scroll sync (lock prevents the two panes from fighting)
    let active = null,
      timer;
    const link = (src, dst, name) =>
      src.addEventListener("scroll", () => {
        if (state.viewMode !== "split" || mq.matches) return;
        if (active && active !== name) return;
        active = name;
        clearTimeout(timer);
        timer = setTimeout(() => {
          active = null;
        }, 120);
        const max = src.scrollHeight - src.clientHeight;
        if (max > 0)
          dst.scrollTop =
            (src.scrollTop / max) * (dst.scrollHeight - dst.clientHeight);
      });
    link(els.textarea, els.previewPanel, "editor");
    link(els.previewPanel, els.textarea, "preview");

    els.title.addEventListener("input", (e) => {
      state.title = e.target.value;
      patchConfig({ coverTitle: e.target.value });
    });

    $("btn-view-split").onclick = () => setViewMode("split");
    $("btn-view-editor").onclick = () => setViewMode("editor");
    $("btn-view-preview").onclick = () => setViewMode("preview");
    ["editor", "preview", "settings"].forEach((t) => {
      $("m-btn-" + t).onclick = () => setMobileTab(t);
    });

    $("btn-toggle-left-sidebar").onclick = () => toggleSidebar(els.leftSidebar);
    $("btn-toggle-right-sidebar").onclick = () =>
      toggleSidebar(els.rightSidebar);
    $("btn-mobile-sidebar-toggle").onclick = () =>
      toggleSidebar(els.leftSidebar);
    mq.addEventListener("change", layoutForViewport);

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach((b) => {
          b.classList.remove("border-brand-500", "text-brand-500");
          b.classList.add("border-transparent");
        });
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.add("hidden"));
        btn.classList.add("border-brand-500", "text-brand-500");
        btn.classList.remove("border-transparent");
        $(btn.dataset.tab).classList.remove("hidden");
      };
    });

    // Bind every customisation control from one table
    for (const [id, key, labelId, fmt, numeric, checkbox] of CONTROLS) {
      const el = $(id);
      if (!el) continue;
      el.addEventListener(
        checkbox || el.tagName === "SELECT" ? "change" : "input",
        () => {
          const v = checkbox
            ? el.checked
            : numeric
              ? parseFloat(el.value)
              : el.value;
          state.config[key] = v;
          if (labelId) $(labelId).textContent = fmt(v);
          applyConfig();
          autosave();
        },
      );
    }

    // Handle Logo Upload
    $("cover-input-logo").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        state.config.coverLogo = ev.target.result;
        applyConfig();
        autosave();
      };
      reader.readAsDataURL(file);
    };

    document.querySelectorAll(".theme-preset-btn").forEach((b) => {
      b.onclick = () => applyTheme(b.dataset.theme);
    });
    $("preset-selector").onchange = (e) => applyPreset(e.target.value);

    // Files
    $("btn-import-md").onclick = () => $("file-input-md").click();
    $("file-input-md").onchange = (e) => {
      loadFile(e.target.files[0]);
      e.target.value = "";
    };
    $("image-upload-input").onchange = (e) => {
      loadFile(e.target.files[0]);
      e.target.value = "";
    };
    $("btn-new-doc").onclick = () => {
      if (confirm("Start a new document? Unsaved changes will be lost."))
        loadMarkdownText(
          "# New Document\n\nType your content...",
          "New Document",
        );
    };
    $("btn-sample-doc").onclick = () => {
      if (confirm("Replace the current document with the sample?"))
        loadMarkdownText(SAMPLE_MARKDOWN, "Enterprise Specification");
    };

    // Drag & drop
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => e.preventDefault());
    ["dragenter", "dragover"].forEach((ev) =>
      els.editorPanel.addEventListener(ev, (e) => {
        e.preventDefault();
        els.dropOverlay.classList.remove("hidden");
      }),
    );
    els.editorPanel.addEventListener("dragleave", (e) => {
      if (!els.editorPanel.contains(e.relatedTarget))
        els.dropOverlay.classList.add("hidden");
    });
    els.editorPanel.addEventListener("drop", (e) => {
      e.preventDefault();
      els.dropOverlay.classList.add("hidden");
      loadFile(e.dataTransfer.files[0]);
    });

    // Export
    $("btn-export-dropdown").onclick = (e) => {
      e.stopPropagation();
      els.exportMenu.classList.toggle("hidden");
    };
    document.addEventListener("click", () =>
      els.exportMenu.classList.add("hidden"),
    );
    $("btn-print-browser").onclick = () =>
      els.printModal.classList.remove("hidden");
    $("btn-close-modal").onclick = () => els.printModal.classList.add("hidden");
    $("btn-proceed-print").onclick = () => {
      els.printModal.classList.add("hidden");
      setTimeout(() => window.print(), 50);
    };
    $("btn-client-pdf").onclick = exportClientPDF;

    // Settings persistence
    $("btn-save-preset").onclick = () =>
      toast(
        writeStore()
          ? "Settings and document saved in this browser"
          : "Could not save (browser storage is blocked)",
      );
    $("btn-export-preset-json").onclick = () => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(state.config, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `preset-${Date.now()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }

  // ---------- INIT ----------
  function init() {
    if (typeof marked !== "undefined")
      marked.setOptions({ gfm: true, breaks: true });
    els.textarea.value = state.markdown;
    els.title.value = state.title;
    syncControls();
    applyConfig();
    setupEvents();
    layoutForViewport();
    started = true;
    renderMarkdown();
  }
  window.addEventListener("DOMContentLoaded", init);
})();
