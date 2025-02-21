import React, { useMemo } from "react";
import chroma from "chroma-js";
import { useControls, folder } from "leva";
import { useMappingContext } from "~/context/MappingContext";
import _ from "lodash";

import Boxes from "~/components/Boxes";
import { ParseResult } from "~/types/ParseResult";
import {
  mostCommonDimX,
  mostCommonDimY,
  mostCommonDimZ,
  mostCommonX,
  mostCommonY,
  mostCommonZ,
} from "~/utils/common";

/**
 * Helper function to find a matching header from a list of common names
 * @param {string[]} popularArray - Array of common names to search for
 * @param {string[]} headers - Available headers in the data
 * @returns {string} Matching header name or empty string if not found
 */
const findPopularHeader = (popularArray: string[], headers: string[]) => {
  return (
    headers.find((v) =>
      popularArray.includes(v?.toString().toLocaleLowerCase())
    ) || ""
  );
};

/**
 * A component that provides a user interface for mapping block model data properties
 * to visual attributes in the 3D visualization. It allows users to:
 * - Select which property to visualize with colors
 * - Choose a color scale for the visualization
 * - Map data columns to spatial coordinates (X, Y, Z)
 * - Configure block dimensions either from data columns or fixed values
 * - Adjust visual parameters like scale and edge visibility
 *
 * @component
 * @param {Object} props - Component props
 * @param {ParseResult} props.data - Parsed block model data containing data array and metadata
 *
 * @example
 * <MappingWidget
 *   data={{
 *     data: [...],
 *     meta: { fields: ["x", "y", "z", "grade", "rock_type"] }
 *   }}
 * />
 */
const MappingWidget = ({ data }: { data: ParseResult }) => {
  const { selectedProperty, setSelectedProperty, setColorScale } =
    useMappingContext();
  const headers = useMemo(() => {
    return data?.meta.fields || [];
  }, [data]);
  const mapping = useControls("Block Model", {
    "Property Selection": folder({
      property: {
        value: "",
        options: headers,
        hint: "Property to visualize",
        onChange: (value) => setSelectedProperty(value),
      },
      colorscale: {
        value: "Viridis",
        options: Object.keys(chroma.brewer),
        hint: "Color scale for the property",
        onChange: (value) => setColorScale(value),
      },
      hideValue: {
        value: "NaN",
        label: "hide value",
        hint: "Hide blocks with this value (e.g. 0)",
      },
    }),

    Coordinates: folder({
      x: {
        value: findPopularHeader(mostCommonX, headers),
        options: headers,
        hint: "X coordinate",
      },
      y: {
        value: findPopularHeader(mostCommonY, headers),
        options: headers,
        hint: "Y coordinate",
      },
      z: {
        value: findPopularHeader(mostCommonZ, headers),
        options: headers,
        hint: "Z coordinate",
      },
    }),

    "Block Dimensions": folder({
      use_dimension_columns: {
        value: true,
        label: "use dimension columns",
        hint: "Use dimension columns instead of block dimension values",
      },
      dim_x: {
        value: findPopularHeader(mostCommonDimX, headers),
        options: headers,
        render: (get) =>
          get("Block Model.Block Dimensions.use_dimension_columns"),
        hint: "Dimension of the block in the x direction",
      },
      dim_y: {
        value: findPopularHeader(mostCommonDimY, headers),
        options: headers,
        render: (get) =>
          get("Block Model.Block Dimensions.use_dimension_columns"),
        hint: "Dimension of the block in the y direction",
      },
      dim_z: {
        value: findPopularHeader(mostCommonDimZ, headers),
        options: headers,
        render: (get) =>
          get("Block Model.Block Dimensions.use_dimension_columns"),
        hint: "Dimension of the block in the z direction",
      },
      block_dimension: {
        value: { x: 5, y: 5, z: 5 },
        joystick: false,
        render: (get) =>
          !get("Block Model.Block Dimensions.use_dimension_columns"),
        label: "block dimension",
        hint: "Fixed dimensions for all blocks when not using dimension columns",
      },
    }),

    "Visual Options": folder({
      showEdges: {
        value: false,
        label: "toggle edges",
        hint: "Show blocks edges. Can lead to performance issues",
      },
      zScale: {
        value: 1,
        min: 1,
        step: 1,
        label: "z exageration",
        hint: "Scale factor for the Z axis",
      },
    }),
  });

  const boxesData = useMemo(() => {
    return selectedProperty
      ? data?.data?.filter((item) => {
          const value = item[selectedProperty];
          const hideValue = mapping.hideValue?.trim()?.toLowerCase();

          // If hideValue is empty, show all values
          if (!hideValue) {
            return true;
          }

          // Handle NaN values
          if (hideValue === "nan") {
            return !Number.isNaN(value) && value !== "nan" && value !== "NaN";
          }

          // Handle numeric values
          const numericHideValue = Number(hideValue);
          if (!Number.isNaN(numericHideValue)) {
            return Number(value) !== numericHideValue && value !== hideValue;
          }

          // Handle string values
          return value !== hideValue;
        })
      : data?.data;
  }, [selectedProperty, mapping.hideValue, data]);

  type MappingKeys = keyof typeof mapping;

  return (
    <>
      {["x", "y", "z"].every((v) => {
        return !!mapping[v as MappingKeys];
      }) && (
        <Boxes data={boxesData} mapping={mapping} arrow={data.meta.arrow} />
      )}
    </>
  );
};

export default MappingWidget;
