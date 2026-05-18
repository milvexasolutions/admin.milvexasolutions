import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Activity, IndianRupee, History, Search, Edit2, Trash2 } from 'lucide-react';

const TransactionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTransactions();
  }, [user]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
      alert('Transaction deleted successfully');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Error deleting transaction');
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'All' ? true : t.type === filter
  );

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 80px)' }}>
      <PageHeader title="Transaction History" showBack={true} />
      
      <div style={{ padding: '20px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px', background: 'white', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpRight size={14} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Income</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>₹{totalIncome.toLocaleString()}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', background: 'white', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowDownLeft size={14} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Expense</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444' }}>₹{totalExpense.toLocaleString()}</div>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }} className="no-scrollbar">
          {['All', 'Income', 'Expense'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                background: filter === f ? '#0B1F4D' : 'white',
                color: filter === f ? 'white' : '#64748B',
                fontSize: '13px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                border: '1px solid #F1F5F9'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="glass-card animate-slide-up" style={{ padding: '16px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: tx.type === 'Income' ? '#ECFDF5' : '#FEF2F2', 
                  color: tx.type === 'Income' ? '#10B981' : '#EF4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {tx.type === 'Income' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0B1F4D' }}>{tx.category}</h3>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: tx.type === 'Income' ? '#10B981' : '#EF4444' }}>
                      {tx.type === 'Income' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>{tx.note || 'No description'}</span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => navigate(`/finance/edit/${tx.id}`)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
                <History size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 4px' }}>No Transactions</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>Start recording your farm income and expenses.</p>
                <button 
                  onClick={() => navigate('/finance/add')}
                  style={{ padding: '10px 20px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  <Plus size={18} />
                  Record Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
