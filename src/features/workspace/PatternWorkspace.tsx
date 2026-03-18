import { useState } from "react";
import { PatternSearchForm } from "../patterns/components/PatternSearchForm";
import { PatternResultsList } from "../patterns/components/PatternResultsList";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceLayout } from "./WorkspaceLayout";

export function PatternWorkspace() {
  const [activeQuery, setActiveQuery] = useState("");

  function handleImportClick() {
    // placeholder — wired up in a later cycle
  }

  const leftPane = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PatternSearchForm onSearch={setActiveQuery} activeQuery={activeQuery} />
      <PatternResultsList query={activeQuery} />
    </div>
  );

  return (
    <WorkspaceLayout
      header={<WorkspaceHeader onImportClick={handleImportClick} />}
      leftPane={leftPane}
      rightPane={null}
    />
  );
}
