import { useQuery } from "@tanstack/react-query";
import { listPatterns, searchPatterns } from "../api/client";
import { PatternResultRow } from "./PatternResultRow";

interface PatternResultsListProps {
  query?: string;
}

export function PatternResultsList({ query }: PatternResultsListProps) {
  const isSearchMode = typeof query === "string" && query.length > 0;

  const browseResult = useQuery({
    queryKey: ["patterns"],
    queryFn: () => listPatterns(),
    enabled: !isSearchMode,
  });

  const searchResult = useQuery({
    queryKey: ["patterns", "search", query ?? ""],
    queryFn: () => searchPatterns({ q: query! }),
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
