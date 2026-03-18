import { BrowserRouter, Route, Routes } from "react-router";

function WorkspacePlaceholder() {
  return (
    <main>
      <h1>Mnemonic Admin</h1>
    </main>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspacePlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}
