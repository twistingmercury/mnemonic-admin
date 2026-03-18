import { useQuery } from "@tanstack/react-query";
import { getPattern, getPatternChunks } from "../api/client";
import { PatternMetadata } from "./PatternMetadata";
import { PatternContent } from "./PatternContent";
import { PatternSupportSections } from "./PatternSupportSections";

interface PatternDetailPaneProps {
  patternId: string | null;
  onSelectRelated?: (id: string) => void;
}

export function PatternDetailPane({
  patternId,
  onSelectRelated,
}: PatternDetailPaneProps) {
  const {
    data,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ["pattern", patternId],
    queryFn: () => getPattern(patternId!),
    enabled: patternId !== null,
  });

  const { data: chunks = [] } = useQuery({
    queryKey: ["pattern-chunks", patternId],
    queryFn: () => getPatternChunks(patternId!),
    enabled: patternId !== null,
  });

  if (patternId === null) {
    return <div>Select a pattern to view details</div>;
  }

  if (isDetailLoading) {
    return <div>Loading…</div>;
  }

  if (isDetailError) {
    return <div>Failed to load pattern</div>;
  }

  if (!data) {
    return null;
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
      <PatternMetadata pattern={data} />
      <PatternContent pattern={data} />
      <PatternSupportSections
        chunks={chunks}
        agentAssociations={data.agent_associations}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3>Related Patterns</h3>
        {data.related_patterns.length === 0 ? (
          <p>No related patterns</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.related_patterns.map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => onSelectRelated?.(related.id)}
                style={{ textAlign: "left" }}
              >
                <span>{related.name}</span>
                {related.description && <span> — {related.description}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
