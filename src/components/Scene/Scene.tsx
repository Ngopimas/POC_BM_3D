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
import { htmlToImage } from "~/utils/dom";

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
    SCREENSHOT: button(async () => {
      // open in new window
      const w = window.open("", "") as Window;
      w.document.title = "Screenshot";

      // Create container for both scene and legend
      const container = document.createElement("div");
      container.style.position = "relative";

      // Capture scene
      const sceneImg = new Image();
      gl.render(scene, cameraRef.current || camera);
      sceneImg.src = gl.domElement.toDataURL();
      container.appendChild(sceneImg);

      // Capture and position legend
      const legendElement = document.querySelector(
        "#color-legend"
      ) as HTMLElement;
      if (legendElement) {
        const legendImg = new Image();
        legendImg.src = await htmlToImage(legendElement);
        legendImg.style.position = "absolute";
        legendImg.style.left = "20px";
        legendImg.style.top = "20px";
        legendImg.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        container.appendChild(legendImg);
      }

      w.document.body.appendChild(container);
    }),
  });
  return null;
};
