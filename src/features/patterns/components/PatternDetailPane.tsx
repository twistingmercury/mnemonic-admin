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
    return <div className="p-4 text-sm">Select a pattern to view details</div>;
  }

  if (isDetailLoading) {
    return <div className="p-4 text-sm">Loading…</div>;
  }

  if (isDetailError) {
    return <div className="p-4 text-sm">Failed to load pattern</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <PatternMetadata pattern={data} />
      <PatternContent pattern={data} />
      <PatternSupportSections
        chunks={chunks}
        agentAssociations={data.agent_associations ?? []}
      />
      <div className="flex flex-col gap-2">
        <h3>Related Patterns</h3>
        {(data.graph?.related_patterns ?? []).length === 0 ? (
          <p>No related patterns</p>
        ) : (
          <div className="flex flex-col gap-1">
            {(data.graph?.related_patterns ?? []).map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => onSelectRelated?.(related.id)}
                className="text-left"
              >
                <span>{related.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
