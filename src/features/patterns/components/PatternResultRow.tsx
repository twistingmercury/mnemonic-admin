import type { PatternListItem } from "../api/types";

interface PatternResultRowProps {
  pattern: PatternListItem;
  onSelect: (id: string) => void;
  selected: boolean;
}

export function PatternResultRow({
  pattern,
  onSelect,
  selected,
}: PatternResultRowProps) {
  const secondaryParts = [
    pattern.language,
    pattern.domain,
    pattern.entity_type,
    `v${pattern.version}`,
  ].filter(Boolean);

  return (
    <li
      role="button"
      aria-pressed={selected}
      onClick={() => onSelect(pattern.id)}
      style={{ cursor: "pointer", fontWeight: selected ? "bold" : "normal" }}
    >
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
