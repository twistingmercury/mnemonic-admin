// ─── Domain models ────────────────────────────────────────────────────────────

export interface AgentAssociation {
  agent_id: string;
  agent_name?: string;
  relevance: number;
}

export interface RelatedPattern {
  id: string;
  name: string;
  description: string;
  similarity_score?: number;
}

export interface ChunkSummary {
  id: string;
  index: number;
  summary: string;
  token_count?: number;
}

// ─── Pattern shapes ───────────────────────────────────────────────────────────

export interface PatternListItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  language?: string;
  domain?: string;
  entity_type?: string;
  version: string;
  enriched: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatternDetail extends PatternListItem {
  content: string;
  agent_associations: AgentAssociation[];
  related_patterns: RelatedPattern[];
}

// ─── Pagination & responses ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchResponse {
  results: PatternListItem[];
  total: number;
  query: string;
}

// ─── Request params ───────────────────────────────────────────────────────────

export interface BrowseParams {
  page?: number;
  page_size?: number;
  tags?: string;
  language?: string;
  domain?: string;
}

export interface SearchParams {
  q: string;
  tags?: string;
  language?: string;
  domain?: string;
  agent_id?: string;
  page?: number;
  page_size?: number;
}

export interface CreatePatternBody {
  name: string;
  description: string;
  content: string;
  tags?: string[];
  language?: string;
  domain?: string;
  entity_type?: string;
  agent_associations?: { agent_id: string; relevance: number }[];
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
