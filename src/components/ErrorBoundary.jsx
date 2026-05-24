import React from 'react';
import { Activity } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'inherit'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#FEF2F2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.1)'
          }}>
            <Activity size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0B1F4D', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '300px', marginBottom: '24px', lineHeight: 1.5 }}>
            An unexpected error occurred. Don't worry, your farm data is completely safe.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            style={{
              padding: '12px 24px',
              background: '#0B1F4D',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(11, 31, 77, 0.2)'
            }}
          >
            Restart Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
