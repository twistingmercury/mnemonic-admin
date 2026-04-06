import type { ChunkSummary } from "../api/types";

interface PatternSupportSectionsProps {
  chunks: ChunkSummary[];
}

export function PatternSupportSections({
  chunks,
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
    </div>
  );
}
