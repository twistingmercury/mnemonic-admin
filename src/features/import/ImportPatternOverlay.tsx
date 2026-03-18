import { useState } from "react";
import { parsePatternFile } from "./patternFileParser";
import {
  validatePatternFile,
  type ValidationError,
} from "./patternFileValidation";
import { buildPatternPayload } from "./patternPayloadBuilder";
import { createPattern } from "../patterns/api/client";
import type { ApiError, CreatePatternBody } from "../patterns/api/types";

interface ImportPatternOverlayProps {
  onClose: () => void;
  onImportSuccess?: (patternId: string) => void;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; patternId: string }
  | { status: "conflict" }
  | { status: "error"; message: string };

export function ImportPatternOverlay({
  onClose,
  onImportSuccess,
}: ImportPatternOverlayProps) {
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    ValidationError[] | null
  >(null);
  const [builtPayload, setBuiltPayload] = useState<CreatePatternBody | null>(
    null,
  );
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setBuiltPayload(null);
    setParseError(null);
    setValidationErrors(null);
    setSubmitState({ status: "idle" });

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

  async function handleSubmit() {
    if (!builtPayload) return;

    setSubmitState({ status: "submitting" });

    try {
      const pattern = await createPattern(builtPayload);
      setSubmitState({ status: "success", patternId: pattern.id });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 409) {
        setSubmitState({ status: "conflict" });
      } else {
        setSubmitState({ status: "error", message: apiError.message });
      }
    }
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
            {builtPayload === null && submitState.status === "idle" && (
              <p>Select a Markdown file to import.</p>
            )}
            {builtPayload !== null && submitState.status === "idle" && (
              <>
                <p>Ready to import: {builtPayload.name}</p>
                <button type="button" onClick={handleSubmit}>
                  Submit
                </button>
              </>
            )}
            {submitState.status === "submitting" && <p>Submitting…</p>}
            {submitState.status === "success" && (
              <>
                <p>Import successful: {submitState.patternId}</p>
                <button type="button" onClick={onClose}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onImportSuccess?.(submitState.patternId);
                    onClose();
                  }}
                >
                  View Pattern
                </button>
              </>
            )}
            {submitState.status === "conflict" && (
              <p>A pattern with this name already exists.</p>
            )}
            {submitState.status === "error" && (
              <p>Import failed: {submitState.message}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
