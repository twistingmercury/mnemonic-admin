import { useState } from "react";
import { parsePatternFile } from "./patternFileParser";
import {
  validatePatternFile,
  type ValidationError,
} from "./patternFileValidation";
import { buildPatternPayload } from "./patternPayloadBuilder";
import type { CreatePatternBody } from "../patterns/api/types";

interface ImportPatternOverlayProps {
  onClose: () => void;
}

export function ImportPatternOverlay({ onClose }: ImportPatternOverlayProps) {
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    ValidationError[] | null
  >(null);
  const [builtPayload, setBuiltPayload] = useState<CreatePatternBody | null>(
    null,
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setBuiltPayload(null);
    setParseError(null);
    setValidationErrors(null);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== "string") return;

      const result = parsePatternFile(content);
      if (!result.ok) {
        setParseError(result.error.message);
        return;
      }

      const validation = validatePatternFile(result.value);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }

      setBuiltPayload(buildPatternPayload(result.value));
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
            {validationErrors !== null && (
              <ul>
                {validationErrors.map((error) => (
                  <li key={error.field}>{error.message}</li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Import outcome">
            {builtPayload !== null && (
              <p>Ready to import: {builtPayload.name}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
