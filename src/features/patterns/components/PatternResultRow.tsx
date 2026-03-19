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
  return (
    <li
      role="button"
      aria-pressed={selected}
      onClick={() => onSelect(pattern.id)}
      className={`cursor-pointer border-b p-3 text-sm ${selected ? "font-semibold" : ""}`}
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
    </li>
  );
}
