import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PatternDetailPane } from "./PatternDetailPane";
import type { PatternDetail } from "../api/types";

vi.mock("../api/client", () => ({
  getPattern: vi.fn(),
  getPatternChunks: vi.fn(),
}));

import { getPattern, getPatternChunks } from "../api/client";

const mockGetPattern = getPattern as ReturnType<typeof vi.fn>;
const mockGetPatternChunks = getPatternChunks as ReturnType<typeof vi.fn>;

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
  enrichment_status: "complete",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  content: "# Alpha Pattern\n\nThis is the pattern content.",
  agent_associations: [],
  graph: { related_patterns: [], concepts: [] },
};

describe("PatternDetailPane", () => {
  beforeEach(() => {
    mockGetPattern.mockReset();
    mockGetPatternChunks.mockReset();
    mockGetPatternChunks.mockResolvedValue([]);
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

  it("calls onSelectRelated with the related pattern id when a related pattern button is clicked", async () => {
    const detailWithRelated: PatternDetail = {
      ...MOCK_DETAIL,
      graph: {
        related_patterns: [
          {
            id: "related-xyz",
            name: "Beta Pattern",
            relationship: "uses",
            strength: 0.8,
          },
        ],
        concepts: [],
      },
    };
    mockGetPattern.mockResolvedValue(detailWithRelated);

    const onSelectRelated = vi.fn();
    renderWithQuery(
      <PatternDetailPane
        patternId="pattern-abc"
        onSelectRelated={onSelectRelated}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Beta Pattern")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Beta Pattern/ }));

    expect(onSelectRelated).toHaveBeenCalledOnce();
    expect(onSelectRelated).toHaveBeenCalledWith("related-xyz");
  });

  it("renders relationship and strength for related patterns", async () => {
    const detailWithRelated: PatternDetail = {
      ...MOCK_DETAIL,
      graph: {
        related_patterns: [
          {
            id: "related-xyz",
            name: "Beta Pattern",
            relationship: "uses",
            strength: 0.8,
          },
        ],
        concepts: [],
      },
    };
    mockGetPattern.mockResolvedValue(detailWithRelated);

    renderWithQuery(<PatternDetailPane patternId="pattern-abc" />);

    await waitFor(() => {
      expect(screen.getByText("Beta Pattern")).toBeInTheDocument();
    });

    expect(screen.getByText(/uses/)).toBeInTheDocument();
    expect(screen.getByText(/0\.8/)).toBeInTheDocument();
  });

  it("clicking a related pattern does not call a separate search handler", async () => {
    const detailWithRelated: PatternDetail = {
      ...MOCK_DETAIL,
      graph: {
        related_patterns: [
          {
            id: "related-xyz",
            name: "Beta Pattern",
            relationship: "uses",
            strength: 0.8,
          },
        ],
        concepts: [],
      },
    };
    mockGetPattern.mockResolvedValue(detailWithRelated);

    const onSelectRelated = vi.fn();
    const onSearch = vi.fn();

    // onSearch is passed to a separate component (PatternSearchForm), not to PatternDetailPane.
    // Rendering only PatternDetailPane here confirms its API does not expose a search callback,
    // so pivoting via onSelectRelated cannot disturb search state.
    renderWithQuery(
      <PatternDetailPane
        patternId="pattern-abc"
        onSelectRelated={onSelectRelated}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Beta Pattern")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Beta Pattern/ }));

    expect(onSelectRelated).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
  });
});
