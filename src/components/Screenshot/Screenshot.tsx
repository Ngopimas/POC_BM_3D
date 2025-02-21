import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useRef } from "react";

import { htmlToImage } from "~/utils/dom";

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

export default Screenshot;
