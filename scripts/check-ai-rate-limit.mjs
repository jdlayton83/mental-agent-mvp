import { existsSync, readFileSync } from "node:fs";

const files = readFileSync(0, "utf8")
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);

const violations = [];

for (const file of files) {
  if (!existsSync(file)) {
    continue;
  }

  const content = readFileSync(file, "utf8");
  const calls = findGenerateTextCalls(content);

  for (const call of calls) {
    if (!/\brateLimitKey\s*:/.test(call.source)) {
      violations.push(`${file}:${call.line}`);
    }
  }
}

if (violations.length > 0) {
  console.error(
    [
      "AI text generation calls must include rateLimitKey.",
      "Pass the authenticated user ID when available so the local PoC rate guard stays user-scoped.",
      "",
      ...violations.map((violation) => `- ${violation}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("AI text generation calls include rateLimitKey.");

function findGenerateTextCalls(content) {
  const calls = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const index = content.indexOf("generateText(", searchFrom);

    if (index === -1) {
      break;
    }

    const previousCharacter = content[index - 1] ?? "";
    const previousSource = content.slice(Math.max(0, index - 32), index);

    if (
      /[A-Za-z0-9_$]/.test(previousCharacter) ||
      /\bfunction\s+$/.test(previousSource)
    ) {
      searchFrom = index + "generateText(".length;
      continue;
    }

    const callEnd = findClosingParenthesis(
      content,
      index + "generateText".length,
    );

    if (callEnd === -1) {
      searchFrom = index + "generateText(".length;
      continue;
    }

    calls.push({
      line: countLines(content.slice(0, index)),
      source: content.slice(index, callEnd + 1),
    });

    searchFrom = callEnd + 1;
  }

  return calls;
}

function findClosingParenthesis(content, openingParenthesisIndex) {
  let depth = 0;
  let stringQuote = null;
  let isEscaped = false;
  let lineComment = false;
  let blockComment = false;

  for (
    let index = openingParenthesisIndex;
    index < content.length;
    index += 1
  ) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
      }

      continue;
    }

    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        index += 1;
      }

      continue;
    }

    if (stringQuote) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === "\\") {
        isEscaped = true;
        continue;
      }

      if (character === stringQuote) {
        stringQuote = null;
      }

      continue;
    }

    if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      stringQuote = character;
      continue;
    }

    if (character === "(") {
      depth += 1;
      continue;
    }

    if (character === ")") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function countLines(text) {
  return text.split(/\r?\n/).length;
}
