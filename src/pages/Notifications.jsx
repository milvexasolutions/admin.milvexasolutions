import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Activity, 
  Syringe,
  Trash2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Notifications = () => {
  const { t } = useTranslation();
  const [notificationHistory, setNotificationHistory] = useState([]);

  const clearAllNotifications = () => {
    setNotificationHistory([]);
  };

  const markAllRead = () => {
    setNotificationHistory(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'breeding': return <Syringe size={20} color="#3B82F6" />;
      case 'calving': return <Activity size={20} color="#10B981" />;
      case 'milk': return <Bell size={20} color="#F59E0B" />;
      default: return <Settings size={20} color="#64748B" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title={t('notifications', 'Notifications')} showBack={true} />
      
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Notification History list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0B1F4D' }}>Notification Log</h4>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span onClick={markAllRead} style={{ fontSize: '12px', fontWeight: '800', color: '#2563EB', cursor: 'pointer' }}>Mark all read</span>
              <span onClick={clearAllNotifications} style={{ fontSize: '12px', fontWeight: '800', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={12} /> Clear
              </span>
            </div>
          </div>

          {notificationHistory.length === 0 ? (
            <div style={{ background: 'white', padding: '40px 20px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <BellOff size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h5 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: '#475569' }}>No Notifications Yet</h5>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Your notifications history is empty.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notificationHistory.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: '14px',
                    position: 'relative',
                    boxShadow: item.read ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.04)'
                  }}
                >
                  {!item.read && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
                  )}
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <h5 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: '#0B1F4D' }}>{item.title}</h5>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#475569', fontWeight: '600', lineHeight: 1.4 }}>{item.body}</p>
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
