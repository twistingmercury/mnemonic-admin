import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { vi, describe, it, expect } from "vitest";
import { PatternFilters, EMPTY_FILTERS } from "./PatternFilters";
import type { FilterState } from "./PatternFilters";

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

/** Stateful wrapper so controlled inputs accumulate typed characters correctly. */
function ControlledFilters({
  initialFilters = EMPTY_FILTERS,
  onChange,
}: {
  initialFilters?: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  function handleChange(updated: FilterState) {
    setFilters(updated);
    onChange(updated);
  }

  return <PatternFilters filters={filters} onFiltersChange={handleChange} />;
}

describe("PatternFilters", () => {
  it("renders all four filter inputs", () => {
    renderWithQuery(
      <PatternFilters filters={EMPTY_FILTERS} onFiltersChange={vi.fn()} />,
    );

    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/domain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/agent/i)).toBeInTheDocument();
  });

  it("calls onFiltersChange with updated tags when the tags input changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(<ControlledFilters onChange={handleChange} />);

    await user.type(screen.getByLabelText(/tags/i), "testing");

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: "testing" }),
    );
  });

  it("calls onFiltersChange with updated language when the language input changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(<ControlledFilters onChange={handleChange} />);

    await user.type(screen.getByLabelText(/language/i), "go");

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ language: "go" }),
    );
  });

  it("calls onFiltersChange with updated domain when the domain input changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(<ControlledFilters onChange={handleChange} />);

    await user.type(screen.getByLabelText(/domain/i), "backend");

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ domain: "backend" }),
    );
  });

  it("calls onFiltersChange with updated agent when the agent input changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithQuery(<ControlledFilters onChange={handleChange} />);

    await user.type(screen.getByLabelText(/agent/i), "agent-x");

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ agent: "agent-x" }),
    );
  });

  it("shows active filter values in the rendered output when filters are non-empty", () => {
    const activeFilters: FilterState = {
      tags: "react",
      language: "typescript",
      domain: "frontend",
      agent: "",
    };

    renderWithQuery(
      <PatternFilters filters={activeFilters} onFiltersChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("active filters")).toBeInTheDocument();
    expect(screen.getByText(/react/)).toBeInTheDocument();
    expect(screen.getByText(/typescript/)).toBeInTheDocument();
    expect(screen.getByText(/frontend/)).toBeInTheDocument();
  });

  it("does not show the active filters region when all filters are empty", () => {
    renderWithQuery(
      <PatternFilters filters={EMPTY_FILTERS} onFiltersChange={vi.fn()} />,
    );

    expect(screen.queryByLabelText("active filters")).not.toBeInTheDocument();
  });
});
