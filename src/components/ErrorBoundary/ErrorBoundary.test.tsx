import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

// Mock console.error to avoid test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws an error
const ThrowError = () => {
  throw new Error("Test error");
};

// Test component that throws an error with a specific message
const ThrowCustomError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  it("renders children when there's no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when child throws error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const fallback = <div>Custom error message</div>;
    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("calls console.error with error information", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("displays different error messages for different errors", () => {
    const customErrorMessage = "Custom error scenario";
    render(
      <ErrorBoundary>
        <ThrowCustomError message={customErrorMessage} />
      </ErrorBoundary>
    );

    expect(screen.getByText(new RegExp(customErrorMessage))).toBeInTheDocument();
  });

  it("reloads page when reload button is clicked", async () => {
    const reloadMock = jest.fn();
    const originalLocation = window.location;

    // Create a proper location mock
    const locationMock = {
      ...originalLocation,
      reload: reloadMock,
    };

    // Delete location first to override readonly property
    delete (window as any).location;
    window.location = locationMock;

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText("Reload Page");
    await userEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalled();

    // Restore original location
    window.location = originalLocation;
  });

  it("handles nested error boundaries correctly", () => {
    const outerFallback = <div>Outer error</div>;
    const innerFallback = <div>Inner error</div>;

    render(
      <ErrorBoundary fallback={outerFallback}>
        <div>
          <ErrorBoundary fallback={innerFallback}>
            <ThrowError />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Inner error")).toBeInTheDocument();
    expect(screen.queryByText("Outer error")).not.toBeInTheDocument();
  });
});
