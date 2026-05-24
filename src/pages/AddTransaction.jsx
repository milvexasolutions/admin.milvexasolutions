import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, IndianRupee, Calendar, FileText, ArrowUpRight, ArrowDownLeft, Tag, Building2, Clock, User, Package, Zap, Wrench, Droplets, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [ledgerPeriods, setLedgerPeriods] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [formData, setFormData] = useState({
    type: 'Expense', // Income or Expense
    amount: '',
    category: 'Feed',
    date: new Date().toISOString().split('T')[0],
    note: '',
    
    // Dynamic fields
    dairy_name: '',
    period_id: '',
    animal_search: '',
    staff_id: '',
    feed_item: '',
    bill_month: new Date().toISOString().slice(0, 7),
    asset_name: '',
    milk_shift: 'Morning',
    milk_qty: ''
  });

  const categories = {
    Expense: ['Feed', 'Medicine', 'Salary', 'Doctor Fee', 'Electricity', 'Maintenance', 'Animal Purchase', 'Other'],
    Income: ['Dairy Salary', 'Animal Sale', 'Milk Sale', 'Other'],
    'Cash Withdraw': ['Cash Withdraw']
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: socData } = await supabase.from('societies').select('name');
        setSocieties(socData || []);

        const { data: ledgerData } = await supabase.from('dairy_ledger')
          .select('id, dairy_name, period_start, period_end, total_milk_amount')
          .order('period_start', { ascending: false });
        setLedgerPeriods(ledgerData || []);

        const { data: animalData } = await supabase.from('animals')
          .select('id, name, tag_id')
          .in('status', ['Milch', 'Dry', 'Baby']);
        setAnimals(animalData || []);

        const { data: workersData } = await supabase.from('staff')
          .select('id, name, salary_amount')
          .eq('is_active', true);
        setWorkers(workersData || []);

        const { data: invData } = await supabase.from('inventory')
          .select('id, item_name')
          .eq('category', 'Feed');
        setInventory(invData || []);
      };
      fetchData();
    }
  }, [user]);

  // Handlers for dynamic fields
  const handlePeriodChange = (e) => {
    const pId = e.target.value;
    if (pId) {
      const selectedPeriod = ledgerPeriods.find(p => p.id === pId);
      if (selectedPeriod) {
        const sDate = new Date(selectedPeriod.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const eDate = new Date(selectedPeriod.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        setFormData(prev => ({
          ...prev, period_id: pId, amount: selectedPeriod.total_milk_amount,
          note: `Salary from ${selectedPeriod.dairy_name} for ${sDate} - ${eDate}`
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, period_id: pId }));
    }
  };

  const handleAnimalSearchChange = (e) => {
    const val = e.target.value;
    let newNote = '';
    if (formData.category === 'Animal Sale') newNote = `Sold animal: ${val}`;
    else if (formData.category === 'Medicine') newNote = `Medicine for: ${val}`;
    else if (formData.category === 'Doctor Fee') newNote = `Doctor fee for: ${val}`;
    setFormData(prev => ({ ...prev, animal_search: val, note: newNote }));
  };

  const handleStaffChange = (e) => {
    const sId = e.target.value;
    const staff = workers.find(w => w.id === sId);
    setFormData(prev => ({
       ...prev, staff_id: sId, 
       note: staff ? `Salary paid to ${staff.name}` : prev.note,
       amount: staff && staff.salary_amount ? staff.salary_amount : prev.amount
    }));
  };

  const handleFeedChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, feed_item: val, note: `Purchased feed: ${val}` }));
  };

  const handleBillMonthChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, bill_month: val, note: `Electricity bill for ${val}` }));
  };

  const handleAssetChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, asset_name: val, note: `Maintenance for ${val}` }));
  };

  const handleMilkChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      updated.note = `Sold ${updated.milk_qty || 0}L milk (${updated.milk_shift} shift)`;
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: newCat,
      note: '', // Reset note when category changes
      dairy_name: '', period_id: '', animal_search: '', staff_id: '', feed_item: '', asset_name: '', milk_qty: ''
    }));
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

  const filteredPeriods = ledgerPeriods.filter(p => p.dairy_name === formData.dairy_name);

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 88px)', paddingBottom: '40px' }}>
      <PageHeader title="Add Income/Exp" showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Transaction Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Transaction Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCategoryChange({ target: { value: 'Dairy Salary' } }) || setFormData(prev => ({...prev, type: 'Income'}))}
                  style={{
                    padding: '12px 6px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: '900',
                    background: formData.type === 'Income' ? '#10B981' : '#F1F5F9',
                    color: formData.type === 'Income' ? 'white' : '#64748B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer'
                  }}
                >
                  <ArrowUpRight size={16} /> Income
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange({ target: { value: 'Feed' } }) || setFormData(prev => ({...prev, type: 'Expense'}))}
                  style={{
                    padding: '12px 6px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: '900',
                    background: formData.type === 'Expense' ? '#EF4444' : '#F1F5F9',
                    color: formData.type === 'Expense' ? 'white' : '#64748B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer'
                  }}
                >
                  <ArrowDownLeft size={16} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange({ target: { value: 'Cash Withdraw' } }) || setFormData(prev => ({...prev, type: 'Cash Withdraw'}))}
                  style={{
                    padding: '12px 6px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: '900',
                    background: formData.type === 'Cash Withdraw' ? '#F97316' : '#F1F5F9',
                    color: formData.type === 'Cash Withdraw' ? 'white' : '#64748B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer'
                  }}
                >
                  <Wallet size={16} /> Withdraw
                </button>
              </div>
            </div>

            {/* 2. Category */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Tag size={18} />
                </div>
                <select 
                  required
                  value={formData.category}
                  onChange={handleCategoryChange}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A', appearance: 'none' }}
                >
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Date */}
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

            {/* --- DYNAMIC FIELDS --- */}

            {/* Dairy Salary */}
            {formData.category === 'Dairy Salary' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Dairy</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                      <Building2 size={18} />
                    </div>
                    <select 
                      required
                      value={formData.dairy_name}
                      onChange={(e) => setFormData({...formData, dairy_name: e.target.value, period_id: ''})}
                      style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#1E3A8A', appearance: 'none' }}
                    >
                      <option value="" disabled>Choose a Dairy</option>
                      {societies.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {formData.dairy_name && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Period</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                        <Clock size={18} />
                      </div>
                      <select 
                        required
                        value={formData.period_id}
                        onChange={handlePeriodChange}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#1E3A8A', appearance: 'none' }}
                      >
                        <option value="" disabled>Choose a Period</option>
                        {filteredPeriods.length === 0 && <option value="" disabled>No periods found</option>}
                        {filteredPeriods.map(p => {
                          const sDate = new Date(p.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                          const eDate = new Date(p.period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                          return <option key={p.id} value={p.id}>{sDate} - {eDate} (Bill: ₹{p.total_milk_amount})</option>;
                        })}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Animal Sale, Medicine, Doctor Fee */}
            {['Animal Sale', 'Medicine', 'Doctor Fee'].includes(formData.category) && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Animal (Name or Tag)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Tag size={18} />
                  </div>
                  <input 
                    type="text" 
                    list="animals-list"
                    required
                    placeholder="Search by name or tag..."
                    value={formData.animal_search}
                    onChange={handleAnimalSearchChange}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#9A3412' }}
                  />
                  <datalist id="animals-list">
                    {animals.map(a => <option key={a.id} value={`${a.name} (Tag: ${a.tag_id})`} />)}
                  </datalist>
                </div>
              </div>
            )}

            {/* Salary */}
            {formData.category === 'Salary' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Staff</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <User size={18} />
                  </div>
                  <select 
                    required
                    value={formData.staff_id}
                    onChange={handleStaffChange}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#065F46', appearance: 'none' }}
                  >
                    <option value="" disabled>Choose Staff Member</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Feed */}
            {formData.category === 'Feed' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Feed Item</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Package size={18} />
                  </div>
                  <input 
                    type="text" 
                    list="feed-list"
                    required
                    placeholder="e.g. Corn, Hay..."
                    value={formData.feed_item}
                    onChange={handleFeedChange}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                  <datalist id="feed-list">
                    {inventory.map(i => <option key={i.id} value={i.item_name} />)}
                  </datalist>
                </div>
              </div>
            )}

            {/* Electricity */}
            {formData.category === 'Electricity' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Bill Month</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Zap size={18} />
                  </div>
                  <input 
                    type="month" 
                    required
                    value={formData.bill_month}
                    onChange={handleBillMonthChange}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#854D0E' }}
                  />
                </div>
              </div>
            )}

            {/* Maintenance */}
            {formData.category === 'Maintenance' && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Asset Name / Detail</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <Wrench size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Tractor, Milking Machine..."
                    value={formData.asset_name}
                    onChange={handleAssetChange}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
              </div>
            )}

            {/* Milk Sale */}
            {formData.category === 'Milk Sale' && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Shift</label>
                  <select 
                    value={formData.milk_shift}
                    onChange={(e) => handleMilkChange('milk_shift', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Quantity (L)</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                      <Droplets size={16} />
                    </div>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={formData.milk_qty}
                      onChange={(e) => handleMilkChange('milk_qty', e.target.value)}
                      style={{ width: '100%', padding: '14px 14px 14px 40px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- END DYNAMIC FIELDS --- */}

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10B981' }}>
                  <IndianRupee size={18} />
                </div>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{ 
                    width: '100%', padding: '14px 14px 14px 48px', 
                    background: (formData.category === 'Dairy Salary' && formData.period_id) || (formData.category === 'Salary' && formData.staff_id) ? '#F0FDF4' : '#F1F5F9', 
                    border: (formData.category === 'Dairy Salary' && formData.period_id) || (formData.category === 'Salary' && formData.staff_id) ? '1px solid #BBF7D0' : 'none', 
                    borderRadius: '16px', fontSize: '18px', fontWeight: '900', 
                    color: (formData.category === 'Dairy Salary' && formData.period_id) || (formData.category === 'Salary' && formData.staff_id) ? '#059669' : '#0F172A' 
                  }}
                />
              </div>
            </div>

            {/* Note */}
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
