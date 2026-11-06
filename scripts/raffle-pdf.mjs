/**
 * Builds the raffle plan PDF: 03_raffle/TRF_Dinner_Raffle_Plan.md -> .html -> .pdf
 *
 * Run from the portal directory:  node scripts/raffle-pdf.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

const projectRoot = join(process.cwd(), "..");
const outDir = join(projectRoot, "03_raffle");
const mdPath = join(outDir, "TRF_Dinner_Raffle_Plan.md");
const htmlPath = join(outDir, "TRF_Dinner_Raffle_Plan.html");
const pdfPath = join(outDir, "TRF_Dinner_Raffle_Plan.pdf");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const chrome = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chrome) throw new Error("Chrome not found — needed for PDF printing");

const markdown = readFileSync(mdPath, "utf8");
const body = marked.parse(markdown);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>TRF Dinner Raffle — Plan</title>
<style>
  :root {
    --ink: #0b1b3a;
    --muted: #45577c;
    --brand: #17458f;
    --accent: #be8218;
    --line: #d5dced;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    color: var(--ink);
    font-size: 10.5pt;
    line-height: 1.5;
  }
  .sheet { max-width: 760px; margin: 0 auto; padding: 8mm 4mm; }
  h1 {
    font-size: 24pt;
    line-height: 1.15;
    margin: 0 0 4pt;
    color: var(--brand);
    letter-spacing: -0.01em;
  }
  h1 + p { color: var(--muted); margin-top: 0; }
  h2 {
    font-size: 14pt;
    margin: 20pt 0 6pt;
    padding-bottom: 3pt;
    border-bottom: 1.5pt solid var(--line);
    color: var(--brand);
    page-break-after: avoid;
  }
  h3 { font-size: 11.5pt; margin: 14pt 0 4pt; page-break-after: avoid; }
  p, ul, ol, table { page-break-inside: avoid; }
  ul, ol { padding-left: 16pt; }
  li { margin: 2pt 0; }
  a { color: var(--brand); text-decoration: none; }
  strong { color: var(--ink); }
  hr { border: 0; border-top: 1pt solid var(--line); margin: 16pt 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt;
    font-size: 9.5pt;
  }
  th {
    text-align: left;
    background: #eef2fa;
    color: var(--brand);
    font-weight: 600;
    padding: 6pt 8pt;
    border: 1pt solid var(--line);
  }
  td { padding: 6pt 8pt; border: 1pt solid var(--line); vertical-align: top; }
  tr:nth-child(even) td { background: #fafbfe; }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 9pt;
    background: #f1f4fa;
    padding: 1pt 3pt;
    border-radius: 2pt;
  }
  blockquote {
    margin: 10pt 0;
    padding: 6pt 10pt;
    border-left: 3pt solid var(--accent);
    background: #fdf7ea;
    color: var(--muted);
  }
  @page { size: A4; margin: 16mm 15mm; }
  @media print { .sheet { padding: 0; max-width: none; } }
</style>
</head>
<body>
  <div class="sheet">
${body}
  </div>
</body>
</html>
`;

writeFileSync(htmlPath, html, "utf8");
console.log(`wrote ${htmlPath}`);

execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    `file:///${htmlPath.replace(/\\/g, "/")}`,
  ],
  { stdio: "inherit" },
);

console.log(`wrote ${pdfPath}`);
