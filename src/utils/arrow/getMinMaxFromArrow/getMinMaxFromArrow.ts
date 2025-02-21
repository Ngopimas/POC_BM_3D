import _ from "lodash";
import { ArrowTable } from "~/types/ArrowTable";

/**
 * Calculates the minimum, maximum, and range values for a specified attribute in an Apache Arrow table.
 *
 * @param {ArrowTable} table - The Apache Arrow table containing the data
 * @param {string} attribute - The name of the column/attribute to analyze
 *
 * @returns {Object} An object containing:
 *   - min: The minimum value in the attribute column (null if not found)
 *   - max: The maximum value in the attribute column (null if not found)
 *   - range: The difference between max and min (null if either max or min is null)
 *
 * @example
 * const table = // Apache Arrow table with 'grade' column
 * const { min, max, range } = getMinMaxFromArrow(table, 'grade');
 * console.log(`Grade range: ${min} to ${max}, span: ${range}`);
 */
const getMinMaxFromArrow = (table: ArrowTable, attribute: string) => {
  if (table && table.getChild(attribute)) {
    const floatArray = table.getChild(attribute)?.toArray();
    const min = _.min(floatArray);
    const max = _.max(floatArray);
    return { min, max, range: _.isNil(max) || _.isNil(min) ? null : max - min };
  }
  return { min: null, max: null, range: null };
};

export default getMinMaxFromArrow;
