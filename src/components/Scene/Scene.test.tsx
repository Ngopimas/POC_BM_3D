import React from "react";
import { render } from "@testing-library/react";
import Scene from "./Scene";

// Mock react-three-fiber and drei components
jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    gl: {
      render: jest.fn(),
      domElement: {
        toDataURL: jest.fn(),
        width: 800,
        height: 600,
      },
    },
    scene: {},
    camera: {},
  })),
}));

jest.mock("@react-three/drei", () => ({
  ArcballControls: () => null,
  GizmoHelper: () => null,
  GizmoViewport: () => null,
  PerspectiveCamera: () => null,
}));

jest.mock("r3f-perf", () => ({
  Perf: () => null,
}));

describe("Scene", () => {
  it("renders without crashing", () => {
    render(<Scene parsedData={null} />);
  });
});
