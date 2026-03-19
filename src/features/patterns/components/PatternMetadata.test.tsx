import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PatternMetadata } from "./PatternMetadata";
import type { PatternDetail } from "../api/types";

const MOCK_PATTERN: PatternDetail = {
  id: "pattern-abc",
  name: "Alpha Pattern",
  description: "A detailed pattern",
  tags: ["typescript", "component"],
  language: "go",
  domain: "backend",
  entity_type: "service",
  version: "1.0.0",
  enrichment_status: "complete",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  content: "# Alpha Pattern\n\nThis is the pattern content.",
  agent_associations: [],
  graph: { related_patterns: [], concepts: [] },
};

describe("PatternMetadata", () => {
  it("renders the pattern name", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("Alpha Pattern")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("A detailed pattern")).toBeInTheDocument();
  });

  it("renders the language", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("go")).toBeInTheDocument();
  });

  it("renders the domain", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("backend")).toBeInTheDocument();
  });

  it("renders the entity_type", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("service")).toBeInTheDocument();
  });

  it("renders the version", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });

  it("renders enrichment_status value", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("renders a different enrichment_status value when provided", () => {
    render(
      <PatternMetadata
        pattern={{ ...MOCK_PATTERN, enrichment_status: "pending" }}
      />,
    );
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders all tags inside the tags list", () => {
    const { container } = render(<PatternMetadata pattern={MOCK_PATTERN} />);
    const tagsList = container.querySelector("ul");
    expect(tagsList).not.toBeNull();
    const list = within(tagsList!);
    expect(list.getByText("typescript")).toBeInTheDocument();
    expect(list.getByText("component")).toBeInTheDocument();
  });

  it("renders created_at and updated_at timestamps", () => {
    render(<PatternMetadata pattern={MOCK_PATTERN} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("omits optional fields when not provided", () => {
    const minimal: PatternDetail = {
      ...MOCK_PATTERN,
      language: undefined,
      domain: undefined,
      entity_type: undefined,
      version: undefined,
      tags: [],
    };
    render(<PatternMetadata pattern={minimal} />);
    expect(screen.queryByText("Language")).not.toBeInTheDocument();
    expect(screen.queryByText("Domain")).not.toBeInTheDocument();
    expect(screen.queryByText("Entity type")).not.toBeInTheDocument();
    expect(screen.queryByText("Version")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });
});
