import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Package, Building2, Calendar, IndianRupee, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const FeedPurchase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [formData, setFormData] = useState({
    society_id: '',
    item_name: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchSocieties = async () => {
      if (!user) return;
      const { data } = await supabase.from('societies').select('id, name');
      setSocieties(data || []);
    };
    fetchSocieties();
  }, [user]);

  const totalPrice = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_price) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('feed_purchases').insert([{
        ...formData,
        total_amount: totalPrice,
        owner_id: user.id
      }]);

      if (error && error.code !== '42P01') throw error;
      
      alert('Feed purchase recorded successfully!');
      navigate('/societies');
    } catch (err) {
      console.error('Error recording feed purchase:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Feed Purchase" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Society</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Building2 size={18} />
                </div>
                <select 
                  required
                  value={formData.society_id}
                  onChange={(e) => setFormData({...formData, society_id: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  <option value="">Select a Society</option>
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Item Name (Feed Type)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Package size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cotton Cake, Cattle Feed"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Quantity (Bags/Kg)</label>
                <input 
                  type="number" 
                  required
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Price per Unit</label>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>Total Amount</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>₹{totalPrice.toLocaleString()}</span>
            </div>

          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', 
            color: 'white', 
            borderRadius: '20px', 
            border: 'none', 
            fontSize: '18px', 
            fontWeight: '900', 
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(11, 31, 77, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Recording...' : 'Save Purchase'}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default FeedPurchase;
