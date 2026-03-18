import type { FilterState } from "./filterTypes";

export type { FilterState } from "./filterTypes";
export { EMPTY_FILTERS } from "./filterTypes";

interface PatternFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function PatternFilters({
  filters,
  onFiltersChange,
}: PatternFiltersProps) {
  const activeCount = Object.values(filters).filter((v) => v.length > 0).length;

  function handleChange(field: keyof FilterState, value: string) {
    onFiltersChange({ ...filters, [field]: value });
  }

  return (
    <form style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {activeCount > 0 && (
        <div aria-label="active filters">
          {filters.tags && <span>tags: {filters.tags}</span>}
          {filters.language && <span> language: {filters.language}</span>}
          {filters.domain && <span> domain: {filters.domain}</span>}
          {filters.agent_id && <span> agent: {filters.agent_id}</span>}
        </div>
      )}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Tags
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Language
          <input
            type="text"
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Domain
          <input
            type="text"
            value={filters.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Agent
          <input
            type="text"
            value={filters.agent_id}
            onChange={(e) => handleChange("agent_id", e.target.value)}
          />
        </label>
      </div>
    </form>
  );
}
