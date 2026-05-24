import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const EditMilk = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [formData, setFormData] = useState({ quantity: '', shift: 'Morning', production_date: '', fat: '', snf: '', price_per_liter: '' });

  useEffect(() => {
    supabase.from('milk_production').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setIsSale(!!data.price_per_liter);
        setFormData({ quantity: data.quantity || '', shift: data.shift || 'Morning', production_date: data.production_date || '', fat: data.fat || '', snf: data.snf || '', price_per_liter: data.price_per_liter || '' });
      }
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { quantity: parseFloat(formData.quantity), shift: formData.shift, production_date: formData.production_date };
    if (isSale) { payload.fat = parseFloat(formData.fat); payload.snf = parseFloat(formData.snf); payload.price_per_liter = parseFloat(formData.price_per_liter); payload.total_amount = parseFloat(formData.quantity) * parseFloat(formData.price_per_liter); }
    const { error } = await supabase.from('milk_production').update(payload).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else { alert('Milk record updated!'); navigate('/milk/report'); }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '13px 16px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 88px)', paddingBottom: '40px' }}>
      <PageHeader title={isSale ? 'Edit Milk Sale' : 'Edit Milk Record'} showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Quantity (L)</label><input style={inp} type="number" step="0.1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="0.0" /></div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={formData.production_date} onChange={e => setFormData({...formData, production_date: e.target.value})} /></div>
          </div>
          <div>
            <label style={lbl}>Shift</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Morning', 'Evening'].map(sh => (
                <button key={sh} type="button" onClick={() => setFormData({...formData, shift: sh})} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', background: formData.shift === sh ? '#0A1F5C' : '#F1F5F9', color: formData.shift === sh ? 'white' : '#64748B' }}>{sh}</button>
              ))}
            </div>
          </div>
          {isSale && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>Fat (%)</label><input style={inp} type="number" step="0.1" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} placeholder="6.5" /></div>
                <div><label style={lbl}>SNF (%)</label><input style={inp} type="number" step="0.1" value={formData.snf} onChange={e => setFormData({...formData, snf: e.target.value})} placeholder="8.5" /></div>
              </div>
              <div><label style={lbl}>Price per Liter (₹)</label><input style={inp} type="number" step="0.01" value={formData.price_per_liter} onChange={e => setFormData({...formData, price_per_liter: e.target.value})} placeholder="52.00" /></div>
              {formData.quantity && formData.price_per_liter && (
                <div style={{ background: '#EEF2FF', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Total Amount</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#0A1F5C' }}>₹{(parseFloat(formData.quantity) * parseFloat(formData.price_per_liter)).toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Record'}
        </button>
      </form>
    </div>
  );
};
export default EditMilk;
