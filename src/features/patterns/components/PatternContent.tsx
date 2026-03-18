import type { PatternDetail } from "../api/types";

interface PatternContentProps {
  pattern: PatternDetail;
}

export function PatternContent({ pattern }: PatternContentProps) {
  return (
    <section aria-label="Pattern content" style={{ overflow: "auto" }}>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {pattern.content}
      </pre>
    </section>
  );
}
