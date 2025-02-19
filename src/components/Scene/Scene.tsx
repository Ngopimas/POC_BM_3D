import React, { Suspense, useRef } from "react";
import {
  ArcballControls,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
} from "@react-three/drei";
import MappingWidget from "../MappingWidget";
import { ParseResult } from "~/interfaces/ParseResult";
import { Perf } from "r3f-perf";
import { useControls, button } from "leva";
import { useFrame, useThree } from "@react-three/fiber";

// @ts-ignore
const devEnv = import.meta.env?.DEV;

interface Props {
  parsedData: ParseResult | null;
}

/**
 * A component that sets up the 3D scene for block model visualization.
 * It handles camera setup, lighting, controls, and various UI elements like axes and performance monitor.
 *
 * @component
 * @param {Object} props - Component props
 * @param {ParseResult | null} props.parsedData - Parsed block model data containing data array and metadata
 *
 * @example
 * <Scene
 *   parsedData={{
 *     data: [...blockModelData],
 *     meta: { fields: ["x", "y", "z", "grade"] },
 *     arrow: arrowTable
 *   }}
 * />
 */
function Scene({ parsedData }: Props) {
  const controls = useControls(
    "Global Settings",
    {
      toggle_axes: {
        value: true,
        label: "toggle axes",
        hint: "Toggle the bottom left axes",
      },
      toggle_perf: {
        value: false,
        label: "toggle perf",
        hint: "Toggle the performance monitor",
      },
    },
    {
      collapsed: true,
    }
  );
  return (
    <>
      <ArcballControls makeDefault />

      <PerspectiveCamera
        makeDefault
        position={[0, 430, 120]}
        fov={75}
        near={10}
        far={500000}
      />

      <ambientLight />

      <Suspense fallback={null}>
        {parsedData?.data && <MappingWidget data={parsedData} />}
      </Suspense>

      <Screenshot />

      <GizmoHelper alignment="bottom-left" visible={controls["toggle_axes"]}>
        <GizmoViewport
          visible={controls["toggle_axes"]}
          labels={["X", "Z", "Y"]}
        />
      </GizmoHelper>

      {controls["toggle_perf"] && (
        <Perf position="bottom-right" minimal={!devEnv} />
      )}
    </>
  );
}

export default Scene;

/**
 * A component that adds screenshot functionality to the scene.
 * It creates a button in the global settings folder that, when clicked,
 * opens a new window containing a screenshot of the current scene view.
 *
 * @component
 * @example
 * <Screenshot />
 */
const Screenshot = () => {
  const cameraRef = useRef<THREE.Camera>();
  const { gl, scene, camera } = useThree((state) => state);
  useFrame((state) => (cameraRef.current = state.camera));
  useControls("Global Settings", {
    SCREENSHOT: button(() => {
      // open in new window
      const w = window.open("", "") as Window;
      w.document.title = "Screenshot";
      const img = new Image();
      gl.render(scene, cameraRef.current || camera);
      img.src = gl.domElement.toDataURL();
      w.document.body.appendChild(img);
    }),
  });
  return null;
};
