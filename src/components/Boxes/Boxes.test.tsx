import { render } from "@testing-library/react";
import { Table } from "apache-arrow";
import { MappingProvider } from "~/context/MappingContext";
import Boxes from "./Boxes";

jest.mock("lodash", () => ({
  get: jest.fn((obj, path) => {
    if (Array.isArray(path)) {
      return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    }
    return obj ? obj[path] : undefined;
  }),
}));

jest.mock("three", () => {
  const mockMatrix = { elements: new Float32Array(16) };
  const mockObject3D = {
    position: { set: jest.fn() },
    scale: { set: jest.fn() },
    updateMatrix: jest.fn(),
    matrix: mockMatrix,
  };

  return {
    Object3D: jest.fn(() => mockObject3D),
    BoxGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    EdgesGeometry: jest.fn(),
    LineBasicMaterial: jest.fn(),
    InstancedMesh: jest.fn(() => ({
      setColorAt: jest.fn(),
      setMatrixAt: jest.fn(),
      instanceMatrix: { needsUpdate: false },
      count: 0,
      dispose: jest.fn(),
    })),
    Color: jest.fn(() => ({ setHex: jest.fn() })),
    Plane: jest.fn(),
    DoubleSide: 2,
  };
});

jest.mock("~/hooks/useColorManagement", () => ({
  useColorManagement: jest.fn(() => ({
    colorArray: new Float32Array([1, 0, 0]), // Mock color array
  })),
}));

jest.mock("~/components/CrossSectionWidget", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("apache-arrow", () => {
  const mockDictionary = {
    TType: {},
    TArray: {},
    TValue: {},
    _offsets: [],
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockTable = {
    TType: {},
    TArray: {},
    TValue: {},
    _offsets: [],
    schema: {
      fields: [{ name: "x" }, { name: "y" }, { name: "z" }, { name: "value" }],
    },
    getColumn: jest.fn(() => mockDictionary),
    get: jest.fn(),
    set: jest.fn(),
  };

  return {
    Table: jest.fn(() => mockTable),
    Dictionary: jest.fn(() => mockDictionary),
    Utf8: jest.fn(),
    Int32: jest.fn(),
  };
});

describe("Boxes", () => {
  const mockArrow = new Table();

  const mockMapping = {
    property: "value",
    colorscale: "viridis",
    x: "x",
    y: "y",
    z: "z",
    use_dimension_columns: false,
    dim_x: "dim_x",
    dim_y: "dim_y",
    dim_z: "dim_z",
    block_dimension: {
      x: 10,
      y: 10,
      z: 10,
    },
    zScale: 1,
    showEdges: true,
  };

  it("renders with empty data", () => {
    const emptyMapping = {
      ...mockMapping,
      block_dimension: {
        x: 10,
        y: 10,
        z: 10,
      },
    };

    render(
      <MappingProvider>
        <Boxes data={[]} arrow={mockArrow} mapping={emptyMapping} />
      </MappingProvider>
    );

    expect(document.querySelector("div")).toBeInTheDocument();
  });

  it("renders with dimension columns", () => {
    const dataWithDimensions = [
      {
        x: "0",
        y: "0",
        z: "0",
        value: "1.0",
        dim_x: "5",
        dim_y: "5",
        dim_z: "5",
      },
    ];

    render(
      <MappingProvider>
        <Boxes
          data={dataWithDimensions}
          arrow={mockArrow}
          mapping={{ ...mockMapping, use_dimension_columns: true }}
        />
      </MappingProvider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
