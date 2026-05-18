import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const categories = {
  Expense: ['Feed', 'Medicine', 'Salary', 'Doctor Fee', 'Electricity', 'Maintenance', 'Animal Purchase', 'Other'],
  Income: ['Milk Sale', 'Society Payment', 'Animal Sale', 'Manure Sale', 'Other']
};

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ type: 'Expense', amount: '', category: 'Feed', date: '', note: '' });

  useEffect(() => {
    supabase.from('payments').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setFormData({ type: data.type || 'Expense', amount: data.amount || '', category: data.category || 'Feed', date: data.date || '', note: data.note || '' });
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('payments').update({ ...formData, amount: parseFloat(formData.amount) }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else { alert('Transaction updated!'); navigate('/finance'); }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '13px 16px', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' };

  if (fetching) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Edit Transaction" showBack={true} />
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button type="button" onClick={() => setFormData({...formData, type: 'Income', category: 'Milk Sale'})} style={{ padding: '13px', borderRadius: '14px', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', background: formData.type === 'Income' ? '#10B981' : '#F1F5F9', color: formData.type === 'Income' ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowUpRight size={16} /> Income
              </button>
              <button type="button" onClick={() => setFormData({...formData, type: 'Expense', category: 'Feed'})} style={{ padding: '13px', borderRadius: '14px', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', background: formData.type === 'Expense' ? '#EF4444' : '#F1F5F9', color: formData.type === 'Expense' ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowDownLeft size={16} /> Expense
              </button>
            </div>
          </div>
          <div><label style={lbl}>Amount (₹)</label><input style={inp} type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" /></div>
          <div>
            <label style={lbl}>Category</label>
            <select style={{ ...inp, appearance: 'none' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {(categories[formData.type] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Date</label><input style={inp} type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
          <div><label style={lbl}>Note</label><input style={inp} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." /></div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(135deg, #0A1F5C, #0D2878)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Transaction'}
        </button>
      </form>
    </div>
  );
};
export default EditTransaction;
