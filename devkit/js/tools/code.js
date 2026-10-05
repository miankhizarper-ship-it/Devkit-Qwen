/* ============ Code & Encoding tools ============ */
window.ToolImpls = window.ToolImpls || {};
(function () {
  const D = window.DK;

  /* ---------- generic encode/decode IO ---------- */
  function twoPane(ui, cfg) {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="io-grid">
          <div><label class="field">${cfg.inLabel}</label>
            <textarea id="c-in" spellcheck="false" placeholder="${cfg.placeholder || ""}"></textarea></div>
          <div><label class="field">${cfg.outLabel}</label>
            <pre class="code-out" id="c-out" style="min-height:220px"></pre></div>
        </div>
        <div class="btn-row">
          ${cfg.actions.map((a, i) => `<button class="btn ${i ? "secondary" : ""}" data-act="${i}">${a}</button>`).join("")}
          <button class="btn secondary" id="c-copy">Copy output</button>
          <button class="btn secondary" id="c-sample">Load sample</button>
        </div>
        <div id="c-status"></div>
      </div>`;
    if (cfg.seo) document.getElementById("seo-copy").innerHTML = cfg.seo;
    const inp = ui.querySelector("#c-in"), out = ui.querySelector("#c-out"), st = ui.querySelector("#c-status");
    let last = "";
    function run(i) {
      st.innerHTML = "";
      try {
        last = cfg.fn(inp.value, i);
        out.innerHTML = cfg.highlight ? cfg.highlight(last) : D.esc(last);
      } catch (e) {
        last = ""; out.textContent = "";
        st.innerHTML = `<div class="status err">✗ ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelectorAll("[data-act]").forEach(b => b.onclick = () => run(+b.dataset.act));
    ui.querySelector("#c-copy").onclick = e => D.copy(last, e.target);
    ui.querySelector("#c-sample").onclick = () => { inp.value = cfg.sample; run(0); };
    inp.oninput = () => run(0);
    inp.value = cfg.sample; run(0);
  }

  /* ================= Base64 Encoder / Decoder ================= */
  function b64utf8Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
  }
  function b64utf8Decode(b64) {
    const bin = atob(b64.trim().replace(/\s+/g, ""));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
  twoPaneReg("base64", {
    inLabel: "Text or Base64", outLabel: "Result",
    actions: ["Encode →", "← Decode"],
    placeholder: "Type text to encode, or paste Base64 to decode…",
    sample: "Hello DevKit! 🚀 Free online developer tools.",
    fn: (v, mode) => {
      if (!v.trim()) throw new Error("Input is empty.");
      if (mode === 0) return b64utf8Encode(v);
      if (!/^[A-Za-z0-9+/=\s]+$/.test(v)) throw new Error("Input contains characters that are not valid Base64.");
      try { return b64utf8Decode(v); }
      catch (e) { throw new Error("Invalid Base64 — cannot decode (check padding & length)."); }
    },
    seo: `<h2>Base64 Encoder / Decoder Online</h2><p>Encode UTF-8 text to Base64 or decode Base64 back to text instantly — with full emoji and unicode support. Base64 is commonly used for data URIs, Basic auth headers (<code>Authorization: Basic …</code>), JWT segments and embedding binary data in JSON. Everything is computed locally in your browser.</p><p class="hint">Tip: JWT header/payload segments are Base64<b>url</b> — try our <a href="#/jwt-decoder">Free JWT Decoder</a> for tokens.</p>`
  });

  /* ================= URL Encoder / Decoder ================= */
  twoPaneReg("url-encoder", {
    inLabel: "URL / text", outLabel: "Result",
    actions: ["encodeURIComponent", "encodeURI", "Decode"],
    sample: "https://example.com/search?q=hello world&tag=c++/cli#frag",
    fn: (v, mode) => {
      if (!v.trim()) throw new Error("Input is empty.");
      try {
        if (mode === 0) return encodeURIComponent(v);
        if (mode === 1) return encodeURI(v);
        return decodeURIComponent(v.replace(/\+/g, " "));
      } catch (e) { throw new Error("Malformed percent-encoding — cannot decode."); }
    },
    seo: `<h2>URL Encoder / Decoder (Percent-Encoding)</h2><p>Percent-encode URLs and query parameters (<code>encodeURIComponent</code>) or whole URLs (<code>encodeURI</code>), and decode them back. Spaces become <code>%20</code>, special characters like <code># &amp; + ? =</code> are escaped so they survive transport in query strings. Fast, free and private.</p>`
  });

  function twoPaneReg(id, cfg) { ToolImpls[id] = ui => twoPane(ui, cfg); }

  /* ================= HTML Formatter ================= */
  twoPaneReg("html-formatter", {
    inLabel: "Messy HTML", outLabel: "Formatted HTML",
    actions: ["Format HTML"], highlight: s => D.hlGeneric(s, "html"),
    sample: '<div class="card"><h3>Title</h3><p>Hello <b>world</b>!</p><ul><li>One</li><li>Two</li></ul><img src="x.png" alt="x"/></div>',
    fn: v => { if (!v.trim()) throw new Error("Paste some HTML first."); return D.formatHTML(v); },
    seo: `<h2>HTML Formatter / Beautifier Online</h2><p>Turn minified or badly indented HTML into clean, readable markup with proper nesting and indentation. Handles void elements (&lt;br&gt;, &lt;img&gt;, &lt;input&gt;…), self-closing tags and keeps &lt;pre&gt;/&lt;script&gt;/&lt;style&gt; contents untouched.</p>`
  });

  /* ================= CSS Formatter ================= */
  twoPaneReg("css-formatter", {
    inLabel: "CSS (compressed or messy)", outLabel: "Formatted CSS",
    actions: ["Format CSS"], highlight: s => D.hlGeneric(s, "css"),
    sample: ".btn{background:#2f81f7;color:#fff;padding:8px 16px;border-radius:8px}.btn:hover{filter:brightness(1.1)}h1,h2,h3{margin:0;font-weight:700}",
    fn: v => { if (!v.trim()) throw new Error("Paste some CSS first."); return D.formatCSS(v); },
    seo: `<h2>CSS Formatter / Beautifier Online</h2><p>Pretty-print minified CSS: one declaration per line, consistent spacing, grouped selectors and preserved comments. Works with plain CSS and most preprocessor output. All formatting happens client-side — stylesheets never leave your device.</p>`
  });

  /* ================= JS Formatter ================= */
  twoPaneReg("js-formatter", {
    inLabel: "JavaScript", outLabel: "Formatted JavaScript",
    actions: ["Format JS"], highlight: s => D.hlGeneric(s, "js"),
    sample: 'function greet(name){const msg="Hi "+name;if(name){console.log(msg);return msg;}return null;}const users=["ada","alan"];users.forEach(u=>greet(u));',
    fn: v => { if (!v.trim()) throw new Error("Paste some JavaScript first."); return D.formatJS(v); },
    seo: `<h2>JavaScript Formatter Online</h2><p>Beautify dense or minified JavaScript with automatic indentation, line breaks after statements and string/comment-aware processing. Great for reading bundled code, debugging snippets and cleaning up pasted scripts — 100% in-browser.</p>`
  });

  /* ================= SQL Formatter ================= */
  twoPaneReg("sql-formatter", {
    inLabel: "SQL query", outLabel: "Formatted SQL",
    actions: ["Format SQL"], highlight: s => D.hlGeneric(s, "sql"),
    sample: "SELECT u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 GROUP BY u.name HAVING COUNT(o.id)>5 ORDER BY orders DESC LIMIT 20;",
    fn: v => { if (!v.trim()) throw new Error("Paste a SQL query first."); return D.formatSQL(v); },
    seo: `<h2>SQL Formatter / Beautifier Online</h2><p>Reformat one-line SQL into readable queries with major clauses (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY…) on their own lines. Supports SELECT/INSERT/UPDATE/DELETE, joins, CTEs and subqueries. Your queries stay private — formatting runs entirely in your browser.</p>`
  });

  /* ================= Regex Tester ================= */
  ToolImpls["regex-tester"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div style="flex:3"><label class="field">Regular expression</label>
            <input type="text" id="r-pat" placeholder="e.g. (\\w+)@(\\w+\\.\\w+)" value="(\\w+)@([\\w.]+)"></div>
          <div><label class="field">Flags</label>
            <input type="text" id="r-flags" class="regex-flags" value="gi"></div>
        </div>
        <label class="field">Test string</label>
        <textarea id="r-str" spellcheck="false" style="min-height:150px">Contact: ada@example.com or alan@devkit.io — invalid: @nope, me@bad..com?</textarea>
        <div id="r-status"></div>
        <label class="field">Highlighted matches</label>
        <pre class="code-out" id="r-hl"></pre>
        <label class="field">Match details</label>
        <div id="r-table"></div>
        <div class="btn-row"><button class="btn secondary" id="r-replace-btn">Show replace preview</button></div>
        <div id="r-replace" style="display:none">
          <div class="inline-inputs">
            <div><label class="field">Replace with ($1, $2 supported)</label><input type="text" id="r-rep" value="[masked-$1]@$2"></div>
          </div>
          <pre class="code-out" id="r-rep-out" style="min-height:80px"></pre>
        </div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Regex Tester Online (JavaScript Regular Expressions)</h2><p>Test and debug regular expressions with instant live results: highlighted matches, capture-group breakdown per match, match count and a replacement preview using <code>$1</code>, <code>$2</code> references. Uses the JavaScript (ECMAScript) regex engine with flags <code>g i m s u y</code>.</p>`;
    const pat = ui.querySelector("#r-pat"), flags = ui.querySelector("#r-flags"), str = ui.querySelector("#r-str");
    const st = ui.querySelector("#r-status"), hl = ui.querySelector("#r-hl"), table = ui.querySelector("#r-table");
    function run() {
      let re;
      try { re = new RegExp(pat.value, flags.value.includes("g") ? flags.value : flags.value + "g"); }
      catch (e) {
        st.innerHTML = `<div class="status err">✗ Invalid regex: ${D.esc(e.message)}</div>`;
        hl.innerHTML = D.esc(str.value); table.innerHTML = ""; return;
      }
      st.innerHTML = "";
      const text = str.value;
      const matches = [...text.matchAll(re)];
      // build highlight
      let outHtml = "", lastIdx = 0;
      for (const m of matches) {
        if (m.index > lastIdx) outHtml += D.esc(text.slice(lastIdx, m.index));
        outHtml += `<span class="tok-mark">${D.esc(m[0])}</span>`;
        lastIdx = m.index + m[0].length;
        if (m[0].length === 0) break; // avoid infinite loop on zero-length
      }
      outHtml += D.esc(text.slice(lastIdx));
      hl.innerHTML = outHtml;
      table.innerHTML = matches.length
        ? `<table class="data"><tr><th>#</th><th>Index</th><th>Match</th><th>Groups</th><th>Named</th></tr>` +
          matches.map((m, i) => `<tr><td>${i + 1}</td><td>${m.index}</td><td>${D.esc(m[0])}</td><td>${m.slice(1).map(g => g === undefined ? "—" : D.esc(g)).join(", ") || "—"}</td><td>${Object.keys(m.groups || {}).length ? D.esc(JSON.stringify(m.groups)) : "—"}</td></tr>`).join("") +
          `</table><p class="hint">${matches.length} match${matches.length === 1 ? "" : "es"} found.</p>`
        : `<div class="status warn">No matches.</div>`;
      const repOut = ui.querySelector("#r-rep-out");
      if (repOut) try { repOut.textContent = text.replace(new RegExp(pat.value, flags.value), ui.querySelector("#r-rep").value); } catch (e) {}
    }
    [pat, flags, str].forEach(el => el.addEventListener("input", run));
    ui.querySelector("#r-replace-btn").onclick = () => {
      const box = ui.querySelector("#r-replace");
      box.style.display = box.style.display === "none" ? "block" : "none";
      ui.querySelector("#r-rep").addEventListener("input", run);
      run();
    };
    run();
  };
})();
