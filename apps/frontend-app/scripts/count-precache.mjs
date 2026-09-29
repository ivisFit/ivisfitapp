import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const swPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "sw.js",
);
const content = fs.readFileSync(swPath, "utf8");
const urls = [...content.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);

const countMatch = (re) => urls.filter((u) => re.test(u)).length;

console.log("precache entries:", urls.length);
console.log("videos:", urls.filter((u) => /\.(?:mp4|webm)$/i.test(u) || u.includes("/videos/")));
console.log("imgs:", urls.filter((u) => u.includes("/imgs/")).length);
console.log("route (admin):", countMatch(/\(admin\)/));
console.log("route (alumna):", countMatch(/\(alumna\)/));
console.log("route (auth):", countMatch(/\(auth\)/));
console.log("route (landing):", countMatch(/\(landing\)/));
console.log(
  "SW update mode:",
  content.includes('SKIP_WAITING"===e.data.type')
    ? "message SKIP_WAITING"
    : content.includes("self.skipWaiting()")
      ? "immediate skipWaiting"
      : "unknown",
);
