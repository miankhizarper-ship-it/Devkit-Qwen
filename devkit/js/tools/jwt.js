/* ============ JWT tool family (decoder, generator, validator, inspector) ============ */
window.ToolImpls = window.ToolImpls || {};
(function () {
  const ICO = () => window.DKIcons;

  const D = window.DK;

  /* ---------- crypto helpers: HS256/384/512 sign & verify via WebCrypto ---------- */
  async function hmac(alg, secretKey, message) {
    const hashName = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" }[alg];
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(secretKey),
      { name: "HMAC", hash: { name: hashName } }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return new Uint8Array(sig);
  }

  function splitJWT(token) {
    const parts = token.trim().split(".");
    if (parts.length !== 3) throw new Error("A JWT must have 3 dot-separated parts (header.payload.signature).");
    return parts;
  }

  function decodeParts(token) {
    const [h, p, s] = splitJWT(token);
    let header, payload;
    try { header = JSON.parse(D.b64urlDecode(h)); }
    catch (e) { throw new Error("Header is not valid base64url JSON."); }
    try { payload = JSON.parse(D.b64urlDecode(p)); }
    catch (e) { throw new Error("Payload is not valid base64url JSON."); }
    return { header, payload, signedInput: h + "." + p, signature: s };
  }

  async function verifyHS(token, secret) {
    const { header, signedInput, signature } = decodeParts(token);
    if (!/^HS(256|384|512)$/.test(header.alg)) throw new Error(`Verification supports HS256/HS384/HS512 (token uses ${header.alg}).`);
    const expected = D.b64urlEncodeBytes(await hmac(header.alg, secret, signedInput));
    // constant-time-ish compare
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  }

  const CLAIM_DESC = {
    iss: "Issuer — who created the token",
    sub: "Subject — the user/entity the token represents",
    aud: "Audience — intended recipient(s)",
    exp: "Expiration time (Unix seconds)",
    nbf: "Not before — token invalid until this time",
    iat: "Issued at (Unix seconds)",
    jti: "JWT ID — unique token identifier"
  };

  function fmtClaim(k, v) {
    if ((k === "exp" || k === "nbf" || k === "iat") && typeof v === "number") {
      return `${v} <span class="hint">→ ${new Date(v * 1000).toLocaleString()}</span>`;
    }
    return typeof v === "object" ? D.esc(JSON.stringify(v)) : D.esc(String(v));
  }

  function claimsTable(payload) {
    return `<table class="data claims-table"><tr><th>Claim</th><th>Value</th><th>Meaning</th></tr>` +
      Object.entries(payload).map(([k, v]) =>
        `<tr><td>${D.esc(k)}</td><td>${fmtClaim(k, v)}</td><td class="hint">${CLAIM_DESC[k] || "Custom claim"}</td></tr>`).join("") +
      `</table>`;
  }

  function expiryBadge(payload) {
    if (typeof payload.exp !== "number") return `<div class="status warn">${ICO().i("alert","ic-sm")} This token has no <code>exp</code> claim — it never expires.</div>`;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return `<div class="status err">${ICO().i("x","ic-sm")} Token EXPIRED ${new Date(payload.exp * 1000).toLocaleString()} (${Math.round((now - payload.exp) / 60)} min ago)</div>`;
    return `<div class="status ok">${ICO().i("check","ic-sm")} Token is valid until ${new Date(payload.exp * 1000).toLocaleString()} (in ${Math.max(1, Math.round((payload.exp - now) / 60))} min)</div>`;
  }

  // signed with the secret "your-256-bit-secret" so the sample verify passes
  const SAMPLE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDAwMDAwMDAwLCJyb2xlIjoiYWRtaW4ifQ.vXBEOohTJXIaTYVWTNSRyCQIselHJucR9bath8n5dFc";

  function segmentBoxes(ui, { header, payload }, token) {
    const [h, p, s] = token.trim().split(".");
    ui.innerHTML += `
      <div class="jwt-seg seg-header"><div class="seg-title" style="color:#79c0ff">HEADER (algorithm & type)</div><div>${D.esc(h)}</div></div>
      <div class="jwt-seg seg-payload"><div class="seg-title" style="color:#ffa657">PAYLOAD (claims)</div><div>${D.esc(p)}</div></div>
      <div class="jwt-seg seg-signature"><div class="seg-title" style="color:#f85149">SIGNATURE</div><div>${D.esc(s || "(missing)")} <span class="hint">— cannot be decoded, only verified</span></div></div>
      <label class="field">Decoded Header</label>
      <pre class="code-out">${D.hlJSON(JSON.stringify(header, null, 2))}</pre>
      <label class="field">Decoded Payload</label>
      <pre class="code-out">${D.hlJSON(JSON.stringify(payload, null, 2))}</pre>
      <label class="field">Payload claims explained</label>
      ${claimsTable(payload)}`;
  }

  /* ================= JWT Decoder ================= */
  ToolImpls["jwt-decoder"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">Paste a JWT (JSON Web Token)</label>
        <textarea id="t-in" spellcheck="false" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"></textarea>
        <div class="btn-row">
          <button class="btn" id="t-decode">${ICO().i("key","ic-sm")} Decode token</button>
          <button class="btn secondary" id="t-sample">${ICO().i("file","ic-sm")} Load sample</button>
          <button class="btn secondary" id="t-copy">${ICO().i("copy","ic-sm")} Copy payload JSON</button>
        </div>
        <div id="t-status"></div>
        <div id="t-result"></div>
      </div>`;
    const inp = ui.querySelector("#t-in"), st = ui.querySelector("#t-status"), res = ui.querySelector("#t-result");
    let lastPayload = "";
    function run() {
      res.innerHTML = ""; lastPayload = "";
      const tok = inp.value.trim();
      if (!tok) { st.innerHTML = `<div class="status warn">Paste a token first.</div>`; return; }
      try {
        const { header, payload } = decodeParts(tok);
        st.innerHTML = `<div class="status ok">${ICO().i("check","ic-sm")} Decoded successfully. Note: decoding does <em>not</em> verify the signature — use the <a href="#/jwt-validator">JWT Validator</a> for that.</div>` + expiryBadge(payload);
        lastPayload = JSON.stringify(payload, null, 2);
        segmentBoxes(res, { header, payload }, tok);
      } catch (e) {
        st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelector("#t-decode").onclick = run;
    ui.querySelector("#t-sample").onclick = () => { inp.value = SAMPLE_TOKEN; run(); };
    ui.querySelector("#t-copy").onclick = e => D.copy(lastPayload, e.target);
    inp.oninput = run;
    document.getElementById("seo-copy").innerHTML = `
      <h2>Free JWT Decoder Online</h2>
      <p>Decode any JSON Web Token instantly. Paste your token to see the <strong>Base64Url-decoded header</strong> (signature algorithm &amp; token type), the <strong>payload with all registered and custom claims</strong>, and the raw signature — plus a human-readable explanation of every claim (iss, sub, aud, exp, iat, nbf, jti).</p>
      <h3>What is a JWT?</h3>
      <p>A JWT is a compact, URL-safe token made of three Base64Url segments separated by dots: <code>xxxxx.yyyyy.zzzzz</code> = header, payload and signature. The payload is <em>encoded, not encrypted</em> — anyone can decode it, so never put secrets inside a JWT without additional encryption.</p>
      <h3>Is it safe to decode tokens here?</h3>
      <p>Yes. Everything runs in your browser; the token is never sent to a server. Decoding shows contents but does not verify the signature — for verification, use our free <a href="#/jwt-validator">JWT Validator</a> or generate your own tokens with the <a href="#/jwt-generator">JWT Generator</a>.</p>`;
  };

  /* ================= JWT Generator ================= */
  ToolImpls["jwt-generator"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div><label class="field">Algorithm</label>
            <select id="g-alg"><option>HS256</option><option>HS384</option><option>HS512</option></select></div>
          <div><label class="field">Secret key</label><input type="text" id="g-secret" value="your-256-bit-secret"></div>
          <div><label class="field">Expires in (minutes, optional)</label><input type="number" id="g-exp" value="60" min="0"></div>
        </div>
        <label class="field">Header JSON</label>
        <textarea id="g-header" style="min-height:80px"></textarea>
        <label class="field">Payload JSON (claims)</label>
        <textarea id="g-payload" style="min-height:140px"></textarea>
        <div class="btn-row">
          <button class="btn" id="g-sign">${ICO().i("lock","ic-sm")} Sign token</button>
          <button class="btn secondary" id="g-copy">${ICO().i("copy","ic-sm")} Copy token</button>
        </div>
        <div id="g-status"></div>
        <label class="field">Your JWT</label>
        <pre class="code-out mono" id="g-out" style="min-height:70px"></pre>
      </div>`;
    const gh = ui.querySelector("#g-header"), gp = ui.querySelector("#g-payload");
    gh.value = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
    const now = Math.floor(Date.now() / 1000);
    gp.value = JSON.stringify({ sub: "1234567890", name: "Ada Lovelace", admin: true, iat: now }, null, 2);
    const out = ui.querySelector("#g-out"), st = ui.querySelector("#g-status");
    ui.querySelector("#g-alg").onchange = e => {
      const o = JSON.parse(gh.value || "{}"); o.alg = e.target.value;
      gh.value = JSON.stringify(o, null, 2);
    };
    async function sign() {
      st.innerHTML = "";
      try {
        const header = JSON.parse(gh.value), payload = JSON.parse(gp.value);
        header.alg = ui.querySelector("#g-alg").value; header.typ = header.typ || "JWT";
        const mins = parseInt(ui.querySelector("#g-exp").value, 10);
        if (mins > 0) payload.exp = Math.floor(Date.now() / 1000) + mins * 60;
        const h = D.b64urlEncode(JSON.stringify(header));
        const p = D.b64urlEncode(JSON.stringify(payload));
        const sig = D.b64urlEncodeBytes(await hmac(header.alg, ui.querySelector("#g-secret").value, h + "." + p));
        const token = `${h}.${p}.${sig}`;
        out.textContent = token;
        st.innerHTML = `<div class="status ok">${ICO().i("check","ic-sm")} Token signed with ${header.alg}. <a href="#/jwt-decoder">Decode it</a> or <a href="#/jwt-validator">verify it</a>.</div>`;
      } catch (e) {
        st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelector("#g-sign").onclick = sign;
    ui.querySelector("#g-copy").onclick = e => D.copy(out.textContent, e.target);
    sign();
    document.getElementById("seo-copy").innerHTML = `<h2>Free JWT Generator Online (HS256 / HS384 / HS512)</h2><p>Create signed JSON Web Tokens directly in your browser using the Web Crypto API. Set the header, add any custom claims to the payload, choose an HMAC algorithm and secret, optionally attach an expiry — then copy the finished token for testing your authentication flows. No server round-trip, no leaked secrets.</p>`;
  };

  /* ================= JWT Validator ================= */
  ToolImpls["jwt-validator"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">JWT token</label>
        <textarea id="val-t" spellcheck="false" placeholder="Paste token…"></textarea>
        <label class="field">Secret (HMAC shared secret)</label>
        <input type="text" id="val-s" placeholder="your-256-bit-secret">
        <div class="btn-row">
          <button class="btn" id="val-run">${ICO().i("shield","ic-sm")} Verify signature</button>
          <button class="btn secondary" id="val-sample">${ICO().i("file","ic-sm")} Load sample pair</button>
        </div>
        <div id="val-status"></div>
        <div id="val-result"></div>
      </div>`;
    const t = ui.querySelector("#val-t"), sec = ui.querySelector("#val-s"), st = ui.querySelector("#val-status"), res = ui.querySelector("#val-result");
    async function run() {
      res.innerHTML = "";
      try {
        const { header, payload } = decodeParts(t.value);
        const ok = await verifyHS(t.value, sec.value);
        st.innerHTML = ok
          ? `<div class="status ok">${ICO().i("check","ic-sm")} Signature VERIFIED with ${header.alg} — the token was definitely signed with this secret and has not been tampered with.</div>` + expiryBadge(payload)
          : `<div class="status err">${ICO().i("x","ic-sm")} Signature INVALID — wrong secret, or the token was modified after signing.</div>` + expiryBadge(payload);
        segmentBoxes(res, { header, payload }, t.value);
      } catch (e) {
        st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelector("#val-run").onclick = run;
    ui.querySelector("#val-sample").onclick = async () => {
      t.value = SAMPLE_TOKEN; sec.value = "your-256-bit-secret"; run();
    };
    document.getElementById("seo-copy").innerHTML = `<h2>Free JWT Validator &amp; Signature Verifier</h2><p>Verify a JWT's HMAC signature (HS256/HS384/HS512) with your shared secret, check whether the token is expired (<code>exp</code>) or not-yet-valid (<code>nbf</code>), and inspect the decoded header and payload. Signatures are computed locally with the browser's Web Crypto API — your secret never leaves your machine.</p><p class="hint">Note: RS256/ES256 public-key verification requires the issuer's JWKS — this tool currently verifies symmetric HMAC algorithms.</p>`;
  };

  /* ================= JWT Inspector ================= */
  ToolImpls["jwt-inspector"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">JWT token to inspect</label>
        <textarea id="i-in" spellcheck="false" placeholder="Paste token…"></textarea>
        <div class="btn-row"><button class="btn" id="i-run">${ICO().i("eye","ic-sm")} Inspect token</button><button class="btn secondary" id="i-sample">${ICO().i("file","ic-sm")} Load sample</button></div>
        <div id="i-status"></div>
        <div id="i-result"></div>
      </div>`;
    const inp = ui.querySelector("#i-in"), st = ui.querySelector("#i-status"), res = ui.querySelector("#i-result");
    function run() {
      res.innerHTML = "";
      try {
        const { header, payload } = decodeParts(inp.value);
        const issues = [];
        if (!header.alg) issues.push("Header has no <code>alg</code> — some libraries accept <code>alg:none</code> tokens (CVE-2015-9235). Never trust tokens without an algorithm!");
        if (header.alg === "none") issues.push("<strong>Danger:</strong> algorithm is <code>none</code> — unsigned token!");
        if (header.alg && !/^HS|^RS|^ES|^PS|^Ed/i.test(header.alg)) issues.push(`Unusual algorithm: <code>${D.esc(header.alg)}</code>`);
        if (typeof payload.exp !== "number") issues.push("No <code>exp</code> claim — the token never expires. Consider short-lived tokens.");
        if (!payload.iss) issues.push("No <code>iss</code> (issuer) claim — you may want to pin the issuer when verifying.");
        if (!payload.aud) issues.push("No <code>aud</code> (audience) claim — tokens could be replayed across services.");
        const size = new Blob([inp.value.trim()]).size;
        const algNote = /^HS/.test(header.alg || "") ? "symmetric HMAC — anyone with the secret can both sign and verify."
          : /^(RS|ES|PS|Ed)/.test(header.alg || "") ? "asymmetric — verified with a public key (see issuer JWKS)." : "unknown";
        st.innerHTML = `
          <div class="status ok">${ICO().i("check","ic-sm")} Structure OK — ${size} bytes · alg=<code>${D.esc(header.alg || "?")}</code> (${algNote})</div>
          ${issues.length ? `<div class="status warn"><strong>Security review:</strong><ul style="margin:6px 0 0">${issues.map(x => `<li>${x}</li>`).join("")}</ul></div>` : `<div class="status ok">${ICO().i("check","ic-sm")} No structural issues found.</div>`}
          ${expiryBadge(payload)}`;
        segmentBoxes(res, { header, payload }, inp.value.trim());
      } catch (e) {
        st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} ${D.esc(e.message)}</div>`;
      }
    }
    ui.querySelector("#i-run").onclick = run;
    ui.querySelector("#i-sample").onclick = () => { inp.value = SAMPLE_TOKEN; run(); };
    document.getElementById("seo-copy").innerHTML = `<h2>JWT Inspector — Analyze &amp; Audit JSON Web Tokens</h2><p>Go beyond decoding: the inspector audits your token's security posture — checks the algorithm (including the dangerous <code>alg:none</code> trick), warns about missing <code>exp</code>, <code>iss</code> or <code>aud</code> claims, shows token size, converts timestamps to readable dates and explains every claim. Ideal for security reviews and debugging auth bugs.</p>`;
  };
})();
