import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Building2, Phone, MapPin, User, Plus, Activity, Edit2, Trash2 } from 'lucide-react';

const SocietyList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocieties = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('societies')
          .select('*')
          .order('name');

        if (error && error.code !== '42P01') throw error;
        setSocieties(data || []);
      } catch (err) {
        console.error('Error fetching societies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSocieties();
  }, [user]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this society?')) return;
    try {
      const { error } = await supabase.from('societies').delete().eq('id', id);
      if (error) throw error;
      setSocieties(societies.filter(s => s.id !== id));
      alert('Society removed successfully');
    } catch (err) {
      console.error('Error deleting society:', err);
      alert('Error removing society');
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 80px)' }}>
      <PageHeader title="Societies" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {societies.map((society) => (
              <div key={society.id} className="glass-card animate-slide-up" style={{ padding: '20px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0B1F4D' }}>{society.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} color="#64748B" />
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{society.location || 'No location'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{society.contact_person || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{society.contact_number || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => navigate(`/societies/edit/${society.id}`)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(society.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {societies.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Societies Found</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>Add your first dairy society to start managing sales and feed.</p>
                <button 
                  onClick={() => navigate('/societies/add')}
                  style={{ padding: '12px 24px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  <Plus size={18} />
                  Add Society
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocietyList;
