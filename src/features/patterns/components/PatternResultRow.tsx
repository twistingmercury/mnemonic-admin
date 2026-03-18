import type { PatternListItem } from "../api/types";

interface PatternResultRowProps {
  pattern: PatternListItem;
}

export function PatternResultRow({ pattern }: PatternResultRowProps) {
  const secondaryParts = [
    pattern.language,
    pattern.domain,
    pattern.entity_type,
    `v${pattern.version}`,
  ].filter(Boolean);

  return (
    <li>
      <div>
        <span>{pattern.name}</span>
      </div>
      {pattern.description && <div>{pattern.description}</div>}
      {pattern.tags.length > 0 && (
        <div>
          {pattern.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {secondaryParts.length > 0 && <div>{secondaryParts.join(" · ")}</div>}
    </li>
  );
}
