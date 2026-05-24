import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { useHeader } from '../context/HeaderContext';
import { useAuth } from '../context/AuthContext';

const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 70;

  const { headerConfig } = useHeader();
  const { user } = useAuth();
  const hasHeader = !!(user && headerConfig);

  const handleTouchStart = (e) => {
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || window.scrollY > 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      // Resistance effect
      const dampedDistance = Math.min(distance * 0.4, threshold + 20);
      setPullDistance(dampedDistance);
      
      // Prevent browser default pull-to-refresh if we are handling it
      if (distance > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default to reload if no function provided
        window.location.reload();
      }
      setIsRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  };

  // If there is a header, start 50px behind the header bottom (header bottom is var(--safe-top) + 68px).
  // Slide down smoothly when pullDistance increases.
  const getSpinnerTop = () => {
    if (hasHeader) {
      const offset = isRefreshing ? 20 : pullDistance;
      return `calc(var(--safe-top) + 18px + ${offset}px)`;
    } else {
      return -50 + (isRefreshing ? 70 : pullDistance);
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      <div style={{
          position: 'fixed',
          top: getSpinnerTop(),
          left: 0,
          right: 0,
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: Math.min(pullDistance / threshold, 1),
          pointerEvents: 'none',
          transition: isRefreshing ? 'none' : 'top 0.2s ease-out'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '50%', 
          padding: '10px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <RefreshCw 
            size={20} 
            color="var(--primary)" 
            style={{ 
              transform: `rotate(${pullDistance * 4}deg)`,
              animation: isRefreshing ? 'pt-spin 1s linear infinite' : 'none'
            }} 
          />
        </div>
      </div>
      
      <div style={{ 
        transform: (pullDistance > 0 || isRefreshing) ? `translateY(${isRefreshing ? 20 : pullDistance * 0.3}px)` : 'none', 
        transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
        width: '100%',
        minHeight: '100%'
      }}>
        {children}
      </div>

      <style>{`
        @keyframes pt-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PullToRefresh;
