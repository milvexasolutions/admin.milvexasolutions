import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Truck, Calendar, IndianRupee, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const SupplierPurchase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    item_name: '',
    quantity: '',
    unit_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!user) return;
      const { data } = await supabase.from('suppliers').select('id, name');
      setSuppliers(data || []);
    };
    fetchSuppliers();
  }, [user]);

  const totalAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_price) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('supplier_purchases').insert([{
        ...formData,
        total_amount: totalAmount,
        owner_id: user.id
      }]);

      if (error && error.code !== '42P01') throw error;
      
      alert('Purchase recorded successfully!');
      navigate('/suppliers');
    } catch (err) {
      console.error('Error recording supplier purchase:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Purchase Feed" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Supplier</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Truck size={18} />
                </div>
                <select 
                  required
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  <option value="">Choose Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Item Name</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Package size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Khal, Churi, Medicine"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Quantity</label>
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
                  placeholder="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Purchase Date</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div style={{ background: '#F0F9FF', padding: '16px', borderRadius: '16px', border: '1px solid #E0F2FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0369A1' }}>Total Cost</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>₹{totalAmount.toLocaleString()}</span>
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
          {loading ? 'Recording...' : 'Record Purchase'}
          {!loading && <ShoppingCart size={20} />}
        </button>
      </form>
    </div>
  );
};

export default SupplierPurchase;
