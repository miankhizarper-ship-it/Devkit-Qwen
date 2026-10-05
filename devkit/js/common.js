/* ============================================================
   DevKit shared helpers: DOM, clipboard, highlighters, formatters
   ============================================================ */
window.DK = (function () {
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function copy(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      if (!btn) return;
      const old = btn.textContent;
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = old), 1200);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    });
  }

  /* ---------- JSON syntax highlighting ---------- */
  function hlJSON(str) {
    return esc(str).replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (m, s, colon, bool, nul) => {
        if (s) return colon ? `<span class="tok-key">${s}</span>${colon}` : `<span class="tok-str">${s}</span>`;
        if (bool !== undefined && m !== "null") return `<span class="tok-bool">${m}</span>`;
        if (nul) return `<span class="tok-null">null</span>`;
        return `<span class="tok-num">${m}</span>`;
      }
    );
  }

  /* ---------- generic code highlight (lightweight) ---------- */
  function hlGeneric(code, lang) {
    let out = esc(code);
    if (lang === "js") {
      out = out
        .replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, `<span class="tok-comment">$1</span>`)
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|async|await|=>|this|null|undefined|true|false)\b/g, `<span class="tok-kw">$1</span>`)
        .replace(/(&quot;(?:\\.|[^&])*?&quot;|&#39;(?:\\.|[^&])*?&#39;|`(?:[^`\\]|\\.)*`)/g, `<span class="tok-str">$1</span>`);
    } else if (lang === "css") {
      out = out
        .replace(/(\/\*[\s\S]*?\*\/)/g, `<span class="tok-comment">$1</span>`)
        .replace(/([.#]?[\w-]+(?:\s*[>&+~]\s*[\w-]+)*)(\s*\{)/g, `<span class="tok-sel">$1</span>$2`)
        .replace(/([\w-]+)(\s*:)/g, `<span class="tok-prop">$1</span>$2`);
    } else if (lang === "html") {
      out = out
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span class="tok-comment">$1</span>`)
        .replace(/(&lt;\/?)([\w-]+)/g, `$1<span class="tok-tag">$2</span>`)
        .replace(/([\w-]+)(=)(&quot;[^&]*&quot;)/g, `<span class="tok-attr">$1</span>$2<span class="tok-str">$3</span>`);
    } else if (lang === "sql") {
      out = out.replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|AND|OR|NOT|NULL|CREATE|TABLE|ALTER|DROP|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|DISTINCT|UNION|ALL|CASE|WHEN|THEN|ELSE|END|WITH)\b/gi,
        m => `<span class="tok-kw">${m.toUpperCase()}</span>`);
      out = out.replace(/(&#39;(?:[^&])*?&#39;|'[^']*')/g, `<span class="tok-str">$1</span>`);
    }
    return out;
  }

  /* ================= HTML formatter ================= */
  function formatHTML(src) {
    const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr","!doctype"]);
    // normalize: put each tag on its own line boundary
    let s = src.replace(/>\s*</g, "><\n").trim();
    const lines = s.split("\n");
    let depth = 0, out = [];
    const raw = new Set(["pre", "script", "style", "textarea"]);
    let inRaw = null;
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (inRaw) {
        out.push("  ".repeat(depth) + line);
        if (new RegExp(`</${inRaw}`, "i").test(line)) inRaw = null;
        continue;
      }
      const closeMatch = line.match(/^<\/([\w-]+)/i);
      if (closeMatch) depth = Math.max(0, depth - 1);
      out.push("  ".repeat(depth) + line);
      const tagName = (line.match(/^<(\/?)([\w-!]+)/i) || [])[2];
      const isSelfClose = /\/>$/.test(line) || (tagName && voids.has(tagName.toLowerCase()));
      const hasOpen = /^<[\w]/.test(line) && !isSelfClose && !(tagName && raw.has(tagName.toLowerCase()) && /<\/?/.test(line) === false);
      if (tagName && raw.has(tagName.toLowerCase()) && !new RegExp(`</${tagName}`, "i").test(line)) inRaw = tagName.toLowerCase();
      else if (!closeMatch && !isSelfClose && /^<[\w]/.test(line) && !/<\/[\w-]+>/.test(line)) depth++;
    }
    return out.join("\n");
  }

  /* ================= CSS formatter ================= */
  function formatCSS(src) {
    let s = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/\s+/g, " "))
               .replace(/\s*([{}:;,])\s*/g, "$1")
               .replace(/;}/g, "}")
               .replace(/,(?=\{)/g, ""); // drop dangling comma before a block (e.g. ".b, {")
    const rules = [];
    let buf = "", depth = 0;
    for (const ch of s) {
      if (ch === ";" && depth === 0) {
        const trimmed = buf.trim();
        if (trimmed) rules.push(trimmed + ";");
        buf = "";
        continue;
      }
      buf += ch;
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { rules.push(buf.trim()); buf = ""; } }
    }
    if (buf.trim()) rules.push(buf.trim().replace(/;$/, ""));
    return rules.map(r => {
      const i = r.indexOf("{");
      if (i === -1) return r.endsWith(";") ? r : r + ";";
      const sel = r.slice(0, i).trim().replace(/\s*,\s*/g, ",\n");
      const body = r.slice(i + 1).replace(/}$/, "").trim();
      const decls = body.split(";").filter(Boolean).map(d => {
        const idx = d.indexOf(":");
        return "  " + d.slice(0, idx).trim() + ": " + d.slice(idx + 1).trim() + ";";
      });
      return sel.split("\n").map(x => x + " {").join("\n") + "\n" + decls.join("\n") + "\n}";
    }).join("\n\n");
  }

  /* ================= MD5 (RFC 1321) ================= */
  function md5(str) {
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    const bytes = new TextEncoder().encode(str);
    const n = bytes.length;
    const total = (((n + 8) >> 6) + 1) << 6;
    const buf = new Uint8Array(total);
    buf.set(bytes); buf[n] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, (n * 8) >>> 0, true);
    dv.setUint32(total - 4, Math.floor(n / 536870912), true); // high 32 bits of bit length
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    const rl = (x, k) => (x << k) | (x >>> (32 - k));
    for (let off = 0; off < total; off += 64) {
      const M = new Array(16);
      for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
      let A = a, B = b, C = c, D = d;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16)      { F = (B & C) | (~B & D);          g = i; }
        else if (i < 32) { F = (D & B) | (~D & C);          g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D;                   g = (3 * i + 5) % 16; }
        else             { F = C ^ (B | ~D);                g = (7 * i) % 16; }
        F = (F + A + K[i] + M[g]) >>> 0;
        A = D; D = C; C = B;
        B = (B + rl(F, S[i])) >>> 0;
      }
      a = (a + A) >>> 0; b = (b + B) >>> 0; c = (c + C) >>> 0; d = (d + D) >>> 0;
    }
    return [a, b, c, d].map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  /* ================= JS formatter (indentation-based) ================= */
  function formatJS(src) {
    // strip trailing spaces, ensure space after keywords
    let s = src.replace(/\r/g, "");
    const out = [];
    let indent = 0, lineBuf = "", inStr = null, inComment = null, prevCh = "";
    const pushLine = () => {
      const t = lineBuf.trim();
      if (t) {
        let ind = indent;
        if (/^[)}\]]/.test(t)) ind = Math.max(0, ind - 1);
        out.push("  ".repeat(ind) + t);
      }
      lineBuf = "";
    };
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inComment === "//") { lineBuf += ch; if (ch === "\n") { inComment = null; pushLine(); } continue; }
      if (inComment === "/*") { lineBuf += ch; if (prevCh === "*" && ch === "/") inComment = null; prevCh = ch; continue; }
      if (inStr) { lineBuf += ch; if (ch === "\\") { lineBuf += s[++i] || ""; } else if (ch === inStr) inStr = null; prevCh = ch; continue; }
      if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; lineBuf += ch; prevCh = ch; continue; }
      if (ch === "/" && (s[i+1] === "/")) { inComment = "//"; lineBuf += ch; prevCh = ch; continue; }
      if (ch === "/" && (s[i+1] === "*")) { inComment = "/*"; lineBuf += ch; prevCh = ch; continue; }
      if (ch === "{" || ch === "(" || ch === "[") { indent++; lineBuf += ch; pushLine(); prevCh = ch; continue; }
      if (ch === "}" || ch === ")" || ch === "]") { indent = Math.max(0, indent - 1); pushLine(); lineBuf = ch; prevCh = ch; continue; }
      if (ch === ";" || ch === ",") {
        // keep , inside call args inline-ish: still newline for readability
        lineBuf += ch; pushLine(); prevCh = ch; continue;
      }
      if (ch === "\n") { pushLine(); prevCh = ch; continue; }
      lineBuf += ch; prevCh = ch;
    }
    pushLine();
    // join brace closers with following semicolons nicely & tidy artifacts
    return out.join("\n")
      .replace(/\n\s*\)\s*;/g, ");")
      .replace(/\{\n\s*\}/g, "{}");
  }

  /* ================= SQL formatter ================= */
  function formatSQL(src) {
    const kw = ["SELECT","FROM","WHERE","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","LEFT JOIN","RIGHT JOIN","INNER JOIN","OUTER JOIN","FULL JOIN","JOIN","ON","UNION ALL","UNION","CREATE TABLE","ALTER TABLE","DROP TABLE","WITH"];
    let s = src.replace(/\s+/g, " ").trim();
    for (const k of kw) {
      const re = new RegExp("\\b" + k.replace(/ /g, "\\s+") + "\\b", "gi");
      s = s.replace(re, "\n" + k + "\n");
    }
    s = s.replace(/,(?=\s*\n)?/g, ",\n  ");
    const lines = s.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.map(l => {
      if (/^[A-Z ]+$/.test(l) || kw.includes(l.toUpperCase())) return l;
      if (l.startsWith("  ") || /^\w/.test(l) && kw.some(k => l.toUpperCase().startsWith(k))) return l;
      return "  " + l;
    }).join("\n").replace(/\n\s*\n/g, "\n");
  }

  /* ================= YAML stringify ================= */
  function toYAML(obj, indent = 0) {
    const pad = "  ".repeat(indent);
    if (obj === null || obj === undefined) return "null";
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (typeof obj === "string") {
      const ambiguous = /^(?:~?null|~?[yY](?:es|a|n)|~?[nN]o|~?[tT]rue|~?[fF]alse|~?[-+]?(?:inf(?:inity)?|nan|\d+(?:\.\d+)?))$/i.test(obj)
        || /^[-?:,\[\]{}#&*!|>'"%@`]/.test(obj) || /:\s|\s#/.test(obj) || /\n/.test(obj) || /^\s|\s$/.test(obj) || obj === "";
      return ambiguous ? JSON.stringify(obj) : obj;
    }
    if (Array.isArray(obj)) {
      if (!obj.length) return "[]";
      return "\n" + obj.map(v => {
        const y = toYAML(v, indent + 1);
        return y.startsWith("\n") ? `${pad}- ${y.trimStart()}` : `${pad}- ${y}`;
      }).join("\n");
    }
    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (!keys.length) return "{}";
      return "\n" + keys.map(k => {
        const safeK = /[:#\n]/.test(k) ? JSON.stringify(k) : k;
        const v = obj[k];
        const y = toYAML(v, indent + 1);
        if (typeof v === "object" && v !== null) {
          if (Array.isArray(v) && v.length) return `${pad}${safeK}:${y.replace(pad + "-", pad + "  -").replace(new RegExp("^\\n" + pad + "\\s"), "\n" + pad + " ")}`;
          return `${pad}${safeK}:${y.startsWith("\n") ? y : " " + y}`;
        }
        return `${pad}${safeK}: ${y}`;
      }).join("\n");
    }
    return String(obj);
  }

  function yamlOut(obj) {
    const s = toYAML(obj, 0);
    return s.startsWith("\n") ? s.slice(1) : s;
  }

  /* ================= CSV ================= */
  function csvCell(v) {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  /* ================= Base64url ================= */
  function b64urlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const bin = atob(str);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }
  function b64urlEncodeBytes(bytes) {
    let bin = "";
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlEncode(str) {
    return b64urlEncodeBytes(new TextEncoder().encode(str));
  }

  return { esc, h, copy, hlJSON, hlGeneric, formatHTML, formatCSS, formatJS, formatSQL, toYAML, yamlOut, csvCell, b64urlDecode, b64urlEncode, b64urlEncodeBytes, md5 };
})();
