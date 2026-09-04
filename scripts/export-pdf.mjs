import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outFile = process.argv[2] || "resume.pdf";

const CONTENT_TYPES = {
  ".html": "text/html",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
};

function startServer(dir) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const urlPath = req.url === "/" ? "/index.html" : req.url;
      const filePath = path.join(dir, decodeURIComponent(urlPath.split("?")[0]));
      try {
        const body = await readFile(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const server = await startServer(rootDir);
  const port = server.address().port;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
    await page.pdf({
      path: path.join(rootDir, outFile),
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.54in", right: "0.54in" },
    });
    console.log(`Wrote ${outFile}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
