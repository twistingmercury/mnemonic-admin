import { describe, expect, it } from "vitest";
import { parsePatternFile } from "./patternFileParser";

const VALID_SIMPLE = `---
name: Some Pattern Name
description: A description of the pattern.
language: en
domain: engineering
---

## Overview

Main body content here.
`;

const VALID_BLOCK_SEQUENCE = `---
name: Block Array Pattern
tags:
  - tag1
  - tag2
agents:
  - agent-one
  - agent-two
---

Body text.
`;

const VALID_INLINE_SEQUENCE = `---
name: Inline Array Pattern
tags: [tag1, tag2]
agents: [agent-one, agent-two]
---

Body text.
`;

const VALID_QUOTED_VALUES = `---
name: "Quoted Name"
version: '1.0'
description: "A description with spaces"
---

Body.
`;

const VALID_EMPTY_BODY = `---
name: No Body Pattern
---
`;

describe("parsePatternFile", () => {
  it("returns ok: true with correct frontmatter and body for a valid file", () => {
    const result = parsePatternFile(VALID_SIMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.frontmatter["name"]).toBe("Some Pattern Name");
    expect(result.value.frontmatter["description"]).toBe(
      "A description of the pattern.",
    );
    expect(result.value.frontmatter["language"]).toBe("en");
    expect(result.value.frontmatter["domain"]).toBe("engineering");
    expect(result.value.body).toContain("## Overview");
    expect(result.value.body).toContain("Main body content here.");
  });

  it("extracts block-sequence arrays correctly", () => {
    const result = parsePatternFile(VALID_BLOCK_SEQUENCE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.frontmatter["tags"]).toEqual(["tag1", "tag2"]);
    expect(result.value.frontmatter["agents"]).toEqual([
      "agent-one",
      "agent-two",
    ]);
  });

  it("extracts inline-sequence arrays correctly", () => {
    const result = parsePatternFile(VALID_INLINE_SEQUENCE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.frontmatter["tags"]).toEqual(["tag1", "tag2"]);
    expect(result.value.frontmatter["agents"]).toEqual([
      "agent-one",
      "agent-two",
    ]);
  });

  it("returns ok: false when file does not start with ---", () => {
    const result = parsePatternFile("# Just a heading\n\nNo frontmatter.");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
  });

  it("returns ok: false when there is no closing --- delimiter", () => {
    const result = parsePatternFile("---\nname: Missing Closing\n");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
  });

  it("returns an empty string for body when nothing follows the closing ---", () => {
    const result = parsePatternFile(VALID_EMPTY_BODY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.body).toBe("");
  });

  it("strips quotes from quoted string values in frontmatter", () => {
    const result = parsePatternFile(VALID_QUOTED_VALUES);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.frontmatter["name"]).toBe("Quoted Name");
    expect(result.value.frontmatter["version"]).toBe("1.0");
    expect(result.value.frontmatter["description"]).toBe(
      "A description with spaces",
    );
  });
});
