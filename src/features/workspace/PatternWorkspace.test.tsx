import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatternWorkspace } from "./PatternWorkspace";

// Mock all child components that make API calls
vi.mock("../patterns/components/PatternResultsList", () => ({
  PatternResultsList: ({
    query,
    selectedId,
    onSelect,
  }: {
    query?: string;
    selectedId?: string | null;
    onSelect?: (id: string) => void;
  }) => (
    <div
      data-testid="pattern-results-list"
      data-query={query ?? ""}
      data-selected-id={selectedId ?? ""}
    >
      <button onClick={() => onSelect?.("pattern-1")}>Select pattern-1</button>
    </div>
  ),
}));

vi.mock("../patterns/components/PatternDetailPane", () => ({
  PatternDetailPane: ({
    patternId,
    onSelectRelated,
  }: {
    patternId: string | null;
    onSelectRelated?: (id: string) => void;
  }) => (
    <div data-testid="pattern-detail-pane" data-pattern-id={patternId ?? ""}>
      <button onClick={() => onSelectRelated?.("related-1")}>
        Pivot to related-1
      </button>
    </div>
  ),
}));

vi.mock("../patterns/components/PatternFilters", () => ({
  PatternFilters: () => <div data-testid="pattern-filters" />,
  EMPTY_FILTERS: {},
}));

vi.mock("../import/ImportPatternOverlay", () => ({
  ImportPatternOverlay: ({
    onClose,
    onImportSuccess,
  }: {
    onClose: () => void;
    onImportSuccess?: (id: string) => void;
  }) => (
    <div data-testid="import-overlay">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onImportSuccess?.("new-id")}>
        Trigger Success
      </button>
    </div>
  ),
}));

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWorkspace(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <PatternWorkspace />
    </QueryClientProvider>,
  );
}

describe("PatternWorkspace — import success integration", () => {
  let queryClient: QueryClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let invalidateSpy: ReturnType<typeof vi.spyOn<any, any>>;

  beforeEach(() => {
    queryClient = makeQueryClient();
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  });

  function openImport() {
    fireEvent.click(screen.getByRole("button", { name: /import/i }));
  }

  it("successful import invalidates patterns query", async () => {
    renderWorkspace(queryClient);
    openImport();

    fireEvent.click(screen.getByRole("button", { name: /trigger success/i }));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["patterns"] });
  });

  it("successful import closes overlay", () => {
    renderWorkspace(queryClient);
    openImport();

    expect(screen.getByTestId("import-overlay")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /trigger success/i }));

    expect(screen.queryByTestId("import-overlay")).not.toBeInTheDocument();
  });

  it("successful import preserves activeQuery", () => {
    renderWorkspace(queryClient);

    // Set an active query via the search form
    const searchInput = screen.getByRole("textbox", {
      name: /search patterns/i,
    });
    fireEvent.change(searchInput, { target: { value: "my search term" } });
    fireEvent.submit(searchInput.closest("form")!);

    // Open import and trigger success
    openImport();
    fireEvent.click(screen.getByRole("button", { name: /trigger success/i }));

    // The active query indicator should still show the original query
    expect(screen.getByLabelText("Active query")).toHaveTextContent(
      "my search term",
    );
  });
});

describe("PatternWorkspace — browse and search flows", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
  });

  it("renders results list in browse mode on initial load", () => {
    renderWorkspace(queryClient);

    const list = screen.getByTestId("pattern-results-list");
    expect(list).toBeInTheDocument();
    // On initial load the query prop is empty string (no active search)
    expect(list).toHaveAttribute("data-query", "");
  });

  it("passes submitted query to results list after search submission", () => {
    renderWorkspace(queryClient);

    const searchInput = screen.getByRole("textbox", {
      name: /search patterns/i,
    });
    fireEvent.change(searchInput, { target: { value: "authentication" } });
    fireEvent.submit(searchInput.closest("form")!);

    expect(screen.getByTestId("pattern-results-list")).toHaveAttribute(
      "data-query",
      "authentication",
    );
  });

  it("passes selected ID to detail pane when a result row is selected", () => {
    renderWorkspace(queryClient);

    fireEvent.click(screen.getByRole("button", { name: /select pattern-1/i }));

    expect(screen.getByTestId("pattern-detail-pane")).toHaveAttribute(
      "data-pattern-id",
      "pattern-1",
    );
  });

  it("pivots to related pattern without disturbing search state", () => {
    renderWorkspace(queryClient);

    // Set an active search query
    const searchInput = screen.getByRole("textbox", {
      name: /search patterns/i,
    });
    fireEvent.change(searchInput, { target: { value: "jwt" } });
    fireEvent.submit(searchInput.closest("form")!);

    // Select a result to set a selectedId
    fireEvent.click(screen.getByRole("button", { name: /select pattern-1/i }));

    // Pivot to a related pattern
    fireEvent.click(
      screen.getByRole("button", { name: /pivot to related-1/i }),
    );

    // Detail pane now shows the related pattern
    expect(screen.getByTestId("pattern-detail-pane")).toHaveAttribute(
      "data-pattern-id",
      "related-1",
    );

    // Search query is still active in the UI
    expect(screen.getByLabelText("Active query")).toHaveTextContent("jwt");
  });
});
