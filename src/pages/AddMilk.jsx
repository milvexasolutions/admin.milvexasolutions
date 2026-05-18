import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Milk as MilkIcon, Calendar, Clock, Dog, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';

const AddMilk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: 'all',
    quantity: '',
    shift: 'Morning',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchAnimals = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('animals')
        .select('id, name, tag_number')
        .eq('owner_id', user.id)
        .eq('status', 'Milch');
      setAnimals(data || []);
    };
    fetchAnimals();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (formData.animal_id === 'all') {
        const { error } = await supabase.from('milk_production').insert([{
          animal_id: null,
          quantity: parseFloat(formData.quantity),
          shift: formData.shift,
          production_date: formData.date,
          owner_id: user.id
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('milk_production').insert([{
          animal_id: formData.animal_id,
          quantity: parseFloat(formData.quantity),
          shift: formData.shift,
          production_date: formData.date,
          owner_id: user.id
        }]);
        if (error) throw error;
      }

      alert('Milk record saved successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error adding milk:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: '40px' }}>
      <PageHeader title="Add Milk Record" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Animal</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Dog size={18} />
                </div>
                <select 
                  value={formData.animal_id}
                  onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                  style={{ width: '100%', padding: '14px 40px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  <option value="all">All Animals (Collective)</option>
                  {animals.map(animal => (
                    <option key={animal.id} value={animal.id}>{animal.name} ({animal.tag_number})</option>
                  ))}
                </select>
                <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Quantity (Liters)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <MilkIcon size={18} />
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  placeholder="e.g. 10.5"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                />
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: '800', fontSize: '14px' }}>L</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>Shift</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                {['Morning', 'Evening'].map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    onClick={() => setFormData({ ...formData, shift })}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      fontSize: '14px', 
                      fontWeight: '800',
                      background: formData.shift === shift ? 'white' : 'transparent',
                      color: formData.shift === shift ? '#0B1F4D' : '#64748B',
                      boxShadow: formData.shift === shift ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                      transition: '0.2s'
                    }}
                  >
                    {shift}
                  </button>
                ))}
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
          {loading ? 'Saving...' : 'Save Milk Record'}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default AddMilk;
