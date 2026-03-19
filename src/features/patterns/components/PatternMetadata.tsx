import type { PatternDetail } from "../api/types";

interface PatternMetadataProps {
  pattern: PatternDetail;
}

export function PatternMetadata({ pattern }: PatternMetadataProps) {
  return (
    <dl className="mb-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
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

      {pattern.version && (
        <>
          <dt>Version</dt>
          <dd>{pattern.version}</dd>
        </>
      )}

      <dt>Enrichment status</dt>
      <dd>{pattern.enrichment_status}</dd>

      {pattern.tags.length > 0 && (
        <>
          <dt>Tags</dt>
          <dd>
            <ul className="flex list-none flex-wrap gap-1 p-0">
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
