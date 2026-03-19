import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { listPatterns, searchPatterns } from "../api/client";
import { PatternResultRow } from "./PatternResultRow";
import type { FilterState } from "./PatternFilters";
import { EMPTY_FILTERS } from "./PatternFilters";
import type { PatternListItem, SearchResultItem } from "../api/types";

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

  const browseResult = useInfiniteQuery({
    queryKey: ["patterns", filters],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listPatterns({
        tags: filters.tags || undefined,
        language: filters.language || undefined,
        domain: filters.domain || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    initialPageParam: undefined as string | undefined,
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

  if (isSearchMode) {
    const searchResults: SearchResultItem[] = searchResult.data?.results ?? [];

    if (searchResults.length === 0) {
      return <div className="p-3 text-sm">No results for your search</div>;
    }

    return (
      <div className="flex flex-1 flex-col overflow-auto">
        <ul>
          {searchResults.map((result) => (
            <PatternResultRow
              key={`${result.pattern_id}-${result.chunk_index}`}
              mode="search"
              result={result}
              onSelect={onSelect ?? (() => {})}
              selected={selectedId === result.pattern_id}
            />
          ))}
        </ul>
      </div>
    );
  }

  const browsePatterns: PatternListItem[] =
    browseResult.data?.pages.flatMap((p) => p.data) ?? [];

  if (browsePatterns.length === 0) {
    return <div className="p-3 text-sm">No patterns found</div>;
  }

  const lastPage = browseResult.data?.pages[browseResult.data.pages.length - 1];
  const hasMore = lastPage?.has_more ?? false;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ul>
        {browsePatterns.map((pattern) => (
          <PatternResultRow
            key={pattern.id}
            mode="browse"
            pattern={pattern}
            onSelect={onSelect ?? (() => {})}
            selected={selectedId === pattern.id}
          />
        ))}
      </ul>
      {hasMore && (
        <button
          className="p-3 text-sm"
          onClick={() => void browseResult.fetchNextPage()}
          disabled={browseResult.isFetchingNextPage}
        >
          {browseResult.isFetchingNextPage ? "Loading…" : "Load More"}
        </button>
      )}
    </div>
  );
}
