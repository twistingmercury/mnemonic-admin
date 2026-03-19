import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { PatternSearchForm } from "./PatternSearchForm";

vi.mock("../api/client", () => ({
  listPatterns: vi.fn(),
  searchPatterns: vi.fn(),
}));

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

describe("PatternSearchForm", () => {
  it("renders the search input", () => {
    renderWithQuery(<PatternSearchForm onSearch={vi.fn()} activeQuery="" />);

    expect(
      screen.getByRole("textbox", { name: /search patterns/i }),
    ).toBeInTheDocument();
  });

  it("calls onSearch with the entered query when the form is submitted", async () => {
    const handleSearch = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(
      <PatternSearchForm onSearch={handleSearch} activeQuery="" />,
    );

    const input = screen.getByRole("textbox", { name: /search patterns/i });
    await user.type(input, "error handling");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledOnce();
    expect(handleSearch).toHaveBeenCalledWith("error handling");
  });

  it("calls onSearch when Enter is pressed in the input", async () => {
    const handleSearch = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(
      <PatternSearchForm onSearch={handleSearch} activeQuery="" />,
    );

    const input = screen.getByRole("textbox", { name: /search patterns/i });
    await user.type(input, "repository pattern{Enter}");

    expect(handleSearch).toHaveBeenCalledOnce();
    expect(handleSearch).toHaveBeenCalledWith("repository pattern");
  });

  it("displays the active query when one is provided", () => {
    renderWithQuery(
      <PatternSearchForm onSearch={vi.fn()} activeQuery="singleton" />,
    );

    expect(screen.getByLabelText(/active query/i)).toBeInTheDocument();
    expect(screen.getByText("singleton")).toBeInTheDocument();
  });

  it("does not display the active query region when activeQuery is empty", () => {
    renderWithQuery(<PatternSearchForm onSearch={vi.fn()} activeQuery="" />);

    expect(screen.queryByLabelText(/active query/i)).not.toBeInTheDocument();
  });

  it("trims whitespace before calling onSearch", async () => {
    const handleSearch = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(
      <PatternSearchForm onSearch={handleSearch} activeQuery="" />,
    );

    const input = screen.getByRole("textbox", { name: /search patterns/i });
    await user.type(input, "  factory  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledWith("factory");
  });

  it("calls onSearch with an empty string when submitting a whitespace-only query", async () => {
    const handleSearch = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(
      <PatternSearchForm onSearch={handleSearch} activeQuery="" />,
    );

    const input = screen.getByRole("textbox", { name: /search patterns/i });
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledOnce();
    expect(handleSearch).toHaveBeenCalledWith("");
  });
});
