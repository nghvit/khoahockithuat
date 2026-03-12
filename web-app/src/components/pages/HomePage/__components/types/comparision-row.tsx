import { ComparisonCell } from "./comparision-cell";

export type ComparisonRow = {
  icon: string;
  label: string;
  chatgpt: ComparisonCell;
  support: ComparisonCell;
  emphasis?: boolean;
};
