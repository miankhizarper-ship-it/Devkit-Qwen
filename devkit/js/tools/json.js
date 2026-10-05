/* ============ JSON tool family ============ */
window.ToolImpls = window.ToolImpls || {};
(function () {
  const ICO = () => window.DKIcons;

  const D = window.DK;

  function ioPanel(ui, opts) {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="io-grid">
          <div>
            <label class="field">${opts.inLabel}</label>
            <textarea id="j-in" spellcheck="false" placeholder="${opts.placeholder || "Paste here…"}"></textarea>
          </div>
          <div>
            <label class="field">${opts.outLabel}</label>
            <pre class="code-out" id="j-out" style="min-height:220px"></pre>
          </div>
        </div>
        <div class="btn-row">
          ${opts.buttons.map((b, i) => `<button class="btn ${i ? "secondary" : ""}" data-act="${i}">${b.label}</button>`).join("")}
          <button class="btn secondary" id="j-copy">${ICO().i("copy","ic-sm")} Copy output</button>
          <button class="btn secondary" id="j-sample">${ICO().i("file","ic-sm")} Load sample</button>
        </div>
        <div id="j-status"></div>
      </div>`;
    if (opts.seo) document.getElementById("seo-copy").innerHTML = opts.seo;
    const inp = ui.querySelector("#j-in"), out = ui.querySelector("#j-out"), st = ui.querySelector("#j-status");
    let lastOut = "";
    const setStatus = (cls, msg) => (st.innerHTML = msg ? `<div class="status ${cls}">${msg}</div>` : "");
    function run(i) {
      const raw = inp.value;
      if (!raw.trim()) { setStatus("warn", "Paste some JSON first."); return; }
      try {
        const obj = JSON.parse(raw);
        setStatus("ok", "✓ Valid JSON");
        lastOut = opts.process(obj, i);
        out.innerHTML = opts.highlight ? D.hlJSON(lastOut) : D.esc(lastOut);
      } catch (e) {
        lastOut = "";
        out.textContent = "";
        const msg = D.esc(e.message);
        const posMatch = e.message.match(/position (\d+)/);
        let extra = "";
        if (posMatch) {
          const pos = +posMatch[1];
          const upto = raw.slice(0, pos);
          const line = upto.split("\n").length;
          const col = pos - upto.lastIndexOf("\n");
          extra = ` <strong>(line ${line}, column ${col})</strong>`;
        }
        setStatus("err", "✗ Invalid JSON: " + msg + extra);
      }
    }
    ui.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => run(+b.dataset.act)));
    ui.querySelector("#j-copy").addEventListener("click", e => D.copy(lastOut, e.target));
    ui.querySelector("#j-sample").addEventListener("click", () => { inp.value = opts.sample; run(0); });
    if (opts.live) inp.addEventListener("input", () => run(0));
    if (opts.autorun) { inp.value = opts.sample; run(0); }
  }

  const sampleObj = { name: "DevKit", type: "developer-tools", free: true, stars: 100, tags: ["json", "jwt", "base64"], owner: { name: "You", email: "you@example.com" }, archived: false };
  const SAMPLE = JSON.stringify(sampleObj, null, 2);

  /* ---------- JSON Formatter ---------- */
  ToolImpls["json-formatter"] = ui => ioPanel(ui, {
    inLabel: "Input JSON", outLabel: "Formatted JSON",
    buttons: [{ label: "Format (2 spaces)" }, { label: "Format (4 spaces)" }, { label: "Format (Tab)" }],
    sample: SAMPLE, highlight: true, autorun: true,
    process: (obj, variant) => JSON.stringify(obj, null, variant === 1 ? 4 : variant === 2 ? "\t" : 2),
    seo: `<h2>Online JSON Formatter</h2><p>Paste unformatted or minified JSON and get pretty-printed, syntax-highlighted output instantly. The formatter validates your JSON as you format it, shows the exact error location when something is wrong, and runs entirely in your browser — your data never leaves your computer.</p><h3>How to use</h3><ul><li>Paste JSON into the left box (or click “Load sample”).</li><li>Choose 2-space, 4-space or tab indentation.</li><li>Click “Copy output” to grab the result.</li></ul>`
  });

  /* ---------- JSON Validator ---------- */
  ToolImpls["json-validator"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">JSON to validate</label>
        <textarea id="v-in" spellcheck="false" placeholder='{"paste": "your json here"}'></textarea>
        <div class="btn-row"><button class="btn" id="v-run">${ICO().i("check","ic-sm")} Validate JSON</button><button class="btn secondary" id="v-sample">${ICO().i("file","ic-sm")} Load sample</button></div>
        <div id="v-status"></div>
      </div>`;
    const inp = ui.querySelector("#v-in"), st = ui.querySelector("#v-status");
    function run() {
      const raw = inp.value;
      if (!raw.trim()) { st.innerHTML = `<div class="status warn">${ICO().i("alert","ic-sm")} Enter some text to validate.</div>`; return; }
      try {
        JSON.parse(raw);
        const size = new Blob([raw]).size;
        st.innerHTML = `<div class="status ok">${ICO().i("check","ic-sm")} Valid JSON (${size.toLocaleString()} bytes, ${raw.split("\n").length} lines). Ready to use!</div>`;
      } catch (e) {
        const posMatch = e.message.match(/position (\d+)/i);
        let loc = "";
        if (posMatch) {
          const p = +posMatch[1], upto = raw.slice(0, p);
          loc = ` at line ${upto.split("\n").length}, column ${p - upto.lastIndexOf("\n")}`;
        }
        st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} Invalid JSON${loc}: ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelector("#v-run").onclick = run;
    ui.querySelector("#v-sample").onclick = () => { inp.value = SAMPLE; run(); };
    inp.oninput = run;
    document.getElementById("seo-copy").innerHTML = `<h2>Online JSON Validator</h2><p>Check whether your JSON is valid with a fast, free validator. Get precise error messages with line and column numbers, byte count and line statistics — all processed locally in your browser for full privacy. Great for debugging API payloads, config files and JWT claims.</p>`;
  };

  /* ---------- JSON Minifier ---------- */
  ToolImpls["json-minifier"] = ui => ioPanel(ui, {
    inLabel: "Input JSON", outLabel: "Minified JSON",
    buttons: [{ label: "Minify" }],
    sample: SAMPLE, live: true,
    process: obj => JSON.stringify(obj),
    seo: `<h2>JSON Minifier Online</h2><p>Remove all unnecessary whitespace, newlines and indentation from JSON to shrink payload size. Minified JSON is ideal for embedding in code, reducing HTTP request bodies and speeding up storage. Paste pretty JSON on the left and the compressed version appears instantly on the right.</p>`
  });

  /* ---------- JSON → CSV ---------- */
  ToolImpls["json-to-csv"] = ui => ioPanel(ui, {
    inLabel: "Input: JSON array of objects", outLabel: "CSV output",
    buttons: [{ label: "Convert to CSV" }],
    sample: JSON.stringify([
      { id: 1, name: "Ada Lovelace", role: "Engineer", active: true },
      { id: 2, name: "Alan Turing", role: "Scientist", active: true },
      { id: 3, name: "Grace Hopper", role: "Rear Admiral", active: false }
    ], null, 2),
    process: obj => {
      let rows = Array.isArray(obj) ? obj : [obj];
      rows = rows.map(r => (r && typeof r === "object" && !Array.isArray(r)) ? r : { value: r });
      const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
      const head = keys.join(",");
      const body = rows.map(r => keys.map(k => D.csvCell(r[k])).join(",")).join("\n");
      return head + "\n" + body;
    },
    seo: `<h2>JSON to CSV Converter</h2><p>Convert an array of JSON objects into CSV format in one click. All keys across every object are collected into columns; nested values are embedded as JSON strings. Copy the result or paste it straight into Excel, Google Sheets or a database import. 100% client-side — private and instant.</p>`
  });

  /* ---------- JSON → TypeScript ---------- */
  ToolImpls["json-to-ts"] = ui => ioPanel(ui, {
    inLabel: "Input JSON (object or array)", outLabel: "TypeScript interfaces",
    buttons: [{ label: "Generate interfaces" }],
    sample: JSON.stringify({ id: 42, title: "Hello", published: true, author: { name: "Ada", email: "ada@dev.io" }, tags: ["a", "b"], meta: null }, null, 2),
    process: obj => {
      const parts = [];
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9_$]/g, "");
      const tsType = v => {
        if (v === null || v === undefined) return "null";
        if (Array.isArray(v)) {
          const objs = v.filter(x => x && typeof x === "object");
          if (objs.length) {
            const merged = Object.assign({}, ...objs);
            const n = cap("item");
            build(n, merged);
            return n + "[]";
          }
          return (typeof v[0] || "any") + "[]";
        }
        if (typeof v === "object") {
          const n = cap("nested_" + parts.length);
          build(n, v);
          return n;
        }
        return typeof v;
      };
      function build(name, val) {
        if (parts.some(p => p.startsWith(`interface ${name} {`))) return;
        parts.push(`interface ${name} {\n` + Object.entries(val).map(([k, v]) =>
          `  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `"${k}"`}: ${tsType(v)};`).join("\n") + "\n}");
      }
      let rootType;
      if (Array.isArray(obj)) {
        const first = obj.find(x => x !== undefined);
        if (first && typeof first === "object" && !Array.isArray(first)) { build("Item", first); rootType = "Item[]"; }
        else rootType = (typeof first || "any") + "[]";
      } else { build("Root", obj); rootType = "Root"; }
      return parts.join("\n\n") + `\n\nexport type RootType = ${rootType};`;
    },
    seo: `<h2>JSON to TypeScript Interface Generator</h2><p>Turn any JSON sample into strongly-typed TypeScript interfaces. Nested objects become their own interfaces, arrays are typed from their elements and nulls are detected. Perfect for typing API responses quickly — generated locally, nothing uploaded.</p>`
  });

  /* ---------- JSON → YAML ---------- */
  ToolImpls["json-to-yaml"] = ui => ioPanel(ui, {
    inLabel: "Input JSON", outLabel: "YAML output",
    buttons: [{ label: "Convert to YAML" }],
    sample: SAMPLE,
    process: obj => D.yamlOut(obj),
    seo: `<h2>JSON to YAML Converter</h2><p>Convert JSON documents into clean, readable YAML — great for Kubernetes manifests, Docker Compose files, CI configs and Ansible playbooks. Strings that need quoting are escaped correctly and nested structures keep their order. Runs fully in your browser.</p>`
  });
})();
