import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PatternResultsList } from "./PatternResultsList";
import type { PaginatedResponse, PatternListItem } from "../api/types";

vi.mock("../api/client", () => ({
  listPatterns: vi.fn(),
  searchPatterns: vi.fn(),
}));

import { listPatterns, searchPatterns } from "../api/client";

const mockListPatterns = listPatterns as ReturnType<typeof vi.fn>;
const mockSearchPatterns = searchPatterns as ReturnType<typeof vi.fn>;

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

const MOCK_PATTERN: PatternListItem = {
  id: "pattern-1",
  name: "Test Pattern Alpha",
  description: "A test pattern for unit tests",
  tags: ["testing", "unit"],
  language: "typescript",
  domain: "backend",
  entity_type: "component",
  version: "1.0.0",
  enriched: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

function makeResponse(
  items: PatternListItem[],
): PaginatedResponse<PatternListItem> {
  return {
    data: items,
    total: items.length,
    page: 1,
    page_size: 20,
  };
}

describe("PatternResultsList", () => {
  beforeEach(() => {
    mockListPatterns.mockReset();
    mockSearchPatterns.mockReset();
  });

  it("renders a row for each pattern in the response", async () => {
    const second: PatternListItem = {
      ...MOCK_PATTERN,
      id: "pattern-2",
      name: "Second Pattern Beta",
    };
    mockListPatterns.mockResolvedValue(makeResponse([MOCK_PATTERN, second]));

    renderWithQuery(<PatternResultsList />);

    await waitFor(() => {
      expect(screen.getByText("Test Pattern Alpha")).toBeInTheDocument();
    });

    expect(screen.getByText("Second Pattern Beta")).toBeInTheDocument();
  });

  it("shows empty state text when no results are returned", async () => {
    mockListPatterns.mockResolvedValue(makeResponse([]));

    renderWithQuery(<PatternResultsList />);

    await waitFor(() => {
      expect(screen.getByText("No patterns found")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockListPatterns.mockReturnValue(new Promise(() => {}));

    renderWithQuery(<PatternResultsList />);

    expect(screen.getByText("Loading patterns…")).toBeInTheDocument();
  });

  it("shows error state when the query fails", async () => {
    mockListPatterns.mockRejectedValue(new Error("network error"));

    renderWithQuery(<PatternResultsList />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load patterns")).toBeInTheDocument();
    });
  });

  it("calls onSelect with the pattern id when a row is clicked", async () => {
    mockListPatterns.mockResolvedValue(makeResponse([MOCK_PATTERN]));
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(<PatternResultsList onSelect={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByText("Test Pattern Alpha")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /Test Pattern Alpha/ }),
    );

    expect(handleSelect).toHaveBeenCalledOnce();
    expect(handleSelect).toHaveBeenCalledWith("pattern-1");
  });

  it("marks the selected row with aria-pressed=true", async () => {
    mockListPatterns.mockResolvedValue(makeResponse([MOCK_PATTERN]));

    renderWithQuery(<PatternResultsList selectedId="pattern-1" />);

    await waitFor(() => {
      expect(screen.getByText("Test Pattern Alpha")).toBeInTheDocument();
    });

    const row = screen.getByRole("button", { name: /Test Pattern Alpha/ });
    expect(row).toHaveAttribute("aria-pressed", "true");
  });

  it("marks an unselected row with aria-pressed=false", async () => {
    mockListPatterns.mockResolvedValue(makeResponse([MOCK_PATTERN]));

    renderWithQuery(<PatternResultsList selectedId="other-id" />);

    await waitFor(() => {
      expect(screen.getByText("Test Pattern Alpha")).toBeInTheDocument();
    });

    const row = screen.getByRole("button", { name: /Test Pattern Alpha/ });
    expect(row).toHaveAttribute("aria-pressed", "false");
  });

  describe("search mode", () => {
    it("shows searching state while the search query is in flight", () => {
      mockSearchPatterns.mockReturnValue(new Promise(() => {}));

      renderWithQuery(<PatternResultsList query="test query" />);

      expect(screen.getByText("Searching…")).toBeInTheDocument();
    });

    it("shows empty state when the search returns no results", async () => {
      mockSearchPatterns.mockResolvedValue({
        results: [],
        total: 0,
        query: "test query",
      });

      renderWithQuery(<PatternResultsList query="test query" />);

      await waitFor(() => {
        expect(
          screen.getByText("No results for your search"),
        ).toBeInTheDocument();
      });
    });

    it("shows error state when the search fails", async () => {
      mockSearchPatterns.mockRejectedValue(new Error("search error"));

      renderWithQuery(<PatternResultsList query="test query" />);

      await waitFor(() => {
        expect(screen.getByText("Search failed")).toBeInTheDocument();
      });
    });
  });
});
