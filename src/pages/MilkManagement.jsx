import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Milk as MilkIcon, ChevronRight, ShoppingBag } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const MilkManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const options = [
    { 
      key: 'add_milk',
      label: 'Add Milk', 
      path: '/milk/add', 
      icon: Plus, 
      descKey: 'add_milk_desc',
      desc: 'Record new production',
      color: '#3B82F6',
      bg: '#EFF6FF'
    },
    { 
      key: 'sell_milk',
      label: 'Sell Milk', 
      path: '/milk/sell', 
      icon: ShoppingBag, 
      descKey: 'sell_milk_desc',
      desc: 'Record milk sales',
      color: '#10B981',
      bg: '#ECFDF5'
    },
    { 
      key: 'milk_report',
      label: 'Milk Report', 
      path: '/milk/report', 
      icon: FileText, 
      descKey: 'milk_report_desc',
      desc: 'View history',
      color: '#8B5CF6',
      bg: '#F5F3FF'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title={t('milk_records', 'Milk Records')} showBack={true} />
      
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {options.map((opt, index) => {
            const Icon = opt.icon;
            return (
              <div 
                key={opt.key}
                onClick={() => navigate(opt.path)}
                className="glass-card"
                style={{ 
                  padding: '20px', 
                  background: 'white', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: opt.bg, 
                  color: opt.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Icon size={28} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0B1F4D' }}>{t(opt.key, opt.label)}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{t(opt.descKey, opt.desc)}</p>
                </div>

                <div style={{ color: '#CBD5E1' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', 
          borderRadius: '32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(11, 31, 77, 0.2)'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <MilkIcon size={24} color="white" />
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800' }}>{t('quick_analytics', 'Quick Analytics')}</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{t('quick_analytics_desc', 'Track your daily milk production effortlessly.')}</p>
        </div>
      </div>
    </div>
  );
};

export default MilkManagement;
