import { describe, expect, it } from "vitest";
import { validatePatternFile } from "./patternFileValidation";
import type { ParsedPatternFile } from "./patternFileParser";

function makeValid(
  overrides: Partial<ParsedPatternFile> = {},
): ParsedPatternFile {
  return {
    frontmatter: {
      name: "My Pattern",
      description: "A valid description",
      ...overrides.frontmatter,
    },
    body:
      overrides.body ?? "## Overview\n\nSome content here.\n\n[//]: pattern\n",
  };
}

describe("validatePatternFile", () => {
  it("returns valid: true for a fully valid file", () => {
    const result = validatePatternFile(makeValid());
    expect(result.valid).toBe(true);
  });

  it("returns an error for missing name", () => {
    const parsed = makeValid();
    delete parsed.frontmatter["name"];
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("name");
  });

  it("returns an error for missing description", () => {
    const parsed = makeValid();
    delete parsed.frontmatter["description"];
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("description");
  });

  it("returns an error when name is an empty string", () => {
    const parsed = makeValid({
      frontmatter: { name: "", description: "A description" },
    });
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("name");
  });

  it("returns an error when ## Overview is absent", () => {
    const parsed = makeValid({ body: "No heading here.\n\n[//]: pattern\n" });
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("body");
  });

  it("returns an error when no [//]: pattern decorator is present", () => {
    const parsed = makeValid({ body: "## Overview\n\nNo decorator here.\n" });
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("body");
  });

  it("collects all errors without short-circuiting", () => {
    const parsed = makeValid();
    delete parsed.frontmatter["name"];
    parsed.body = "No heading and no decorator.";
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("name");
    expect(fields.filter((f) => f === "body").length).toBeGreaterThanOrEqual(2);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
