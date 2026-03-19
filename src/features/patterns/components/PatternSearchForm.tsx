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

  function handleClear() {
    setInputValue("");
    onSearch("");
  }

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="text"
          aria-label="Search patterns"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search patterns…"
          className="min-w-0 flex-1"
        />
        {inputValue && (
          <button type="button" onClick={handleClear} aria-label="Clear">
            Clear
          </button>
        )}
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
