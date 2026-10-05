/* ============ Generators: UUID, Password, Hash, Lorem Ipsum, QR, Color Palette ============ */
window.ToolImpls = window.ToolImpls || {};
(function () {
  const ICO = () => window.DKIcons;

  const D = window.DK;

  /* ================= UUID Generator ================= */
  ToolImpls["uuid"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div><label class="field">How many?</label><input type="number" id="u-count" value="5" min="1" max="1000"></div>
          <div><label class="field">Format</label><select id="u-fmt"><option value="std">Standard (lowercase, hyphens)</option><option value="upper">UPPERCASE</option><option value="nohyphen">No hyphens</option><option value="braces">{curly braces}</option></select></div>
        </div>
        <div class="btn-row"><button class="btn" id="u-gen">${ICO().i("refresh","ic-sm")} Generate UUIDs</button><button class="btn secondary" id="u-copy">${ICO().i("copy","ic-sm")} Copy all</button></div>
        <div class="list-output" id="u-out"></div>
        <p class="hint">Click any UUID to copy it. Version 4 (random) per RFC 4122, generated with crypto-secure randomness.</p>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Free UUID Generator Online (v4)</h2><p>Generate universally unique identifiers (UUID v4 / GUIDs) instantly — one at a time or up to 1000 in bulk. UUIDs are 128-bit values with ~2¹²² randomness, used for database keys, session IDs, idempotency keys and transaction references. All values come from your browser's cryptographic random source.</p>`;
    function uuidv4() {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      const hex = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
    let last = [];
    function gen() {
      const n = Math.min(1000, Math.max(1, +ui.querySelector("#u-count").value || 1));
      const fmt = ui.querySelector("#u-fmt").value;
      last = Array.from({ length: n }, () => {
        let u = uuidv4();
        if (fmt === "upper") u = u.toUpperCase();
        if (fmt === "nohyphen") u = u.replace(/-/g, "");
        if (fmt === "braces") u = "{" + u + "}";
        return u;
      });
      const out = ui.querySelector("#u-out");
      out.innerHTML = last.map(u => `<div title="Click to copy">${u}</div>`).join("");
      out.querySelectorAll("div").forEach(el => el.onclick = () => D.copy(el.textContent, el));
    }
    ui.querySelector("#u-gen").onclick = gen;
    ui.querySelector("#u-copy").onclick = e => D.copy(last.join("\n"), e.target);
    gen();
  };

  /* ================= Password Generator ================= */
  ToolImpls["password"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">Password preview</label>
        <pre class="code-out mono" id="p-out" style="min-height:56px;font-size:18px;text-align:center"></pre>
        <div class="entropy-bar"><div id="p-bar"></div></div>
        <div id="p-entropy" class="hint"></div>
        <div class="inline-inputs" style="margin-top:12px">
          <div><label class="field">Length</label><input type="number" id="p-len" value="16" min="4" max="128"></div>
          <div><label class="field">Count</label><input type="number" id="p-count" value="3" min="1" max="50"></div>
        </div>
        <div class="checkbox-row">
          <label><input type="checkbox" id="p-up" checked> A-Z</label>
          <label><input type="checkbox" id="p-lo" checked> a-z</label>
          <label><input type="checkbox" id="p-nu" checked> 0-9</label>
          <label><input type="checkbox" id="p-sy" checked> !@#$% symbols</label>
          <label><input type="checkbox" id="p-nc"> No confusing (l1IO0)</label>
        </div>
        <div class="btn-row"><button class="btn" id="p-gen">${ICO().i("refresh","ic-sm")} Regenerate</button><button class="btn secondary" id="p-copy">${ICO().i("copy","ic-sm")} Copy first</button></div>
        <div class="list-output" id="p-list" style="margin-top:8px"></div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Strong Random Password Generator</h2><p>Create cryptographically strong passwords using your browser's <code>crypto.getRandomValues</code> — never <code>Math.random</code>. Choose length, character sets and batch size, and read the live Shannon-entropy estimate (bits) to judge strength. Nothing is transmitted or stored anywhere.</p>`;
    let list = [];
    function pick(arr) {
      const x = new Uint32Array(1);
      crypto.getRandomValues(x);
      return arr[x[0] % arr.length]; // negligible modulo bias for our sizes
    }
    function gen() {
      const len = Math.min(128, Math.max(4, +ui.querySelector("#p-len").value || 16));
      const count = Math.min(50, Math.max(1, +ui.querySelector("#p-count").value || 1));
      let sets = [];
      if (ui.querySelector("#p-up").checked) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      if (ui.querySelector("#p-lo").checked) sets.push("abcdefghijklmnopqrstuvwxyz");
      if (ui.querySelector("#p-nu").checked) sets.push("0123456789");
      if (ui.querySelector("#p-sy").checked) sets.push("!@#$%^&*()-_=+[]{};:,.<>?/~");
      if (!sets.length) { sets = ["abcdefghijklmnopqrstuvwxyz"]; }
      let pool = sets.join("");
      if (ui.querySelector("#p-nc").checked) pool = pool.replace(/[l1LIO0o]/g, "");
      list = Array.from({ length: count }, () => {
        // guarantee one char from each selected set
        const chars = sets.map(pick);
        while (chars.length < len) chars.push(pick(pool));
        // shuffle (Fisher-Yates with secure rand)
        for (let i = chars.length - 1; i > 0; i--) {
          const j = new Uint32Array(1); crypto.getRandomValues(j);
          const k = j[0] % (i + 1);
          [chars[i], chars[k]] = [chars[k], chars[i]];
        }
        return chars.slice(0, len).join("");
      });
      const pw = list[0];
      ui.querySelector("#p-out").textContent = pw;
      const entropy = Math.round(len * Math.log2(pool.length) * 10) / 10;
      const bar = ui.querySelector("#p-bar");
      const pct = Math.min(100, entropy / 128 * 100);
      bar.style.width = pct + "%";
      bar.style.background = entropy < 45 ? "#f85149" : entropy < 75 ? "#d29922" : "#3fb950";
      ui.querySelector("#p-entropy").innerHTML = `≈ <strong>${entropy} bits</strong> of entropy · ${entropy < 45 ? "weak" : entropy < 75 ? "good" : entropy < 100 ? "strong" : "very strong"} · pool size ${pool.length}`;
      ui.querySelector("#p-list").innerHTML = list.map(x => `<div title="Click to copy">${D.esc(x)}</div>`).join("");
      ui.querySelectorAll("#p-list div").forEach(el => el.onclick = () => D.copy(el.textContent, el));
    }
    ui.querySelector("#p-gen").onclick = gen;
    ui.querySelector("#p-copy").onclick = e => D.copy(list[0] || "", e.target);
    ui.querySelectorAll("input").forEach(el => el.addEventListener("change", gen));
    gen();
  };

  /* ================= Hash Generator ================= */
  ToolImpls["hash"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">Input text</label>
        <textarea id="h-in" spellcheck="false" style="min-height:120px">Hello DevKit!</textarea>
        <div class="btn-row"><button class="btn" id="h-run">${ICO().i("asterisk","ic-sm")} Compute hashes</button><button class="btn secondary" id="h-clear">${ICO().i("minus","ic-sm")} Clear</button></div>
        <div id="h-out"></div>
        <p class="hint">MD5 is computed locally in pure JS (for checksums only — <strong>never for passwords</strong>). SHA-1/256/384/512 use the browser's Web Crypto API.</p>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Hash Generator Online — MD5, SHA-1, SHA-256, SHA-384, SHA-512</h2><p>Compute cryptographic hash digests of any text in your browser. Verify file checksums, generate API signatures, fingerprint values or explore how a single-character change avalanche-transforms the output. Click any hash to copy it.</p>`;

    /* MD5 provided by shared helpers (DK.md5, RFC 1321 reference implementation) */
    const md5 = D.md5;

    async function run() {
      const text = ui.querySelector("#h-in").value;
      const out = ui.querySelector("#h-out");
      const rows = [["MD5", md5(text)]];
      if (window.crypto && crypto.subtle) {
        for (const alg of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
          try {
            const buf = await crypto.subtle.digest(alg, new TextEncoder().encode(text));
            rows.push([alg, [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("")]);
          } catch (e) { rows.push([alg, "unavailable"]); }
        }
      }
      out.innerHTML = `<table class="data"><tr><th>Algorithm</th><th>Hex digest</th></tr>` +
        rows.map(([a, h]) => `<tr><td>${a}</td><td class="mono" title="Click to copy" data-hash="${h}" style="cursor:pointer">${h}</td></tr>`).join("") + `</table>`;
      out.querySelectorAll("[data-hash]").forEach(el => el.onclick = () => D.copy(el.dataset.hash, el));
    }
    ui.querySelector("#h-run").onclick = run;
    ui.querySelector("#h-clear").onclick = () => { ui.querySelector("#h-in").value = ""; ui.querySelector("#h-out").innerHTML = ""; };
    ui.querySelector("#h-in").addEventListener("input", run);
    run();
  };

  /* ================= Lorem Ipsum ================= */
  ToolImpls["lorem-ipsum"] = ui => {
    const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div><label class="field">Amount</label><input type="number" id="l-num" value="3" min="1" max="100"></div>
          <div><label class="field">Unit</label><select id="l-unit"><option>paragraphs</option><option>sentences</option><option>words</option></select></div>
          <div><label class="field">&nbsp;</label><div class="checkbox-row" style="margin:0"><label><input type="checkbox" id="l-classic" checked> Start with “Lorem ipsum…”</label></div></div>
        </div>
        <div class="btn-row"><button class="btn" id="l-gen">${ICO().i("text","ic-sm")} Generate</button><button class="btn secondary" id="l-copy">${ICO().i("copy","ic-sm")} Copy text</button></div>
        <pre class="code-out" id="l-out" style="min-height:200px;white-space:pre-wrap"></pre>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Lorem Ipsum Generator — Dummy Placeholder Text</h2><p>Generate classic Latin placeholder text for mockups and designs: paragraphs, sentences or exact word counts. Use it to fill HTML templates, wireframes and portfolio drafts without distracting readers with real content.</p>`;
    const rnd = n => Math.floor(Math.random() * n);
    function sentence(first) {
      const n = 8 + rnd(10);
      const w = Array.from({ length: n }, () => words[rnd(words.length)]);
      let s = w.join(" ");
      s = (first ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua" : s.charAt(0).toUpperCase() + s.slice(1)) + ".";
      return s;
    }
    function gen() {
      const num = Math.min(100, Math.max(1, +ui.querySelector("#l-num").value || 1));
      const unit = ui.querySelector("#l-unit").value;
      const classic = ui.querySelector("#l-classic").checked;
      let outTxt = "";
      if (unit === "words") {
        const w = Array.from({ length: num }, (_, i) => (classic && i < 2 ? ["Lorem", "ipsum"][i] : words[rnd(words.length)]));
        outTxt = w.join(" ").replace(/^./, c => c.toUpperCase()) + ".";
      } else if (unit === "sentences") {
        outTxt = Array.from({ length: num }, (_, i) => sentence(classic && i === 0)).join(" ");
      } else {
        outTxt = Array.from({ length: num }, (_, p) =>
          Array.from({ length: 4 + rnd(3) }, (_, i) => sentence(classic && p === 0 && i === 0)).join(" ")
        ).join("\n\n");
      }
      ui.querySelector("#l-out").textContent = outTxt;
    }
    ui.querySelector("#l-gen").onclick = gen;
    ui.querySelector("#l-copy").onclick = e => D.copy(ui.querySelector("#l-out").textContent, e.target);
    gen();
  };

  /* ================= QR Code (pure-JS generator) ================= */
  ToolImpls["qr-code"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">Text or URL to encode</label>
        <textarea id="q-in" style="min-height:80px" placeholder="https://example.com">https://devkit.tools</textarea>
        <div class="inline-inputs">
          <div><label class="field">Size (px per module)</label><input type="number" id="q-scale" value="8" min="2" max="24"></div>
          <div><label class="field">Error correction</label><select id="q-ecc"><option value="L">L — 7%</option><option value="M" selected>M — 15%</option><option value="Q">Q — 25%</option><option value="H">H — 30%</option></select></div>
        </div>
        <div class="btn-row"><button class="btn" id="q-gen">${ICO().i("qr","ic-sm")} Generate QR code</button><button class="btn secondary" id="q-dl">${ICO().i("download","ic-sm")} Download PNG</button></div>
        <div class="qr-wrap"><canvas id="q-canvas"></canvas></div>
        <p class="hint">Generated fully offline by a built-in QR encoder (byte mode). Scan it with any camera app.</p>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Free QR Code Generator Online</h2><p>Create QR codes for websites, Wi-Fi hints, text, vCards and more — rendered privately in your browser and downloadable as PNG. Unlike many generators, your data is never sent to a server, so you can safely encode internal URLs and sensitive links.</p>`;

    /* ---- compact QR encoder (byte mode, versions 1–10, ECC L/M/Q/H) ---- */
    // Reeds-Solomon over GF(256)
    const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
    (() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
    const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
    function rsGenPoly(n) {
      let p = [1];
      for (let i = 0; i < n; i++) {
        const np = new Array(p.length + 1).fill(0);
        p.forEach((c, j) => { np[j] ^= c; np[j + 1] ^= mul(c, EXP[i]); });
        p = np;
      }
      return p;
    }
    function rsEncode(data, ecLen) {
      const gen = rsGenPoly(ecLen), res = new Array(ecLen).fill(0);
      for (const b of data) {
        const factor = b ^ res.shift(); res.push(0);
        for (let i = 0; i < gen.length - 1; i++) res[i] ^= mul(gen[i + 1], factor);
      }
      return res;
    }
    const ECC_INFO = { // per version 1..10: [totalECcodewords, blocksGroup1, group1DataCW, blocksGroup2, group2DataCW]
      L: [[7,1,19],[10,1,34],[15,1,55],[20,1,80],[26,1,108],[18,2,68],[20,2,78],[24,2,97],[30,2,116],[34,2,140]],
      M: [[10,1,16],[16,1,28],[26,1,44],[18,2,38],[24,2,54],[16,4,28],[18,4,32],[22,2,43],[22,3,44],[26,4,43]],
      Q: [[13,1,13],[22,1,22],[18,2,34],[26,2,44],[18,2,60],[24,4,26],[18,4,36],[26,4,42],[24,2,47],[28,4,35]],
      H: [[17,1,9],[28,1,16],[22,1,30],[16,2,24],[22,2,39],[28,4,20],[26,4,24],[26,4,32],[24,4,39],[28,4,28]]
    };
    function makeQR(text, eccLevel) {
      const bytes = [...new TextEncoder().encode(text)];
      let ver = 0;
      for (let v = 1; v <= 10; v++) {
        const info = ECC_INFO[eccLevel][v - 1];
        const dataCap = info[1] * info[2] + info[3] * info[4];
        const charCountBits = v <= 9 ? 8 : 16;
        const need = Math.ceil((4 + charCountBits + bytes.length * 8) / 8);
        if (need <= dataCap) { ver = v; break; }
      }
      if (!ver) throw new Error("Text too long for this generator (max ≈ 270 bytes at ECC-L). Try shortening it.");
      const info = ECC_INFO[eccLevel][ver - 1];
      const totalData = info[1] * info[2] + info[3] * info[4];
      const ccBits = ver <= 9 ? 8 : 16;
      const bits = [];
      const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
      push(0b0100, 4); push(bytes.length, ccBits);
      bytes.forEach(b => push(b, 8));
      push(0, Math.min(4, totalData * 8 - bits.length));
      while (bits.length % 8) bits.push(0);
      const dataBytes = [];
      for (let i = 0; i < bits.length; i += 8) { let v = 0; for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; dataBytes.push(v); }
      for (let pad = 0xec; dataBytes.length < totalData; pad ^= 0xec ^ 0x11) dataBytes.push(pad);
      // split into blocks & interleave
      const [ecTotal, nb1, d1, nb2, d2] = info;
      const blocks = [], ecBlocks = [];
      let pos = 0;
      for (let i = 0; i < nb1; i++) { const b = dataBytes.slice(pos, pos + d1); pos += d1; blocks.push(b); ecBlocks.push(rsEncode(b, ecTotal / (nb1 + nb2))); }
      for (let i = 0; i < nb2; i++) { const b = dataBytes.slice(pos, pos + d2); pos += d2; blocks.push(b); ecBlocks.push(rsEncode(b, ecTotal / (nb1 + nb2))); }
      const interleaved = [];
      const maxData = Math.max(d1, d2);
      for (let i = 0; i < maxData; i++) blocks.forEach(b => { if (i < b.length) interleaved.push(b[i]); });
      for (let i = 0; i < ecTotal / (nb1 + nb2); i++) ecBlocks.forEach(b => interleaved.push(b[i]));
      // build matrix
      const size = ver * 4 + 17;
      const mod = Array.from({ length: size }, () => new Array(size).fill(null));
      const fn = Array.from({ length: size }, () => new Array(size).fill(false));
      function setFn(r, c, v) { mod[r][c] = v ? 1 : 0; fn[r][c] = true; }
      function finder(r, c) {
        for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
          const inRing = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) || (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6));
          const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFn(rr, cc, (inRing || inCore) && dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6);
        }
      }
      finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
      for (let i = 8; i < size - 8; i++) { if (mod[6][i] === null) setFn(6, i, i % 2 === 0); if (mod[i][6] === null) setFn(i, 6, i % 2 === 0); }
      setFn(size - 8, 8, true); // dark module
      // alignment patterns (versions ≥2)
      if (ver >= 2) {
        const centers = ALIGN_POS[ver];
        for (const r of centers) for (const c of centers) {
          if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
          for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
            setFn(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
      // timing above already handled row/col 6; reserve format areas
      const fmtReserve = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
      fmtReserve.forEach(([r,c]) => { if (mod[r][c] === null) setFn(r,c,false); });
      if (ver >= 7) for (let i = 0; i < 18; i++) {
        const r = Math.floor(i / 3), c = size - 11 + (i % 3);
        if (mod[r][c] === null) setFn(r, c, false);
        const r2 = size - 11 + (i % 3), c2 = Math.floor(i / 3);
        if (mod[r2][c2] === null) setFn(r2, c2, false);
      }
      // place data zigzag
      let bi = 0;
      const dataBitsArr = interleaved.flatMap(byte => [7,6,5,4,3,2,1,0].map(s => (byte >> s) & 1));
      for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
          for (let j = 0; j < 2; j++) {
            const c = right - j;
            const upward = ((right + 1) & 2) === 0;
            const r = upward ? size - 1 - vert : vert;
            if (!fn[r][c] && bi < dataBitsArr.length) { mod[r][c] = dataBitsArr[bi++]; }
          }
        }
      }
      // mask: try 8 masks, pick lowest penalty (simplified: use mask 0 pattern formula but evaluate)
      function applyMask(m) {
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
          if (fn[r][c]) continue;
          let inv = false;
          switch (m) {
            case 0: inv = (r + c) % 2 === 0; break;
            case 1: inv = r % 2 === 0; break;
            case 2: inv = c % 3 === 0; break;
            case 3: inv = (r + c) % 3 === 0; break;
            case 4: inv = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
            case 5: inv = ((r * c) % 2 + (r * c) % 3) === 0; break;
            case 6: inv = (((r * c) % 2 + (r * c) % 3) % 2) === 0; break;
            case 7: inv = (((r + c) % 2 + (r * c) % 3) % 2) === 0; break;
          }
          if (inv) mod[r][c] ^= 1;
        }
      }
      function penalty() {
        let p = 0;
        for (let r = 0; r < size; r++) { let run = 1; for (let c = 1; c < size; c++) { if (mod[r][c] === mod[r][c-1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
        for (let c = 0; c < size; c++) { let run = 1; for (let r = 1; r < size; r++) { if (mod[r][c] === mod[r-1][c]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
        return p;
      }
      let bestMask = 0, bestPen = Infinity, snapshot = mod.map(row => row.slice());
      for (let m = 0; m < 8; m++) {
        applyMask(m);
        const pen = penalty();
        if (pen < bestPen) { bestPen = pen; bestMask = m; }
        mod.forEach((row, r) => row.forEach((v, c) => { if (!fn[r][c]) mod[r][c] = snapshot[r][c]; }));
      }
      applyMask(bestMask);
      // format info
      const eccBits = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 }[eccLevel];
      let fmtVal = ((eccBits << 3) | bestMask);
      let rem = fmtVal;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
      const fmtBits = (((fmtVal << 10) | rem) ^ 0x5412) & 0x7fff;
      const gb = i => (fmtBits >> i) & 1;
      // format bits around top-left finder
      const positionsA = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
      positionsA.forEach(([r,c], i) => { mod[r][c] = gb(i); fn[r][c] = true; });
      const positionsB = [];
      for (let i = 0; i < 15; i++) {
        if (i < 8) positionsB.push([size - 1 - i, 8]);
        else positionsB.push([8, size - 15 + i]);
      }
      positionsB.forEach(([r,c], i) => { mod[r][c] = gb(i); fn[r][c] = true; });
      return mod;
    }
    const ALIGN_POS = { 1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30], 6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,50] };

    function draw() {
      const canvas = ui.querySelector("#q-canvas");
      try {
        const mod = makeQR(ui.querySelector("#q-in").value || " ", ui.querySelector("#q-ecc").value);
        const scale = Math.min(24, Math.max(2, +ui.querySelector("#q-scale").value || 8));
        const quiet = 4, size = mod.length;
        const px = (size + quiet * 2) * scale;
        canvas.width = canvas.height = px;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, px, px);
        ctx.fillStyle = "#000000";
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++)
          if (mod[r][c]) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
      } catch (e) {
        canvas.width = canvas.height = 0;
        alert("⚠ " + e.message);
      }
    }
    ui.querySelector("#q-gen").onclick = draw;
    ["#q-in", "#q-scale", "#q-ecc"].forEach(sel => ui.querySelector(sel).addEventListener("input", draw));
    ui.querySelector("#q-dl").onclick = () => {
      const a = document.createElement("a");
      a.download = "devkit-qrcode.png";
      a.href = ui.querySelector("#q-canvas").toDataURL("image/png");
      a.click();
    };
    draw();
  };

  /* ================= Color Palette Generator ================= */
  ToolImpls["color-palette"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div><label class="field">Base color</label><input type="text" id="col-hex" value="#2f81f7"></div>
          <div><label class="field">&nbsp;</label><input type="color" id="col-pick" value="#2f81f7" style="height:40px;padding:2px"></div>
          <div><label class="field">Palette type</label>
            <select id="col-mode">
              <option value="mono">Monochrome (shades & tints)</option>
              <option value="analogous">Analogous</option>
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="random">Random harmonious</option>
            </select></div>
        </div>
        <div class="btn-row"><button class="btn" id="col-gen">${ICO().i("refresh","ic-sm")} Generate palette</button><button class="btn secondary" id="col-copy-all">${ICO().i("copy","ic-sm")} Copy all HEX</button></div>
        <div class="palette-swatches" id="col-out"></div>
        <p class="hint">Click a swatch to copy its HEX value.</p>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Color Palette Generator Online</h2><p>Build beautiful color schemes from any base HEX color: monochrome shade/tint ramps (perfect for Tailwind-style design systems), analogous, complementary and triadic harmony palettes computed in HSL space. Click any swatch to copy its hex code — free, instant and offline.</p>`;
    function hexToHsl(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
      if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error("Invalid hex color");
      const r = parseInt(hex.slice(0,2),16)/255, g = parseInt(hex.slice(2,4),16)/255, b = parseInt(hex.slice(4,6),16)/255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h = 0, s = 0; const l = (max+min)/2;
      if (max !== min) {
        const d = max-min;
        s = l > .5 ? d/(2-max-min) : d/(max+min);
        h = max===r ? (g-b)/d + (g<b?6:0) : max===g ? (b-r)/d+2 : (r-g)/d+4;
        h /= 6;
      }
      return [h*360, s*100, l*100];
    }
    function hslToHex(h, s, l) {
      h = ((h % 360) + 360) % 360; s = Math.min(100, Math.max(0, s)); l = Math.min(100, Math.max(0, l));
      const f = n => {
        const k = (n + h / 30) % 12;
        const a = s / 100 * Math.min(l / 100, 1 - l / 100);
        const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * c).toString(16).padStart(2, "0");
      };
      return "#" + f(0) + f(8) + f(4);
    }
    let colors = [];
    function gen() {
      const base = ui.querySelector("#col-hex").value.trim();
      let hsl;
      try { hsl = hexToHsl(base); }
      catch (e) { alert("Enter a valid hex color like #2f81f7"); return; }
      const [h, s, l] = hsl;
      const mode = ui.querySelector("#col-mode").value;
      if (mode === "mono") colors = [10, 25, 40, 55, 70, 85].map(L => hslToHex(h, s, L));
      else if (mode === "analogous") colors = [-60, -30, 0, 30, 60].map(d => hslToHex(h + d, s, l));
      else if (mode === "complementary") colors = [hslToHex(h, s, l), hslToHex(h, s, Math.min(90, l + 20)), hslToHex(h + 180, s, l), hslToHex(h + 180, s, Math.min(90, l + 20)), hslToHex(h + 180, s, Math.max(12, l - 20))];
      else if (mode === "triadic") colors = [h, h + 120, h + 240].flatMap(x => [hslToHex(x, s, l), hslToHex(x, s, Math.min(88, l + 18))]).slice(0, 6);
      else { const rh = Math.random() * 360; colors = [0, 20, 40, 60, 80].map(d => hslToHex(rh + d, 45 + Math.random() * 40, 35 + Math.random() * 45)); }
      const out = ui.querySelector("#col-out");
      out.innerHTML = colors.map(c => `<div class="swatch" title="Click to copy"><div class="chip" style="background:${c}"></div><div class="hex">${c}</div></div>`).join("");
      out.querySelectorAll(".swatch").forEach(el => el.onclick = () => D.copy(el.querySelector(".hex").textContent, el));
      ui.querySelector("#col-pick").value = colors[0];
    }
    ui.querySelector("#col-gen").onclick = gen;
    ui.querySelector("#col-pick").oninput = e => { ui.querySelector("#col-hex").value = e.target.value; gen(); };
    ui.querySelector("#col-hex").oninput = gen;
    ui.querySelector("#col-mode").onchange = gen;
    ui.querySelector("#col-copy-all").onclick = e => D.copy(colors.join(", "), e.target);
    gen();
  };
})();
