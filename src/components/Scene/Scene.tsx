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
      // Create a canvas to compose the final image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Render scene to get its dimensions
      gl.render(scene, cameraRef.current || camera);
      const sceneImg = new Image();
      sceneImg.src = gl.domElement.toDataURL();

      // Set canvas size to match scene
      canvas.width = sceneImg.width || gl.domElement.width;
      canvas.height = sceneImg.height || gl.domElement.height;

      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw scene first
      await new Promise((resolve) => {
        sceneImg.onload = () => {
          ctx.drawImage(sceneImg, 0, 0);
          resolve(true);
        };
      });

      // Add legend if it exists
      const legendElement = document.querySelector(
        "#color-legend"
      ) as HTMLElement;
      if (legendElement) {
        const legendImg = new Image();
        legendImg.src = await htmlToImage(legendElement);
        await new Promise((resolve) => {
          legendImg.onload = () => {
            const scale = 1.5; // Scale the legend by 1.5x
            ctx.drawImage(
              legendImg,
              20, // x position
              20, // y position
              legendImg.width * scale,
              legendImg.height * scale
            );
            resolve(true);
          };
        });
      }

      // Open image in new tab with HTML document
      const image = canvas.toDataURL("image/png");
      const newTab = window.open("", "_blank");
      if (newTab) {
        newTab.document.write(`
          <html>
            <head><title>Screenshot</title></head>
            <body style="margin: 0; background: white;">
              <img src="${image}" style="max-width: 100%; height: auto;" />
            </body>
          </html>
        `);
        newTab.document.close();
      }
    }),
  });
  return null;
};
