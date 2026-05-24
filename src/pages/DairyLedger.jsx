import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Activity, Building2, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const DairyLedger = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    id: null,
    dairy_name: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    total_milk_amount: '',
    paid_amount: '',
    status: 'Pending',
    // New fields for auto generation
    auto_generate: false,
    period_days: 10,
  });

  useEffect(() => {
    fetchData();
  }, [user, selectedYear]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: socData } = await supabase.from('societies').select('name');
      setSocieties(socData || []);

      const { data: ledgerData, error } = await supabase
        .from('dairy_ledger')
        .select('*')
        .order('period_start', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      
      const allLedgers = ledgerData || [];
      setLedgers(allLedgers);

      // --- AUTO YEAR CHANGE LOGIC ---
      if (allLedgers.length > 0) {
        const currentYear = new Date().getFullYear();
        const uniqueDairies = [...new Set(allLedgers.map(l => l.dairy_name))];
        
        let needRefresh = false;

        for (const dairy of uniqueDairies) {
          const dairyLedgers = allLedgers.filter(l => l.dairy_name === dairy);
          const hasCurrentYear = dairyLedgers.some(l => new Date(l.period_start).getFullYear() === currentYear);
          
          if (!hasCurrentYear) {
            // Auto generate for current year based on past settings
            console.log(`Auto-generating new year (${currentYear}) periods for ${dairy}...`);
            const pastPeriodDays = getPeriodDaysForDairy(dairy, dairyLedgers);
            await generateYearlyPayloads(dairy, pastPeriodDays, currentYear, user.id);
            needRefresh = true;
          }
        }

        if (needRefresh) {
           // Fetch again if we auto-generated
           const { data: newLedgerData } = await supabase.from('dairy_ledger').select('*').order('period_start', { ascending: false });
           setLedgers(newLedgerData || []);
        }
      }

    } catch (err) {
      console.error('Error fetching Dairy Ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDaysForDairy = (dairyName, dairyLedgers) => {
    const firstOfMonthLedger = dairyLedgers.find(l => new Date(l.period_start).getDate() === 1);
    if (firstOfMonthLedger) {
       const start = new Date(firstOfMonthLedger.period_start);
       const end = new Date(firstOfMonthLedger.period_end);
       return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 10; // default fallback
  };

  const handleOpenModal = (ledger = null) => {
    if (ledger) {
      setFormData({
        id: ledger.id,
        dairy_name: ledger.dairy_name,
        period_start: ledger.period_start,
        period_end: ledger.period_end,
        total_milk_amount: ledger.total_milk_amount,
        paid_amount: ledger.paid_amount,
        status: ledger.status,
        auto_generate: false,
      });
    } else {
      setFormData({
        id: null,
        dairy_name: '',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        total_milk_amount: '',
        paid_amount: '',
        status: 'Pending',
        auto_generate: true, // Default to auto-generate for new additions
        period_days: 10,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      const { error } = await supabase.from('dairy_ledger').delete().eq('id', id);
      if (error) throw error;
      setLedgers(ledgers.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting ledger record:', err);
      alert('Error deleting record');
    }
  };

  const generateYearlyPayloads = async (dairyName, periodDays, year, ownerId) => {
    const payloads = [];
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let currentStart = 1;
      
      while (currentStart <= daysInMonth) {
        let currentEnd = currentStart + periodDays - 1;
        
        if (currentEnd >= daysInMonth) {
          currentEnd = daysInMonth;
        } else if (daysInMonth - currentEnd <= 3) {
          // If only 1-3 days left in the month, combine them into this chunk
          currentEnd = daysInMonth;
        }

        const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentStart).padStart(2, '0')}`;
        const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentEnd).padStart(2, '0')}`;

        payloads.push({
          owner_id: ownerId,
          dairy_name: dairyName,
          period_start: startDateStr,
          period_end: endDateStr,
          total_milk_amount: 0,
          paid_amount: 0,
          status: 'Pending'
        });

        currentStart = currentEnd + 1;
      }
    }

    const { error } = await supabase.from('dairy_ledger').insert(payloads);
    if (error) throw error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setIsAutoGenerating(formData.auto_generate);

    try {
      if (formData.auto_generate && !formData.id) {
        // Auto Generate for the whole selected year
        const year = selectedYear;
        const pDays = parseInt(formData.period_days) || 10;
        await generateYearlyPayloads(formData.dairy_name, pDays, year, user.id);
        alert(`Successfully generated all periods for ${year}!`);
      } else {
        // Normal Update for a single period
        const payload = {
          owner_id: user.id,
          dairy_name: formData.dairy_name,
          period_start: formData.period_start,
          period_end: formData.period_end,
          total_milk_amount: parseFloat(formData.total_milk_amount) || 0,
          paid_amount: parseFloat(formData.paid_amount) || 0,
          status: formData.status
        };

        if (formData.id) {
          const { error } = await supabase.from('dairy_ledger').update(payload).eq('id', formData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('dairy_ledger').insert([payload]);
          if (error) throw error;
        }
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving Dairy Ledger:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
      setIsAutoGenerating(false);
    }
  };

  const calculateBalance = (total, paid) => {
    return (parseFloat(total) || 0) - (parseFloat(paid) || 0);
  };

  const displayLedgers = ledgers.filter(l => new Date(l.period_start).getFullYear() === selectedYear);

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title="Dairy Ledger" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        
        {/* Header and Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0B1F4D' }}>Milk Payments</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', color: '#0B1F4D', background: 'white' }}
              >
                {[...Array(5)].map((_, i) => {
                  const yr = new Date().getFullYear() - 2 + i;
                  return <option key={yr} value={yr}>{yr}</option>;
                })}
              </select>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            style={{ 
              width: '44px', height: '44px', 
              background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', 
              color: 'white', borderRadius: '14px', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(11,31,77,0.2)', cursor: 'pointer'
            }}
          >
            <Plus size={24} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayLedgers.map((ledger) => (
              <div key={ledger.id} className="glass-card animate-slide-up" style={{ padding: '20px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0B1F4D' }}>{ledger.dairy_name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Calendar size={12} color="#64748B" />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                          {new Date(ledger.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(ledger.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: '800', 
                    textTransform: 'uppercase',
                    background: ledger.status === 'Paid' ? '#F0FDF4' : ledger.status === 'Partial' ? '#FFFBEB' : '#FEF2F2',
                    color: ledger.status === 'Paid' ? '#16A34A' : ledger.status === 'Partial' ? '#D97706' : '#DC2626'
                  }}>
                    {ledger.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Total Milk (₹)</p>
                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#0B1F4D' }}>{parseFloat(ledger.total_milk_amount).toLocaleString()}</h4>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Paid (₹)</p>
                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#10B981' }}>{parseFloat(ledger.paid_amount).toLocaleString()}</h4>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Balance (₹)</p>
                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#EF4444' }}>{calculateBalance(ledger.total_milk_amount, ledger.paid_amount).toLocaleString()}</h4>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button 
                    onClick={() => handleOpenModal(ledger)}
                    style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    Edit Amount
                  </button>
                  <button 
                    onClick={() => handleDelete(ledger.id)}
                    style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {displayLedgers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Records for {selectedYear}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>Click the + button to auto-generate periods for {selectedYear}.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(11,31,77,0.5)', backdropFilter: 'blur(4px)', 
          zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' 
        }}>
          <div className="animate-slide-up" style={{ 
            background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px 32px 0 0', 
            padding: '24px', maxHeight: '90vh', overflowY: 'auto' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>
                {formData.id ? 'Edit Period Amount' : `Auto-Generate Periods (${selectedYear})`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ width: '32px', height: '32px', background: '#F1F5F9', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Dairy Name</label>
                {societies.length > 0 ? (
                  <select 
                    required
                    disabled={formData.id !== null}
                    value={formData.dairy_name}
                    onChange={(e) => setFormData({...formData, dairy_name: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', opacity: formData.id ? 0.7 : 1 }}
                  >
                    <option value="" disabled>Select a Dairy</option>
                    {societies.map((s, idx) => (
                      <option key={idx} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    required
                    disabled={formData.id !== null}
                    value={formData.dairy_name}
                    onChange={(e) => setFormData({...formData, dairy_name: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', opacity: formData.id ? 0.7 : 1 }}
                  />
                )}
              </div>

              {formData.auto_generate && !formData.id ? (
                // Auto Generate Form
                <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E3A8A', marginBottom: '8px', textTransform: 'uppercase' }}>Period Duration (Days)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="31"
                    value={formData.period_days}
                    onChange={(e) => setFormData({...formData, period_days: e.target.value})}
                    style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1px solid #93C5FD', borderRadius: '12px', fontSize: '16px', fontWeight: '800', color: '#1E40AF' }}
                  />
                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#3B82F6', fontWeight: '600' }}>
                    This will automatically create all payment periods for the year {selectedYear}, adjusting month-ends correctly.
                  </p>
                </div>
              ) : (
                // Edit Amounts Form
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Start Date</label>
                      <input 
                        type="date" 
                        required
                        value={formData.period_start}
                        onChange={(e) => setFormData({...formData, period_start: e.target.value})}
                        style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>End Date</label>
                      <input 
                        type="date" 
                        required
                        value={formData.period_end}
                        onChange={(e) => setFormData({...formData, period_end: e.target.value})}
                        style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Total Milk (₹)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={formData.total_milk_amount}
                        onChange={(e) => setFormData({...formData, total_milk_amount: e.target.value})}
                        style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Paid Amount (₹)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={formData.paid_amount}
                        onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
                        style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '16px', border: '1px solid #FEE2E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B' }}>Calculated Balance</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444' }}>
                      ₹{calculateBalance(formData.total_milk_amount, formData.paid_amount).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={saving}
                style={{ 
                  width: '100%', padding: '18px', background: '#0B1F4D', color: 'white', 
                  borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '900', 
                  marginTop: '16px', opacity: saving ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                {saving || isAutoGenerating ? 'Processing...' : (formData.auto_generate && !formData.id ? `Generate for ${selectedYear}` : 'Save Record')}
                {!saving && !isAutoGenerating && (formData.auto_generate && !formData.id ? <RefreshCw size={18} /> : <Save size={18} />)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DairyLedger;
