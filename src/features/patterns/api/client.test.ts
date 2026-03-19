import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPattern,
  getPattern,
  getPatternChunks,
  listPatterns,
  searchPatterns,
  toApiError,
} from "./client";
import type {
  ApiError,
  ChunkSummary,
  PaginatedResponse,
  PatternDetail,
  PatternListItem,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(
  status: number,
  body: unknown,
  contentType = "application/json",
): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": contentType },
    }),
  );
}

function mockFetchText(
  status: number,
  text: string,
  contentType = "text/plain",
): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(text, {
      status,
      headers: { "Content-Type": contentType },
    }),
  );
}

const PATTERN_ITEM: PatternListItem = {
  id: "abc-123",
  name: "Test Pattern",
  description: "A test pattern",
  tags: ["go", "test"],
  enrichment_status: "complete",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

const PATTERN_DETAIL: PatternDetail = {
  ...PATTERN_ITEM,
  content: "Pattern content here",
  agent_associations: [{ agent_name: "Agent One", relevance: 0.9 }],
  graph: {
    related_patterns: [
      { id: "rel-1", name: "Related", relationship: "uses", strength: 0.75 },
    ],
    concepts: [],
  },
};

const PAGINATED: PaginatedResponse<PatternListItem> = {
  data: [PATTERN_ITEM],
  limit: 20,
  cursor: "",
  has_more: false,
  next_cursor: "",
};

const SEARCH_RESPONSE = {
  metadata: {
    query: "test query",
    search_duration_ms: 10,
    total_candidates: 1,
  },
  results: [
    {
      pattern_id: "abc-123",
      pattern_name: "Test Pattern",
      section_title: "Introduction",
      similarity: 0.9,
      content: "Pattern content here",
      chunk_index: 0,
      language: "go",
      domain: "backend",
      entity_type: "service",
      tags: ["go", "test"],
    },
  ],
};

const CHUNKS_API_RESPONSE = {
  chunks: [{ chunk_index: 0, section_title: "First chunk" }],
};

const CHUNKS: ChunkSummary[] = [{ id: "0", index: 0, summary: "First chunk" }];

// ─── toApiError ───────────────────────────────────────────────────────────────

describe("toApiError", () => {
  it("maps a problem-detail body using detail field", () => {
    const err = toApiError(422, {
      status: 422,
      detail: "Validation failed",
      type: "https://example.com/errors/validation",
    });
    expect(err).toEqual<ApiError>({
      status: 422,
      message: "Validation failed",
      type: "https://example.com/errors/validation",
    });
  });

  it("falls back to title when detail is absent", () => {
    const err = toApiError(404, { status: 404, title: "Not Found" });
    expect(err).toEqual<ApiError>({
      status: 404,
      message: "Not Found",
      type: undefined,
    });
  });

  it("uses generic message when both detail and title are absent", () => {
    const err = toApiError(500, { status: 500 });
    expect(err).toEqual<ApiError>({
      status: 500,
      message: "Request failed with status 500",
      type: undefined,
    });
  });

  it("produces a generic error for non-problem-detail JSON", () => {
    const err = toApiError(500, { error: "something broke" });
    expect(err).toEqual<ApiError>({
      status: 500,
      message: "Request failed with status 500",
    });
  });

  it("produces a generic error for non-JSON (undefined body)", () => {
    const err = toApiError(503, undefined);
    expect(err).toEqual<ApiError>({
      status: 503,
      message: "Request failed with status 503",
    });
  });

  it("produces a generic error when body has a status property that is not a number", () => {
    const err = toApiError(400, { status: "400" });
    expect(err).toEqual<ApiError>({
      status: 400,
      message: "Request failed with status 400",
    });
  });

  it("produces a generic error when body is null", () => {
    const err = toApiError(500, null);
    expect(err).toEqual<ApiError>({
      status: 500,
      message: "Request failed with status 500",
    });
  });

  it("uses empty string detail as-is (nullish coalescing does not skip empty strings)", () => {
    const err = toApiError(418, {
      status: 418,
      detail: "",
      title: "Some Title",
    });
    // ?? only skips null/undefined, not ""; so detail="" is used directly
    expect(err).toEqual<ApiError>({
      status: 418,
      message: "",
      type: undefined,
    });
  });
});

// ─── listPatterns ─────────────────────────────────────────────────────────────

describe("listPatterns", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns paginated pattern list on success", async () => {
    mockFetch(200, PAGINATED);
    const result = await listPatterns();
    expect(result).toEqual(PAGINATED);
  });

  it("appends query params to the request URL", async () => {
    mockFetch(200, PAGINATED);
    await listPatterns({ limit: 10, cursor: "abc", language: "go" });
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).toContain("limit=10");
    expect(url).toContain("cursor=abc");
    expect(url).toContain("language=go");
  });

  it("appends tags and domain filter params to the URL", async () => {
    mockFetch(200, PAGINATED);
    await listPatterns({ tags: "security", domain: "backend" });
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).toContain("tags=security");
    expect(url).toContain("domain=backend");
  });

  it("does not append a query string when called with no params", async () => {
    mockFetch(200, PAGINATED);
    await listPatterns();
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).not.toContain("?");
  });

  it("throws ApiError on non-2xx response with problem detail", async () => {
    mockFetch(
      404,
      { status: 404, detail: "No patterns found" },
      "application/problem+json",
    );
    await expect(listPatterns()).rejects.toMatchObject({
      status: 404,
      message: "No patterns found",
    });
  });

  it("throws ApiError on non-2xx response with plain error body", async () => {
    mockFetchText(500, "Internal Server Error");
    await expect(listPatterns()).rejects.toMatchObject({
      status: 500,
      message: "Request failed with status 500",
    });
  });
});

// ─── searchPatterns ───────────────────────────────────────────────────────────

describe("searchPatterns", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns search response on success", async () => {
    mockFetch(200, SEARCH_RESPONSE);
    const result = await searchPatterns({ q: "test query" });
    expect(result).toEqual(SEARCH_RESPONSE);
  });

  it("sends all filter params as query string", async () => {
    mockFetch(200, SEARCH_RESPONSE);
    await searchPatterns({
      q: "auth",
      tags: "security",
      language: "go",
      domain: "backend",
      agent: "agent-1",
      limit: 5,
      threshold: 0.7,
    });
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).toContain("q=auth");
    expect(url).toContain("tags=security");
    expect(url).toContain("language=go");
    expect(url).toContain("domain=backend");
    expect(url).toContain("agent=agent-1");
    expect(url).toContain("limit=5");
    expect(url).toContain("threshold=0.7");
  });

  it("throws ApiError on non-2xx", async () => {
    mockFetch(
      400,
      { status: 400, detail: "Missing required param q" },
      "application/problem+json",
    );
    await expect(searchPatterns({ q: "" })).rejects.toMatchObject({
      status: 400,
      message: "Missing required param q",
    });
  });
});

// ─── getPattern ───────────────────────────────────────────────────────────────

describe("getPattern", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns pattern detail on success", async () => {
    mockFetch(200, PATTERN_DETAIL);
    const result = await getPattern("abc-123");
    expect(result).toEqual(PATTERN_DETAIL);
  });

  it("URL-encodes the pattern id", async () => {
    mockFetch(200, PATTERN_DETAIL);
    await getPattern("id with spaces");
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).toContain("id%20with%20spaces");
  });

  it("throws ApiError on 404", async () => {
    mockFetch(
      404,
      { status: 404, detail: "Pattern not found" },
      "application/problem+json",
    );
    await expect(getPattern("missing")).rejects.toMatchObject({
      status: 404,
      message: "Pattern not found",
    });
  });
});

// ─── getPatternChunks ─────────────────────────────────────────────────────────

describe("getPatternChunks", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns chunk summaries on success", async () => {
    mockFetch(200, CHUNKS_API_RESPONSE);
    const result = await getPatternChunks("abc-123");
    expect(result).toEqual(CHUNKS);
  });

  it("throws ApiError on non-2xx", async () => {
    mockFetch(
      500,
      { status: 500, detail: "Server error" },
      "application/problem+json",
    );
    await expect(getPatternChunks("abc-123")).rejects.toMatchObject({
      status: 500,
      message: "Server error",
    });
  });

  it("URL-encodes the pattern id in the chunks path", async () => {
    mockFetch(200, CHUNKS_API_RESPONSE);
    await getPatternChunks("id/with/slashes");
    const [url] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      ...unknown[],
    ];
    expect(url).toContain("id%2Fwith%2Fslashes");
  });
});

// ─── createPattern ────────────────────────────────────────────────────────────

describe("createPattern", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns the created pattern detail on success", async () => {
    mockFetch(201, PATTERN_DETAIL);
    const result = await createPattern({
      name: "New Pattern",
      description: "A new pattern",
      content: "Content here",
      tags: ["go"],
    });
    expect(result).toEqual(PATTERN_DETAIL);
  });

  it("sends a POST request with JSON body", async () => {
    mockFetch(201, PATTERN_DETAIL);
    const body = { name: "N", description: "D", content: "C" };
    await createPattern(body);
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify(body));
  });

  it("throws ApiError on validation failure", async () => {
    mockFetch(
      422,
      { status: 422, detail: "name is required" },
      "application/problem+json",
    );
    await expect(
      createPattern({ name: "", description: "", content: "" }),
    ).rejects.toMatchObject({
      status: 422,
      message: "name is required",
    });
  });

  it("sends the correct Content-Type header", async () => {
    mockFetch(201, PATTERN_DETAIL);
    await createPattern({ name: "N", description: "D", content: "C" });
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});
