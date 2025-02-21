import React, { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * A class component that catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of the component tree that crashed.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback UI
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  /**
   * Static method called when an error is thrown in a child component.
   * Used to update the component's state based on the caught error.
   *
   * @param error - The error that was thrown
   * @returns New state object with error information
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error is caught by this component.
   * Used for logging error information for debugging purposes.
   *
   * @param error - The error that was thrown
   * @param errorInfo - Additional information about the error
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>
              Oops! Something went wrong. 😢
            </h2>
            <details className={styles.errorDetails}>
              {this.state.error && this.state.error.toString()}
            </details>
            <button
              onClick={() => window.location.reload()}
              className={styles.reloadButton}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
