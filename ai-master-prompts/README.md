# AI Master Prompts

A free, static resource site presenting the ChatGPT, Gemini and Claude "Lyra" Master Prompts, with one-click copy and PDF downloads.

## Files

- `index.html` — page structure and content
- `css/style.css` — all styling
- `js/prompts-data.js` — the three Master Prompt texts, stored verbatim as data (edit this file to update prompt wording)
- `js/script.js` — nav, copy-to-clipboard, in-page search, and PDF generation (via jsPDF, loaded from cdnjs)
- `data/` — plain-text source copies of each prompt (not required by the site itself; kept for reference/editing)

## How the PDFs work

Each "Download PDF" button calls jsPDF in the browser to build a text-based (selectable, not screenshot) PDF: a cover page with the platform name and description, then the full prompt in a monospace font, auto-flowing across pages with page numbers and a footer. The "How to Use" PDF is generated the same way from the step-by-step guide and workflow diagram in `js/script.js`. "Download all PDFs" triggers all four downloads in sequence.

## Run locally

No build step is required. From this folder, start any static server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

(Opening `index.html` directly by double-clicking also works in most browsers, since everything is either inline or loaded from `js/`.)

## Deploy to GitHub Pages

1. Push this folder's contents to a GitHub repository (e.g. as the repo root, or in a `docs/` folder).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick your branch, and the root (or `/docs`) folder.
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo>/` within a minute or two.

## Editing the Master Prompt content later

Open `js/prompts-data.js` — it defines one `PROMPTS` object with three keys (`chatgpt`, `gemini`, `claude`), each a plain string. Edit the text there; the page, copy buttons, PDFs and search all read from this single source, so nothing else needs to change. The how-to guide's steps and best-practices list live near the top of `js/script.js` (`HOWTO_STEPS` and `BEST_PRACTICES`) if you want to edit those too.