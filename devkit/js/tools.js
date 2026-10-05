/* ============================================================
   DevKit — Tool Registry & Site Shell (header, footer, router)
   ============================================================ */

window.DevKit = (function () {
  const categories = [
    {
      id: "json",
      name: "JSON Tools",
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

  const IC = () => window.DKIcons;
  const AD = () => (window.DK ? window.DK.adSlot() : "");

  /* ---------- theme toggle ---------- */
  function initThemeToggle() {
    const btn = document.getElementById("dk-theme");
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    const mqLight = window.matchMedia("(prefers-color-scheme: light)");
    // follow the OS while the user has not chosen a theme explicitly
    mqListen(mqLight, () => {
      let saved = null;
      try { saved = localStorage.getItem("devkit-theme"); } catch (e) {}
      if (saved !== "light" && saved !== "dark") applyTheme(mqLight.matches ? "light" : "dark");
    });
    btn.onclick = () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("devkit-theme", next); } catch (e) { /* private mode — ignore */ }
    };
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const btn = document.getElementById("dk-theme");
    if (btn) btn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
  }
  function mqListen(mq, fn) { if (mq.addEventListener) mq.addEventListener("change", fn); else if (mq.addListener) mq.addListener(fn); }

  /* ---------- mobile drawer ---------- */
  function closeMenu() {
    document.body.classList.remove("nav-open");
    const ov = document.getElementById("dk-overlay");
    if (ov) ov.hidden = true;
    const b = document.getElementById("dk-burger");
    if (b) { b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Open menu"); }
  }
  function openMenu() {
    document.body.classList.add("nav-open");
    const ov = document.getElementById("dk-overlay");
    if (ov) ov.hidden = false;
    const b = document.getElementById("dk-burger");
    if (b) { b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-label", "Close menu"); }
    const first = document.querySelector("#dk-nav .nav-group-btn");
    if (first) first.focus();
  }
  function initMenu() {
    const burger = document.getElementById("dk-burger");
    const overlay = document.getElementById("dk-overlay");
    if (!burger) return;
    burger.onclick = e => {
      e.stopPropagation();
      document.body.classList.contains("nav-open") ? closeMenu() : openMenu();
    };
    if (overlay) overlay.onclick = closeMenu;
    document.addEventListener("keydown", e => {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.key === "Escape") { closeMenu(); burger.focus(); return; }
      if (e.key === "Tab") { // simple focus trap inside the drawer
        const nav = document.getElementById("dk-nav");
        const items = [...(nav ? nav.querySelectorAll("a, button") : [])].filter(el => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- shell rendering ---------- */
  function renderHeader(activeId) {
    const nav = document.getElementById("dk-nav");
    if (!nav) return;
    nav.innerHTML = categories.map(c => `
      <div class="nav-group">
        <button class="nav-group-btn" data-cat="${c.id}" aria-haspopup="true" aria-expanded="false">${IC().catIconHTML(c.id, 20)} <span>${c.name}</span></button>
        <div class="nav-drop">
          ${c.tools.map(t => `<a href="#/${t.id}" class="${t.id === activeId ? "active" : ""}">${IC().icon(t.id, 24)}<span>${t.name}</span></a>`).join("")}
        </div>
      </div>`).join("");
    nav.querySelectorAll(".nav-group-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const drop = btn.nextElementSibling;
        const willOpen = !drop.classList.contains("open");
        nav.querySelectorAll(".nav-drop.open").forEach(d => {
          d.classList.remove("open");
          d.previousElementSibling.setAttribute("aria-expanded", "false");
        });
        if (willOpen) { drop.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
    document.addEventListener("click", () => nav.querySelectorAll(".nav-drop.open").forEach(d => {
      d.classList.remove("open");
      d.previousElementSibling.setAttribute("aria-expanded", "false");
    }));
    initMenu();
    initThemeToggle();
  }

  function relatedToolsHTML(toolId) {
    const ids = related[toolId] || [];
    if (!ids.length) return "";
    return `
      <section class="related">
        <h2>${IC().i("arrow", "h-ic")} Related tools you might need</h2>
        <div class="related-grid">
          ${ids.map(id => {
            const t = toolMap[id];
            return `<a class="related-card" href="#/${id}">
              ${IC().icon(id, 34)}
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
        <div class="footer-brand">
          <div class="logo">${IC().icon("", 34)}<span><span class="dk-badge">DevKit</span><small>Free Online Developer Tools</small></span></div>
          <p>Dozens of fast developer tools. Tool input is processed entirely in your browser — nothing you paste is uploaded. The site is supported by advertising.</p>
        </div>
        ${categories.map(c => `
          <div>
            <h4>${IC().catIconHTML(c.id, 18)} ${c.name}</h4>
            ${c.tools.map(t => `<a href="#/${t.id}">${IC().icon(t.id, 16)} ${t.name}</a>`).join("")}</div>`).join("")}
        <div>
          <h4>${IC().i("file", "ic-sm")} Site</h4>
          <a href="#/about">${IC().i("star", "ic-sm")} About</a>
          <a href="#/privacy">${IC().i("lock", "ic-sm")} Privacy Policy</a>
          <a href="#/terms">${IC().i("check", "ic-sm")} Terms of Use</a>
          <a href="#/contact">${IC().i("wrench", "ic-sm")} Contact</a>
        </div>
      </div>
      <p class="footer-note">© ${new Date().getFullYear()} DevKit — Free Online Developer Tools. Tool data is processed client-side; ads are served by Google.</p>`;
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
        <div class="breadcrumb"><a href="#/">${IC().i("wrench", "ic-sm")} DevKit Home</a> › <span>${t.category.name}</span> › <span class="crumb-cur">${t.name}</span></div>
        <header class="tool-head">
          ${IC().icon(toolId, 52)}
          <div>
            <h1>${t.name}</h1>
            <p class="tagline">${t.desc}</p>
          </div>
        </header>
        <div id="tool-ui"></div>
        ${AD()}
        ${relatedToolsHTML(toolId)}
        <section class="seo-copy" id="seo-copy"></section>
      </article>`;
    const ui = document.getElementById("tool-ui");
    const impl = window.ToolImpls && window.ToolImpls[toolId];
    if (impl) impl(ui); else ui.innerHTML = "<p>Tool coming soon.</p>";
    window.scrollTo(0, 0);
    wrapTables(main);
    DKloadAds();
    // SEO copy is injected by the tool implementation *after* mount — add a
    // clearly separated ad at the end of the SEO section (max-3 cap enforced in DK.loadAds).
    setTimeout(() => {
      const seo = document.getElementById("seo-copy");
      if (seo && seo.innerHTML.trim()) {
        const holder = document.createElement("div");
        holder.innerHTML = AD();
        seo.appendChild(holder);
        DKloadAds();
      }
    }, 0);
  }

  function DKloadAds() { try { if (window.DK) window.DK.loadAds(document.getElementById("app")); } catch (e) {} }

  /* ---------- put tables in a horizontal scroll wrapper (responsive) ---------- */
  function wrapTables(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("table.data").forEach(t => {
      if (t.parentElement && t.parentElement.classList.contains("table-wrap")) return;
      const w = document.createElement("div");
      w.className = "table-wrap";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }
  // auto-wrap tables that tools render into their output containers after mount
  function initTableObserver() {
    if (!("MutationObserver" in window)) return;
    const app = document.getElementById("app");
    if (!app || app.dataset.tableObs) return;
    app.dataset.tableObs = "1";
    new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) {
            if (n.matches && n.matches("table.data")) wrapTables(n.parentElement);
            else if (n.querySelectorAll) wrapTables(n);
          }
        }
      }
    }).observe(app, { childList: true, subtree: true });
  }

  function renderHome() {
    const main = document.getElementById("app");
    document.title = "DevKit — Free Online Developer Tools (JSON, JWT, Base64, UUID, QR & more)";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "DevKit offers dozens of free online developer tools: JSON formatter & validator, free JWT decoder online, Base64, URL encoder, UUID, password, hash, QR code generators, Unix timestamp converters and more.";
    renderHeader(null);
    main.innerHTML = `
      <div class="hero">
        <div class="hero-stickers">${IC().icon("jwt-decoder", 44)}${IC().icon("json-formatter", 44)}${IC().icon("base64", 44)}${IC().icon("uuid", 44)}${IC().icon("qr-code", 44)}${IC().icon("unix-timestamp", 44)}</div>
        <h1><span class="dk-badge">DevKit</span> — Free Online Developer Tools</h1>
        <p>Dozens of fast tools for developers. <strong>Tool data stays in your browser</strong> — nothing you paste is uploaded. The site itself is supported by ads.</p>
        <div class="search-wrap">${IC().i("search", "search-ic")}<input id="home-search" class="search" type="search" placeholder="Search a tool… e.g. “jwt decoder”, “base64”" autocomplete="off" aria-label="Search tools"></div>
        <div class="hero-badges chips-row">${categories.map(c => `<a class="chip" href="#cat-${c.id}">${IC().catIconHTML(c.id, 18)} ${c.name}</a>`).join("")}</div>
        <div class="hero-badges"><span>${IC().i("check", "ic-sm")} Client-side tools</span><span>${IC().i("zap", "ic-sm")} Instant results</span><span>${IC().i("lock", "ic-sm")} No sign-up</span></div>
      </div>
      ${AD()}
      <div id="home-cats">
        ${categories.map(c => `
          <section class="cat-block" id="cat-${c.id}">
            <h2>${IC().catIconHTML(c.id, 30)} ${c.name}</h2>
            <div class="tool-grid">
              ${c.tools.map(t => `
                <a class="tool-card" href="#/${t.id}" data-search="${(t.name + ' ' + t.desc + ' ' + t.keywords).toLowerCase()}">
                  <div class="card-top">${IC().icon(t.id, 42)}<strong>${t.name}</strong></div>
                  <span>${t.desc}</span>
                  <em class="card-cta">Open tool ${IC().i("arrow", "ic-sm")}</em>
                </a>`).join("")}
            </div>
          </section>`).join("")}
      </div>
      <section class="popular-seo">
        <h2>${IC().i("star", "h-ic")} Popular searches we cover</h2>
        <p>
          <a href="#/jwt-decoder">${IC().icon("jwt-decoder", 18)} free jwt decoder online</a> ·
          <a href="#/json-formatter">${IC().icon("json-formatter", 18)} json formatter online</a> ·
          <a href="#/base64">${IC().icon("base64", 18)} base64 decode online</a> ·
          <a href="#/uuid">${IC().icon("uuid", 18)} uuid generator</a> ·
          <a href="#/unix-timestamp">${IC().icon("unix-timestamp", 18)} unix timestamp now</a> ·
          <a href="#/qr-code">${IC().icon("qr-code", 18)} qr code generator free</a> ·
          <a href="#/hash">${IC().icon("hash", 18)} md5 hash online</a> ·
          <a href="#/regex-tester">${IC().icon("regex-tester", 18)} regex tester</a> ·
          <a href="#/password">${IC().icon("password", 18)} strong password generator</a> ·
          <a href="#/jwt-validator">${IC().icon("jwt-validator", 18)} jwt verifier online</a>
        </p>
      </section>
      ${AD()}`;
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
      // hide the top ad while search results are filtered (policy: no ads on empty/partial states)
      const topAd = document.querySelector("#app > .ad-wrap");
      if (topAd) topAd.classList.toggle("ad-hidden", !!q);
    });
    DKloadAds();
  }

  /* ---------- static info pages (AdSense policy: privacy, about, contact, terms) ---------- */
  const PRIVACY_LINKS = `Google's tools (AdSense, etc.) may use cookies to serve ads based on a user's prior visits to this or other websites. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">google.com/settings/ads</a>, and read Google's actual privacy practices at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">policies.google.com/technologies/partner-sites</a>.`;

  const infoPages = {
    "privacy": {
      name: "Privacy Policy",
      desc: "What data DevKit sees, cookies and Google AdSense.",
      body: `<h2>DevKit Privacy Policy</h2>
        <p><em>Last updated: October 2026</em></p>
        <h3>Your tool data stays in your browser</h3>
        <p>All DevKit tools (JSON formatter, JWT decoder, Base64, hash, password generator, etc.) run entirely client-side. The text, tokens and secrets you paste into a tool are processed locally by JavaScript in your browser and are never transmitted to, logged by, or stored on any server we control.</p>
        <h3>Advertising &amp; cookies</h3>
        <p>This website uses <strong>Google AdSense</strong> to display advertisements. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this or other websites. These cookies enable Google to personalize the ads you see (and measure ad performance). No personal information is collected by the tools themselves.</p>
        <p>${PRIVACY_LINKS}</p>
        <h3>Local storage</h3>
        <p>We store small UI preferences (your dark/light theme choice) in your browser's localStorage. This never leaves your device and contains no personal data.</p>
        <h3>Analytics</h3>
        <p>We do not run our own analytics scripts. Any measurement performed by Google's ad tags is governed by Google's privacy policies (linked above).</p>
        <h3>Consent (EEA / UK / Switzerland)</h3>
        <p>For visitors from the European Economic Area, the United Kingdom and Switzerland, a consent message provided by Google's certified consent management platform (enabled via AdSense → Privacy &amp; messaging) governs cookie use before personalized ads are shown.</p>
        <h3>Contact</h3>
        <p>Questions about privacy? Use the details on our <a href="#/contact">Contact page</a>.</p>`
    },
    "about": {
      name: "About DevKit",
      desc: "Why DevKit exists and how it works.",
      body: `<h2>About DevKit</h2>
        <p>DevKit is a collection of free online developer utilities — JSON formatting &amp; conversion, JWT decoding/signing/verification, Base64 and URL encoding, code formatters, UUID/password/hash/QR generators and timestamp converters.</p>
        <h3>How it works</h3>
        <p>DevKit is a single-page app written in plain HTML, CSS and JavaScript with no frameworks and no build step. Every tool runs locally in your browser, so results appear instantly and your data never leaves your machine.</p>
        <h3>Who maintains it</h3>
        <p>DevKit is an independent project maintained by developers, for developers. It is supported by unobtrusive display advertising, which keeps every tool free.</p>
        <h3>Our promises</h3>
        <ul><li>Free tools, no sign-up, no account required.</li><li>Tool input/output is processed only in your browser.</li><li>Ads are clearly labelled and never interfere with the tools.</li></ul>`
    },
    "contact": {
      name: "Contact",
      desc: "Report bugs or request a new tool.",
      body: `<h2>Contact DevKit</h2>
        <p>We'd love your feedback — bug reports, missing features or tool requests.</p>
        <h3>Email</h3>
        <p>For privacy and anti-spam reasons, reach us at <code>hello@devkit.tools</code> (replace <code>devkit.tools</code> with the domain you are reading this on if it differs).</p>
        <h3>What to include</h3>
        <ul><li>Which tool the issue affects (e.g. “JWT Validator”).</li><li>What you expected vs what happened.</li><li>Your browser and OS.</li></ul>
        <p class="hint">Please don't send real production secrets in bug reports — sample values are enough to reproduce almost any issue.</p>`
    },
    "terms": {
      name: "Terms of Use",
      desc: "The rules for using DevKit's free tools.",
      body: `<h2>DevKit Terms of Use</h2>
        <p><em>Last updated: October 2026</em></p>
        <h3>Use as-is</h3>
        <p>DevKit's tools are provided “as is”, without warranty of any kind. They are intended for convenience and education; always validate critical output (signatures, hashes, conversions) against authoritative libraries or servers before relying on it in production.</p>
        <h3>Acceptable use</h3>
        <p>You may use DevKit for legitimate development work. Do not use the site or its content for unlawful purposes, do not attempt to disrupt the service, and do not scrape or mirror the tools in ways that conflict with Google AdSense program policies.</p>
        <h3>Intellectual property</h3>
        <p>The DevKit name, design and source code of this site are © DevKit. Tool outputs you generate belong to you.</p>
        <h3>Third parties</h3>
        <p>Ads served by Google and linked third-party sites are governed by their own terms and privacy policies.</p>
        <h3>Changes</h3>
        <p>We may update these terms; continued use of the site means you accept the current version published here.</p>`
    }
  };

  function mountInfo(pageId) {
    const p = infoPages[pageId];
    const main = document.getElementById("app");
    document.title = `${p.name} — DevKit Free Online Developer Tools`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${p.desc} DevKit — free online developer tools.`;
    renderHeader(null);
    main.innerHTML = `
      <article class="tool-page info-page">
        <div class="breadcrumb"><a href="#/">${IC().i("wrench", "ic-sm")} DevKit Home</a> › <span class="crumb-cur">${p.name}</span></div>
        <header class="tool-head">
          ${IC().catIconHTML("json", 52)}
          <div><h1>${p.name}</h1><p class="tagline">${p.desc}</p></div>
        </header>
        <section class="seo-copy info-body">${p.body}</section>
      </article>`;
    window.scrollTo(0, 0);
    DKloadAds();
  }

  /* ---------- routing ---------- */
  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash || hash === "home") renderHome();
    else if (infoPages[hash]) mountInfo(hash);
    else mountTool(hash);
  }

  function init() {
    renderFooter();
    initTableObserver();
    route();
    window.addEventListener("hashchange", () => { closeMenu(); route(); });
    // close mobile menu when a nav link is tapped
    document.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("#dk-nav a");
      if (a) closeMenu();
    });
  }

  return { init, categories, toolMap, related, infoPages };
})();
