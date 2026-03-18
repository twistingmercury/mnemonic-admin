import type {
  ApiError,
  BrowseParams,
  ChunkSummary,
  CreatePatternBody,
  PaginatedResponse,
  PatternDetail,
  PatternListItem,
  ProblemDetail,
  SearchParams,
  SearchResponse,
} from "./types";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8080/v1/api";

// ─── Error normalisation ──────────────────────────────────────────────────────

function isProblemDetail(value: unknown): value is ProblemDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof (value as Record<string, unknown>).status === "number"
  );
}

/**
 * Convert a raw HTTP error into the canonical `ApiError` shape.
 *
 * @param status - HTTP status code from the failed response.
 * @param body   - Parsed (or unparseable) response body.
 */
export function toApiError(status: number, body: unknown): ApiError {
  if (isProblemDetail(body)) {
    return {
      status: body.status,
      message:
        body.detail ??
        body.title ??
        `Request failed with status ${body.status}`,
      type: body.type,
    };
  }

  return {
    status,
    message: `Request failed with status ${status}`,
  };
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  // Attempt structured error parse; fall back gracefully.
  const contentType = response.headers.get("Content-Type") ?? "";
  const isJson =
    contentType.includes("application/problem+json") ||
    contentType.includes("application/json");

  let body: unknown = undefined;
  if (isJson) {
    try {
      body = await response.json();
    } catch {
      // parse failure — body stays undefined, generic message used below
    }
  }

  throw toApiError(response.status, body);
}

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ─── Public client functions ──────────────────────────────────────────────────

/** Browse/list patterns with optional filters and pagination. */
export function listPatterns(
  params: BrowseParams = {},
): Promise<PaginatedResponse<PatternListItem>> {
  const query = buildQuery(
    params as Record<string, string | number | undefined>,
  );
  return apiFetch(`/patterns${query}`);
}

/** Semantic search over patterns. */
export function searchPatterns(params: SearchParams): Promise<SearchResponse> {
  const query = buildQuery(
    params as unknown as Record<string, string | number | undefined>,
  );
  return apiFetch(`/patterns/search${query}`);
}

/** Fetch a single pattern by ID. */
export function getPattern(id: string): Promise<PatternDetail> {
  return apiFetch(`/patterns/${encodeURIComponent(id)}`);
}

/** Fetch chunk summaries for a pattern. */
export function getPatternChunks(id: string): Promise<ChunkSummary[]> {
  return apiFetch(`/patterns/${encodeURIComponent(id)}/chunks`);
}

/** Create or import a new pattern. */
export function createPattern(body: CreatePatternBody): Promise<PatternDetail> {
  return apiFetch("/patterns", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
