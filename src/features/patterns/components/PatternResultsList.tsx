import { useQuery } from "@tanstack/react-query";
import { listPatterns } from "../api/client";
import { PatternResultRow } from "./PatternResultRow";

export function PatternResultsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patterns"],
    queryFn: () => listPatterns(),
  });

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (isError) {
    return <div>Failed to load patterns</div>;
  }

  const patterns = data?.data ?? [];

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
