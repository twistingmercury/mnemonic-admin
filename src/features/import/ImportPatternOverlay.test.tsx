import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ImportPatternOverlay } from "./ImportPatternOverlay";
import * as client from "../patterns/api/client";

vi.mock("../patterns/api/client", () => ({ createPattern: vi.fn() }));
vi.mock("./patternFileParser", () => ({
  parsePatternFile: vi.fn(() => ({
    ok: true,
    value: { frontmatter: {}, body: "body" },
  })),
}));
vi.mock("./patternFileValidation", () => ({
  validatePatternFile: vi.fn(() => ({ valid: true, errors: [] })),
}));
vi.mock("./patternPayloadBuilder", () => ({
  buildPatternPayload: vi.fn(() => ({
    name: "Test Pattern",
    description: "A test",
    content: "body",
  })),
}));

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

  describe("submit outcomes", () => {
    beforeEach(() => {
      class SyncFileReader {
        onload: ((e: { target: { result: string } }) => void) | null = null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readAsText(_file: File) {
          this.onload?.({ target: { result: "# mock content" } });
        }
      }
      vi.stubGlobal("FileReader", SyncFileReader);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    async function uploadAndSubmit(user: ReturnType<typeof userEvent.setup>) {
      const file = new File(["# content"], "test.md", {
        type: "text/markdown",
      });
      const input = screen.getByLabelText("Select Markdown file");
      await user.upload(input, file);
      await waitFor(() => screen.getByRole("button", { name: /submit/i }));
      await user.click(screen.getByRole("button", { name: /submit/i }));
    }

    it("shows success outcome after a successful import", async () => {
      const mockPattern = {
        id: "pat-123",
        name: "Test Pattern",
        description: "A test",
        content: "body",
        tags: [],
        version: "1",
        enriched: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        agent_associations: [],
        related_patterns: [],
      };
      vi.mocked(client.createPattern).mockResolvedValueOnce(mockPattern);

      const user = userEvent.setup();
      render(<ImportPatternOverlay onClose={vi.fn()} />);

      await uploadAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByText(/Import successful/)).toBeDefined();
      });
    });

    it("shows conflict outcome for a 409 API response", async () => {
      vi.mocked(client.createPattern).mockRejectedValueOnce({
        status: 409,
        message: "Conflict",
      });

      const user = userEvent.setup();
      render(<ImportPatternOverlay onClose={vi.fn()} />);

      await uploadAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByText(/already exists/)).toBeDefined();
      });
    });

    it("shows failure outcome for a non-conflict API error", async () => {
      vi.mocked(client.createPattern).mockRejectedValueOnce({
        status: 500,
        message: "Internal server error",
      });

      const user = userEvent.setup();
      render(<ImportPatternOverlay onClose={vi.fn()} />);

      await uploadAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByText(/Import failed/)).toBeDefined();
      });
    });
  });
});
