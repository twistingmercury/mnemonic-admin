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

  it("returns an error when description is a whitespace-only string", () => {
    const parsed = makeValid({
      frontmatter: { name: "Valid Name", description: "   " },
    });
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("description");
  });

  it("returns an error when name is provided as an array (not a string)", () => {
    const parsed = makeValid();
    parsed.frontmatter["name"] = ["array-value"];
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("name");
  });

  it("returns errors for both body checks when body is an empty string", () => {
    const parsed = makeValid({ body: "" });
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields.filter((f) => f === "body").length).toBe(2);
  });

  it("returns an error for missing description and passes name check when name is valid", () => {
    const parsed = makeValid();
    delete parsed.frontmatter["description"];
    const result = validatePatternFile(parsed);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("description");
    expect(fields).not.toContain("name");
  });
});
