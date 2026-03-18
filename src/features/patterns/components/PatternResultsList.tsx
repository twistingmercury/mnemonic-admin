import { useQuery } from "@tanstack/react-query";
import { listPatterns, searchPatterns } from "../api/client";
import { PatternResultRow } from "./PatternResultRow";
import type { FilterState } from "./PatternFilters";
import { EMPTY_FILTERS } from "./PatternFilters";

interface PatternResultsListProps {
  query?: string;
  filters?: FilterState;
}

export function PatternResultsList({
  query,
  filters = EMPTY_FILTERS,
}: PatternResultsListProps) {
  const isSearchMode = typeof query === "string" && query.length > 0;

  const browseResult = useQuery({
    queryKey: ["patterns", filters],
    queryFn: () =>
      listPatterns({
        tags: filters.tags || undefined,
        language: filters.language || undefined,
        domain: filters.domain || undefined,
      }),
    enabled: !isSearchMode,
  });

  const searchResult = useQuery({
    queryKey: ["patterns", "search", query ?? "", filters],
    queryFn: () =>
      searchPatterns({
        q: query!,
        tags: filters.tags || undefined,
        language: filters.language || undefined,
        domain: filters.domain || undefined,
        agent_id: filters.agent_id || undefined,
      }),
    enabled: isSearchMode,
  });

  const { isLoading, isError } = isSearchMode ? searchResult : browseResult;

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (isError) {
    return <div>Failed to load patterns</div>;
  }

  const patterns = isSearchMode
    ? (searchResult.data?.results ?? [])
    : (browseResult.data?.data ?? []);

  if (patterns.length === 0) {
    return <div>No patterns found</div>;
  }

  return (
    <ul>
      {patterns.map((pattern) => (
        <PatternResultRow key={pattern.id} pattern={pattern} />
      ))}
    </ul>
  );
}
