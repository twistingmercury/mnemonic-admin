import { useState } from "react";

interface PatternSearchFormProps {
  onSearch: (query: string) => void;
  activeQuery: string;
}

export function PatternSearchForm({
  onSearch,
  activeQuery,
}: PatternSearchFormProps) {
  const [inputValue, setInputValue] = useState(activeQuery);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    onSearch(trimmed);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", width: "100%" }}>
        <input
          type="text"
          aria-label="Search patterns"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search patterns…"
          style={{ flex: 1 }}
        />
        <button type="submit">Search</button>
      </form>
      {activeQuery && (
        <div aria-label="Active query">
          Query: <span>{activeQuery}</span>
        </div>
      )}
    </div>
  );
}
