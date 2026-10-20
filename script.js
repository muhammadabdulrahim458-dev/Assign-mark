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
    bodyFont: "'Times New Roman', Times, serif",
    headingFont: "'Times New Roman', Times, serif",
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
    imgOcc = 0; // image counter restarts on every render
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
    refreshImageSelection();
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

  // ---------- IMAGES ----------
  const IMG_KEY = "markdownStudio.images.v1";
  const IMG_RE = /!\[([^\]]*)\]\(img:([a-z0-9]+)(?:\s+"([^"]*)")?\)/g;
  const CODE_MASK_RE = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$|`[^`\n]+`/gm;

  let imageStore = (() => {
    try {
      return JSON.parse(localStorage.getItem(IMG_KEY)) || {};
    } catch (e) {
      return {};
    }
  })();
  let imgOcc = 0, // image counter, reset on every render
    selOcc = -1, // which image occurrence is selected
    imgBox = null,
    storageWarned = false;

  const newImageId = () =>
    Math.random().toString(36).slice(2, 10).padEnd(8, "0");

  function persistImages() {
    try {
      localStorage.setItem(IMG_KEY, JSON.stringify(imageStore));
    } catch (e) {
      if (!storageWarned) {
        storageWarned = true;
        toast(
          "Browser storage is full: images will not survive a reload. Export your PDF soon.",
        );
      }
    }
  }

  // Drop stored images that no document references (runs once at startup, so Undo keeps working)
  function pruneImages(md) {
    const used = new Set(
      [...md.matchAll(/\(img:([a-z0-9]+)/g)].map((m) => m[1]),
    );
    let changed = false;
    Object.keys(imageStore).forEach((k) => {
      if (!used.has(k)) {
        delete imageStore[k];
        changed = true;
      }
    });
    if (changed) persistImages();
  }

  // Convert inline base64 images into short references
  function migrateInlineImages(md) {
    let changed = false;
    const out = md.replace(
      /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)\)/g,
      (m, alt, data) => {
        const id = newImageId();
        imageStore[id] = data;
        changed = true;
        return `![${alt}](img:${id})`;
      },
    );
    if (changed) persistImages();
    return out;
  }

  const readAsDataURL = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  // Downscale + compress so localStorage and the PDF stay small
  async function prepareImage(file) {
    const raw = await readAsDataURL(file);
    if (file.type === "image/svg+xml" || file.type === "image/gif") return raw;
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = raw;
    });
    const MAX = 1600;
    const scale = Math.min(
      1,
      MAX / Math.max(img.naturalWidth, img.naturalHeight),
    );
    if (scale === 1 && file.size < 400 * 1024) return raw;

    const cv = document.createElement("canvas");
    cv.width = Math.round(img.naturalWidth * scale);
    cv.height = Math.round(img.naturalHeight * scale);
    const ctx = cv.getContext("2d");
    if (file.type === "image/png") {
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      const png = cv.toDataURL("image/png");
      if (png.length < 800000) return png; // keep transparency when small enough
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL("image/jpeg", 0.88);
  }

  async function insertImages(files) {
    const parts = [];
    for (const f of files) {
      try {
        const id = newImageId();
        imageStore[id] = await prepareImage(f);
        const alt =
          (/^image\.\w+$/i.test(f.name)
            ? "Image"
            : f.name.replace(/\.[^.]+$/, "")
          )
            .replace(/[\[\]\n]/g, " ")
            .trim() || "Image";
        parts.push(`![${alt}](img:${id})`);
      } catch (e) {
        toast("Could not read image: " + f.name);
      }
    }
    if (!parts.length) return;
    persistImages();
    const ta = els.textarea,
      before = ta.value.slice(0, ta.selectionStart);
    const prefix =
      !before || before.endsWith("\n\n")
        ? ""
        : before.endsWith("\n")
          ? "\n"
          : "\n\n";
    ta.setRangeText(
      prefix + parts.join("\n\n") + "\n\n",
      ta.selectionStart,
      ta.selectionEnd,
      "end",
    );
    renderMarkdown();
    toast(
      parts.length > 1
        ? parts.length + " images added"
        : "Image added: click it in the preview to resize",
    );
  }

  // "w=60,a=right"  ->  { w: 60, a: "right" }
  function parseImgMeta(t) {
    const o = {};
    (t || "").split(",").forEach((p) => {
      const [k, v] = p.split("=").map((s) => (s || "").trim());
      if (k === "w" && +v > 0) o.w = Math.min(100, Math.round(+v));
      if (k === "a" && ["left", "center", "right"].includes(v)) o.a = v;
    });
    return o;
  }

  // marked renderer: img:ID -> real <img>   (marked v12 signature)
  function renderImage(href, title, text) {
    if (!href || !href.startsWith("img:")) return false; // normal images: default behaviour
    const id = href.slice(4),
      occ = imgOcc++,
      { w, a = "center" } = parseImgMeta(title),
      src = imageStore[id];
    if (!src)
      return `<span class="img-missing">Image not found in this browser (${esc(text || id)})</span>`;
    const ml = a === "left" ? "0" : "auto",
      mr = a === "right" ? "0" : "auto";
    return `<img src="${src}" alt="${esc(text)}" data-img-id="${id}" data-occ="${occ}" data-align="${a}" draggable="false" style="${w ? `width:${w}%;` : ""}margin-left:${ml};margin-right:${mr}">`;
  }

  // Write a size/alignment change (or deletion) back into the Markdown source
  function editImage(occ, patch, remove) {
    const src = els.textarea.value;
    const masked = src.replace(CODE_MASK_RE, (m) => " ".repeat(m.length)); // ignore code blocks
    let n = 0;
    for (const m of masked.matchAll(IMG_RE)) {
      if (n++ !== occ) continue;
      let out = "";
      if (!remove) {
        const orig = src
          .slice(m.index, m.index + m[0].length)
          .match(new RegExp(IMG_RE.source));
        const meta = Object.assign(parseImgMeta(orig[3]), patch);
        Object.keys(meta).forEach((k) => meta[k] == null && delete meta[k]);
        const s = [
          meta.w != null ? `w=${meta.w}` : "",
          meta.a && meta.a !== "center" ? `a=${meta.a}` : "",
        ]
          .filter(Boolean)
          .join(",");
        out = `![${orig[1]}](img:${orig[2]}${s ? ` "${s}"` : ""})`;
      }
      els.textarea.value =
        src.slice(0, m.index) + out + src.slice(m.index + m[0].length);
      renderMarkdown();
      return;
    }
  }

  const selectedImg = () =>
    selOcc < 0 ? null : els.body.querySelector(`img[data-occ="${selOcc}"]`);

  function positionImgBox() {
    if (!imgBox) return;
    const img = selectedImg();
    if (!img) {
      imgBox.classList.add("hidden");
      return;
    }
    const r = img.getBoundingClientRect(),
      pr = els.previewPanel.getBoundingClientRect();
    if (!r.width) {
      imgBox.classList.add("hidden");
      return;
    }
    imgBox.classList.remove("hidden");
    imgBox.style.left = r.left - pr.left + els.previewPanel.scrollLeft + "px";
    imgBox.style.top = r.top - pr.top + els.previewPanel.scrollTop + "px";
    imgBox.style.width = r.width + "px";
    imgBox.style.height = r.height + "px";
    imgBox.classList.toggle("bar-below", r.top - pr.top < 52);
    const bodyW = els.body.getBoundingClientRect().width || 1;
    $("img-size-label").textContent = Math.round((r.width / bodyW) * 100) + "%";
  }

  // Called after every render: keep the selection alive across re-renders
  function refreshImageSelection() {
    const img = selectedImg();
    if (!img) selOcc = -1;
    else if (!img.complete)
      img.addEventListener("load", positionImgBox, { once: true });
    positionImgBox();
  }

  function buildImageBox() {
    imgBox = document.createElement("div");
    imgBox.id = "img-box";
    imgBox.className = "no-print hidden";
    imgBox.innerHTML = `
      <div id="img-bar">
        <button data-act="left" title="Align left"><i class="fa-solid fa-align-left"></i></button>
        <button data-act="center" title="Center"><i class="fa-solid fa-align-center"></i></button>
        <button data-act="right" title="Align right"><i class="fa-solid fa-align-right"></i></button>
        <span class="sep"></span>
        <span id="img-size-label">100%</span>
        <button data-act="fit" title="Full width"><i class="fa-solid fa-expand"></i></button>
        <button data-act="reset" title="Reset size"><i class="fa-solid fa-rotate-left"></i></button>
        <span class="sep"></span>
        <button data-act="delete" class="danger" title="Delete image (Del)"><i class="fa-solid fa-trash"></i></button>
      </div>
      <span class="img-handle" data-h="nw"></span><span class="img-handle" data-h="ne"></span>
      <span class="img-handle" data-h="sw"></span><span class="img-handle" data-h="se"></span>`;
    els.previewPanel.appendChild(imgBox);

    // Toolbar actions
    imgBox.querySelector("#img-bar").addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b || selOcc < 0) return;
      const act = b.dataset.act;
      if (act === "delete") {
        editImage(selOcc, null, true);
        selOcc = -1;
      } else if (act === "fit") editImage(selOcc, { w: 100 });
      else if (act === "reset") editImage(selOcc, { w: null, a: null });
      else editImage(selOcc, { a: act });
    });

    // Drag handles
    imgBox.querySelectorAll(".img-handle").forEach((h) => {
      h.addEventListener("pointerdown", (e) => {
        const img = selectedImg();
        if (!img) return;
        e.preventDefault();
        e.stopPropagation();
        h.setPointerCapture(e.pointerId);
        const align = img.dataset.align || "center",
          isWest = h.dataset.h.includes("w"),
          startX = e.clientX,
          startW = img.getBoundingClientRect().width,
          bodyW = els.body.getBoundingClientRect().width,
          // centered images grow on both sides, so the edge moves half as fast as the cursor
          factor = align === "center" ? 2 : 1,
          // right-aligned images are anchored on the right edge
          dir = isWest ? -1 : align === "right" ? -1 : 1;
        let pct = (startW / bodyW) * 100;
        const move = (ev) => {
          const w = startW + dir * (ev.clientX - startX) * factor;
          pct = Math.min(100, Math.max(5, (w / bodyW) * 100));
          img.style.width = pct + "%";
          positionImgBox();
        };
        const up = () => {
          h.removeEventListener("pointermove", move);
          h.removeEventListener("pointerup", up);
          h.removeEventListener("pointercancel", up);
          editImage(selOcc, { w: Math.round(pct) });
        };
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", up);
        h.addEventListener("pointercancel", up);
      });
    });

    // Select / deselect
    els.previewPanel.addEventListener("click", (e) => {
      if (imgBox.contains(e.target)) return;
      const img = e.target.closest && e.target.closest("img[data-img-id]");
      selOcc = img ? +img.dataset.occ : -1;
      positionImgBox();
    });

    document.addEventListener("keydown", (e) => {
      const t = e.target.tagName;
      if (selOcc < 0 || t === "INPUT" || t === "TEXTAREA" || t === "SELECT")
        return;
      if (e.key === "Escape") {
        selOcc = -1;
        positionImgBox();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        editImage(selOcc, null, true);
        selOcc = -1;
      }
    });

    // Layout changes (width slider, window resize, sidebars) keep the box aligned
    new ResizeObserver(positionImgBox).observe(els.paper);

    // Paste screenshots / copied images (like MS Word)
    document.addEventListener("paste", (e) => {
      const t = e.target.tagName;
      if (t === "INPUT" || t === "SELECT") return;
      const cd = e.clipboardData;
      if (!cd) return;
      const files = [...cd.items]
        .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter(Boolean);
      if (!files.length) return;
      if (cd.getData("text/plain").trim()) return; // real text on the clipboard: normal paste
      e.preventDefault();
      insertImages(files);
    });
  }

  // ---------- FILE HELPERS ----------
  function loadMarkdownText(text, name) {
    els.textarea.value = migrateInlineImages(text);
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
    reader.onload = (e) => loadMarkdownText(String(e.target.result), file.name);
    reader.readAsText(file);
  }
  function loadFiles(files) {
    const other = files.find((f) => !f.type.startsWith("image/"));
    if (other) return loadFile(other); // a .md file replaces the document
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length) insertImages(imgs);
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
      const f = Array.from(e.target.files);
      e.target.value = "";
      loadFiles(f);
    };
    $("image-upload-input").onchange = (e) => {
      const f = Array.from(e.target.files);
      e.target.value = "";
      loadFiles(f);
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
      loadFiles(Array.from(e.dataTransfer.files));
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

    // Image selection box, resize handles, paste support
    buildImageBox();
  }

  // ---------- INIT ----------
  function init() {
    if (typeof marked !== "undefined") {
      marked.setOptions({ gfm: true, breaks: true });
      marked.use({ renderer: { image: renderImage } });
    }
    state.markdown = migrateInlineImages(state.markdown);
    pruneImages(state.markdown);
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
