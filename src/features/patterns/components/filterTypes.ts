export interface FilterState {
  tags: string;
  language: string;
  domain: string;
  agent_id: string;
}

export const EMPTY_FILTERS: FilterState = {
  tags: "",
  language: "",
  domain: "",
  agent_id: "",
};
