import React, {
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";
import _ from "lodash";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { ArrowTable } from "~/types/ArrowTable";
import CrossSectionWidget from "~/components/CrossSectionWidget";
import { useColorManagement } from "~/hooks/useColorManagement";
import { useMappingContext } from "~/context/MappingContext";

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
  showTooltips?: boolean;
}

/**
 * Tooltip component to display basic block properties on hover
 * and show copy feedback
 */
const BlockTooltip = ({
  data,
  visible,
  position,
  selectedProperty,
  positionProps,
  showCopyFeedback,
}: {
  data: { [key: string]: string } | null;
  visible: boolean;
  position: THREE.Vector3;
  selectedProperty: string;
  positionProps: { x: string; y: string; z: string };
  showCopyFeedback: boolean;
}) => {
  if (!visible || !data) return null;

  // Extract only the position and selected property for display
  const basicInfo: { [key: string]: string } = {};

  // Add selected property if it exists
  if (selectedProperty && data[selectedProperty]) {
    basicInfo[selectedProperty] = data[selectedProperty];
  }

  // Add position values
  if (positionProps.x && data[positionProps.x]) {
    basicInfo["X"] = data[positionProps.x];
  }
  if (positionProps.y && data[positionProps.y]) {
    basicInfo["Y"] = data[positionProps.y];
  }
  if (positionProps.z && data[positionProps.z]) {
    basicInfo["Z"] = data[positionProps.z];
  }

  return (
    <Html position={position}>
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          transform: "translate3d(-50%, -100%, 0)",
          maxWidth: "300px",
          pointerEvents: "none", // Disable pointer events to allow clicking through
        }}
      >
        <>
          {Object.entries(basicInfo).map(([key, value]) => (
            <div key={key} style={{ margin: "2px 0" }}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
          <div
            style={{
              marginTop: "5px",
              fontSize: "10px",
              color: showCopyFeedback ? "#4ade80" : "#aaa", // Green color for success
              fontWeight: "bold",
              textAlign: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              paddingTop: "4px",
            }}
          >
            {showCopyFeedback
              ? "Copied to clipboard!"
              : "Click block to copy block values"}
          </div>
        </>
      </div>
    </Html>
  );
};

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
 * @param {boolean} [props.showTooltips=true] - Whether to show tooltips on hover
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
 *   showTooltips={true}
 * />
 */
function Boxes({ data = [], mapping, arrow, showTooltips = true }: Props) {
  const [clippingPlane, setClippingPlane] = useState<THREE.Plane | null>(null);
  const { selectedProperty, colorScale } = useMappingContext();
  const [hoveredBlock, setHoveredBlock] = useState<{
    data: { [key: string]: string } | null;
    position: THREE.Vector3;
    instanceId: number | null;
    matrix: THREE.Matrix4 | null;
  }>({
    data: null,
    position: new THREE.Vector3(),
    instanceId: null,
    matrix: null,
  });
  const [showCopyFeedback, setShowCopyFeedback] = useState<boolean>(false);

  const ref = useRef<THREE.InstancedMesh>();
  const edgesRef = useRef<THREE.InstancedMesh>();
  const highlightRef = useRef<THREE.Mesh>();
  const { raycaster, camera } = useThree();

  const { property, colorscale } = mapping;
  const { colorArray } = useColorManagement({
    data,
    arrow,
    property: selectedProperty || property,
    colorscale: colorScale || colorscale,
  });

  const copyBlockDataToClipboard = useCallback(
    (blockData: { [key: string]: string } | null) => {
      if (blockData) {
        console.log("Copying block data:", blockData);

        try {
          navigator.clipboard
            .writeText(JSON.stringify(blockData))
            .then(() => {
              // Show feedback in tooltip
              setShowCopyFeedback(true);

              setTimeout(() => {
                setShowCopyFeedback(false);
              }, 800);
            })
            .catch((err) => {
              console.error("Failed to copy block data: ", err);
            });
        } catch (error) {
          console.error("Error during clipboard operation:", error);
        }
      } else {
        console.warn("No block data to copy");
      }
    },
    []
  );

  // Check if the mouse is over a UI element
  const isMouseOverUI = (event: MouseEvent): boolean => {
    // Check if the mouse is over the Leva panel
    const levaPanel = document.querySelector(".leva-c-kWgxhW");
    if (levaPanel) {
      const rect = levaPanel.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return true;
      }
    }

    // Check if the mouse is over any other UI element with the class 'top-panel'
    const topPanel = document.querySelector(".top-panel");
    if (topPanel) {
      const rect = topPanel.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return true;
      }
    }

    return false;
  };

  // Handle pointer move to detect hovered blocks
  const handlePointerMove = (event: MouseEvent) => {
    // If mouse is over UI, clear hover state and return
    if (isMouseOverUI(event)) {
      if (hoveredBlock.instanceId !== null) {
        setHoveredBlock({
          data: null,
          position: new THREE.Vector3(),
          instanceId: null,
          matrix: null,
        });
      }
      return;
    }

    if (!ref.current || !data.length || !showTooltips) {
      if (hoveredBlock.instanceId !== null) {
        setHoveredBlock({
          data: null,
          position: new THREE.Vector3(),
          instanceId: null,
          matrix: null,
        });
      }
      return;
    }

    // Convert mouse position to normalized device coordinates
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Update the raycaster with the mouse position and camera
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with the instanced mesh
    const intersects = raycaster.intersectObject(ref.current);

    if (intersects.length > 0) {
      // Get the instance ID of the intersected block
      const instanceId = intersects[0].instanceId;

      if (
        instanceId !== undefined &&
        instanceId > 0 &&
        instanceId <= data.length
      ) {
        // Get the data for the hovered block
        const blockData = data[instanceId - 1];

        // Get the matrix for the hovered block
        const matrix = new THREE.Matrix4();
        ref.current.getMatrixAt(instanceId, matrix);

        // Set the hovered block data and position
        setHoveredBlock({
          data: blockData,
          position: intersects[0].point,
          instanceId: instanceId,
          matrix: matrix,
        });
        return;
      }
    }

    // No intersection, clear the hovered block
    setHoveredBlock({
      data: null,
      position: new THREE.Vector3(),
      instanceId: null,
      matrix: null,
    });
  };

  // Handle click event for copying block data
  const handleClick = (event: MouseEvent) => {
    // If mouse is over UI, don't do anything
    if (isMouseOverUI(event)) {
      return;
    }

    // If we're hovering over a block, copy its data and prevent the click from reaching the Leva panel
    if (hoveredBlock.instanceId !== null && hoveredBlock.data) {
      copyBlockDataToClipboard(hoveredBlock.data);
      event.stopPropagation();
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("click", handleClick);

    if (showTooltips) {
      window.addEventListener("mousemove", handlePointerMove);
    }

    return () => {
      window.removeEventListener("click", handleClick);
      if (showTooltips) {
        window.removeEventListener("mousemove", handlePointerMove);
      }
    };
  }, [data, ref.current, showTooltips, handleClick, handlePointerMove]);

  useLayoutEffect(() => {
    if (!data.length) return;

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

      if (ref.current && "setMatrixAt" in ref.current) {
        ref.current.setMatrixAt(i + 1, obj.matrix);
      }
      if (edgesRef.current && "setMatrixAt" in edgesRef.current) {
        edgesRef.current.setMatrixAt(i + 1, obj.matrix);
      }
    }

    if (ref.current?.instanceMatrix) {
      ref.current.instanceMatrix.needsUpdate = true;
    }
    if (edgesRef.current?.instanceMatrix) {
      edgesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, mapping]);

  // Update the highlight mesh when the hovered block changes
  useLayoutEffect(() => {
    if (
      !highlightRef.current ||
      !hoveredBlock.instanceId ||
      hoveredBlock.instanceId <= 0
    ) {
      if (highlightRef.current) {
        highlightRef.current.visible = false;
      }
      return;
    }

    // Get the index of the hovered block in the data array
    const index = hoveredBlock.instanceId - 1;
    if (index < 0 || index >= data.length) {
      return;
    }

    // Get the block data
    const blockData = data[index];

    // Calculate position
    const xOrigin = Number(data[0][mapping["x"]]) + 1;
    const yOrigin = Number(data[0][mapping["y"]]) + 1;
    const zOrigin = Number(data[0][mapping["z"]]) + 1;

    const x = Number(blockData[mapping["x"]]) - xOrigin;
    const y = Number(blockData[mapping["y"]]) - yOrigin;
    const z = Number(blockData[mapping["z"]]) - zOrigin;

    // Calculate dimensions
    const dimX = mapping["use_dimension_columns"]
      ? Number(blockData[mapping["dim_x"]])
      : _.get(mapping, ["block_dimension", "x"]);

    const dimY = mapping["use_dimension_columns"]
      ? Number(blockData[mapping["dim_y"]])
      : _.get(mapping, ["block_dimension", "y"]);

    const dimZ = mapping["use_dimension_columns"]
      ? Number(blockData[mapping["dim_z"]])
      : _.get(mapping, ["block_dimension", "z"]);

    // Position the highlight mesh
    highlightRef.current.position.set(x, z * mapping["zScale"], -y);

    // Scale the highlight mesh to match the block dimensions
    highlightRef.current.scale.set(dimX, dimZ * mapping["zScale"], dimY);

    // Make the highlight mesh visible
    highlightRef.current.visible = true;
    highlightRef.current.matrixAutoUpdate = true;
  }, [hoveredBlock, data, mapping]);

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
        onClick={(e) => {
          e.stopPropagation();
          if (hoveredBlock.data) {
            copyBlockDataToClipboard(hoveredBlock.data);
          }
        }}
      >
        <boxGeometry>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colorArray, 3]}
          />
        </boxGeometry>
        <meshBasicMaterial
          vertexColors={true}
          side={THREE.DoubleSide}
          clippingPlanes={clippingPlane ? [clippingPlane] : undefined}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Highlight mesh for hovered block */}
      <mesh ref={highlightRef as React.Ref<THREE.Mesh>} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="red"
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.2}
          depthTest={false}
          clippingPlanes={clippingPlane ? [clippingPlane] : undefined}
        />
      </mesh>

      {/* Tooltip for hovered block */}
      {showTooltips && (
        <BlockTooltip
          data={hoveredBlock.data}
          visible={hoveredBlock.instanceId !== null}
          position={hoveredBlock.position}
          selectedProperty={selectedProperty || property || ""}
          positionProps={{
            x: mapping.x,
            y: mapping.y,
            z: mapping.z,
          }}
          showCopyFeedback={showCopyFeedback}
        />
      )}

      {/* Edges for blocks */}
      {mapping["showEdges"] && (
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
            transparent
            opacity={0.1}
            depthWrite={false}
            clippingPlanes={clippingPlane ? [clippingPlane] : undefined}
          />
        </instancedMesh>
      )}
    </>
  );
}

export default Boxes;
