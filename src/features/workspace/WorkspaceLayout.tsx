import type { ReactNode } from "react";

interface WorkspaceLayoutProps {
  header: ReactNode;
  leftPane: ReactNode;
  rightPane: ReactNode;
}

export function WorkspaceLayout({
  header,
  leftPane,
  rightPane,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="border-b">{header}</div>
      <div className="flex min-h-0 flex-1">
        <div className="w-96 shrink-0 overflow-auto border-r">{leftPane}</div>
        <div className="flex-1 overflow-auto">{rightPane}</div>
      </div>
    </div>
  );
}
