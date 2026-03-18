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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <section aria-label="Chunk summaries">
        <h3>Chunk Summaries</h3>
        {chunks.length === 0 ? (
          <p>No chunk summaries available.</p>
        ) : (
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
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
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {agentAssociations.map((assoc) => (
              <li key={assoc.agent_id}>
                <span>{assoc.agent_name ?? assoc.agent_id}</span>
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
