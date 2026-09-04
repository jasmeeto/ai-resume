# Resume

Data-driven resume: all content lives in [`resume.json`](./resume.json). `index.html` reads
that file and renders it in the browser, styled to match the original LaTeX layout. No LaTeX
toolchain, no recompiling — add a job, save the file, refresh the page.

## Structure

```
resume.json         # all your content (basics, skills, work, projects, education)
resume.schema.json  # JSON Schema for resume.json (editor autocomplete/validation)
index.html           # page shell
css/style.css         # styling (screen + print)
js/render.js           # reads resume.json and builds the DOM
scripts/export-pdf.mjs  # headless-Chromium export to PDF
legacy/main.tex       # original LaTeX source, kept for reference
```

## Adding or editing experience

Open `resume.json` and edit the `work` array. Each entry looks like:

```json
{
  "name": "Company Name",
  "location": "City, ST",
  "position": "Job Title",
  "startDate": "2024-01",
  "endDate": "",
  "highlights": [
    "Bullet point describing an accomplishment"
  ],
  "keywords": ["Tools", "Frameworks", "Used"]
}
```

- New jobs go at the **top** of the `work` array (most recent first).
- Leave `endDate` as an empty string for a current position — it renders as "Present".
- `keywords` renders as a small "Tools/Frameworks Used" line under the bullets.
- `skills`, `projects`, and `education` follow the same pattern — see `resume.schema.json`
  for the full shape. Most editors (VS Code) will give you autocomplete and validation
  automatically via the `$schema` field at the top of `resume.json`.

## Preview locally

Browsers block `fetch()` of local files opened directly (`file://`), so serve the folder
over HTTP:

```bash
npm start
# or: python3 -m http.server 8080
```

Then open the printed URL (e.g. http://localhost:3000).

## Export to PDF

Two options:

1. **Browser print dialog** — open the served page and print to PDF (Cmd/Ctrl+P). The
   print stylesheet already matches Letter size with the original margins.
2. **Scripted export** (useful for a repeatable, pixel-consistent output):

   ```bash
   npm install
   npm run pdf
   ```

   This launches headless Chromium via Playwright and writes `resume.pdf` in the repo root.

## Why JSON instead of a database or CMS

Keeping the data as plain JSON means:
- It's diffable in git — every resume change is a reviewable commit.
- It's portable — the same file can feed other renderers/themes, or be scripted (e.g.
  generating a tailored version for a specific application by filtering `highlights`).
- No build step is required to edit content.
