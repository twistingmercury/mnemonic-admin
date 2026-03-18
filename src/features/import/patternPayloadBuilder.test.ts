import { describe, it, expect } from "vitest";
import { buildPatternPayload } from "./patternPayloadBuilder";
import type { ParsedPatternFile } from "./patternFileParser";

function makeFile(
  frontmatter: Record<string, string | string[]>,
  body = "## Overview\n\n[//]: pattern\n\nSome content.",
): ParsedPatternFile {
  return { frontmatter, body };
}

describe("buildPatternPayload", () => {
  it("maps required fields", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "Test Pattern", description: "A description" }),
    );

    expect(payload.name).toBe("Test Pattern");
    expect(payload.description).toBe("A description");
    expect(payload.content).toBe(
      "## Overview\n\n[//]: pattern\n\nSome content.",
    );
  });

  it("maps tags as array", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d", tags: ["a", "b"] }),
    );

    expect(payload.tags).toEqual(["a", "b"]);
  });

  it("maps tags as string into a single-element array", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d", tags: "single" }),
    );

    expect(payload.tags).toEqual(["single"]);
  });

  it("includes optional fields when present", () => {
    const payload = buildPatternPayload(
      makeFile({
        name: "n",
        description: "d",
        language: "typescript",
        domain: "frontend",
        entity_type: "component",
      }),
    );

    expect(payload.language).toBe("typescript");
    expect(payload.domain).toBe("frontend");
    expect(payload.entity_type).toBe("component");
  });

  it("omits optional fields when absent", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d" }),
    );

    expect("language" in payload).toBe(false);
    expect("domain" in payload).toBe(false);
    expect("entity_type" in payload).toBe(false);
  });

  it("converts agents array to agent_associations with default relevance", () => {
    const payload = buildPatternPayload(
      makeFile({
        name: "n",
        description: "d",
        agents: ["agent-alpha", "agent-beta"],
      }),
    );

    expect(payload.agent_associations).toEqual([
      { agent_name: "agent-alpha", relevance: 0.8 },
      { agent_name: "agent-beta", relevance: 0.8 },
    ]);
  });

  it("converts single agent string to agent_associations array", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d", agents: "solo-agent" }),
    );

    expect(payload.agent_associations).toEqual([
      { agent_name: "solo-agent", relevance: 0.8 },
    ]);
  });

  it("omits agent_associations when agents is absent", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d" }),
    );

    expect("agent_associations" in payload).toBe(false);
  });

  it("passes body content through unchanged", () => {
    const specialBody =
      "## Overview\n\nLine 1\nLine 2\n\t tabbed\n[//]: pattern\n<special> & chars";
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d" }, specialBody),
    );

    expect(payload.content).toBe(specialBody);
  });

  it("sets tags to an empty array when tags is an empty array", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d", tags: [] }),
    );

    expect(payload.tags).toEqual([]);
  });

  it("sets agent_associations to an empty array when agents is an empty array", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d", agents: [] }),
    );

    expect(payload.agent_associations).toEqual([]);
  });

  it("omits tags when tags is absent", () => {
    const payload = buildPatternPayload(
      makeFile({ name: "n", description: "d" }),
    );

    expect("tags" in payload).toBe(false);
  });
});
