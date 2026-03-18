import type { ParsedPatternFile } from "./patternFileParser";

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

export function validatePatternFile(
  parsed: ParsedPatternFile,
): ValidationResult {
  const errors: ValidationError[] = [];

  const name = parsed.frontmatter["name"];
  if (typeof name !== "string" || name.trim() === "") {
    errors.push({
      field: "name",
      message:
        "frontmatter field 'name' is required and must be a non-empty string",
    });
  }

  const description = parsed.frontmatter["description"];
  if (typeof description !== "string" || description.trim() === "") {
    errors.push({
      field: "description",
      message:
        "frontmatter field 'description' is required and must be a non-empty string",
    });
  }

  if (!parsed.body.includes("## Overview")) {
    errors.push({
      field: "body",
      message: "body must contain a '## Overview' heading",
    });
  }

  if (!parsed.body.includes("[//]: pattern")) {
    errors.push({
      field: "body",
      message: "body must contain at least one '[//]: pattern' decorator",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
