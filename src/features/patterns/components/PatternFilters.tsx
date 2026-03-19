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
    <form className="flex flex-col gap-1 border-b p-3">
      {activeCount > 0 && (
        <div aria-label="active filters">
          {filters.tags && <span>tags: {filters.tags}</span>}
          {filters.language && <span> language: {filters.language}</span>}
          {filters.domain && <span> domain: {filters.domain}</span>}
          {filters.agent && <span> agent: {filters.agent}</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        <label className="flex flex-col text-sm">
          Tags
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            className="w-20"
          />
        </label>
        <label className="flex flex-col text-sm">
          Language
          <input
            type="text"
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-20"
          />
        </label>
        <label className="flex flex-col text-sm">
          Domain
          <input
            type="text"
            value={filters.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
            className="w-20"
          />
        </label>
        <label className="flex flex-col text-sm">
          Agent
          <input
            type="text"
            value={filters.agent}
            onChange={(e) => handleChange("agent", e.target.value)}
            className="w-20"
          />
        </label>
      </div>
    </form>
  );
}
