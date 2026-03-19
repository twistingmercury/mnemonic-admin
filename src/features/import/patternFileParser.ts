export type FrontmatterData = Record<string, string | string[]>;

export type ParsedPatternFile = {
  frontmatter: FrontmatterData;
  body: string;
};

export type ParseError = {
  message: string;
};

export type ParseResult =
  | { ok: true; value: ParsedPatternFile }
  | { ok: false; error: ParseError };

function unquoteString(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineSequence(value: string): string[] {
  // value is like: [item1, item2] — already stripped of outer brackets by caller
  return value
    .split(",")
    .map((item) => unquoteString(item))
    .filter((item) => item.length > 0);
}

function parseFrontmatter(raw: string): FrontmatterData {
  const result: FrontmatterData = {};
  const lines = raw.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      i++;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    // Block sequence: value is empty, next lines start with "  -"
    if (rest === "") {
      const items: string[] = [];
      i++;
      while (i < lines.length && /^\s+-\s/.test(lines[i])) {
        const item = lines[i].replace(/^\s+-\s+/, "").trim();
        items.push(unquoteString(item));
        i++;
      }
      if (items.length > 0) {
        result[key] = items;
      }
      continue;
    }

    // Inline sequence: value starts with "["
    if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1);
      result[key] = parseInlineSequence(inner);
      i++;
      continue;
    }

    // Simple scalar value
    result[key] = unquoteString(rest);
    i++;
  }

  return result;
}

export function parsePatternFile(content: string): ParseResult {
  if (!content.startsWith("---")) {
    return {
      ok: false,
      error: { message: "File must start with a YAML frontmatter block (---)" },
    };
  }

  // Find the closing ---. Search from position 3 to skip the opening delimiter.
  const closingIdx = content.indexOf("---", 3);
  if (closingIdx === -1) {
    return {
      ok: false,
      error: { message: "No closing frontmatter delimiter (---) found" },
    };
  }

  const rawFrontmatter = content.slice(3, closingIdx);
  const frontmatter = parseFrontmatter(rawFrontmatter);

  // Body is everything after the closing ---\n
  const afterClosing = content.slice(closingIdx + 3);
  const body = afterClosing.replace(/^\n/, "").trimStart();

  return { ok: true, value: { frontmatter, body } };
}
