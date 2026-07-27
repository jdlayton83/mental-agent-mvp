import { existsSync, readFileSync } from "node:fs";

const secretPatterns = [
  {
    name: "OpenAI API key",
    pattern: /\bsk-(?:proj|svcacct|admin)?-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    name: "Anthropic API key",
    pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    name: "GitHub token",
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g,
  },
  {
    name: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    name: "Private key block",
    pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
];

const trackedFiles = readFileSync(0, "utf8").split(/\r?\n/).filter(Boolean);

const findings = [];

for (const filePath of trackedFiles) {
  if (!existsSync(filePath)) {
    continue;
  }

  const fileBuffer = readFileSync(filePath);

  if (fileBuffer.includes(0)) {
    continue;
  }

  const content = fileBuffer.toString("utf8");

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;

    for (const match of content.matchAll(pattern)) {
      findings.push({
        filePath,
        lineNumber: getLineNumber(content, match.index ?? 0),
        name,
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Secret-like values were found in tracked files:");

  for (const finding of findings) {
    console.error(
      `- ${finding.filePath}:${finding.lineNumber} (${finding.name})`,
    );
  }

  process.exitCode = 1;
} else {
  console.log("No secret-like values found in tracked files.");
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r\n|\r|\n/).length;
}
