import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PatternSupportSections } from "./PatternSupportSections";
import type { ChunkSummary } from "../api/types";

const MOCK_CHUNKS: ChunkSummary[] = [
  { id: "chunk-1", index: 0, summary: "Introduction to the pattern." },
  { id: "chunk-2", index: 1, summary: "Implementation details." },
];

describe("PatternSupportSections", () => {
  describe("chunk summaries", () => {
    it("renders each chunk's summary text", () => {
      render(<PatternSupportSections chunks={MOCK_CHUNKS} />);
      expect(
        screen.getByText(/Introduction to the pattern\./),
      ).toBeInTheDocument();
      expect(screen.getByText(/Implementation details\./)).toBeInTheDocument();
    });

    it("renders each chunk's index", () => {
      render(<PatternSupportSections chunks={MOCK_CHUNKS} />);
      expect(screen.getByText(/Chunk 0:/)).toBeInTheDocument();
      expect(screen.getByText(/Chunk 1:/)).toBeInTheDocument();
    });

    it("shows an empty state message when chunks array is empty", () => {
      render(<PatternSupportSections chunks={[]} />);
      expect(
        screen.getByText("No chunk summaries available."),
      ).toBeInTheDocument();
    });
  });
});
