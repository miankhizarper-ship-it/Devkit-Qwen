/* ============================================================
   DevKit — Tool Registry & Site Shell (header, footer, router)
   ============================================================ */

window.DevKit = (function () {
  const categories = [
    {
      id: "json",
      name: "JSON Tools",
      icon: "{ }",
      tools: [
        { id: "json-formatter",  name: "JSON Formatter",          desc: "Pretty-print & beautify JSON with syntax highlighting.", keywords: "json formatter beautifier prettify online" },
        { id: "json-validator",  name: "JSON Validator",          desc: "Validate JSON and get exact error line & column.",     keywords: "json validator check validate online" },
        { id: "json-minifier",   name: "JSON Minifier",           desc: "Compress JSON by removing whitespace & newlines.",     keywords: "json minifier compress shrink" },
        { id: "json-to-csv",     name: "JSON → CSV",              desc: "Convert a JSON array into CSV data.",                  keywords: "json to csv converter" },
        { id: "json-to-ts",      name: "JSON → TypeScript",       desc: "Generate TypeScript interfaces from JSON.",            keywords: "json to typescript interface generator" },
        { id: "json-to-yaml",    name: "JSON → YAML",             desc: "Convert JSON into clean YAML.",                        keywords: "json to yaml converter" }
      ]
    },
    {
      id: "jwt",
      name: "JWT Tools",
      icon: "🔑",
      tools: [
        { id: "jwt-decoder",   name: "Free JWT Decoder Online", desc: "Decode any JWT — header, payload & signature in one click.", keywords: "jwt decoder online base64url decode token" },
        { id: "jwt-generator", name: "JWT Generator",           desc: "Create signed HS256 JWTs right in your browser.",          keywords: "jwt generator online sign token hs256" },
        { id: "jwt-validator", name: "JWT Validator",           desc: "Verify JWT signatures & check expiry.",                  keywords: "jwt validator verify signature expired" },
        { id: "jwt-inspector", name: "JWT Inspector",           desc: "Deep inspection: claims, typ, alg, kid, exp as date.",     keywords: "jwt inspector claims analyzer" }
      ]
    },
    {
      id: "code",
      name: "Code & Encoding",
      icon: "</>",
      tools: [
        { id: "base64",         name: "Base64 Encoder / Decoder", desc: "Encode or decode Base64 text instantly.",        keywords: "base64 encode decode online" },
        { id: "url-encoder",    name: "URL Encoder / Decoder",    desc: "Percent-encode or decode URLs and query strings.", keywords: "url encoder percent encoding escape" },
        { id: "html-formatter", name: "HTML Formatter",           desc: "Beautify messy HTML markup.",                  keywords: "html formatter beautifier online" },
        { id: "css-formatter",  name: "CSS Formatter",            desc: "Pretty-print CSS stylesheets.",                keywords: "css formatter beautifier" },
        { id: "js-formatter",   name: "JS Formatter",             desc: "Format & indent JavaScript code.",             keywords: "javascript formatter beautifier online" },
        { id: "sql-formatter",  name: "SQL Formatter",            desc: "Format SQL queries for readability.",          keywords: "sql formatter beautifier online" },
        { id: "regex-tester",   name: "Regex Tester",             desc: "Test regular expressions with live matches & groups.", keywords: "regex tester javascript regular expression" }
      ]
    },
    {
      id: "generators",
      name: "Generators",
      icon: "⚡",
      tools: [
        { id: "uuid",            name: "UUID Generator",            desc: "Generate v4 UUIDs (RFC 4122) in bulk.",      keywords: "uuid generator v4 guid online" },
        { id: "password",        name: "Password Generator",        desc: "Strong random passwords with entropy meter.", keywords: "password generator secure random" },
        { id: "hash",            name: "Hash Generator",            desc: "MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes.", keywords: "hash generator md5 sha256 online" },
        { id: "lorem-ipsum",     name: "Lorem Ipsum Generator",     desc: "Placeholder text: paragraphs, sentences, words.", keywords: "lorem ipsum generator dummy text" },
        { id: "qr-code",         name: "QR Code Generator",         desc: "Create QR codes for links & text, download as PNG.", keywords: "qr code generator online free" },
        { id: "color-palette",   name: "Color Palette Generator",   desc: "Harmonious color palettes from any base color.", keywords: "color palette generator hex shades tints" }
      ]
    },
    {
      id: "timestamp",
      name: "Time & Date",
      icon: "🕒",
      tools: [
        { id: "unix-timestamp",   name: "Unix Timestamp Converter", desc: "Unix seconds/milliseconds ↔ human date.",   keywords: "unix timestamp converter epoch now" },
        { id: "date-to-timestamp",name: "Date → Timestamp",         desc: "Pick a date, get its Unix timestamp.",       keywords: "date to unix timestamp converter" },
        { id: "timestamp-to-date",name: "Timestamp → Date",         desc: "Convert a timestamp back to a readable date.", keywords: "timestamp to date converter" },
        { id: "timezone-converter",name: "Timezone Converter",      desc: "Convert time between world timezones.",      keywords: "timezone converter utc ist pst" }
      ]
    }
  ];

  // flat lookup
  const toolMap = {};
  categories.forEach(c => c.tools.forEach(t => { toolMap[t.id] = { ...t, category: c }; }));

  /* ---------- related tools per tool (SEO internal linking) ---------- */
  const related = {
    "json-formatter": ["json-validator", "json-minifier", "jwt-decoder", "base64"],
    "json-validator": ["json-formatter", "json-minifier", "jwt-decoder", "json-to-yaml"],
    "json-minifier":  ["json-formatter", "json-validator", "base64", "json-to-csv"],
    "json-to-csv":    ["json-formatter", "json-to-yaml", "json-to-ts", "base64"],
    "json-to-ts":     ["json-formatter", "json-to-yaml", "json-validator", "regex-tester"],
    "json-to-yaml":   ["json-formatter", "json-to-ts", "json-to-csv", "html-formatter"],
    "jwt-decoder":    ["jwt-generator", "jwt-validator", "base64", "json-formatter"],
    "jwt-generator":  ["jwt-decoder", "jwt-validator", "hash", "base64"],
    "jwt-validator":  ["jwt-decoder", "jwt-generator", "hash", "base64"],
    "jwt-inspector":  ["jwt-decoder", "jwt-validator", "jwt-generator", "json-formatter"],
    "base64":         ["url-encoder", "jwt-decoder", "hash", "json-formatter"],
    "url-encoder":    ["base64", "regex-tester", "html-formatter", "json-formatter"],
    "html-formatter": ["css-formatter", "js-formatter", "url-encoder", "json-formatter"],
    "css-formatter":  ["html-formatter", "js-formatter", "color-palette", "regex-tester"],
    "js-formatter":   ["css-formatter", "html-formatter", "json-formatter", "regex-tester"],
    "sql-formatter":  ["regex-tester", "js-formatter", "json-formatter", "hash"],
    "regex-tester":   ["base64", "url-encoder", "js-formatter", "json-validator"],
    "uuid":           ["password", "hash", "jwt-generator", "lorem-ipsum"],
    "password":       ["hash", "uuid", "jwt-generator", "base64"],
    "hash":           ["password", "base64", "uuid", "jwt-validator"],
    "lorem-ipsum":    ["uuid", "color-palette", "qr-code", "html-formatter"],
    "qr-code":        ["url-encoder", "color-palette", "lorem-ipsum", "base64"],
    "color-palette":  ["css-formatter", "qr-code", "html-formatter", "lorem-ipsum"],
    "unix-timestamp": ["date-to-timestamp", "timestamp-to-date", "timezone-converter", "jwt-decoder"],
    "date-to-timestamp": ["unix-timestamp", "timestamp-to-date", "timezone-converter", "jwt-validator"],
    "timestamp-to-date": ["unix-timestamp", "date-to-timestamp", "timezone-converter", "jwt-inspector"],
    "timezone-converter": ["unix-timestamp", "date-to-timestamp", "timestamp-to-date", "jwt-decoder"]
  };

  /* ---------- shell rendering ---------- */
  function renderHeader(activeId) {
    const nav = document.getElementById("dk-nav");
    if (!nav) return;
    nav.innerHTML = categories.map(c => `
      <div class="nav-group">
        <button class="nav-group-btn" data-cat="${c.id}">${c.icon} ${c.name}</button>
        <div class="nav-drop">
          ${c.tools.map(t => `<a href="#/${t.id}" class="${t.id === activeId ? "active" : ""}">${t.name}</a>`).join("")}
        </div>
      </div>`).join("");
    nav.querySelectorAll(".nav-group-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const drop = btn.nextElementSibling;
        document.querySelectorAll(".nav-drop.open").forEach(d => { if (d !== drop) d.classList.remove("open"); });
        drop.classList.toggle("open");
      });
    });
    document.addEventListener("click", () => document.querySelectorAll(".nav-drop.open").forEach(d => d.classList.remove("open")));
  }

  function relatedToolsHTML(toolId) {
    const ids = related[toolId] || [];
    if (!ids.length) return "";
    return `
      <section class="related">
        <h2>Related tools you might need</h2>
        <div class="related-grid">
          ${ids.map(id => {
            const t = toolMap[id];
            return `<a class="related-card" href="#/${id}">
              <strong>${t.name}</strong>
              <span>${t.desc}</span>
            </a>`;
          }).join("")}
        </div>
      </section>`;
  }

  function renderFooter() {
    const f = document.getElementById("dk-footer");
    if (!f) return;
    f.innerHTML = `
      <div class="footer-cols">
        ${categories.map(c => `
          <div>
            <h4>${c.name}</h4>
            ${c.tools.map(t => `<a href="#/${t.id}">${t.name}</a>`).join("")}
          </div>`).join("")}
      </div>
      <p class="footer-note">DevKit — Free Online Developer Tools. Everything runs 100% in your browser; no data is sent to any server.</p>`;
  }

  /* ---------- page mount helpers ---------- */
  function mountTool(toolId) {
    const t = toolMap[toolId];
    const main = document.getElementById("app");
    if (!t) { renderHome(); return; }
    document.title = `${t.name} — DevKit Free Online Developer Tools`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${t.desc} ${t.keywords}. Fast, free and private — runs entirely in your browser.`;
    renderHeader(toolId);
    main.innerHTML = `
      <article class="tool-page" id="tool-page">
        <div class="breadcrumb"><a href="#/">DevKit Home</a> › <a href="#/">${t.category.name}</a> › <span>${t.name}</span></div>
        <h1>${t.name}</h1>
        <p class="tagline">${t.desc}</p>
        <div id="tool-ui"></div>
        <aside class="ad-slot ad-inline" aria-hidden="true">Advertisement space (728×90)</aside>
        ${relatedToolsHTML(toolId)}
        <section class="seo-copy" id="seo-copy"></section>
      </article>`;
    const ui = document.getElementById("tool-ui");
    const impl = window.ToolImpls && window.ToolImpls[toolId];
    if (impl) impl(ui); else ui.innerHTML = "<p>Tool coming soon.</p>";
    window.scrollTo(0, 0);
  }

  function renderHome() {
    const main = document.getElementById("app");
    document.title = "DevKit — Free Online Developer Tools (JSON, JWT, Base64, UUID, QR & more)";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "DevKit offers dozens of free online developer tools: JSON formatter & validator, free JWT decoder online, Base64, URL encoder, UUID, password, hash, QR code generators, Unix timestamp converters and more.";
    renderHeader(null);
    main.innerHTML = `
      <div class="hero">
        <h1>DevKit — Free Online Developer Tools</h1>
        <p>Dozens of fast, privacy-friendly tools for developers. <strong>Everything runs in your browser</strong> — nothing is uploaded.</p>
        <input id="home-search" class="search" type="search" placeholder="Search a tool… e.g. “jwt decoder”, “base64”" autofocus>
      </div>
      <aside class="ad-slot ad-top" aria-hidden="true">Advertisement space (970×250)</aside>
      <div id="home-cats">
        ${categories.map(c => `
          <section class="cat-block" id="cat-${c.id}">
            <h2>${c.icon} ${c.name}</h2>
            <div class="tool-grid">
              ${c.tools.map(t => `
                <a class="tool-card" href="#/${t.id}" data-search="${(t.name + ' ' + t.desc + ' ' + t.keywords).toLowerCase()}">
                  <strong>${t.name}</strong>
                  <span>${t.desc}</span>
                </a>`).join("")}
            </div>
          </section>`).join("")}
      </div>
      <section class="popular-seo">
        <h2>Popular searches we cover</h2>
        <p>
          <a href="#/jwt-decoder">free jwt decoder online</a> ·
          <a href="#/json-formatter">json formatter online</a> ·
          <a href="#/base64">base64 decode online</a> ·
          <a href="#/uuid">uuid generator</a> ·
          <a href="#/unix-timestamp">unix timestamp now</a> ·
          <a href="#/qr-code">qr code generator free</a> ·
          <a href="#/hash">md5 hash online</a> ·
          <a href="#/regex-tester">regex tester</a> ·
          <a href="#/password">strong password generator</a> ·
          <a href="#/jwt-validator">jwt verifier online</a>
        </p>
      </section>`;
    const s = document.getElementById("home-search");
    s.addEventListener("input", () => {
      const q = s.value.trim().toLowerCase();
      document.querySelectorAll(".tool-card").forEach(card => {
        card.style.display = !q || card.dataset.search.includes(q) ? "" : "none";
      });
      document.querySelectorAll(".cat-block").forEach(block => {
        const anyVisible = [...block.querySelectorAll(".tool-card")].some(c => c.style.display !== "none");
        block.style.display = anyVisible ? "" : "none";
      });
    });
  }

  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash || hash === "home") renderHome();
    else mountTool(hash);
  }

  function init() {
    renderFooter();
    route();
    window.addEventListener("hashchange", route);
  }

  return { init, categories, toolMap, related };
})();
