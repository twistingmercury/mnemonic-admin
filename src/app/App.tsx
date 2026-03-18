import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WorkspacePlaceholder />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function WorkspacePlaceholder() {
  return (
    <main>
      <h1>Mnemonic Admin</h1>
    </main>
  );
}
