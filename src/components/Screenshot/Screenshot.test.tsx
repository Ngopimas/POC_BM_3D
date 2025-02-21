import { useThree } from "@react-three/fiber";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { button, useControls } from "leva";
import { htmlToImage } from "~/utils/dom";
import Screenshot from "./Screenshot";

// Mock dependencies
jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn(),
  useThree: jest.fn(),
}));

jest.mock("leva", () => ({
  useControls: jest.fn(),
  button: jest.fn((callback) => callback),
}));

jest.mock("~/utils/dom", () => ({
  htmlToImage: jest.fn(),
}));

describe("Screenshot", () => {
  let screenshotCallback: () => Promise<void>;

  const mockGL = {
    render: jest.fn(),
    domElement: {
      toDataURL: jest.fn(() => "mock-scene-url"),
      width: 800,
      height: 600,
    },
  };

  const mockCamera = {};
  const mockScene = {};

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    (useThree as jest.Mock).mockReturnValue({
      gl: mockGL,
      scene: mockScene,
      camera: mockCamera,
    });

    // Mock button creation and capture the callback
    (button as jest.Mock).mockImplementation((callback) => {
      screenshotCallback = callback;
      return { onClick: callback };
    });

    // Setup useControls to return the mocked button
    (useControls as jest.Mock).mockReturnValue({
      SCREENSHOT: { onClick: screenshotCallback },
    });

    (htmlToImage as jest.Mock).mockResolvedValue("mock-legend-url");

    // Mock window.open
    window.open = jest.fn().mockReturnValue({
      document: {
        write: jest.fn(),
        close: jest.fn(),
      },
    });

    // Mock Image class
    global.Image = class {
      onload: () => void = () => {};
      src: string = "";
      width: number = 800;
      height: number = 600;
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;
  });

  it("renders without crashing", () => {
    render(<Screenshot />);
    expect(useControls).toHaveBeenCalled();
  });
});
