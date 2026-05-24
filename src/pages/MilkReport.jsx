import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Milk as MilkIcon, Calendar, Activity, ShoppingBag, TrendingUp, IndianRupee, Edit2, Trash2 } from 'lucide-react';

const MilkReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('production');

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Try fetching all columns first
        const { data, error } = await supabase
          .from('milk_production')
          .select(`
            id,
            animal_id,
            quantity,
            shift,
            production_date,
            fat,
            snf,
            price_per_liter,
            total_amount,
            owner_id,
            animal:animals(name, tag_number)
          `)
          .eq('owner_id', user.id)
          .order('production_date', { ascending: false })
          .limit(100);

        if (error) {
          // If columns are missing, fall back to basic production columns
          if (error.code === '42703' || (error.message && error.message.includes('column'))) {
            console.warn('Database is missing fat/snf/pricing columns. Falling back to basic production columns.');
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('milk_production')
              .select(`
                id,
                animal_id,
                quantity,
                shift,
                production_date,
                owner_id,
                animal:animals(name, tag_number)
              `)
              .eq('owner_id', user.id)
              .order('production_date', { ascending: false })
              .limit(100);

            if (fallbackError) throw fallbackError;
            setReport(fallbackData || []);
          } else {
            throw error;
          }
        } else {
          setReport(data || []);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase.from('milk_production').delete().eq('id', id);
      if (error) throw error;
      setReport(report.filter(item => item.id !== id));
      alert('Record deleted successfully');
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error deleting record');
    }
  };

  const productionRecords = report.filter(item => item.animal_id !== null || !item.price_per_liter);
  const salesRecords = report.filter(item => item.price_per_liter);
  const displayRecords = activeTab === 'production' ? productionRecords : salesRecords;

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title="Milk Reports" showBack={true} />
      
      {/* Tab Switcher */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'white', padding: '6px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <button
            onClick={() => setActiveTab('production')}
            style={{
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              background: activeTab === 'production' ? 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)' : 'transparent',
              color: activeTab === 'production' ? 'white' : '#64748B',
              transition: '0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={16} />
            Production
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            style={{
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              background: activeTab === 'sales' ? 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)' : 'transparent',
              color: activeTab === 'sales' ? 'white' : '#64748B',
              transition: '0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={16} />
            Sales
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayRecords.map((item) => (
              <div key={item.id} className="glass-card animate-slide-up" style={{ padding: '18px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: item.shift === 'Morning' ? '#FEF3C7' : '#EFF6FF', color: item.shift === 'Morning' ? '#D97706' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeTab === 'production' ? <MilkIcon size={22} /> : <ShoppingBag size={22} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0B1F4D' }}>
                        {activeTab === 'production' ? (item.animal?.name || 'All Animals') : 'Milk Sale'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                        {new Date(item.production_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • {item.shift}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>{parseFloat(item.quantity).toFixed(1)}L</h3>
                    {activeTab === 'sales' && <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800' }}>₹{item.price_per_liter}/L</span>}
                  </div>
                </div>

                {activeTab === 'sales' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '16px', marginTop: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Fat</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#0B1F4D', fontWeight: '900' }}>{item.fat || '0.0'}%</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>SNF</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#0B1F4D', fontWeight: '900' }}>{item.snf || '0.0'}%</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Total</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#059669', fontWeight: '900' }}>₹{item.total_amount || '0'}</p>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => navigate(`/milk/edit/${item.id}`)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {displayRecords.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0', marginTop: '20px' }}>
                <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No {activeTab} Records</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Start adding milk {activeTab === 'production' ? 'production' : 'sales'} to see them here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilkReport;
