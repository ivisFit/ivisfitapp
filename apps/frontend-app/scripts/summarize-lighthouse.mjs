import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node summarize-lighthouse.mjs <directory>");
  process.exit(1);
}

const score = (c, id) =>
  c[id]?.score != null ? Math.round(c[id].score * 100) : "—";

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const json = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const c = json.categories ?? {};
  const a = json.audits ?? {};
  const metric = (id) => a[id]?.displayValue ?? String(a[id]?.numericValue ?? "—");

  console.log(`\n${file.replace(".json", "")}`);
  console.log(
    `  Scores: perf=${score(c, "performance")} pwa=${score(c, "pwa")} bp=${score(c, "best-practices")} a11y=${score(c, "accessibility")}`,
  );
  console.log(
    `  FCP=${metric("first-contentful-paint")} LCP=${metric("largest-contentful-paint")} TTI=${metric("interactive")} TBT=${metric("total-blocking-time")} CLS=${metric("cumulative-layout-shift")}`,
  );
}
