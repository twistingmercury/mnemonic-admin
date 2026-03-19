import type { PatternListItem, SearchResultItem } from "../api/types";

type PatternResultRowProps =
  | {
      mode: "browse";
      pattern: PatternListItem;
      onSelect: (id: string) => void;
      selected: boolean;
    }
  | {
      mode: "search";
      result: SearchResultItem;
      onSelect: (id: string) => void;
      selected: boolean;
    };

export function PatternResultRow(props: PatternResultRowProps) {
  const { mode, onSelect, selected } = props;

  if (mode === "search") {
    const { result } = props;
    const similarityPct = Math.round(result.similarity * 100);

    return (
      <li
        role="button"
        aria-pressed={selected}
        onClick={() => onSelect(result.pattern_id)}
        className={`cursor-pointer border-b p-3 text-sm ${selected ? "font-semibold" : ""}`}
      >
        <div>
          <span>{result.pattern_name}</span>
        </div>
        {result.section_title && <div>{result.section_title}</div>}
        <div>{similarityPct}% match</div>
      </li>
    );
  }

  const { pattern } = props;

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
