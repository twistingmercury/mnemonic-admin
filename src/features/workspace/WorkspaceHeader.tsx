interface WorkspaceHeaderProps {
  onImportClick: () => void;
}

export function WorkspaceHeader({ onImportClick }: WorkspaceHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Mnemonic Admin</h1>
      <button type="button" onClick={onImportClick}>
        Import Pattern
      </button>
    </header>
  );
}
