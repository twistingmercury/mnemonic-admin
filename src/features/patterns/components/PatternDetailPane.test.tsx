import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PatternDetailPane } from "./PatternDetailPane";
import type { PatternDetail } from "../api/types";

vi.mock("../api/client", () => ({
  getPattern: vi.fn(),
}));

import { getPattern } from "../api/client";

const mockGetPattern = getPattern as ReturnType<typeof vi.fn>;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const MOCK_DETAIL: PatternDetail = {
  id: "pattern-abc",
  name: "Alpha Pattern",
  description: "A detailed pattern",
  tags: ["go", "service"],
  language: "go",
  domain: "backend",
  entity_type: "service",
  version: "1.0.0",
  enriched: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  content: "# Alpha Pattern\n\nThis is the pattern content.",
  agent_associations: [],
  related_patterns: [],
};

describe("PatternDetailPane", () => {
  beforeEach(() => {
    mockGetPattern.mockReset();
  });

  it("renders empty state when patternId is null", () => {
    renderWithQuery(<PatternDetailPane patternId={null} />);
    expect(
      screen.getByText("Select a pattern to view details"),
    ).toBeInTheDocument();
  });

  it("calls getPattern and renders the pattern name on success", async () => {
    mockGetPattern.mockResolvedValue(MOCK_DETAIL);

    renderWithQuery(<PatternDetailPane patternId="pattern-abc" />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alpha Pattern")).toBeInTheDocument();
    });

    expect(mockGetPattern).toHaveBeenCalledWith("pattern-abc");
  });

  it("shows error state when getPattern fails", async () => {
    mockGetPattern.mockRejectedValue(new Error("not found"));

    renderWithQuery(<PatternDetailPane patternId="pattern-missing" />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load pattern")).toBeInTheDocument();
    });
  });
});
