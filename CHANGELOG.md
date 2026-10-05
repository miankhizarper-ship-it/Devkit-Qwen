# DevKit — Google AdSense Setup (CHANGELOG)

## What changed

### 1. AdSense script + verification (`index.html`)
- Added async loader in `<head>`: `adsbygoogle.js?client=ca-pub-6506538093886638` with `crossorigin="anonymous"`.
- Added `<meta name="google-adsense-account" content="ca-pub-6506538093886638">`.
- Removed the old commented-out placeholder snippet; added a TODO comment about enabling Google's certified CMP.
- All SEO meta tags, Open Graph and JSON-LD kept intact (og:description reworded for truthfulness).

### 2. `devkit/ads.txt` (site root, next to index.html)
```
google.com, pub-6506538093886638, DIRECT, f08c47fec0942fa0
```

### 3. SPA-safe ad component (`js/common.js`)
- `DK.ADS = { client: "ca-pub-6506538093886638", slot: "18190346125" }` — **single place to change IDs**.
- `DK.adSlot()` → `.ad-wrap` markup with an "Advertisement" label + responsive `<ins class="adsbygoogle">` (`data-ad-format="auto"`, `data-full-width-responsive="true"`).
- `DK.loadAds(container)` → pushes each unfilled `<ins>` at most once (guards on `data-adsbygoogle-status` + internal queue flag), everything in try/catch, IntersectionObserver lazy-fill (200px rootMargin), hard cap of 3 slots/route, sets `adsbygoogle.loaded` on route change so stale pending requests are dropped (no duplicate fills / "already have ads" errors).

### 4. Placements (`js/tools.js`)
- Home: 1 ad below hero/search, 1 before the footer section end (max 2; top one hides while search filtering is active).
- Tool pages: 1 directly below `.tool-panel` (before Related tools), 1 optional at the end of the SEO copy (only when SEO content exists). Never inside the panel/input/output/button rows.
- Info pages render no ads (thin-content policy).
- No back-to-back stacking; spacing + uppercase "Advertisement" label separates ads from content.

### 5. Styling (`css/style.css`)
- Replaced the striped "placeholder" `.ad-slot` look with real `.ad-wrap`: centered, `margin-block` 24–32px, reserved min-height (100px mobile / 120px desktop → low CLS), `overflow:hidden`, `max-width:min(970px,100%)` — no horizontal scroll at 320px.
- Collapse rules for unfilled/blocked ads: `[data-ad-status="unfilled"]{display:none}` + `.ad-empty/.ad-hidden` helpers; mobile CSS hides the last ad (≤2 per page on phones).

### 6. Policy pages (new hash routes)
- `#/privacy`, `#/about`, `#/contact`, `#/terms` rendered by the existing router (`DevKit.infoPages`), linked from a new "Site" column in the footer.
- Privacy Policy mentions Google AdSense, cookies/ad personalization, opt-out link, and links https://policies.google.com/technologies/partner-sites.
- Truthful wording pass: hero/footer/OG copy now say tool data stays in the browser but the site shows ads ("100% client-side" chip → "Client-side tools").

## Verification done
- jsdom smoke test over all 27 tool routes + home + 4 info pages: zero console errors, correct `data-ad-client`/`data-ad-slot` on every `<ins>`, ≤3 slots per route, labels present, JWT decode & JSON format regressions still pass, footer links present.

## You must do manually
1. **Verify site ownership** in AdSense and confirm `ads.txt` is reachable at `https://<your-domain>/ads.txt` after deploy.
2. **Confirm the slot ID**: `18190346125` has 11 digits (AdSense slots are usually 10). If ads don't render, copy the exact `data-ad-slot` from your AdSense ad-unit code and update it in ONE place: `DK.ADS.slot` in `js/common.js`.
3. **Enable the GDPR consent message**: AdSense → *Privacy & messaging* → enable Google's free certified CMP for EEA/UK/Switzerland. A fake custom banner was intentionally NOT built (see TODO comment in index.html).
4. **Wait for review/approval** — new ad units can take hours to days to start filling; blank/collapsed ad areas before approval are normal (the layout collapses gracefully).
