import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { ImportPatternOverlay } from "../import/ImportPatternOverlay";

export function PatternWorkspace() {
  const [activeQuery, setActiveQuery] = useState("");
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const queryClient = useQueryClient();

  function handleImportClick() {
    setShowImport(true);
  }

  function handleImportSuccess(patternId: string) {
    queryClient.invalidateQueries({ queryKey: ["patterns"] });
    setSelectedId(patternId);
    setShowImport(false);
  }

  const leftPane = (
    <div className="flex h-full flex-col">
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
    <>
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
      {showImport && (
        <ImportPatternOverlay
          onClose={() => setShowImport(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </>
  );
}
