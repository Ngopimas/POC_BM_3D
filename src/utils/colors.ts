import chroma from "chroma-js";
import _ from "lodash";

import { ArrowTable } from "~/types/ArrowTable";
import { ColorsScales } from "~/types/ColorsScales";
import { getMinMaxFromArrow } from "~/utils/arrow";

export const DEFAULT_COLOR = "#FDE725";

interface GetColorFromArrowTableProps {
  table: ArrowTable;
  attribute?: string;
  colorscale?: ColorsScales;
}

/**
 * Creates a color mapping function based on data from an Apache Arrow table.
 * This function generates a color scale based on the min/max values of a specified attribute
 * in the table, using the provided color scale.
 *
 * @param {GetColorFromArrowTableProps} props - Configuration object
 * @param {ArrowTable} props.table - Apache Arrow table containing the data
 * @param {string} props.attribute - Name of the attribute/column to use for color mapping
 * @param {ColorsScales} [props.colorscale="Viridis"] - Color scale to use (defaults to "Viridis")
 *
 * @returns {Function} A function that takes a numeric value and returns a hex color code.
 * If no valid attribute or min/max values are found, returns a function that always returns DEFAULT_COLOR.
 *
 * @example
 * const colorMapper = getColorFromArrowTable({
 *   table: arrowTable,
 *   attribute: "grade",
 *   colorscale: "Viridis"
 * });
 *
 * const color = colorMapper(42); // Returns a hex color code like "#4C9F39"
 */
export const getColorFromArrowTable = ({
  table,
  attribute,
  colorscale = "Viridis",
}: GetColorFromArrowTableProps) => {
  if (attribute) {
    const { min, max } = getMinMaxFromArrow(table, attribute);
    if (!_.isNil(min) && !_.isNil(max)) {
      const cb = chroma.scale(colorscale).domain([min, max]);
      return (val: number) => cb(val).hex();
    }
  }
  return () => DEFAULT_COLOR;
};
