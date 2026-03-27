export interface FilterState {
  tags: string;
  language: string;
  domain: string;
}

export const EMPTY_FILTERS: FilterState = {
  tags: "",
  language: "",
  domain: "",
};
