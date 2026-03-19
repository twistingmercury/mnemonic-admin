import type { ParsedPatternFile } from "./patternFileParser";
import type { CreatePatternBody } from "../patterns/api/types";

const DEFAULT_AGENT_RELEVANCE = 0.8;

export function buildPatternPayload(
  parsed: ParsedPatternFile,
): CreatePatternBody {
  const { frontmatter, body } = parsed;

  const payload: CreatePatternBody = {
    name: frontmatter["name"] as string,
    description: frontmatter["description"] as string,
    content: body,
  };

  const tags = frontmatter["tags"];
  if (tags !== undefined) {
    payload.tags = Array.isArray(tags) ? tags : [tags];
  }

  const language = frontmatter["language"];
  if (typeof language === "string") {
    payload.language = language;
  }

  const domain = frontmatter["domain"];
  if (typeof domain === "string") {
    payload.domain = domain;
  }

  const entityType = frontmatter["entity_type"];
  if (typeof entityType === "string") {
    payload.entity_type = entityType;
  }

  const agents = frontmatter["agents"];
  if (agents !== undefined) {
    const agentList = Array.isArray(agents) ? agents : [agents];
    payload.agent_associations = agentList.map((agent_name) => ({
      agent_name,
      relevance: DEFAULT_AGENT_RELEVANCE,
    }));
  }

  return payload;
}
