import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
