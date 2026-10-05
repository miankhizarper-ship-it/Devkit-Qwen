/* ============ Timestamp & Timezone tools ============ */
window.ToolImpls = window.ToolImpls || {};
(function () {
  const ICO = () => window.DKIcons;

  const D = window.DK;

  function fmtDate(d) {
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  function toUTC(d, tz) {
    try {
      return new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(d);
    } catch (e) { return null; }
  }

  /* ================= Unix Timestamp Converter ================= */
  ToolImpls["unix-timestamp"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <label class="field">Current Unix timestamp (live)</label>
        <div class="now-box" id="u-now"></div>
        <div class="btn-row"><button class="btn secondary" id="u-use">Use current time ↓</button></div>
        <div class="inline-inputs">
          <div style="flex:2"><label class="field">Timestamp (seconds or milliseconds)</label>
            <input type="text" id="u-in" placeholder="e.g. 1700000000"></div>
          <div><label class="field">Unit</label><select id="u-unit"><option value="auto">Auto-detect</option><option value="s">Seconds</option><option value="ms">Milliseconds</option></select></div>
          <div><label class="field">&nbsp;</label><button class="btn" id="u-conv">${ICO().i("swap","ic-sm")} Convert</button></div>
        </div>
        <div id="u-status"></div>
        <div id="u-out"></div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Unix Timestamp Converter Online</h2><p>Convert Unix (epoch) timestamps to human-readable dates and back — seconds or milliseconds, auto-detected. See UTC time, your local time, ISO-8601, relative age (“x minutes ago”) and day of week instantly. The live counter shows the current epoch second, which updates every tick.</p>`;
    const nowEl = ui.querySelector("#u-now");
    setInterval(() => {
      const ms = Date.now();
      nowEl.textContent = Math.floor(ms / 1000) + " s  ·  " + ms + " ms";
    }, 250);
    ui.querySelector("#u-use").onclick = () => { ui.querySelector("#u-in").value = String(Math.floor(Date.now() / 1000)); run(); };
    function run() {
      const v = ui.querySelector("#u-in").value.trim(), st = ui.querySelector("#u-status"), out = ui.querySelector("#u-out");
      if (!v) { st.innerHTML = ""; out.innerHTML = ""; return; }
      if (!/^-?\d+$/.test(v)) { st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} Timestamp must be a whole number.</div>`; out.innerHTML = ""; return; }
      let n = BigInt(v), unit = ui.querySelector("#u-unit").value;
      if (unit === "auto") unit = Math.abs(Number(v)) > 1e11 ? "ms" : "s"; // ~ after year 5138 in seconds
      const ms = unit === "s" ? Number(n * 1000n) : Number(n);
      const d = new Date(ms);
      if (isNaN(d.getTime())) { st.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} Out of range date.</div>`; return; }
      const diffSec = Math.round((Date.now() - ms) / 1000);
      const rel = Math.abs(diffSec) < 60 ? `${diffSec}s` : Math.abs(diffSec) < 3600 ? `${Math.round(diffSec/60)} min` : Math.abs(diffSec) < 86400 ? `${Math.round(diffSec/3600)} h` : `${Math.round(diffSec/86400)} days`;
      st.innerHTML = `<div class="status ok">${ICO().i("check","ic-sm")} Interpreted as <strong>${unit === "s" ? "seconds" : "milliseconds"}</strong> — ${diffSec >= 0 ? rel + " ago" : "in " + rel}.</div>`;
      out.innerHTML = `<table class="data">
        <tr><th>Representation</th><th>Value</th></tr>
        <tr><td>Local time</td><td>${fmtDate(d)}</td></tr>
        <tr><td>UTC</td><td>${d.toUTCString()}</td></tr>
        <tr><td>ISO 8601</td><td class="mono">${d.toISOString()}</td></tr>
        <tr><td>Unix seconds</td><td class="mono">${Math.floor(ms / 1000)}</td></tr>
        <tr><td>Unix milliseconds</td><td class="mono">${ms}</td></tr>
      </table>`;
    }
    ui.querySelector("#u-conv").onclick = run;
    ui.querySelector("#u-in").addEventListener("input", run);
    ui.querySelector("#u-unit").onchange = run;
  };

  /* ================= Date → Timestamp ================= */
  ToolImpls["date-to-timestamp"] = ui => {
    const pad = x => String(x).padStart(2, "0");
    const d = new Date();
    const localIso = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div style="flex:2"><label class="field">Pick a date &amp; time</label>
            <input type="datetime-local" id="d-in" value="${localIso}" step="1"></div>
          <div><label class="field">Interpret as</label>
            <select id="d-mode"><option value="local">My local timezone</option><option value="utc">UTC</option></select></div>
          <div><label class="field">&nbsp;</label><button class="btn" id="d-go">Convert</button></div>
        </div>
        <div id="d-out" style="margin-top:12px"></div>
        <div class="btn-row"><button class="btn secondary" id="d-copy">Copy timestamp</button></div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Date to Unix Timestamp Converter</h2><p>Choose any calendar date and clock time, decide whether it means your local timezone or UTC, and get the matching Unix epoch value in both seconds and milliseconds — plus ISO-8601 output. Perfect for seeding databases, writing test fixtures and setting <code>exp</code>/<code>iat</code> claims by hand.</p>`;
    let lastTs = "";
    function run() {
      const v = ui.querySelector("#d-in").value;
      const out = ui.querySelector("#d-out");
      if (!v) { out.innerHTML = `<div class="status warn">Pick a date first.</div>`; return; }
      const dateObj = ui.querySelector("#d-mode").value === "utc" ? new Date(v + "Z") : new Date(v);
      if (isNaN(dateObj.getTime())) { out.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} Invalid date.</div>`; return; }
      lastTs = String(Math.floor(dateObj.getTime() / 1000));
      out.innerHTML = `<table class="data">
        <tr><th>Unix seconds</th><td class="mono">${lastTs}</td></tr>
        <tr><th>Unix milliseconds</th><td class="mono">${dateObj.getTime()}</td></tr>
        <tr><th>ISO 8601</th><td class="mono">${dateObj.toISOString()}</td></tr>
        <tr><th>Readable (${ui.querySelector("#d-mode").value === "utc" ? "UTC" : "local"})</th><td>${fmtDate(dateObj)}</td></tr>
      </table>`;
    }
    ["#d-in", "#d-mode"].forEach(s => ui.querySelector(s).addEventListener("change", run));
    ui.querySelector("#d-go").onclick = run;
    ui.querySelector("#d-copy").onclick = e => D.copy(lastTs, e.target);
    run();
  };

  /* ================= Timestamp → Date ================= */
  ToolImpls["timestamp-to-date"] = ui => {
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div style="flex:2"><label class="field">Unix timestamp</label>
            <input type="text" id="td-in" placeholder="${Math.floor(Date.now()/1000)}"></div>
          <div><label class="field">Unit</label><select id="td-unit"><option value="auto">Auto</option><option value="s">Seconds</option><option value="ms">Milliseconds</option></select></div>
          <div><label class="field">&nbsp;</label><button class="btn" id="td-go">Convert to date</button></div>
        </div>
        <div id="td-out" style="margin-top:12px"></div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Timestamp to Date Converter</h2><p>Paste a Unix epoch value (seconds like <code>1700000000</code> or milliseconds like <code>1700000000000</code>) and see the exact calendar date &amp; time in your local zone, in UTC and in ISO format — with a “how long ago” summary. Auto-detection picks the sensible unit for you.</p>`;
    function run() {
      const v = ui.querySelector("#td-in").value.trim(), out = ui.querySelector("#td-out");
      if (!/^-?\d+$/.test(v)) { out.innerHTML = `<div class="status warn">Enter a numeric timestamp.</div>`; return; }
      let unit = ui.querySelector("#td-unit").value;
      if (unit === "auto") unit = Math.abs(Number(v)) > 1e11 ? "ms" : "s";
      const ms = unit === "s" ? Number(v) * 1000 : Number(v);
      const d = new Date(ms);
      if (isNaN(d.getTime())) { out.innerHTML = `<div class="status err">${ICO().i("x","ic-sm")} Out of range.</div>`; return; }
      out.innerHTML = `
        <div class="status ok">${ICO().i("check","ic-sm")} ${unit === "s" ? "Seconds" : "Milliseconds"} → readable date</div>
        <table class="data">
          <tr><th>Local</th><td>${fmtDate(d)}</td></tr>
          <tr><th>UTC</th><td>${d.toUTCString()}</td></tr>
          <tr><th>ISO 8601</th><td class="mono">${d.toISOString()}</td></tr>
          <tr><th>Date only</th><td class="mono">${d.toISOString().slice(0, 10)}</td></tr>
        </table>`;
    }
    ui.querySelector("#td-go").onclick = run;
    ui.querySelector("#td-in").addEventListener("input", run);
    ui.querySelector("#td-unit").onchange = run;
  };

  /* ================= Timezone Converter ================= */
  ToolImpls["timezone-converter"] = ui => {
    const ZONES = [
      "UTC", "Asia/Kolkata", "Asia/Karachi", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "America/New_York", "America/Chicago",
      "America/Denver", "America/Los_Angeles", "America/Sao_Paulo", "Africa/Lagos", "Africa/Johannesburg", "Pacific/Auckland"
    ];
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const pad = x => String(x).padStart(2, "0");
    ui.innerHTML = `
      <div class="tool-panel">
        <div class="inline-inputs">
          <div style="flex:2"><label class="field">Date &amp; time</label>
            <input type="datetime-local" id="tz-in" value="${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}"></div>
          <div><label class="field">From timezone</label><select id="tz-from">${ZONES.map(z => `<option ${z===localTz?"selected":""}>${z}</option>`).join("")}</select></div>
          <div><label class="field">To timezone</label><select id="tz-to">${ZONES.map(z => `<option ${z==="UTC"?"selected":""}>${z}</option>`).join("")}</select></div>
        </div>
        <div class="checkbox-row"><label style="color:var(--muted)">Also show common world clocks:</label></div>
        <div id="tz-out" style="margin-top:10px"></div>
      </div>`;
    document.getElementById("seo-copy").innerHTML = `<h2>Timezone Converter Online (UTC, IST, PST, GMT…)</h2><p>Convert any date &amp; time between the world's major IANA timezones — accurate across daylight-saving transitions because it uses your browser's built-in Intl time-zone database. Great for scheduling meetings across offices, planning releases and converting log timestamps (UTC ↔ local).</p>`;
    // convert "wall time in zone A" → Date instant
    function zonedToInstant(y, mo, da, hh, mm, zone) {
      const guess = Date.UTC(y, mo - 1, da, hh, mm);
      for (let iter = 0; iter < 3; iter++) {
        const parts = zoneParts(new Date(guess), zone);
        const asUTC = Date.UTC(parts.y, parts.mo - 1, parts.da, parts.hh, parts.mm);
        const delta = asUTC - guess;
        if (delta === 0) break;
        guess += delta;
      }
      return new Date(guess);
    }
    function zoneParts(date, zone) {
      const f = new Intl.DateTimeFormat("en-GB", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
      const p = {};
      f.formatToParts(date).forEach(x => { if (x.type !== "literal") p[x.type] = x.value; });
      return { y: +p.year, mo: +p.month, da: +p.day, hh: +p.hour % 24, mm: +p.minute, ss: +p.second };
    }
    function offsetLabel(date, zone) {
      const p = zoneParts(date, zone);
      const asUTC = Date.UTC(p.y, p.mo - 1, p.da, p.hh, p.mm);
      const mins = Math.round((asUTC - Math.floor(date.getTime() / 60000) * 60000) / 60000);
      const sign = mins >= 0 ? "+" : "-";
      return `UTC${sign}${String(Math.floor(Math.abs(mins) / 60)).padStart(2, "0")}:${String(Math.abs(mins) % 60).padStart(2, "0")}`;
    }
    function run() {
      const v = ui.querySelector("#tz-in").value;
      const out = ui.querySelector("#tz-out");
      if (!v) { out.innerHTML = `<div class="status warn">Pick a date & time.</div>`; return; }
      const [ds, ts] = v.split("T");
      const [y, mo, da] = ds.split("-").map(Number);
      const [hh, mm] = ts.split(":").map(Number);
      const from = ui.querySelector("#tz-from").value, to = ui.querySelector("#tz-to").value;
      const instant = zonedToInstant(y, mo, da, hh, mm, from);
      const p = zoneParts(instant, to);
      const diffH = (instant.getTime() - Date.UTC(y, mo - 1, da, hh, mm)) / 3600000;
      const sameDay = p.da === da && p.mo === mo && p.y === y;
      out.innerHTML = `
        <div class="status ok">${ICO().i("check","ic-sm")} <strong>${from}</strong> ${pad(hh)}:${pad(mm)}, ${da}/${mo}/${y}
          &nbsp;→&nbsp; <strong>${to}</strong> <span style="font-size:17px">${pad(p.hh)}:${pad(p.mm)}, ${p.da}/${p.mo}/${p.y}</span>
          ${sameDay ? "" : `<em>(next day: ${p.da}/${p.mo})</em>`}</div>
        <table class="data">
          <tr><th>Offset ${D.esc(from)}</th><td>${offsetLabel(instant, from)}</td></tr>
          <tr><th>Offset ${D.esc(to)}</th><td>${offsetLabel(instant, to)}</td></tr>
          <tr><th>Shift</th><td>${(diffH > 0 ? "+" : "") + (Math.round(diffH * 2) / 2)} h · Instant: ${instant.toISOString()}</td></tr>
        </table>
        <table class="data" style="margin-top:10px">
          <tr><th colspan="2">World clocks at this instant</th></tr>
          ${["UTC","America/New_York","Europe/London","Asia/Kolkata","Asia/Tokyo","Australia/Sydney"].map(z =>
            `<tr><td>${z}</td><td>${toUTC(instant, z)} (${offsetLabel(instant, z)})</td></tr>`).join("")}
        </table>`;
    }
    ["#tz-in", "#tz-from", "#tz-to"].forEach(s => ui.querySelector(s).addEventListener("change", run));
    run();
  };
})();
