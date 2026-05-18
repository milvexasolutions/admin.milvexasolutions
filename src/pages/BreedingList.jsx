import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Heart, Calendar, Activity, CheckCircle2, XCircle, Info, Plus, Edit2, Trash2 } from 'lucide-react';

const BreedingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('breeding_records')
        .select('*, animals(id, name, tag_number)')
        .order('breeding_date', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching breeding records:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'Failed') {
        // Delete record from breeding list as requested
        const { error } = await supabase
          .from('breeding_records')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        // No status change for the animal
      } else {
        // Success or Pregnant
        const { error } = await supabase
          .from('breeding_records')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
        
        // Automatic Pregnant status update for the animal
        const record = records.find(r => r.id === id);
        if (record && record.animals?.id) {
          await supabase.from('animals').update({ pregnant_status: 'Pregnant' }).eq('id', record.animals.id);
        }
      }

      fetchRecords();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error: ' + err.message);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this breeding record?')) return;
    try {
      const { error } = await supabase.from('breeding_records').delete().eq('id', id);
      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
      alert('Record deleted successfully');
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error deleting record');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return '#10B981';
      case 'Pregnant': return '#F59E0B';
      case 'Failed': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 80px)' }}>
      <PageHeader title="Breeding History" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {records.map((record) => (
              <div key={record.id} className="glass-card animate-slide-up" style={{ padding: '20px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0B1F4D' }}>{record.animals?.name || 'Unknown Cow'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Tag: {record.animals?.tag_number ? record.animals.tag_number.replace(/_(sold|dead|old).*/i, '') : 'N/A'}</span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }}></span>
                      <span style={{ fontSize: '11px', color: getStatusColor(record.status), fontWeight: '900', textTransform: 'uppercase' }}>{record.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F8FAFC', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{new Date(record.breeding_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{record.type} Breeding</span>
                  </div>
                </div>

                {record.status === 'Pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button 
                      onClick={() => updateStatus(record.id, 'Success')}
                      style={{ padding: '12px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} /> Success
                    </button>
                    <button 
                      onClick={() => updateStatus(record.id, 'Failed')}
                      style={{ padding: '12px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <XCircle size={16} /> Failed
                    </button>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => navigate(`/breeding/edit/${record.id}`)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {records.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <Heart size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Breeding Records</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>Keep track of inseminations and pregnancy status.</p>
                <button 
                  onClick={() => navigate('/breeding/add')}
                  style={{ padding: '12px 24px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  <Plus size={18} />
                  Add Record
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedingList;
