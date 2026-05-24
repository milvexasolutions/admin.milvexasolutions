import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Stethoscope, Phone, MapPin, Award, Plus, Activity, IndianRupee, Edit2, Trash2 } from 'lucide-react';

const DoctorList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!user) return;
      try {
        // Fetch doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*')
          .order('name');

        if (doctorsError && doctorsError.code !== '42P01') throw doctorsError;

        // Fetch ledger entries to calculate outstanding balance
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('doctor_ledger')
          .select('doctor_id, balance');

        if (ledgerError && ledgerError.code !== '42P01') throw ledgerError;

        // Group balances by doctor_id
        const balances = (ledgerData || []).reduce((acc, curr) => {
          acc[curr.doctor_id] = (acc[curr.doctor_id] || 0) + (curr.balance || 0);
          return acc;
        }, {});

        // Combine data
        const enrichedDoctors = (doctorsData || []).map(doc => ({
          ...doc,
          due_balance: balances[doc.id] || 0
        }));

        setDoctors(enrichedDoctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [user]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
      setDoctors(doctors.filter(d => d.id !== id));
      alert('Doctor removed successfully');
    } catch (err) {
      console.error('Error deleting doctor:', err);
      alert('Error removing doctor');
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title="Doctors" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="glass-card animate-slide-up" style={{ padding: '20px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0B1F4D' }}>{doctor.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Award size={12} color="#64748B" />
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{doctor.specialty || 'Veterinary Surgeon'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F8FAFC', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{doctor.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="#94A3B8" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{doctor.address || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ background: '#FEF2F2', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#991B1B' }}>Outstanding Balance</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444' }}>₹{(doctor.due_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(doctor.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {doctors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Doctors Found</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>Add a veterinarian to manage medical history and payments.</p>
                <button 
                  onClick={() => navigate('/doctors/add')}
                  style={{ padding: '12px 24px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  <Plus size={18} />
                  Add Doctor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
