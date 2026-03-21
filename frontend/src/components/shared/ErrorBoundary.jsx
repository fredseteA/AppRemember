import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: "#f9fafb"
        }}>
          <h1>Algo deu errado 😢</h1>
          <p>Recarregue a página ou tente novamente.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;