import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, Bell } from 'lucide-react';

const PageHeader = ({ title, showMenu, showBack, onOpenSidebar, rightAction }) => {
  const navigate = useNavigate();

  return (
    <div className="header-navy" style={{ 
      borderBottomLeftRadius: '24px', 
      borderBottomRightRadius: '24px',
      background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)',
      boxShadow: '0 10px 30px rgba(11, 31, 77, 0.2)',
      padding: '16px 20px 24px',
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
            onClick={() => navigate(-1)}
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '900', 
            color: 'white', 
            letterSpacing: '0.2px', 
            fontFamily: "'Roboto', sans-serif", 
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: showMenu ? 'center' : 'left'
          }}>
            {title}
          </h2>
          {!showMenu && (
            <p style={{ margin: '2px 0 0', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Milvexa Farm
            </p>
          )}
        </div>

        {rightAction ? (
          rightAction
        ) : (
          <button 
            onClick={() => navigate('/notifications')} 
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Bell size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
