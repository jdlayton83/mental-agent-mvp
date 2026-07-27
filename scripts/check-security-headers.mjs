import { readFileSync } from "node:fs";

const requiredHeaders = [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
];

const content = readFileSync("next.config.ts", "utf8");
const missingHeaders = requiredHeaders.filter(
  (header) => !content.includes(`key: "${header}"`),
);

if (missingHeaders.length > 0) {
  console.error(
    [
      "next.config.ts is missing required local PoC security headers:",
      ...missingHeaders.map((header) => `- ${header}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("Required local PoC security headers are configured.");
