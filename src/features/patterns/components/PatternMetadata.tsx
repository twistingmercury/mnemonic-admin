import type { PatternDetail } from "../api/types";

interface PatternMetadataProps {
  pattern: PatternDetail;
}

export function PatternMetadata({ pattern }: PatternMetadataProps) {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        gap: "4px 16px",
      }}
    >
      <dt>Name</dt>
      <dd>{pattern.name}</dd>

      <dt>Description</dt>
      <dd>{pattern.description}</dd>

      {pattern.language && (
        <>
          <dt>Language</dt>
          <dd>{pattern.language}</dd>
        </>
      )}

      {pattern.domain && (
        <>
          <dt>Domain</dt>
          <dd>{pattern.domain}</dd>
        </>
      )}

      {pattern.entity_type && (
        <>
          <dt>Entity type</dt>
          <dd>{pattern.entity_type}</dd>
        </>
      )}

      <dt>Version</dt>
      <dd>{pattern.version}</dd>

      <dt>Enriched</dt>
      <dd>{pattern.enriched ? "Yes" : "No"}</dd>

      {pattern.tags.length > 0 && (
        <>
          <dt>Tags</dt>
          <dd>
            <ul
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {pattern.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </dd>
        </>
      )}

      <dt>Created</dt>
      <dd>{new Date(pattern.created_at).toLocaleString()}</dd>

      <dt>Updated</dt>
      <dd>{new Date(pattern.updated_at).toLocaleString()}</dd>
    </dl>
  );
}
