import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PatternResultsList } from "./PatternResultsList";
import type { PaginatedResponse, PatternListItem } from "../api/types";

vi.mock("../api/client", () => ({
  listPatterns: vi.fn(),
}));

import { listPatterns } from "../api/client";

const mockListPatterns = listPatterns as ReturnType<typeof vi.fn>;

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

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows error state when the query fails", async () => {
    mockListPatterns.mockRejectedValue(new Error("network error"));

    renderWithQuery(<PatternResultsList />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load patterns")).toBeInTheDocument();
    });
  });
});
