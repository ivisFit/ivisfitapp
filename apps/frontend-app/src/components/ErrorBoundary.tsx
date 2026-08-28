"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/Button";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            padding: "2rem",
            textAlign: "center",
            background: "#0f0f0f",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Algo salió mal</h1>
          <p style={{ marginBottom: "2rem", maxWidth: "500px", color: "#aaa" }}>
            Ocurrió un error inesperado. Por favor, intenta recargar la página.
          </p>
          <Button onClick={() => window.location.reload()}>Recargar página</Button>
        </div>
      );
    }

    return this.props.children;
  }
}