import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImportPatternOverlay } from "./ImportPatternOverlay";

describe("ImportPatternOverlay", () => {
  it('renders the "Import Pattern" heading', () => {
    render(<ImportPatternOverlay onClose={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: "Import Pattern" }),
    ).toBeDefined();
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<ImportPatternOverlay onClose={handleClose} />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("renders a file input that accepts .md files", () => {
    render(<ImportPatternOverlay onClose={vi.fn()} />);
    const input = screen.getByLabelText("Select Markdown file");
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).accept).toBe(".md");
    expect((input as HTMLInputElement).type).toBe("file");
  });

  it("renders the validation feedback placeholder region", () => {
    render(<ImportPatternOverlay onClose={vi.fn()} />);
    expect(
      screen.getByRole("region", { name: "Validation feedback" }),
    ).toBeDefined();
  });

  it("renders the import outcome placeholder region", () => {
    render(<ImportPatternOverlay onClose={vi.fn()} />);
    expect(
      screen.getByRole("region", { name: "Import outcome" }),
    ).toBeDefined();
  });
});
