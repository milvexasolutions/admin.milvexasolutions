import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import { useHeader } from '../context/HeaderContext';

// PageHeader is what page components render to configure the top header.
const PageHeader = ({ title, showMenu, showBack, onOpenSidebar, rightAction, onBack }) => {
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({ title, showMenu, showBack, onOpenSidebar, rightAction, onBack });
    // Cleanup to clear header config when page unmounts
    return () => {
      setHeaderConfig(null);
    };
  }, [title, showMenu, showBack, onOpenSidebar, rightAction, onBack, setHeaderConfig]);

  return null;
};

// GlobalPageHeader is rendered once in App.jsx at the root level.
export const GlobalPageHeader = () => {
  const { headerConfig } = useHeader();
  const navigate = useNavigate();

  if (!headerConfig) return null;

  const { title, showMenu, showBack, onOpenSidebar, rightAction, onBack } = headerConfig;

  return (
    <div className="header-navy" style={{ 
      borderBottomLeftRadius: '24px', 
      borderBottomRightRadius: '24px',
      background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)',
      boxShadow: '0 10px 30px rgba(11, 31, 77, 0.2)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      zIndex: 1000,
      padding: 'calc(var(--safe-top) + 12px) 20px 16px',
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
        {showMenu && (
          <button 
            onClick={onOpenSidebar}
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Menu size={22} />
          </button>
        )}
        
        {showBack && (
          <button 
            onClick={onBack || (() => navigate(-1))}
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {React.isValidElement(title) ? (
            title
          ) : (
            <>
              <h2 
                className={title && typeof title === 'string' && title.toUpperCase().includes("MILVEXA") ? "notranslate" : ""}
                translate={title && typeof title === 'string' && title.toUpperCase().includes("MILVEXA") ? "no" : undefined}
                style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '900', 
                  color: 'white', 
                  letterSpacing: '0.2px', 
                  fontFamily: "'Roboto', sans-serif", 
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: showMenu ? 'center' : 'left'
                }}
              >
                {title}
              </h2>
            </>
          )}
        </div>

        {rightAction ? (
          rightAction
        ) : (
          <div style={{ width: '40px', height: '40px', flexShrink: 0 }} />
        )}
      </div>
    </div>
  );
};

export default PageHeader;
