import { load } from "@loaders.gl/core";
import { ArrowLoader } from "@loaders.gl/arrow";

/**
 * Loads and parses an Apache Arrow file asynchronously.
 * 
 * @param {File} file - The Arrow file to be loaded
 * @returns {Promise<ArrowTable>} A promise that resolves to the parsed Arrow table
 * 
 * @example
 * const arrowFile = new File([arrayBuffer], 'data.arrow');
 * const arrowTable = await getDataFromArrow(arrowFile);
 */
const getDataFromArrow = async (file: File) => {
  return await load(file, ArrowLoader);
};

export default getDataFromArrow;
