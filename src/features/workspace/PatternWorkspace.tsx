import { useState } from "react";
import { PatternSearchForm } from "../patterns/components/PatternSearchForm";
import { PatternResultsList } from "../patterns/components/PatternResultsList";
import {
  PatternFilters,
  EMPTY_FILTERS,
  type FilterState,
} from "../patterns/components/PatternFilters";
import { PatternDetailPane } from "../patterns/components/PatternDetailPane";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceLayout } from "./WorkspaceLayout";

export function PatternWorkspace() {
  const [activeQuery, setActiveQuery] = useState("");
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleImportClick() {
    // placeholder — wired up in a later cycle
  }

  const leftPane = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PatternSearchForm onSearch={setActiveQuery} activeQuery={activeQuery} />
      <PatternFilters
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
      />
      <PatternResultsList
        query={activeQuery}
        filters={activeFilters}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
    </div>
  );

  return (
    <WorkspaceLayout
      header={<WorkspaceHeader onImportClick={handleImportClick} />}
      leftPane={leftPane}
      rightPane={
        <PatternDetailPane
          patternId={selectedId}
          onSelectRelated={setSelectedId}
        />
      }
    />
  );
}
