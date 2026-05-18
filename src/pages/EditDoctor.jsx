import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, User, Phone, MapPin, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ name: '', specialty: '', phone: '', address: '' });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (data) setFormData({ name: data.name || '', specialty: data.specialty || '', phone: data.phone || '', address: data.address || '' });
      setFetching(false);
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('doctors').update(formData).eq('id', id);
      if (error) throw error;
      alert('Doctor updated successfully!');
      navigate('/doctors');
    } catch (err) { alert('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const ico = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Doctor" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={lbl}>Doctor Name</label><div style={{ position: 'relative' }}><div style={ico}><User size={18} /></div><input style={inp} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Dr. Sharma" /></div></div>
          <div><label style={lbl}>Specialty</label><div style={{ position: 'relative' }}><div style={ico}><Award size={18} /></div><input style={inp} value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="Large Animal Specialist" /></div></div>
          <div><label style={lbl}>Phone Number</label><div style={{ position: 'relative' }}><div style={ico}><Phone size={18} /></div><input style={inp} type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" /></div></div>
          <div><label style={lbl}>Address</label><div style={{ position: 'relative' }}><div style={ico}><MapPin size={18} /></div><input style={inp} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Civil Hospital Road" /></div></div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Doctor'}
        </button>
      </form>
    </div>
  );
};
export default EditDoctor;
