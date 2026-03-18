import { useState } from "react";
import { parsePatternFile, type ParsedPatternFile } from "./patternFileParser";

interface ImportPatternOverlayProps {
  onClose: () => void;
}

export function ImportPatternOverlay({ onClose }: ImportPatternOverlayProps) {
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedFile, setParsedFile] = useState<ParsedPatternFile | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== "string") return;

      const result = parsePatternFile(content);
      if (result.ok) {
        setParsedFile(result.value);
        setParseError(null);
      } else {
        setParseError(result.error.message);
        setParsedFile(null);
      }
    };
    reader.readAsText(file);
  }

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
          <input
            type="file"
            accept=".md"
            aria-label="Select Markdown file"
            onChange={handleFileChange}
          />

          <section aria-label="Validation feedback">
            {parseError !== null && <p>{parseError}</p>}
          </section>

          {/* parsedFile is set but rendered in a later cycle */}
          <section aria-label="Import outcome">{parsedFile && null}</section>
        </div>
      </div>
    </div>
  );
}
