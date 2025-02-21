import {
  ArcballControls,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
} from "@react-three/drei";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { Suspense } from "react";

import { ParseResult } from "~/types/ParseResult";
import ErrorBoundary from "../ErrorBoundary";
import MappingWidget from "../MappingWidget";
import Screenshot from "../Screenshot";

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
    <ErrorBoundary>
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

      {controls["toggle_perf"] && <Perf position="bottom-right" />}
    </ErrorBoundary>
  );
}

export default Scene;
