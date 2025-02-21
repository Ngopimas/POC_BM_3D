import React from "react";
import { render } from "@testing-library/react";
import { useControls } from "leva";
import HelperPlane from "./HelperPlane";

// Mock Three.js components
jest.mock("@react-three/fiber", () => ({
  extend: jest.fn(),
  useThree: jest.fn(),
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  mesh: "mesh",
  PlaneGeometry: "PlaneGeometry",
  MeshBasicMaterial: "MeshBasicMaterial",
}));

// Mock leva controls
jest.mock("leva", () => ({
  useControls: jest.fn(),
  folder: (config: any) => config,
}));

// Create test renderer
const createRenderer = () => {
  const root = document.createElement("div");
  document.body.appendChild(root);
  return root;
};

describe("HelperPlane", () => {
  let container: HTMLElement;

  const mockBounds = {
    minX: 0,
    maxX: 100,
    minY: 0,
    maxY: 100,
    minZ: 0,
    maxZ: 50,
  };

  beforeEach(() => {
    container = createRenderer();
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementation for useControls
    (useControls as jest.Mock).mockReturnValue({
      active: true,
      height: 1000,
      width: 5000,
      color: "#ff0000",
      opacity: 0.5,
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders when active is true", () => {
    const { container } = render(
      <HelperPlane
        dataBounds={mockBounds}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
    expect(container).not.toBeNull();
  });

  it("returns null when active is false", () => {
    (useControls as jest.Mock).mockReturnValue({
      active: false,
      height: 1000,
      width: 5000,
      color: "#ff0000",
      opacity: 0.5,
    });

    const { container } = render(
      <HelperPlane
        dataBounds={mockBounds}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
    expect(container.children.length).toBe(0);
  });

  it("uses default position and rotation when not provided", () => {
    const { container } = render(<HelperPlane dataBounds={mockBounds} />);
    expect(container).not.toBeNull();
  });

  it("uses provided width and height", () => {
    const { container } = render(
      <HelperPlane dataBounds={mockBounds} width={2000} height={500} />
    );
    expect(container).not.toBeNull();
  });
});
