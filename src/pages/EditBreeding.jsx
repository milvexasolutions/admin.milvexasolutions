import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Calendar, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const EditBreeding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ breeding_date: '', type: 'AI', bull_details: '', status: 'Pending' });

  useEffect(() => {
    supabase.from('breeding_records').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setFormData({ breeding_date: data.breeding_date || '', type: data.type || 'AI', bull_details: data.bull_details || '', status: data.status || 'Pending' });
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('breeding_records').update(formData).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else { alert('Breeding record updated!'); navigate('/breeding'); }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '14px 16px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' };
  const btnBase = { padding: '12px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', flex: 1 };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Breeding" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Breeding Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['AI', 'Natural'].map(t => (
                <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} style={{ ...btnBase, background: formData.type === t ? '#0A1F5C' : '#F1F5F9', color: formData.type === t ? 'white' : '#64748B' }}>{t === 'AI' ? 'Artificial (AI)' : 'Natural'}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Breeding Date</label><input style={inp} type="date" value={formData.breeding_date} onChange={e => setFormData({...formData, breeding_date: e.target.value})} /></div>
          <div><label style={lbl}>Bull Name / Semen Details</label><input style={inp} value={formData.bull_details} onChange={e => setFormData({...formData, bull_details: e.target.value})} placeholder="Bull #104 or Semen ID" /></div>
          <div>
            <label style={lbl}>Status</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Pending', 'Success', 'Failed', 'Delivered'].map(st => (
                <button key={st} type="button" onClick={() => setFormData({...formData, status: st})} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', background: formData.status === st ? '#0A1F5C' : '#F1F5F9', color: formData.status === st ? 'white' : '#64748B' }}>{st}</button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Record'}
        </button>
      </form>
    </div>
  );
};
export default EditBreeding;
