import { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error al iniciar Ecos de Tamarán:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#171B21] text-[#F5F3EE] p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/15 bg-[#202630] p-6 text-center space-y-4 shadow-xl">
            <h1 className="text-xl font-bold">
              Ecos de Tamarán necesita recargarse
            </h1>
            <p className="text-sm text-[#D6D3CD]">
              Se produjo un problema inesperado al abrir la aventura. Puedes
              recargar la página o reiniciar el progreso guardado.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-[#D99A2B] text-[#171B21] font-semibold cursor-pointer"
              >
                Recargar página
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.clear();
                  } catch {
                    // ignore storage errors
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl border border-white/25 text-white font-medium cursor-pointer"
              >
                Reiniciar datos
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
