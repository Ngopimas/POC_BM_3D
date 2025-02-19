import * as THREE from "three";
import _ from "lodash";
import { useControls, folder } from "leva";
import { MeshProps } from "@react-three/fiber";

interface Props extends MeshProps {
  dataBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  width?: number;
  height?: number;
  zScale?: number;
}

/**
 * A component that renders a helper plane for visualizing cross-sections in 3D block models.
 * This plane serves as a visual guide to show where the clipping plane intersects the model.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} [props.dataBounds] - Boundaries of the data for positioning the helper plane
 * @param {number} props.dataBounds.minX - Minimum X coordinate of the data
 * @param {number} props.dataBounds.maxX - Maximum X coordinate of the data
 * @param {number} props.dataBounds.minY - Minimum Y coordinate of the data
 * @param {number} props.dataBounds.maxY - Maximum Y coordinate of the data
 * @param {number} props.dataBounds.minZ - Minimum Z coordinate of the data
 * @param {number} props.dataBounds.maxZ - Maximum Z coordinate of the data
 * @param {number} [props.width] - Width of the helper plane
 * @param {number} [props.height] - Height of the helper plane
 * @param {number} [props.zScale] - Scale factor for Z axis
 * @param {Array} [props.position] - Position of the helper plane [x, y, z]
 * @param {Array} [props.rotation] - Rotation of the helper plane [x, y, z]
 *
 * @example
 * <HelperPlane
 *   dataBounds={{
 *     minX: 0, maxX: 100,
 *     minY: 0, maxY: 100,
 *     minZ: 0, maxZ: 50
 *   }}
 *   width={100}
 *   height={50}
 *   zScale={1}
 *   position={[0, 25, 0]}
 *   rotation={[Math.PI / 2, 0, 0]}
 * />
 */
function HelperPlane({ dataBounds, position, rotation, ...props }: Props) {
  const { opacity, color, active, width, height } = useControls(
    "Cross Section",
    {
      "Helper Settings": folder(
        {
          active: { value: true, label: "show helper" },
          height: props.height || 1000,
          width: props.width || 5000,
          color: "#ff0000",
          opacity: { value: 0.5, min: 0, max: 1, step: 0.1 },
        },
        { collapsed: true }
      ),
    }
  );
  if (!active) {
    return null;
  }
  return (
    <mesh
      position={position || [0, 0, 0]}
      rotation={rotation || [0, 0, 0]}
      scale={[width, height, 1]}
    >
      <planeGeometry />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  );
}

export default HelperPlane;
