import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ShoppingBag, Calendar, Clock, IndianRupee, Activity, Info, TrendingUp, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const SellMilk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [ledgerPeriods, setLedgerPeriods] = useState([]);
  const [formData, setFormData] = useState({
    society: '',
    quantity: '',
    fat: '',
    snf: '',
    price_per_liter: '',
    shift: 'Morning',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: socData } = await supabase.from('societies').select('name');
        setSocieties(socData || []);

        const { data: ledgerData } = await supabase.from('dairy_ledger').select('dairy_name, period_start, period_end');
        setLedgerPeriods(ledgerData || []);
      };
      fetchData();
    }
  }, [user]);

  // Calculate period dynamically from dairy_ledger
  const getPeriod = () => {
    if (!formData.society || !formData.date) return 'Select Dairy & Date';
    
    const targetDate = new Date(formData.date);
    targetDate.setHours(12, 0, 0, 0); // Midday to avoid timezone issues
    
    const match = ledgerPeriods.find(l => {
      if (l.dairy_name !== formData.society) return false;
      const start = new Date(l.period_start);
      const end = new Date(l.period_end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    });

    if (match) {
      const sDate = new Date(match.period_start);
      const eDate = new Date(match.period_end);
      return `${sDate.getDate()} ${sDate.toLocaleString('default', { month: 'short' })} to ${eDate.getDate()} ${eDate.toLocaleString('default', { month: 'short' })}`;
    }
    
    return 'No Period Set';
  };

  const totalPrice = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price_per_liter) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Check if production records already exist for this date and shift
      const { data: existingProduction, error: checkError } = await supabase
        .from('milk_production')
        .select('id')
        .eq('production_date', formData.date)
        .eq('shift', formData.shift)
        .is('price_per_liter', null);

      if (checkError) throw checkError;

      // 2. If no production records exist, automatically create a collective record for all animals
      if (!existingProduction || existingProduction.length === 0) {
        const { error: prodInsertError } = await supabase.from('milk_production').insert([{
          animal_id: null,
          quantity: parseFloat(formData.quantity),
          shift: formData.shift,
          production_date: formData.date,
          owner_id: user.id
        }]);
        if (prodInsertError) throw prodInsertError;
        console.log('Automatically created collective production record for all animals');
      }

      // 3. Record the milk sale
      const { error: saleError } = await supabase.from('milk_production').insert([{
        quantity: parseFloat(formData.quantity),
        shift: formData.shift,
        production_date: formData.date,
        fat: parseFloat(formData.fat),
        snf: parseFloat(formData.snf),
        price_per_liter: parseFloat(formData.price_per_liter),
        total_amount: totalPrice,
        owner_id: user.id
      }]);

      if (saleError) throw saleError;

      alert('Milk sale recorded successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error recording milk sale:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      paddingTop: 'calc(var(--safe-top) + 88px)',
      paddingBottom: '40px' 
    }}>
      <PageHeader title="Sell Milk" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        
        {/* Society & Basic Info */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={16} color="#3B82F6" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Sale Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Dairy Name</label>
              {societies.length > 0 ? (
                <select 
                  name="society"
                  value={formData.society}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 20px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
                >
                  <option value="" disabled>Select a Dairy</option>
                  {societies.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="society"
                  value={formData.society}
                  onChange={handleChange}
                  placeholder="e.g. Amul, Mother Dairy"
                  style={{ width: '100%', padding: '14px 20px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
                />
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Period (Auto)</label>
                <div style={{ width: '100%', padding: '14px 16px', background: '#E2E8F0', borderRadius: '16px', fontSize: '14px', fontWeight: '800', color: '#475569' }}>
                  {getPeriod()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality & Quantity Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '20px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#10B981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Quantity & Quality</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Total Milk (L)</label>
                <input 
                  type="number" 
                  name="quantity"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0.0"
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Shift</label>
                <select 
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Fat (%)</label>
                <input 
                  type="number" 
                  name="fat"
                  step="0.1"
                  value={formData.fat}
                  onChange={handleChange}
                  placeholder="e.g. 6.5"
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>SNF (%)</label>
                <input 
                  type="number" 
                  name="snf"
                  step="0.1"
                  value={formData.snf}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '32px', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#FEF2F2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color="#EF4444" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Pricing & Total</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Price per Liter (₹)</label>
              <input 
                type="number" 
                name="price_per_liter"
                step="0.01"
                value={formData.price_per_liter}
                onChange={handleChange}
                placeholder="0.00"
                style={{ width: '100%', padding: '14px 20px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                required
              />
            </div>

            <div style={{ background: '#0F172A', padding: '20px', borderRadius: '20px', color: 'white', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Amount</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: '900' }}>₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>

        {/* Receipt Upload Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '32px', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={16} color="#8B5CF6" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Add Receipt</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => document.getElementById('camera-input').click()}
              style={{ flex: 1, padding: '16px', background: '#F8FAFC', border: '1.5px dashed #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Camera size={24} color="#64748B" />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>Camera</span>
            </button>
            <input id="camera-input" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageChange} />

            <button 
              type="button"
              onClick={() => document.getElementById('gallery-input').click()}
              style={{ flex: 1, padding: '16px', background: '#F8FAFC', border: '1.5px dashed #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <ImageIcon size={24} color="#64748B" />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>Gallery</span>
            </button>
            <input id="gallery-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>

          {receiptImage && (
            <div className="animate-fade-in" style={{ marginTop: '16px', position: 'relative' }}>
              <img src={receiptImage} alt="Receipt Preview" style={{ width: '100%', borderRadius: '16px', maxHeight: '200px', objectFit: 'cover', border: '1px solid #F1F5F9' }} />
              <button 
                type="button"
                onClick={() => setReceiptImage(null)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', color: '#EF4444', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
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
          {loading ? 'Recording Sale...' : 'Record Milk Sale'}
          {!loading && <ShoppingBag size={20} />}
        </button>
      </form>
    </div>
  );
};

export default SellMilk;
