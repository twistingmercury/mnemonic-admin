import type { AgentAssociation, ChunkSummary } from "../api/types";

interface PatternSupportSectionsProps {
  chunks: ChunkSummary[];
  agentAssociations: AgentAssociation[];
}

export function PatternSupportSections({
  chunks,
  agentAssociations,
}: PatternSupportSectionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-4 border-t pt-4">
      <section aria-label="Chunk summaries">
        <h3>Chunk Summaries</h3>
        {chunks.length === 0 ? (
          <p>No chunk summaries available.</p>
        ) : (
          <ol className="flex list-none flex-col gap-2 p-0">
            {chunks.map((chunk) => (
              <li key={chunk.id}>
                <span>Chunk {chunk.index}:</span> {chunk.summary}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-label="Agent associations">
        <h3>Agent Associations</h3>
        {agentAssociations.length === 0 ? (
          <p>No agent associations available.</p>
        ) : (
          <ul className="flex list-none flex-col gap-2 p-0">
            {agentAssociations.map((assoc) => (
              <li key={assoc.agent_name}>
                <span>{assoc.agent_name}</span>
                {" — relevance: "}
                {assoc.relevance}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
