import React from "react";
import { useControls } from "leva";
import type { MeshProps } from "@react-three/fiber";
import * as THREE from "three";
import _ from "lodash";

import HelperPlane from "~/components/HelperPlane";
import { ArrowTable } from "~/types/ArrowTable";
import { getMinMaxFromArrow } from "~/utils/arrow";

const plane = new THREE.Plane();

/**
 * Add safety checks and default values
 * @param value - The value to round
 * @returns The rounded value or 0 if the value is invalid
 */
const safeRound = (value: any) => {
  if (_.isNil(value)) return 0;
  const num = Number(value);
  return _.isNaN(num) ? 0 : _.round(num);
};

interface Props {
  data: { [key: string]: string }[];
  arrow: ArrowTable;
  mapping: {
    x: string;
    y: string;
    z: string;
    zScale: number;
  };
  onClipChange?: (plane: THREE.Plane | null) => void;
}

/**
 * A component that provides interactive cross-section visualization for 3D block models.
 * It allows users to create and manipulate clipping planes along different axes (x, y, z)
 * to view inside the block model.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object[]} props.data - Array of data objects containing block model information
 * @param {ArrowTable} props.arrow - Apache Arrow table containing the block model data
 * @param {Object} props.mapping - Configuration object for cross-section visualization
 * @param {string} props.mapping.x - Column name for X coordinates
 * @param {string} props.mapping.y - Column name for Y coordinates
 * @param {string} props.mapping.z - Column name for Z coordinates
 * @param {number} props.mapping.zScale - Scale factor for Z axis
 * @param {function} [props.onClipChange] - Callback function triggered when the clipping plane changes
 *
 * @example
 * <CrossSectionWidget
 *   data={blockModelData}
 *   arrow={arrowTable}
 *   mapping={{
 *     x: "x",
 *     y: "y",
 *     z: "z",
 *     zScale: 1
 *   }}
 *   onClipChange={(plane) => console.log("Clipping plane changed:", plane)}
 * />
 */
const CrossSectionWidget = ({ data, arrow, mapping, onClipChange }: Props) => {
  const clipDirections = ["x", "y", "z"];

  const startX = safeRound(data?.[0]?.[mapping["x"]]);
  const startY = safeRound(data?.[0]?.[mapping["y"]]);
  const startZ = safeRound(data?.[0]?.[mapping["z"]]);

  const { min: minX, max: maxX } = getMinMaxFromArrow(arrow, mapping["x"]);
  const { min: minY, max: maxY } = getMinMaxFromArrow(arrow, mapping["y"]);
  const { min: minZ, max: maxZ } = getMinMaxFromArrow(arrow, mapping["z"]);

  const controls = useControls(
    "Cross Section",
    {
      active: false,
      direction: {
        value: clipDirections[0],
        options: clipDirections,
      },
      "x position": {
        value: startX,
        min: Number(minX) - 1,
        max: Number(maxX) + 1,
        step: 1,
        render: (get) => get("Cross Section.direction") === "x",
      },
      "y position": {
        value: startY,
        min: Number(minY) - 1,
        max: Number(maxY) + 1,
        step: 1,
        render: (get) => get("Cross Section.direction") === "y",
      },
      "z position": {
        value: startZ,
        step: 1,
        render: (get) => get("Cross Section.direction") === "z",
      },
    },
    {
      collapsed: true,
    }
  );

  const getHelperPlaneProps = (): MeshProps & {
    width?: number;
    height?: number;
  } => {
    switch (controls.direction) {
      case "x":
        return {
          width: Math.abs(Number(maxY) - Number(minY)),
          height: Math.abs(Number(maxZ) - Number(minZ)),
          position: [controls["x position"] - startX - 1, 0, 0],
          rotation: [0, Math.PI / 2, 0],
        };
      case "y":
        return {
          width: Math.abs(Number(maxX) - Number(minX)),
          height: Math.abs(Number(maxZ) - Number(minZ)),
          position: [0, 0, startY - controls["y position"] + 1],
        };
      case "z":
        return {
          width: Math.abs(Number(maxX) - Number(minX)),
          height: Math.abs(Number(maxY) - Number(minY)),
          position: [0, startZ - controls["z position"] + 1, 0],
          rotation: [Math.PI / 2, 0, 0],
        };
      default:
        return {};
    }
  };

  const getClippingPlane = (): THREE.Plane => {
    switch (controls.direction) {
      case "x":
        return plane.setComponents(
          startX - controls["x position"] + 1 || 0.5,
          0,
          0,
          1
        );
      case "y":
        return plane.setComponents(
          0,
          0,
          controls["y position"] - startY - 1 || 0.5,
          1
        );
      case "z":
        return plane.setComponents(
          0,
          controls["z position"] - startZ - 1 || 0.5,
          0,
          1
        );
      default:
        return plane.setComponents(1, 0, 0, 1);
    }
  };

  React.useEffect(() => {
    if (onClipChange) {
      onClipChange(controls.active ? getClippingPlane() : null);
    }
  }, [
    controls.active,
    controls.direction,
    controls["x position"],
    controls["y position"],
    controls["z position"],
    onClipChange,
  ]);

  const dataBounds = {
    minX: Number(minX) - 1,
    maxX: Number(maxX) + 1,
    minY: Number(minY) - 1,
    maxY: Number(maxY) + 1,
    minZ: Number(minZ) - 1,
    maxZ: Number(maxZ) + 1,
  };

  return (
    <>
      {controls.active && (
        <HelperPlane
          dataBounds={dataBounds}
          zScale={mapping["zScale"]}
          {...getHelperPlaneProps()}
        />
      )}
    </>
  );
};

export default CrossSectionWidget;
