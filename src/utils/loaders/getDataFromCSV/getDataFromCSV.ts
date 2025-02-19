import { load } from "@loaders.gl/core";
import { DataType } from "@loaders.gl/loader-utils";
import { CSVLoader } from "@loaders.gl/csv";

/**
 * Loads and parses CSV data asynchronously with specified configuration.
 * 
 * @param {DataType} data - The CSV data to be loaded and parsed
 * @returns {Promise<Object>} A promise that resolves to the parsed CSV data with headers
 * 
 * @example
 * const csvData = new File([csvString], 'data.csv');
 * const parsedData = await getDataFromCSV(csvData);
 * console.log(parsedData.data); // Array of objects with header keys
 */
const getDataFromCSV = async (data: DataType) => {
  return await load(data, CSVLoader, {
    csv: {
      skipEmptyLines: true,
      header: true,
    },
  });
};

export default getDataFromCSV;
