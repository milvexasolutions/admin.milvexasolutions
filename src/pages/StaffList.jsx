import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Users, Phone, Briefcase, Plus, Activity, Banknote, IndianRupee, Edit2, Trash2 } from 'lucide-react';

const StaffList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!user) return;
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .order('name');

        if (staffError && staffError.code !== '42P01') throw staffError;

        // Fetch transactions for advances (Upaad)
        const { data: transData, error: transError } = await supabase
          .from('staff_transactions')
          .select('staff_id, amount, type');

        if (transError && transError.code !== '42P01') throw transError;

        // Calculate active advances (Upaad)
        // Simple logic: Sum of Advances - Sum of Salary Payments (if categorized that way)
        // Or just show total outstanding Advance.
        const advances = (transData || []).reduce((acc, curr) => {
          if (curr.type === 'Advance') {
            acc[curr.staff_id] = (acc[curr.staff_id] || 0) + (curr.amount || 0);
          }
          return acc;
        }, {});

        const enrichedStaff = (staffData || []).map(s => ({
          ...s,
          advance_balance: advances[s.id] || 0
        }));

        setStaff(enrichedStaff);
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [user]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      setStaff(staff.filter(s => s.id !== id));
      alert('Staff removed successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Error removing staff');
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title="Farm Staff" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {staff.map((member) => (
              <div key={member.id} className="glass-card animate-slide-up" style={{ padding: '20px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0B1F4D' }}>{member.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Briefcase size={12} color="#64748B" />
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{member.role || 'General Staff'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F8FAFC', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Salary</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0B1F4D' }}>₹{(member.salary_amount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Phone</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569' }}>{member.phone || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #FFEDD5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Banknote size={16} color="#C2410C" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#9A3412' }}>Upaad (Advance)</span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#C2410C' }}>₹{(member.advance_balance || 0).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => navigate(`/staff/edit/${member.id}`)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {staff.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Staff Found</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>Add your farm workers to manage salaries and advances.</p>
                <button 
                  onClick={() => navigate('/staff/add')}
                  style={{ padding: '12px 24px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  <Plus size={18} />
                  Add Staff
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;
