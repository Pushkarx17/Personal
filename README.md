# pushkarku.com

Personal site — static HTML, CSS and vanilla JS. No framework, no build step.

Live at [pushkarku.com](https://pushkarku.com), deployed on Cloudflare Pages
from `main`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The single-page portfolio |
| `404.html` | Not-found page |
| `styles.css` | All styling, including the responsive layout |
| `script.js` | Uptime counter, scramble-on-hover, stat count-up |
| `sitemap.xml`, `robots.txt` | SEO basics |
| `Pushkar_Resume_*.pdf` | Software/ML and hardware/embedded résumé variants |

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
