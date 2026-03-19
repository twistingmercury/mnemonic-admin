import { useQuery } from "@tanstack/react-query";
import { listPatterns, searchPatterns } from "../api/client";
import { PatternResultRow } from "./PatternResultRow";
import type { FilterState } from "./PatternFilters";
import { EMPTY_FILTERS } from "./PatternFilters";
import type { PatternListItem } from "../api/types";

interface PatternResultsListProps {
  query?: string;
  filters?: FilterState;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

export function PatternResultsList({
  query,
  filters = EMPTY_FILTERS,
  onSelect,
  selectedId,
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
        agent: filters.agent_id || undefined,
      }),
    enabled: isSearchMode,
  });

  const { isLoading, isError } = isSearchMode ? searchResult : browseResult;

  if (isLoading) {
    return (
      <div className="p-3 text-sm">
        {isSearchMode ? "Searching…" : "Loading patterns…"}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 text-sm">
        {isSearchMode ? "Search failed" : "Failed to load patterns"}
      </div>
    );
  }

  const patterns = isSearchMode
    ? ((searchResult.data?.results ?? []) as unknown as PatternListItem[])
    : (browseResult.data?.data ?? []);

  if (patterns.length === 0) {
    return (
      <div className="p-3 text-sm">
        {isSearchMode ? "No results for your search" : "No patterns found"}
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-auto">
      {patterns.map((pattern) => (
        <PatternResultRow
          key={pattern.id}
          pattern={pattern}
          onSelect={onSelect ?? (() => {})}
          selected={selectedId === pattern.id}
        />
      ))}
    </ul>
  );
}
