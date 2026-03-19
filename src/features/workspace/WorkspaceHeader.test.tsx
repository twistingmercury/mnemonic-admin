import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceHeader } from "./WorkspaceHeader";

describe("WorkspaceHeader", () => {
  it('renders the "Mnemonic Admin" heading', () => {
    render(<WorkspaceHeader onImportClick={() => {}} />);
    expect(
      screen.getByRole("heading", { name: "Mnemonic Admin" }),
    ).toBeDefined();
  });

  it('has an "Import Pattern" button', () => {
    render(<WorkspaceHeader onImportClick={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Import Pattern" }),
    ).toBeDefined();
  });

  it("calls onImportClick when the Import Pattern button is clicked", async () => {
    const handleImportClick = vi.fn();
    const user = userEvent.setup();

    render(<WorkspaceHeader onImportClick={handleImportClick} />);

    await user.click(screen.getByRole("button", { name: "Import Pattern" }));

    expect(handleImportClick).toHaveBeenCalledOnce();
  });
});
