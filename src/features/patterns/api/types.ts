// ─── Domain models ────────────────────────────────────────────────────────────

export interface RelatedPattern {
  id: string;
  name: string;
  relationship: string;
  strength: number;
}

export interface ChunkSummary {
  id: string;
  index: number;
  summary: string;
}

// ─── Pattern shapes ───────────────────────────────────────────────────────────

export interface PatternListItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  enrichment_status: string;
  created_at: string;
  updated_at: string;
}

export interface PatternDetail extends PatternListItem {
  content: string;
  version?: string;
  language?: string;
  domain?: string;
  entity_type?: string;
  enriched_at?: string;
  enrichment_error?: string | null;
  graph: {
    related_patterns: RelatedPattern[];
    concepts: { name: string }[];
  };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResultItem {
  pattern_id: string;
  pattern_name: string;
  section_title: string;
  similarity: number;
  content: string;
  chunk_index: number;
  language: string;
  domain: string;
  entity_type: string;
  tags: string[];
}

// ─── Pagination & responses ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  cursor: string;
  has_more: boolean;
  next_cursor: string;
}

export interface SearchResponse {
  metadata: {
    query: string;
    search_duration_ms: number;
    total_candidates: number;
  };
  results: SearchResultItem[];
}

// ─── Request params ───────────────────────────────────────────────────────────

export interface BrowseParams {
  limit?: number;
  cursor?: string;
  search?: string;
  tags?: string;
  language?: string;
  domain?: string;
  entity_type?: string;
}

export interface SearchParams {
  q: string;
  limit?: number;
  threshold?: number;
  tags?: string;
  language?: string;
  domain?: string;
}

export interface CreatePatternBody {
  name: string;
  description: string;
  content: string;
  tags?: string[];
  language?: string;
  domain?: string;
  entity_type?: string;
}

// ─── Error types ──────────────────────────────────────────────────────────────

/** RFC 7807 problem detail as returned by the server. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
}

/** Normalised error shape used throughout the frontend. */
export interface ApiError {
  status: number;
  message: string;
  type?: string;
}
