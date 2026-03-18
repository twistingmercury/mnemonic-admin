import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceLayout } from "./WorkspaceLayout";

export function PatternWorkspace() {
  function handleImportClick() {
    // placeholder — wired up in a later cycle
  }

  return (
    <WorkspaceLayout
      header={<WorkspaceHeader onImportClick={handleImportClick} />}
      leftPane={null}
      rightPane={null}
    />
  );
}
