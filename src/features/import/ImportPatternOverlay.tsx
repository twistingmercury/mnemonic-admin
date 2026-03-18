interface ImportPatternOverlayProps {
  onClose: () => void;
}

export function ImportPatternOverlay({ onClose }: ImportPatternOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "560px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2>Import Pattern</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input type="file" accept=".md" aria-label="Select Markdown file" />

          <section aria-label="Validation feedback" />

          <section aria-label="Import outcome" />
        </div>
      </div>
    </div>
  );
}
