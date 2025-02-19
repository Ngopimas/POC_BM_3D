import chroma from "chroma-js";

export type ColorsScales = keyof typeof chroma.brewer | "Viridis";
