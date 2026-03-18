import { useQuery } from "@tanstack/react-query";
import { getPattern } from "../api/client";

interface PatternDetailPaneProps {
  patternId: string | null;
}

export function PatternDetailPane({ patternId }: PatternDetailPaneProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pattern", patternId],
    queryFn: () => getPattern(patternId!),
    enabled: patternId !== null,
  });

  if (patternId === null) {
    return <div>Select a pattern to view details</div>;
  }

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (isError) {
    return <div>Failed to load pattern</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div>
        <span style={{ fontWeight: "bold" }}>{data?.name}</span>
      </div>
      {data?.content && (
        <div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {data.content}
          </pre>
        </div>
      )}
    </div>
  );
}
