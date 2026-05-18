import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Heart, Calendar, Info, Activity, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const AddBreeding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: '',
    breeding_date: new Date().toISOString().split('T')[0],
    type: 'AI',
    bull_details: '',
    note: ''
  });

  useEffect(() => {
    const fetchAnimals = async () => {
      if (!user) return;
      const { data } = await supabase.from('animals')
        .select('id, name, tag_number, type')
        .in('type', ['Cow', 'Buffalo'])
        .neq('status', 'Sold')
        .neq('status', 'Dead')
        .order('name');
      setAnimals(data || []);
    };
    fetchAnimals();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('breeding_records').insert([{
        ...formData,
        status: 'Pending',
        owner_id: user.id
      }]);

      if (error && error.code !== '42P01') throw error;
      
      alert('Breeding record added successfully!');
      navigate('/breeding');
    } catch (err) {
      console.error('Error adding breeding record:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Add Breeding" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Animal</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Search size={18} />
                </div>
                <select 
                  required
                  value={formData.animal_id}
                  onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  <option value="">Choose Cow</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.tag_number || 'No Tag'})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Breeding Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'AI'})}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '800',
                    background: formData.type === 'AI' ? '#0B1F4D' : '#F1F5F9',
                    color: formData.type === 'AI' ? 'white' : '#64748B',
                    transition: '0.3s'
                  }}
                >
                  Artificial (AI)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Natural'})}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '800',
                    background: formData.type === 'Natural' ? '#0B1F4D' : '#F1F5F9',
                    color: formData.type === 'Natural' ? 'white' : '#64748B',
                    transition: '0.3s'
                  }}
                >
                  Natural
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Breeding Date</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={formData.breeding_date}
                  onChange={(e) => setFormData({...formData, breeding_date: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Bull Name / Semen Details</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Activity size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Bull #104 or Semen ID"
                  value={formData.bull_details}
                  onChange={(e) => setFormData({...formData, bull_details: e.target.value})}
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
          {loading ? 'Adding...' : 'Save Breeding Record'}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default AddBreeding;
