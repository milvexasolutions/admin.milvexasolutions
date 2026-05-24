import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    supabase.from('suppliers').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setFormData({ name: data.name || '', phone: data.phone || '', address: data.address || '' });
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('suppliers').update(formData).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else { alert('Supplier updated!'); navigate('/suppliers'); }
    setLoading(false);
  };

  const s = { inp: { width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }, lbl: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }, ico: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' } };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 88px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Supplier" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={s.lbl}>Supplier Name</label><div style={{ position: 'relative' }}><div style={s.ico}><User size={18} /></div><input style={s.inp} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Kisan Feed Agency" /></div></div>
          <div><label style={s.lbl}>Phone Number</label><div style={{ position: 'relative' }}><div style={s.ico}><Phone size={18} /></div><input style={s.inp} type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" /></div></div>
          <div><label style={s.lbl}>Address</label><div style={{ position: 'relative' }}><div style={s.ico}><MapPin size={18} /></div><input style={s.inp} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="New Market, Gwalior" /></div></div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Supplier'}
        </button>
      </form>
    </div>
  );
};
export default EditSupplier;
