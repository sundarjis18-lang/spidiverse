import { StrictMode, Component, ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#F52245', fontFamily: 'monospace', background: '#080B18', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>SPIDER-CODE SYSTEM HALT</h1>
          <p style={{ color: '#fff', marginBottom: '8px' }}>A runtime error occurred during rendering:</p>
          <pre style={{ background: '#10182B', padding: '16px', borderRadius: '8px', border: '1px solid #F52245', color: '#00F0FF' }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#F52245', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Clear Local State & Reload Arena
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global script error listener
window.addEventListener('error', (event) => {
  console.error("Global script error:", event.error);
  const root = document.getElementById('root');
  if (root && (!root.innerHTML || root.innerHTML.trim() === '')) {
    root.innerHTML = `
      <div style="padding:40px; color:#F52245; font-family:monospace; background:#080B18; min-height:100vh;">
        <h1 style="font-size:24px; margin-bottom:16px;">SPIDER-CODE SYSTEM ALERT</h1>
        <p style="color:#fff; margin-bottom:12px;">Script error encountered: ${event.message || 'Unknown exception'}</p>
        <button onclick="localStorage.clear(); window.location.reload();" style="padding:10px 20px; background:#F52245; color:#fff; border:none; border-radius:8px; cursor:pointer;">
          Clear Cache & Launch Arena
        </button>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
