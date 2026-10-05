/* ============================================================
   DevKit icon system — crisp SVG icons used everywhere as
   colorful "stickers" (badges) + a few inline utility icons.
   Usage: DK.icon("json-formatter")  -> badge sticker markup
          DK.i("copy")               -> raw inline svg icon
   ============================================================ */
window.DKIcons = (function () {

  /* ---- line icons (24x24, stroke-based, Feather style) ---- */
  const P = {
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
    minus: '<path d="M5 12h14"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.3-8.3"/><path d="m16 7 3 3"/><path d="m19 4 2 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 11.5 2 2 4-4.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    binary: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/><path d="M13 6h7M4 17h7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    tag: '<path d="M12 2H2v10l9.3 9.3a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8z"/><circle cx="7" cy="7" r="1.4"/>',
    brackets: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M12 8v8"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    idcard: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8" cy="11" r="2"/><path d="M5 16c.7-1.5 1.8-2.2 3-2.2s2.3.7 3 2.2"/><path d="M14 9h5M14 13h5"/>',
    star: '<path d="m12 2 3 6.5 7 .8-5.2 4.7 1.4 6.9L12 17.5 5.8 20.9l1.4-6.9L2 9.3l7-.8z"/>',
    zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    kkey: '<circle cx="8" cy="15" r="5"/><path d="m11.5 11.5 9-9"/><path d="m17 6 2.5 2.5"/><path d="m20 3 2 2"/>',
    asterisk: '<path d="M12 3v18"/><path d="m4 7.5 16 9"/><path d="m20 7.5-16 9"/>',
    text: '<path d="M4 6h16M4 6v0M9 6v13M4 19h10"/><path d="M15 12h6v7h-3"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3"/>',
    droplet: '<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/><circle cx="12" cy="14" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3.5 2"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.3L21 8"/><path d="M21 3v5h-5"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    alert: '<path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  };

  function i(name, cls) {
    return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.wrench}</svg>`;
  }

  /* ---- tool -> glyph mapping ---- */
  const toolIcon = {
    "json-formatter": "braces", "json-validator": "check", "json-minifier": "minus",
    "json-to-csv": "table", "json-to-ts": "file", "json-to-yaml": "code",
    "jwt-decoder": "key", "jwt-generator": "lock", "jwt-validator": "shield", "jwt-inspector": "eye",
    "base64": "binary", "url-encoder": "globe", "html-formatter": "tag", "css-formatter": "hash",
    "js-formatter": "brackets", "sql-formatter": "database", "regex-tester": "search",
    "uuid": "idcard", "password": "kkey", "hash": "asterisk", "lorem-ipsum": "text",
    "qr-code": "qr", "color-palette": "droplet",
    "unix-timestamp": "clock", "date-to-timestamp": "calendar", "timestamp-to-date": "history",
    "timezone-converter": "swap"
  };

  const catIcon = { json: "braces", jwt: "key", code: "code", generators: "zap", timestamp: "clock" };

  /* ---- sticker palettes (gradient pairs) ---- */
  const pal = [
    ["#2f81f7", "#a371f7"], ["#f85149", "#f0883e"], ["#3fb950", "#2bc8c8"],
    ["#d29922", "#f85149"], ["#a371f7", "#f778ba"], ["#2bc8c8", "#2f81f7"]
  ];
  const catPal = { json: pal[0], jwt: pal[1], code: pal[2], generators: pal[3], timestamp: pal[4] };

  let colorSeed = 0;
  function toolColor(id) {
    if (!toolIcon[id]) return pal[colorSeed++ % pal.length];
    const s = String(id);
    let n = 0;
    for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
    return pal[n % pal.length];
  }

  /* ---- the "sticker" badge: rounded gradient tile with white glyph ---- */
  function icon(toolId, size) {
    const g = toolIcon[toolId] || "wrench";
    const [a, b] = toolColor(toolId);
    const px = size ? `style="--sz:${size}px"` : "";
    return `<span class="sticker" ${px} aria-hidden="true" style="background:linear-gradient(135deg,${a},${b})">${i(g)}</span>`;
  }
  function catIconHTML(catId, size) {
    const g = catIcon[catId] || "wrench";
    const [a, b] = catPal[catId] || pal[5];
    const px = size ? `style="--sz:${size}px"` : "";
    return `<span class="sticker" ${px} aria-hidden="true" style="background:linear-gradient(135deg,${a},${b})">${i(g)}</span>`;
  }

  return { i, icon, catIconHTML, toolIcon, catIcon };
})();
