import React, { useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import _ from "lodash";

import { ArrowTable } from "~/interfaces/ArrowTable";
import CrossSectionWidget from "~/components/CrossSectionWidget";
import { useColorManagement } from "~/hooks/useColorManagement";

const obj = new THREE.Object3D();

interface Props {
  data: { [key: string]: string }[];
  arrow: ArrowTable;
  mapping: {
    property?: string;
    colorscale?: string;
    x: string;
    y: string;
    z: string;
    use_dimension_columns: boolean;
    dim_x: string;
    dim_y: string;
    dim_z: string;
    block_dimension: {
      x: number;
      y: number;
      z: number;
    };
    zScale: number;
    showEdges: boolean;
    hidden?: boolean;
  };
}

/**
 * A 3D visualization component that renders blocks.
 * It supports dynamic coloring, cross-sectioning, and edge visualization of blocks based on provided data.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object[]} props.data - Array of data objects containing block model information
 * @param {ArrowTable} props.arrow - Apache Arrow table containing the block model data
 * @param {Object} props.mapping - Configuration object for block visualization
 * @param {string} props.mapping.property - Property name to use for block coloring
 * @param {string} props.mapping.colorscale - Color scale to apply for the property values
 * @param {string} props.mapping.x - Column name for X coordinates
 * @param {string} props.mapping.y - Column name for Y coordinates
 * @param {string} props.mapping.z - Column name for Z coordinates
 * @param {boolean} props.mapping.use_dimension_columns - Whether to use dimension columns for block sizes
 * @param {string} props.mapping.dim_x - Column name for X dimension when use_dimension_columns is true
 * @param {string} props.mapping.dim_y - Column name for Y dimension when use_dimension_columns is true
 * @param {string} props.mapping.dim_z - Column name for Z dimension when use_dimension_columns is true
 * @param {Object} props.mapping.block_dimension - Default block dimensions when use_dimension_columns is false
 * @param {number} props.mapping.zScale - Scale factor for Z axis
 * @param {boolean} props.mapping.showEdges - Whether to display block edges
 * @param {boolean} [props.mapping.hidden] - Whether to hide the blocks
 *
 * @example
 * <Boxes
 *   data={blockModelData}
 *   arrow={arrowTable}
 *   mapping={{
 *     property: "grade",
 *     colorscale: "viridis",
 *     x: "x",
 *     y: "y",
 *     z: "z",
 *     use_dimension_columns: false,
 *     block_dimension: { x: 10, y: 10, z: 10 },
 *     zScale: 1,
 *     showEdges: true
 *   }}
 * />
 */
function Boxes({ data = [], mapping, arrow }: Props) {
  const [clippingPlane, setClippingPlane] = useState<THREE.Plane | null>(null);

  const ref = useRef<THREE.InstancedMesh>();
  const edgesRef = useRef<THREE.InstancedMesh>();

  const { property, colorscale } = mapping;
  const { colorArray } = useColorManagement({
    data,
    arrow,
    property,
    colorscale,
  });

  useLayoutEffect(() => {
    const xOrigin = Number(data[0][mapping["x"]]) + 1;
    const yOrigin = Number(data[0][mapping["y"]]) + 1;
    const zOrigin = Number(data[0][mapping["z"]]) + 1;

    for (let i = 0; i < data.length; i++) {
      const x = Number(data[i][mapping["x"]]) - xOrigin;
      const y = Number(data[i][mapping["y"]]) - yOrigin;
      const z = Number(data[i][mapping["z"]]) - zOrigin;
      obj.position.set(x, z, -y);
      obj.scale.set(
        mapping["use_dimension_columns"]
          ? Number(data[i][mapping["dim_x"]])
          : _.get(mapping, ["block_dimension", "x"]),
        mapping["use_dimension_columns"]
          ? Number(data[i][mapping["dim_z"]])
          : _.get(mapping, ["block_dimension", "z"]),
        mapping["use_dimension_columns"]
          ? Number(data[i][mapping["dim_y"]])
          : _.get(mapping, ["block_dimension", "y"])
      );
      obj.updateMatrix();
      ref.current?.setMatrixAt(i + 1, obj.matrix);
      edgesRef.current?.setMatrixAt(i + 1, obj.matrix);
    }

    if (ref.current?.instanceMatrix) {
      ref.current.instanceMatrix.needsUpdate = true;
    }
    if (edgesRef.current?.instanceMatrix) {
      edgesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, mapping]);

  return (
    <>
      <CrossSectionWidget
        data={data}
        arrow={arrow}
        mapping={mapping}
        onClipChange={setClippingPlane}
      />
      <instancedMesh
        visible={!mapping["hidden"]}
        ref={ref as React.Ref<THREE.InstancedMesh>}
        args={[, , data.length + 1]}
        scale-y={mapping["zScale"]}
      >
        <boxGeometry>
          <instancedBufferAttribute
            attach={"attributes-color"}
            args={[colorArray, 3]}
          />
        </boxGeometry>
        <meshBasicMaterial
          depthWrite={true}
          vertexColors={true}
          toneMapped={false}
          side={THREE.DoubleSide}
          clippingPlanes={clippingPlane ? [clippingPlane] : null}
        />
      </instancedMesh>
      {mapping.showEdges && (
        <instancedMesh
          visible={!mapping["hidden"]}
          ref={edgesRef as React.Ref<THREE.InstancedMesh>}
          args={[, , data.length + 1]}
          scale-y={mapping["zScale"]}
        >
          <boxGeometry />
          <meshBasicMaterial
            wireframe
            color="black"
            depthWrite={true}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
            clippingPlanes={clippingPlane ? [clippingPlane] : null}
          />
        </instancedMesh>
      )}
    </>
  );
}

export default Boxes;
