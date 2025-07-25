import React, { Component } from 'react';
import './App.css';
import './darkmode.css';  // ← Diese Zeile bleibt
import StundenplanApp from './StundenplanApp'; // ← NEU: Import der neuen Komponente

// ✅ Error Boundary bleibt gleich
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ App Fehler:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Oops! Etwas ist schiefgelaufen
            </h1>
            <p className="text-gray-600 mb-6">
              Die Anwendung ist auf einen unerwarteten Fehler gestoßen.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              🔄 Seite neu laden
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technische Details anzeigen
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ Hauptkomponente - KOMPLETT NEU
function App() {
  return (
    <ErrorBoundary>
      <StundenplanApp />
    </ErrorBoundary>
  );
}

export default App;