import "@testing-library/jest-dom";

const THREE_ELEMENTS = ["mesh", "plane", "light"];
const CASING_WARNINGS = [
  "is using incorrect casing",
  "Use PascalCase",
  "start its name with an uppercase letter",
  "spell it as lowercase",
];

const ATTRIBUTES = ["transparent", "wireframe", "visible"];

const originalError = console.error;
console.error = (...args) => {
  const msg = args.join(" ")?.toLocaleLowerCase();

  if (
    THREE_ELEMENTS.some((element) => msg.includes(element)) &&
    CASING_WARNINGS.some((warning) => msg.includes(warning))
  ) {
    return;
  }

  if (
    ATTRIBUTES.some((element) => msg.includes(element)) &&
    msg.includes("={value.tostring()}")
  ) {
    return;
  }

  originalError(...args);
};

// Mock matchMedia if needed for responsive design testing
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver if needed
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver if needed
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});
