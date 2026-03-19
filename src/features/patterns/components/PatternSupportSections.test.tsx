import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PatternSupportSections } from "./PatternSupportSections";
import type { AgentAssociation, ChunkSummary } from "../api/types";

const MOCK_CHUNKS: ChunkSummary[] = [
  { id: "chunk-1", index: 0, summary: "Introduction to the pattern." },
  { id: "chunk-2", index: 1, summary: "Implementation details." },
];

const MOCK_AGENTS: AgentAssociation[] = [
  { agent_name: "Code Reviewer", relevance: 0.92 },
  { agent_name: "Agent XYZ", relevance: 0.75 },
];

describe("PatternSupportSections", () => {
  describe("chunk summaries", () => {
    it("renders each chunk's summary text", () => {
      render(
        <PatternSupportSections chunks={MOCK_CHUNKS} agentAssociations={[]} />,
      );
      expect(
        screen.getByText(/Introduction to the pattern\./),
      ).toBeInTheDocument();
      expect(screen.getByText(/Implementation details\./)).toBeInTheDocument();
    });

    it("renders each chunk's index", () => {
      render(
        <PatternSupportSections chunks={MOCK_CHUNKS} agentAssociations={[]} />,
      );
      expect(screen.getByText(/Chunk 0:/)).toBeInTheDocument();
      expect(screen.getByText(/Chunk 1:/)).toBeInTheDocument();
    });

    it("shows an empty state message when chunks array is empty", () => {
      render(<PatternSupportSections chunks={[]} agentAssociations={[]} />);
      expect(
        screen.getByText("No chunk summaries available."),
      ).toBeInTheDocument();
    });
  });

  describe("agent associations", () => {
    it("renders agent_name when provided", () => {
      render(
        <PatternSupportSections chunks={[]} agentAssociations={MOCK_AGENTS} />,
      );
      expect(screen.getByText(/Code Reviewer/)).toBeInTheDocument();
    });

    it("renders Agent XYZ when present", () => {
      render(
        <PatternSupportSections chunks={[]} agentAssociations={MOCK_AGENTS} />,
      );
      expect(screen.getByText(/Agent XYZ/)).toBeInTheDocument();
    });

    it("renders relevance for each association", () => {
      render(
        <PatternSupportSections chunks={[]} agentAssociations={MOCK_AGENTS} />,
      );
      expect(screen.getByText(/relevance: 0\.92/)).toBeInTheDocument();
      expect(screen.getByText(/relevance: 0\.75/)).toBeInTheDocument();
    });

    it("shows an empty state message when agentAssociations array is empty", () => {
      render(<PatternSupportSections chunks={[]} agentAssociations={[]} />);
      expect(
        screen.getByText("No agent associations available."),
      ).toBeInTheDocument();
    });
  });
});
