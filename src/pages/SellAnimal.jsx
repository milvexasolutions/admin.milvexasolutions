import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { IndianRupee, Calendar, Dog, Save } from 'lucide-react';

const SellAnimal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: id || '',
    sale_price: '',
    sale_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchActiveAnimals = async () => {
      try {
        const { data, error } = await supabase
          .from('animals')
          .select('*')
          .neq('status', 'Sold')
          .neq('status', 'Dead')
          .order('name');
        if (error) throw error;
        setAnimals(data || []);
      } catch (err) {
        console.error('Error fetching animals:', err);
      }
    };
    if (user) {
      fetchActiveAnimals();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animal_id) {
      alert("Please select an animal");
      return;
    }
    setLoading(true);

    try {
      const selectedAnimal = animals.find(a => a.id === formData.animal_id);
      const suffix = `_sold_${Math.floor(Date.now() / 1000)}`;
      const updatedTagNumber = selectedAnimal && selectedAnimal.tag_number ? `${selectedAnimal.tag_number.replace(/_(sold|dead|old).*/i, '')}${suffix}` : null;
      const updatedTagId = selectedAnimal && selectedAnimal.tag_id ? `${selectedAnimal.tag_id.replace(/_(sold|dead|old).*/i, '')}${suffix}` : null;

      const updateData = { 
        status: 'Sold', 
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null, 
        sale_date: formData.sale_date 
      };

      if (updatedTagNumber) updateData.tag_number = updatedTagNumber;
      if (updatedTagId) updateData.tag_id = updatedTagId;

      const { error } = await supabase
        .from('animals')
        .update(updateData)
        .eq('id', formData.animal_id);

      if (error) throw error;
      alert('Animal marked as sold successfully!');
      navigate('/animals/sell-record');
    } catch (err) {
      console.error('Error selling animal:', err);
      alert('Error selling animal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      paddingTop: 'calc(var(--safe-top) + 88px)',
      paddingBottom: '40px' 
    }}>
      <PageHeader title="Sell Animal Form" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Select Animal */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Animal</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Dog size={18} />
                </div>
                <select 
                  name="animal_id"
                  value={formData.animal_id}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                  required
                >
                  <option value="">-- Choose an Animal --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name || 'Unnamed'} (Tag: {a.tag_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sale Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Sale Date</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  name="sale_date"
                  value={formData.sale_date}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
                />
              </div>
            </div>

            {/* Sale Price */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Sale Price</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: '900' }}>
                  ₹
                </div>
                <input 
                  type="number" 
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '14px 14px 14px 32px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
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
          {loading ? 'Processing...' : 'Confirm Sale'}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default SellAnimal;
