import { useState, useEffect } from "react";
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
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 400);
    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  const activeCount = Object.values(localFilters).filter(
    (v) => v.length > 0,
  ).length;

  function handleChange(field: keyof FilterState, value: string) {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="flex flex-col gap-1 border-b p-3">
      {activeCount > 0 && (
        <div aria-label="active filters">
          {localFilters.tags && <span>tags: {localFilters.tags}</span>}
          {localFilters.language && (
            <span> language: {localFilters.language}</span>
          )}
          {localFilters.domain && <span> domain: {localFilters.domain}</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        <label className="flex flex-col text-sm">
          Tags
          <input
            type="text"
            value={localFilters.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            className="w-20"
          />
        </label>
        <label className="flex flex-col text-sm">
          Language
          <input
            type="text"
            value={localFilters.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-20"
          />
        </label>
        <label className="flex flex-col text-sm">
          Domain
          <input
            type="text"
            value={localFilters.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
            className="w-20"
          />
        </label>
      </div>
    </form>
  );
}
