import { parse } from "@loaders.gl/core";
import { ZipLoader } from "@loaders.gl/zip";

/**
 * Loads and extracts files from a ZIP archive asynchronously.
 * 
 * @param {File} file - The ZIP file to be loaded and extracted
 * @returns {Promise<Object>} A promise that resolves to an object containing the extracted files
 * 
 * @example
 * const zipFile = new File([zipBuffer], 'data.zip');
 * const extractedFiles = await getFilesFromZIP(zipFile);
 * console.log(Object.keys(extractedFiles)); // List of files in the ZIP
 */
const getFilesFromZIP = async (file: File) => {
  return await parse(file, ZipLoader);
};

export default getFilesFromZIP;
