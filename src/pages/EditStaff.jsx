import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, User, Phone, Briefcase, IndianRupee, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', salary_amount: '', joining_date: '' });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('staff').select('*').eq('id', id).single();
      if (data) setFormData({ name: data.name || '', role: data.role || '', phone: data.phone || '', salary_amount: data.salary_amount || '', joining_date: data.joining_date || '' });
      setFetching(false);
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('staff').update({ ...formData, salary_amount: parseFloat(formData.salary_amount) }).eq('id', id);
      if (error) throw error;
      alert('Staff updated successfully!');
      navigate('/staff');
    } catch (err) { alert('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const ico = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 88px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Staff" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={lbl}>Staff Name</label><div style={{ position: 'relative' }}><div style={ico}><User size={18} /></div><input style={inp} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ram Singh" /></div></div>
          <div><label style={lbl}>Role / Designation</label><div style={{ position: 'relative' }}><div style={ico}><Briefcase size={18} /></div><input style={inp} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Milker, Manager" /></div></div>
          <div><label style={lbl}>Monthly Salary (₹)</label><div style={{ position: 'relative' }}><div style={ico}><IndianRupee size={18} /></div><input style={inp} type="number" required value={formData.salary_amount} onChange={e => setFormData({...formData, salary_amount: e.target.value})} placeholder="0" /></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Phone</label><input style={{ ...inp, paddingLeft: '16px' }} type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" /></div>
            <div><label style={lbl}>Joining Date</label><input style={{ ...inp, paddingLeft: '16px' }} type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} /></div>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Staff'}
        </button>
      </form>
    </div>
  );
};
export default EditStaff;
