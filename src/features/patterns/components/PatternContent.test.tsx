import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PatternContent } from "./PatternContent";
import type { PatternDetail } from "../api/types";

const MOCK_PATTERN: PatternDetail = {
  id: "pattern-abc",
  name: "Alpha Pattern",
  description: "A detailed pattern",
  tags: ["go", "service"],
  language: "go",
  domain: "backend",
  entity_type: "service",
  version: "1.0.0",
  enrichment_status: "complete",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  content: "# Alpha Pattern\n\nThis is the pattern content.",
  graph: { related_patterns: [], concepts: [] },
};

describe("PatternContent", () => {
  it("renders the full pattern content", () => {
    render(<PatternContent pattern={MOCK_PATTERN} />);
    expect(screen.getByText(/# Alpha Pattern/)).toBeInTheDocument();
  });

  it("renders the content inside a section element", () => {
    const { container } = render(<PatternContent pattern={MOCK_PATTERN} />);
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("renders content with accessible label", () => {
    render(<PatternContent pattern={MOCK_PATTERN} />);
    expect(
      screen.getByRole("region", { name: "Pattern content" }),
    ).toBeInTheDocument();
  });

  it("renders multiline content preserving whitespace", () => {
    const multiline = "line one\nline two\nline three";
    render(
      <PatternContent pattern={{ ...MOCK_PATTERN, content: multiline }} />,
    );
    expect(screen.getByText(/line one/)).toBeInTheDocument();
    expect(screen.getByText(/line three/)).toBeInTheDocument();
  });

  it("renders without throwing when content is an empty string", () => {
    const { container } = render(
      <PatternContent pattern={{ ...MOCK_PATTERN, content: "" }} />,
    );
    expect(container.querySelector("section")).not.toBeNull();
  });
});
