import { useMemo } from "react";
import * as THREE from "three";
import { getColorFromArrowTable } from "~/utils/colors";
import { ArrowTable } from "~/interfaces/ArrowTable";
import { ColorsScales } from "~/interfaces/ColorsScales";

interface UseColorManagementProps {
  data: { [key: string]: string }[];
  arrow: ArrowTable;
  property?: string;
  colorscale?: string;
}

/**
 * A custom hook that manages color generation for 3D block models based on property values.
 *
 * @param {Object} props - The properties object
 * @param {Object[]} props.data - Array of data objects containing property values
 * @param {ArrowTable} props.arrow - Apache Arrow table containing the block model data
 * @param {string} props.property - The property name to use for color mapping
 * @param {string} props.colorscale - The name of the color scale to apply
 *
 * @returns {Object} An object containing:
 *   - colorArray: Float32Array of RGB color values for each block, with the first entry
 *                being a default gray color (#CCCCCC) and subsequent entries mapped from
 *                the property values using the specified color scale
 *
 * @example
 * const { colorArray } = useColorManagement({
 *   data: blockData,
 *   arrow: arrowTable,
 *   property: "grade",
 *   colorscale: "viridis"
 * });
 */
export const useColorManagement = ({
  data,
  arrow,
  property,
  colorscale,
}: UseColorManagementProps) => {
  const color = new THREE.Color();
  const defaultColor = "#CCCCCC";

  const getColor = useMemo(
    () =>
      getColorFromArrowTable({
        table: arrow,
        attribute: property,
        colorscale: colorscale as ColorsScales,
      }),
    [arrow, property, colorscale]
  );

  const colorArray = useMemo(() => {
    return Float32Array.from(
      Array.from({ length: data.length + 1 }, (_, i) => {
        if (i === 0) {
          return color.set(defaultColor).convertSRGBToLinear().toArray();
        } else {
          const value = Number(data[i - 1][property as string]);
          const hexValue = getColor(value);
          return color.set(hexValue).convertSRGBToLinear().toArray();
        }
      }).flat()
    );
  }, [data, property, getColor]);

  return { colorArray };
};
