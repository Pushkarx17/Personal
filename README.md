# pushkarku.com

Personal site — static HTML, CSS and vanilla JS. No framework, no build step.

Live at [pushkarku.com](https://pushkarku.com), deployed on Cloudflare Pages
from `main`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The single-page portfolio |
| `404.html` | Not-found page |
| `privacy.html` | Privacy policy |
| `cookies.html` | Cookie policy |
| `terms.html` | Terms of use |
| `styles.css` | All styling, including the responsive layout |
| `fonts.css`, `fonts/` | Self-hosted webfonts (see below) |
| `script.js` | Uptime counter, scramble-on-hover, stat count-up |
| `_headers` | Security headers applied by Cloudflare Pages |
| `sitemap.xml`, `robots.txt` | SEO basics |
| `Pushkar_Resume_*.pdf` | Software/ML and hardware/embedded résumé variants |

## Privacy posture

The site loads **nothing from a third-party origin**. No analytics, no
cookies, no storage, no embeds, no forms. Every stylesheet, script, image and
font is served from this origin.

The fonts matter here: loading them from `fonts.gstatic.com` would hand every
visitor's IP address to Google on each page view, which is the one thing on a
site this simple that actually needs a lawful basis. `fonts.css` points at
`fonts/`, holding the latin and latin-ext subsets of JetBrains Mono and
Instrument Serif — both SIL OFL 1.1, licence in `fonts/LICENSE.txt`.

`_headers` sets a `default-src 'self'` CSP, so the browser *enforces* that
claim rather than relying on it staying true by hand. If you ever add a
genuinely necessary third-party resource, the CSP must be widened for it and
`privacy.html` and `cookies.html` updated to match — in that order.

**Keep Cloudflare Web Analytics disabled on this Pages project.** When it is
on, Cloudflare injects a `static.cloudflareinsights.com` beacon into HTML
responses — it is not in this repo, and a plain `curl` will not show it
because injection is conditional on a browser-like request. Check with:

```sh
curl -sS -A "Mozilla/5.0 (Macintosh) Chrome/140" -H "Accept: text/html" \
  https://pushkarku.com/ | grep -c cloudflareinsights   # must print 0
```

The CSP blocks the beacon even when it is injected, so no data is collected
either way — but with it enabled, `privacy.html` and `cookies.html` are only
true *because* of the CSP, which is a bad thing to be relying on.

## Layout

Three states, driven by available space rather than device names:

- **< 640px** — everything in one column.
- **640–1023px** — photo and links sit beside the terminal; *Now* and
  *Journey* run two-up underneath.
- **≥ 1024px** — left rail (`--rail`) plus a fluid content well. The well
  splits into two columns via `auto-fit` only once each can hold 280px, so a
  column can never get narrower as the window gets wider.

Design tokens live in `:root` in `styles.css`.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

Push to `main`; Cloudflare Pages builds and publishes automatically.

`_headers` only takes effect on Pages — the local `http.server` above ignores
it, so a CSP mistake will not show up in local preview.
