import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Dog, 
  Tag, 
  Activity, 
  IndianRupee,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const EditAnimal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    animal_id: '',
    tag_number: '',
    type: 'Cow',
    breed: '',
    status: 'Milch',
    health_status: 'Healthy',
    purchase_price: '',
    purchase_date: '',
    gender: 'Female',
    calf_mother_type: 'Cow'
  });

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const { data, error } = await supabase
          .from('animals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name || '',
            animal_id: (data.tag_id || '').replace(/_(sold|dead|old).*/i, ''),
            tag_number: (data.tag_number || '').replace(/_(sold|dead|old).*/i, ''),
            type: data.type || 'Cow',
            breed: data.breed || '',
            status: data.status || 'Milch',
            health_status: data.health_status || 'Healthy',
            purchase_price: data.purchase_price || '',
            purchase_date: data.purchase_date || '',
            gender: data.gender || 'Female',
            calf_mother_type: data.calf_mother_type || 'Cow'
          });
        }
      } catch (err) {
        console.error('Error fetching animal:', err);
        alert('Error fetching animal details');
        navigate('/animals/list');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchAnimal();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let finalTagNumber = formData.tag_number;
      let finalTagId = formData.animal_id;

      if (formData.status === 'Sold' || formData.status === 'Dead') {
        const suffix = `_${formData.status.toLowerCase()}_${Math.floor(Date.now() / 1000)}`;
        if (finalTagNumber) {
          finalTagNumber = `${finalTagNumber.replace(/_(sold|dead|old).*/i, '')}${suffix}`;
        }
        if (finalTagId) {
          finalTagId = `${finalTagId.replace(/_(sold|dead|old).*/i, '')}${suffix}`;
        }
      }

      const { error } = await supabase
        .from('animals')
        .update({
          name: formData.name,
          tag_id: finalTagId,
          tag_number: finalTagNumber,
          type: formData.type,
          breed: formData.breed,
          status: formData.type === 'Calf' ? 'Baby' : formData.status,
          health_status: formData.health_status,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          purchase_date: formData.purchase_date,
          gender: formData.type === 'Bull' ? 'Male' : (formData.type === 'Calf' ? formData.gender : 'Female'),
          calf_mother_type: formData.type === 'Calf' ? formData.calf_mother_type : null
        })
        .eq('id', id);

      if (error) throw error;
      alert('Animal updated successfully!');
      navigate('/animals/list');
    } catch (err) {
      console.error('Error updating animal:', err);
      alert('Error updating animal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      paddingTop: 'calc(var(--safe-top) + 88px)',
      paddingBottom: '40px' 
    }}>
      <PageHeader title="Edit Animal Details" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px', position: 'relative', zIndex: 3 }}>
        {/* Basic Info Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={16} color="#3B82F6" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Basic Information</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Animal Name</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Dog size={18} />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ganga, Laxmi"
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Animal ID</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Tag size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="animal_id"
                    value={formData.animal_id}
                    onChange={handleChange}
                    placeholder="ID"
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Tag ID</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Sparkles size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="tag_number"
                    value={formData.tag_number}
                    onChange={handleChange}
                    placeholder="Tag #"
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Status Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '20px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#10B981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Category & Status</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Animal Category Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>{t('animal_category', 'Animal Category')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                {['Cow', 'Buffalo', 'Calf', 'Bull'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      type: cat,
                      status: cat === 'Calf' ? 'Baby' : (cat === 'Bull' ? 'Dry' : (prev.status === 'Baby' ? 'Milch' : prev.status))
                    }))}
                    style={{ 
                      padding: '10px 4px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      fontSize: '13px', 
                      fontWeight: '800',
                      background: formData.type === cat ? 'white' : 'transparent',
                      color: formData.type === cat ? '#0B1F4D' : '#64748B',
                      boxShadow: formData.type === cat ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                      transition: '0.2s'
                    }}
                  >
                    {t(cat.toLowerCase(), cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Calf Mother Type Selector */}
            {formData.type === 'Calf' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>{t('calf_type', 'Calf Type')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                  {['Cow', 'Buffalo'].map((mType) => (
                    <button
                      key={mType}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, calf_mother_type: mType }))}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '800',
                        background: formData.calf_mother_type === mType ? 'white' : 'transparent',
                        color: formData.calf_mother_type === mType ? '#0B1F4D' : '#64748B',
                        boxShadow: formData.calf_mother_type === mType ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: '0.2s'
                      }}
                    >
                      {mType === 'Cow' ? t('cow_calf', 'Cow Calf') : t('buffalo_calf', 'Buffalo Calf')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calf Gender Selector */}
            {formData.type === 'Calf' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>{t('calf_gender', 'Calf Gender')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                  {['Male', 'Female'].map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: gen }))}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '800',
                        background: formData.gender === gen ? 'white' : 'transparent',
                        color: formData.gender === gen ? '#0B1F4D' : '#64748B',
                        boxShadow: formData.gender === gen ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: '0.2s'
                      }}
                    >
                      {gen === 'Male' ? t('calf_male', 'Male') : t('calf_female', 'Female')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Breed Field moved here */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>{t('breed', 'Breed')}</label>
              <input 
                type="text" 
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g. Gir, Sahiwal, Murrah"
                style={{ width: '100%', padding: '14px 20px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
              />
            </div>

            {/* Milking Status Toggle - Hidden for Calf and Bull */}
            {!(formData.type === 'Calf' || formData.type === 'Bull') && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>{t('milking_status', 'Milking Status')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                  {['Milking', 'Dry'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: status === 'Milking' ? 'Milch' : 'Dry' }))}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '800',
                        background: (formData.status === 'Milch' && status === 'Milking') || (formData.status === 'Dry' && status === 'Dry') ? 'white' : 'transparent',
                        color: (formData.status === 'Milch' && status === 'Milking') || (formData.status === 'Dry' && status === 'Dry') ? '#0B1F4D' : '#64748B',
                        boxShadow: (formData.status === 'Milch' && status === 'Milking') || (formData.status === 'Dry' && status === 'Dry') ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: '0.2s'
                      }}
                    >
                      {status === 'Milking' ? t('milking', 'Milking') : t('dry', 'Dry')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Health Status Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>{t('animal_status_health', 'Animal Status (Health)')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#F1F5F9', padding: '4px', borderRadius: '16px', gap: '4px' }}>
                {['Healthy', 'Sick', 'Pregnant'].map((hStatus) => (
                  <button
                    key={hStatus}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, health_status: hStatus }))}
                    style={{ 
                      padding: '12px 4px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      fontSize: '13px', 
                      fontWeight: '800',
                      background: formData.health_status === hStatus ? 'white' : 'transparent',
                      color: formData.health_status === hStatus ? '#0B1F4D' : '#64748B',
                      boxShadow: formData.health_status === hStatus ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                      transition: '0.2s'
                    }}
                  >
                    {hStatus === 'Healthy' ? t('healthy', 'Healthy') : (hStatus === 'Sick' ? t('sick_label', 'Sick') : t('pregnant', 'Pregnant'))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Info Section */}
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '32px', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: '#FEF2F2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color="#EF4444" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Purchase Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Purchase Price</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: '900' }}>₹</div>
                  <input 
                    type="number" 
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '14px 14px 14px 32px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Purchase Date</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="date" 
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: '2px solid transparent', borderRadius: '16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
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
          {loading ? 'Updating...' : 'Update Animal Record'}
          {!loading && <Save size={20} />}
        </button>
      </form>
    </div>
  );
};

export default EditAnimal;
