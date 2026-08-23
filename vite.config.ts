import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const mnemonicApiUrl = env.MNEMONIC_API_URL?.trim();

  if (!mnemonicApiUrl) {
    throw new Error(
      "MNEMONIC_API_URL must be set to the Mnemonic API origin (for example, http://localhost:8080).",
    );
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/v1/api": mnemonicApiUrl,
      },
    },
  };
});
