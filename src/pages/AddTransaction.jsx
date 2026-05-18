import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, IndianRupee, Calendar, FileText, ArrowUpRight, ArrowDownLeft, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Expense', // Income or Expense
    amount: '',
    category: 'Feed',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const categories = {
    Expense: ['Feed', 'Medicine', 'Salary', 'Doctor Fee', 'Electricity', 'Maintenance', 'Animal Purchase', 'Other'],
    Income: ['Milk Sale', 'Society Payment', 'Animal Sale', 'Manure Sale', 'Other']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('payments').insert([{
        owner_id: user.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note
      }]);

      if (error && error.code !== '42P01') throw error;
      
      alert('Transaction recorded successfully!');
      navigate('/finance');
    } catch (err) {
      console.error('Error recording transaction:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Add Income/Exp" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Transaction Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Income', category: 'Milk Sale'})}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '900',
                    background: formData.type === 'Income' ? '#10B981' : '#F1F5F9',
                    color: formData.type === 'Income' ? 'white' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ArrowUpRight size={18} /> Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Expense', category: 'Feed'})}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '900',
                    background: formData.type === 'Expense' ? '#EF4444' : '#F1F5F9',
                    color: formData.type === 'Expense' ? 'white' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ArrowDownLeft size={18} /> Expense
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <IndianRupee size={18} />
                </div>
                <input 
                  type="number" 
                  required
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Tag size={18} />
                </div>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Note / Description</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <FileText size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Sold 50L milk, Bought 5 bags of feed"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
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
          {loading ? 'Recording...' : `Record ${formData.type}`}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
