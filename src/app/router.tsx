import { BrowserRouter, Route, Routes } from "react-router";
import { PatternWorkspace } from "../features/workspace/PatternWorkspace";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PatternWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}
