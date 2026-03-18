import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatternWorkspace } from "./PatternWorkspace";

// Mock all child components that make API calls
vi.mock("../patterns/components/PatternResultsList", () => ({
  PatternResultsList: () => <div data-testid="pattern-results-list" />,
}));

vi.mock("../patterns/components/PatternDetailPane", () => ({
  PatternDetailPane: () => <div data-testid="pattern-detail-pane" />,
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
