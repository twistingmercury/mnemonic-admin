// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import viteConfig from "./vite.config";

const configEnv = {
  command: "serve" as const,
  mode: "test",
  isSsrBuild: false,
  isPreview: false,
};

async function getApiProxyTarget(): Promise<string> {
  const config = await viteConfig(configEnv);
  const proxy = config.server?.proxy;

  if (!proxy || typeof proxy === "string" || Array.isArray(proxy)) {
    throw new Error("Expected the Vite proxy to be configured as an object");
  }

  const apiProxy = proxy["/v1/api"];

  if (typeof apiProxy !== "string") {
    throw new Error("Expected the /v1/api proxy target to be a string");
  }

  return apiProxy;
}

let originalMnemonicApiUrl: string | undefined;

beforeEach(() => {
  originalMnemonicApiUrl = process.env.MNEMONIC_API_URL;
  delete process.env.MNEMONIC_API_URL;
});

afterEach(() => {
  vi.unstubAllEnvs();

  if (originalMnemonicApiUrl === undefined) {
    delete process.env.MNEMONIC_API_URL;
    return;
  }

  process.env.MNEMONIC_API_URL = originalMnemonicApiUrl;
});

describe("Vite API proxy configuration", () => {
  it("uses MNEMONIC_API_URL when it is configured", async () => {
    vi.stubEnv("MNEMONIC_API_URL", "https://mnemonic-api.example.test");

    await expect(getApiProxyTarget()).resolves.toBe(
      "https://mnemonic-api.example.test",
    );
  });

  it("fails with actionable guidance when MNEMONIC_API_URL is not configured", async () => {
    await expect(getApiProxyTarget()).rejects.toThrow(
      "MNEMONIC_API_URL must be set to the Mnemonic API origin",
    );
  });

  it("fails with actionable guidance when MNEMONIC_API_URL is empty", async () => {
    vi.stubEnv("MNEMONIC_API_URL", "   ");

    await expect(getApiProxyTarget()).rejects.toThrow(
      "MNEMONIC_API_URL must be set to the Mnemonic API origin",
    );
  });
});
