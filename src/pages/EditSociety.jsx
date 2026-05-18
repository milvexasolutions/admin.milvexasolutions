import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Building2, MapPin, User, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const EditSociety = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ name: '', location: '', contact_person: '', contact_number: '' });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('societies').select('*').eq('id', id).single();
      if (data) setFormData({ name: data.name || '', location: data.location || '', contact_person: data.contact_person || '', contact_number: data.contact_number || '' });
      setFetching(false);
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('societies').update(formData).eq('id', id);
      if (error) throw error;
      alert('Society updated successfully!');
      navigate('/societies');
    } catch (err) { alert('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const ico = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Society" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={lbl}>Society Name</label><div style={{ position: 'relative' }}><div style={ico}><Building2 size={18} /></div><input style={inp} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Amul Dairy Society" /></div></div>
          <div><label style={lbl}>Location</label><div style={{ position: 'relative' }}><div style={ico}><MapPin size={18} /></div><input style={inp} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Village, District" /></div></div>
          <div><label style={lbl}>Contact Person</label><div style={{ position: 'relative' }}><div style={ico}><User size={18} /></div><input style={inp} value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} placeholder="Rajesh Kumar" /></div></div>
          <div><label style={lbl}>Contact Number</label><div style={{ position: 'relative' }}><div style={ico}><Phone size={18} /></div><input style={inp} type="tel" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} placeholder="+91 9876543210" /></div></div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Society'}
        </button>
      </form>
    </div>
  );
};
export default EditSociety;
