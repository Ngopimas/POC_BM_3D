import { Dictionary, Int32, Table, Utf8 } from "apache-arrow";

export type ArrowTable = Table<{
  [x: string]: Dictionary<Utf8, Int32>;
}>;
