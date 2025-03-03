import _ from "lodash";
import { ArrowTable } from "~/types/ArrowTable";

/**
 * Calculates statistics for a specified attribute in an Apache Arrow table.
 *
 * @param {ArrowTable} table - The Apache Arrow table containing the data
 * @param {string} attribute - The name of the column/attribute to analyze
 *
 * @returns {Object} An object containing:
 *   - min: The minimum value in the attribute column (undefined if not found)
 *   - max: The maximum value in the attribute column (undefined if not found)
 *   - range: The difference between max and min (null if either max or min is null)
 *   - count: The number of values in the column
 *   - sum: The sum of all values in the column
 *   - mean: The average of all values in the column
 *   - median: The median value in the column
 *   - stdDev: The standard deviation of values in the column
 *
 * @example
 * const table = // Apache Arrow table with 'grade' column
 * const { min, max, range, mean, median } = getMinMaxFromArrow(table, 'grade');
 * console.log(`Grade range: ${min} to ${max}, mean: ${mean}, median: ${median}`);
 */
const getMinMaxFromArrow = (table: ArrowTable, attribute: string) => {
  if (table && table.getChild(attribute)) {
    const columnData = table.getChild(attribute);
    if (!columnData) {
      return {
        min: null,
        max: null,
        range: null,
        count: 0,
        sum: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
      };
    }

    const floatArray = columnData.toArray();

    // Basic statistics
    const min = _.min(floatArray);
    const max = _.max(floatArray);
    const range = _.isNil(max) || _.isNil(min) ? null : max - min;

    // Additional statistics
    const count = floatArray.length;
    const numericArray = Array.from(floatArray as unknown as ArrayLike<number>);
    const sum = _.sum(numericArray);
    const mean = sum / count;

    // Sort array for median and other calculations
    const sortedArray = [...numericArray].sort((a, b) => a - b);

    // Calculate median
    const midpoint = Math.floor(count / 2);
    const median =
      count % 2 === 0
        ? (sortedArray[midpoint - 1] + sortedArray[midpoint]) / 2
        : sortedArray[midpoint];

    // Calculate standard deviation
    const squareDiffs = numericArray.map((value) => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = _.sum(squareDiffs) / count;
    const stdDev = Math.sqrt(avgSquareDiff);

    return {
      min,
      max,
      range,
      count,
      sum,
      mean,
      median,
      stdDev,
    };
  }

  return {
    min: null,
    max: null,
    range: null,
    count: 0,
    sum: 0,
    mean: 0,
    median: 0,
    stdDev: 0,
  };
};

export default getMinMaxFromArrow;
