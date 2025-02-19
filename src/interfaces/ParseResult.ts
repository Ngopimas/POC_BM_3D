import { ArrowTable } from "./ArrowTable";

export interface ParseResult {
  data: { [key: string]: string }[];
  errors?: unknown[];
  meta: {
    aborted?: boolean;
    cursor?: number;
    delimiter?: string;
    fields: string[];
    linebreak?: string;
    truncated?: boolean;
    arrow: ArrowTable;
  };
}
