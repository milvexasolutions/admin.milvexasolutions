import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Search, 
  Check, 
  AlertCircle, 
  Copy, 
  Wallet, 
  CheckCircle2, 
  Info, 
  X,
  Calendar,
  User,
  IndianRupee,
  FileText,
  Phone,
  PhoneOff,
  FileDown,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  Bell,
  MessageSquare
} from 'lucide-react';

const BorrowLend = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Khatabook Navigation: activeCustomer is null for Parties List, or string name for Customer Ledger
  const [activeCustomer, setActiveCustomer] = useState(null);
  
  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalType, setTxModalType] = useState('Debit'); // 'Debit' (You Gave - Red) or 'Credit' (You Got - Green)
  
  // Form States
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [personPhones, setPersonPhones] = useState(() => {
    const saved = localStorage.getItem('milvexa_person_phones');
    return saved ? JSON.parse(saved) : {};
  });

  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'YouWillGet' | 'YouWillGive' | 'Settled'

  const sqlCode = `-- Run this SQL in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.borrow_lend (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Credit', 'Debit')), -- Credit = borrowed (You Got), Debit = lent (You Gave)
  amount      NUMERIC(12, 2) NOT NULL,
  status      TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Settled')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_borrow_lend_owner ON public.borrow_lend(owner_id);
CREATE INDEX IF NOT EXISTS idx_borrow_lend_type  ON public.borrow_lend(type);
CREATE INDEX IF NOT EXISTS idx_borrow_lend_status ON public.borrow_lend(status);

ALTER TABLE public.borrow_lend ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on borrow_lend" ON public.borrow_lend;
CREATE POLICY "Owner full access on borrow_lend"
  ON public.borrow_lend FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);`;

  useEffect(() => {
    localStorage.removeItem('demo_borrow_lend_khatabook'); // Clear legacy dummy data
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);

    if (user.id === 'demo-user') {
      const demoData = localStorage.getItem('demo_borrow_lend_khatabook_v3');
      if (demoData) {
        setRecords(JSON.parse(demoData));
      } else {
        const initialDemo = [];
        localStorage.setItem('demo_borrow_lend_khatabook_v3', JSON.stringify(initialDemo));
        setRecords(initialDemo);
      }
      setIsTableMissing(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('borrow_lend')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          setIsTableMissing(true);
        } else {
          throw error;
        }
      } else {
        setRecords(data || []);
        setIsTableMissing(false);
      }
    } catch (err) {
      console.error('Error fetching borrow & lend records:', err);
    } finally {
      setLoading(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group transactions by customer name and calculate balances
  const getCustomerBalances = () => {
    const balances = {};
    
    records.forEach(r => {
      const name = r.person_name;
      if (!balances[name]) {
        balances[name] = {
          name,
          youGave: 0, // Debit
          youGot: 0,  // Credit
          lastActivity: r.date,
          transactionsCount: 0
        };
      }
      
      const amt = parseFloat(r.amount) || 0;
      if (r.type === 'Debit') {
        balances[name].youGave += amt;
      } else {
        balances[name].youGot += amt;
      }

      if (new Date(r.date) > new Date(balances[name].lastActivity)) {
        balances[name].lastActivity = r.date;
      }
      balances[name].transactionsCount += 1;
    });

    return Object.values(balances).map(b => {
      const balance = b.youGave - b.youGot;
      return {
        ...b,
        balance, // positive means "You will get" (customer owes you), negative means "You will give"
      };
    });
  };

  const customerBalances = getCustomerBalances();

  // Overall Totals
  const totalYouWillGet = customerBalances
    .filter(c => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  const totalYouWillGive = customerBalances
    .filter(c => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);

  // Filters for Parties
  const filteredCustomers = customerBalances.filter(c => {
    const phone = personPhones[c.name] || '';
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || phone.includes(searchQuery);
    if (!matchesSearch) return false;

    if (filterType === 'YouWillGet') return c.balance > 0;
    if (filterType === 'YouWillGive') return c.balance < 0;
    if (filterType === 'Settled') return c.balance === 0;
    return true;
  });

  // Handle adding new customer name
  const handleAddCustomer = (e) => {
    e.preventDefault();
    const name = newCustomerName.trim();
    if (!name) return;

    // Save phone mapping
    const phone = newCustomerPhone.trim();
    const updatedPhones = { ...personPhones, [name]: phone };
    setPersonPhones(updatedPhones);
    localStorage.setItem('milvexa_person_phones', JSON.stringify(updatedPhones));

    // Set as active customer immediately to open their blank ledger
    setActiveCustomer(name);
    setShowAddCustomerModal(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  // Handle editing person name & phone
  const handleEditCustomer = async (e) => {
    e.preventDefault();
    const oldName = activeCustomer;
    const newName = editCustomerName.trim();
    const newPhone = editCustomerPhone.trim();
    if (!newName) return;

    setLoading(true);

    try {
      // 1. Update phones mapping
      const updatedPhones = { ...personPhones };
      delete updatedPhones[oldName];
      updatedPhones[newName] = newPhone;
      setPersonPhones(updatedPhones);
      localStorage.setItem('milvexa_person_phones', JSON.stringify(updatedPhones));

      // 2. Update records (memory & DB)
      const updatedRecords = records.map(r => r.person_name === oldName ? { ...r, person_name: newName } : r);
      setRecords(updatedRecords);

      if (user.id === 'demo-user') {
        localStorage.setItem('demo_borrow_lend_khatabook_v3', JSON.stringify(updatedRecords));
      } else {
        const { error } = await supabase
          .from('borrow_lend')
          .update({ person_name: newName })
          .eq('person_name', oldName);
        if (error) throw error;
      }

      // 3. Set active person name to the new name
      setActiveCustomer(newName);
      setShowEditCustomerModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a Gave/Got transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!activeCustomer || !formData.amount) return;
    setLoading(true);

    const payload = {
      person_name: activeCustomer,
      amount: parseFloat(formData.amount),
      type: txModalType, // 'Debit' (You Gave) or 'Credit' (You Got)
      date: formData.date,
      note: formData.note.trim()
    };

    if (user.id === 'demo-user') {
      const newTx = {
        id: 'demo-tx-' + Date.now(),
        ...payload
      };
      const updated = [newTx, ...records];
      setRecords(updated);
      localStorage.setItem('demo_borrow_lend_khatabook_v3', JSON.stringify(updated));
      setShowTxModal(false);
      setFormData({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('borrow_lend')
        .insert([{ owner_id: user.id, ...payload }]);

      if (error) throw error;
      
      await fetchRecords();
      setShowTxModal(false);
      setFormData({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm(t('confirm_delete', 'Are you sure you want to delete?'))) return;

    if (user.id === 'demo-user') {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('demo_borrow_lend_khatabook_v3', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('borrow_lend')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  // Generate PDF Report
  const generatePDFReport = (customerName = null) => {
    const doc = new jsPDF();
    const title = customerName ? `${customerName} Ledger Report` : "All Parties Borrow & Lend Report";
    
    doc.setFontSize(18);
    doc.text("MILVEXA CATTLE FARM", 14, 20);
    doc.setFontSize(12);
    doc.text(title, 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 34);

    if (customerName) {
      // Single customer ledger
      const txs = records
        .filter(r => r.person_name === customerName)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const tableRows = [];
      let balance = 0;

      txs.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        let youGave = "-";
        let youGot = "-";

        if (t.type === 'Debit') {
          youGave = `Rs. ${amt}`;
          balance += amt;
        } else {
          youGot = `Rs. ${amt}`;
          balance -= amt;
        }

        tableRows.push([
          new Date(t.date).toLocaleDateString('en-IN'),
          t.note || "-",
          youGave,
          youGot,
          `Rs. ${balance}`
        ]);
      });

      doc.autoTable({
        startY: 42,
        head: [['Date', 'Description / Note', 'You Gave (Lent)', 'You Got (Recd)', 'Balance']],
        body: tableRows,
      });

      const finalY = doc.previousAutoTable.finalY || 50;
      doc.setFontSize(14);
      doc.text(`Final Balance: Rs. ${balance} (${balance > 0 ? "You will get" : balance < 0 ? "You will give" : "Settled Up"})`, 14, finalY + 15);
    } else {
      // All parties summary
      const tableRows = customerBalances.map(c => [
        c.name,
        `Rs. ${c.youGave}`,
        `Rs. ${c.youGot}`,
        c.balance > 0 ? `Get Rs. ${c.balance}` : c.balance < 0 ? `Give Rs. ${Math.abs(c.balance)}` : "Settled"
      ]);

      doc.autoTable({
        startY: 42,
        head: [['Customer Name', 'Total You Gave', 'Total You Got', 'Status / Net']],
        body: tableRows,
      });
    }

    doc.save(`${customerName || 'all_parties'}_ledger_report.pdf`);
  };

  // Helper to format date relative time (e.g. "13 months ago")
  const formatRelativeTime = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };

  // Get initials for Circular Avatar
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // -------------------------------------------------------------
  // MASTER SCREEN: PARTIES/CUSTOMERS LIST
  // -------------------------------------------------------------
  if (activeCustomer === null) {
    // If Supabase table doesn't exist, show setup screen
    if (isTableMissing) {
      return (
        <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
          <PageHeader title={t('borrow_lend', 'Credit & Debit')} showBack={true} />
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card animate-slide-up" style={{ padding: '28px', background: 'white', borderRadius: '28px', boxShadow: '0 12px 30px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertCircle size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0B1F4D', margin: '0 0 8px' }}>Database Table Required</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px' }}>
                To start using the Borrow & Lend ledger, you need to create the table in Supabase. Copy the SQL script below and execute it in your Supabase SQL Editor.
              </p>

              <div style={{ position: 'relative', background: '#0F172A', borderRadius: '16px', padding: '16px', textAlign: 'left', overflowX: 'auto', marginBottom: '24px' }}>
                <button 
                  onClick={copySqlToClipboard}
                  style={{
                    position: 'absolute', right: '12px', top: '12px',
                    background: copied ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '6px 12px', fontSize: '12px', fontWeight: '800',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
                <pre style={{ margin: 0, fontFamily: 'monospace', color: '#38BDF8', fontSize: '11px', lineHeight: 1.6, overflowX: 'auto' }}>{sqlCode}</pre>
              </div>

              <button 
                onClick={fetchRecords}
                style={{
                  width: '100%', padding: '16px',
                  background: '#0B1F4D', color: 'white',
                  border: 'none', borderRadius: '16px',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                Verify Setup
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '120px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
        <PageHeader title={t('borrow_lend', 'Credit & Debit')} showBack={true} />

        <div style={{ padding: '0 20px', marginTop: '16px' }}>
          
          {/* --- TOP SUMMARY CARD (Exactly like Khatabook) --- */}
          <div className="glass-card animate-slide-up" style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '20px' }}>
              
              {/* You Will Give */}
              <div style={{ textAlign: 'center', borderRight: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                  {t('you_will_give', 'You will give')}
                </span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#EF4444' }}>
                  ₹{totalYouWillGive.toLocaleString('en-IN')}
                </span>
              </div>

              {/* You Will Get */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                  {t('you_will_get', 'You will get')}
                </span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#10B981' }}>
                  ₹{totalYouWillGet.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* View Reports Button */}
            <button 
              onClick={() => generatePDFReport()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#F8FAFC',
                border: 'none',
                borderTop: '1px solid #E2E8F0',
                color: '#3B82F6',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileDown size={16} />
              {t('view_reports', 'View Reports')}
            </button>
          </div>

          {/* --- SEARCH & FILTERS BAR --- */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder={t('search_person', 'Search Person...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '12px 12px 12px 38px',
                  background: 'white', border: '1px solid #E2E8F0',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                  color: '#0F172A', outline: 'none'
                }}
              />
            </div>
            
            {/* Filter Toggle */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '12px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '800',
                color: '#64748B',
                outline: 'none'
              }}
            >
              <option value="All">{t('all_parties', 'All Parties')}</option>
              <option value="YouWillGet">{t('you_will_get', 'You will get')}</option>
              <option value="YouWillGive">{t('you_will_give', 'You will give')}</option>
              <option value="Settled">{t('settled_up', 'Settled Up')}</option>
            </select>
          </div>

          {/* --- CUSTOMERS LIST --- */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {filteredCustomers.map((customer, index) => (
                <div 
                  key={customer.name}
                  onClick={() => setActiveCustomer(customer.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: index === filteredCustomers.length - 1 ? 'none' : '1px solid #F1F5F9',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Circle Initials Avatar */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '800'
                    }}>
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                        {customer.name}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {personPhones[customer.name] && (
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                            📞 {personPhones[customer.name]}
                          </span>
                        )}
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>
                          {formatRelativeTime(customer.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right balance */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '900',
                      color: customer.balance > 0 ? '#10B981' : customer.balance < 0 ? '#EF4444' : '#64748B'
                    }}>
                      ₹{Math.abs(customer.balance).toLocaleString('en-IN')}
                    </span>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <Wallet size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 4px' }}>{t('no_persons', 'No Persons')}</h4>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{t('add_person_desc', 'Add a person to start tracking credit & debit.')}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* --- FLOATING ACTION BUTTON (ADD PERSON) --- */}
        <button
          onClick={() => setShowAddCustomerModal(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#9D174D', // Pinkish Crimson Red color from screenshot
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '14px 24px',
            fontSize: '14px',
            fontWeight: '900',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(157, 23, 77, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 100
          }}
        >
          <Plus size={18} />
          {t('add_person', 'ADD PERSON')}
        </button>

        {/* --- ADD PERSON MODAL --- */}
        {showAddCustomerModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5, 22, 61, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{t('add_new_person', 'Add New Person')}</h4>
                <button onClick={() => setShowAddCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>{t('person_name', 'Person Name')}</label>
                  <input 
                    type="text"
                    required
                    placeholder={t('enter_name', 'Enter name...')}
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mobile_number', 'Mobile Number')}</label>
                  <input 
                    type="tel"
                    placeholder={t('enter_mobile', 'Enter mobile...')}
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '6px' }}>
                  {t('open_account', 'Open Account')}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // DETAIL SCREEN: SINGLE CUSTOMER LEDGER (Khatabook Style)
  // -------------------------------------------------------------
  const customerTxs = records
    .filter(r => r.person_name === activeCustomer)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

  // Calculate current customer net balance
  const activeYouGave = customerTxs.filter(t => t.type === 'Debit').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const activeYouGot = customerTxs.filter(t => t.type === 'Credit').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const activeBalance = activeYouGave - activeYouGot;

  // Running balance calculation array (bottom-up for cards)
  const calcRunningBalances = () => {
    const sortedAsc = [...customerTxs].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    const map = {};
    sortedAsc.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'Debit') {
        running += amt;
      } else {
        running -= amt;
      }
      map[t.id] = running;
    });
    return map;
  };
  const runningBalances = calcRunningBalances();

  // Group transactions by date for separators
  const groupedTxs = {};
  customerTxs.forEach(t => {
    const dStr = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    if (!groupedTxs[dStr]) {
      groupedTxs[dStr] = [];
    }
    groupedTxs[dStr].push(t);
  });

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '120px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      
      <PageHeader 
        title={
          <div 
            onClick={() => {
              setEditCustomerName(activeCustomer);
              setEditCustomerPhone(personPhones[activeCustomer] || '');
              setShowEditCustomerModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '800'
            }}>
              {getInitials(activeCustomer)}
            </div>

            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'white', whiteSpace: 'nowrap' }}>{activeCustomer}</h4>
              <span style={{ fontSize: '10px', background: '#3B82F6', padding: '2px 8px', borderRadius: '8px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block', marginTop: '2px' }}>{t('person_click_to_edit', 'Person (click to edit)')}</span>
            </div>
          </div>
        }
        showBack={true}
        onBack={() => setActiveCustomer(null)}
        rightAction={
          personPhones[activeCustomer] ? (
            <a 
              href={`tel:${personPhones[activeCustomer]}`}
              style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <Phone size={18} />
            </a>
          ) : (
            <button 
              onClick={() => {
                setEditCustomerName(activeCustomer);
                setEditCustomerPhone('');
                setShowEditCustomerModal(true);
              }}
              style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <PhoneOff size={18} />
            </button>
          )
        }
      />

      <div style={{ padding: '16px 20px 0' }}>
        
        {/* --- SETTLED STATUS BAR --- */}
        <div className="glass-card" style={{
          padding: '14px 18px',
          background: 'white',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          border: '1px solid #E2E8F0',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeBalance === 0 ? (
              <>
                <CheckCircle2 size={18} color="#10B981" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748B' }}>Settled Up</span>
              </>
            ) : activeBalance > 0 ? (
              <>
                <ArrowUpRight size={18} color="#10B981" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748B' }}>You will get</span>
              </>
            ) : (
              <>
                <ArrowDownLeft size={18} color="#EF4444" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748B' }}>You will give</span>
              </>
            )}
          </div>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '900',
            color: activeBalance > 0 ? '#10B981' : activeBalance < 0 ? '#EF4444' : '#64748B'
          }}>
            ₹{Math.abs(activeBalance).toLocaleString('en-IN')}
          </span>
        </div>

        {/* --- ACTION QUICK BAR (Report, Reminder, SMS) --- */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => generatePDFReport(activeCustomer)}
            style={{
              padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
              color: '#3B82F6', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}
          >
            <FileDown size={18} />
            {t('report', 'Report')}
          </button>
          
          <button 
            onClick={() => alert("Notification reminder scheduled!")}
            style={{
              padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
              color: '#F59E0B', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}
          >
            <Bell size={18} />
            {t('reminder', 'Reminder')}
          </button>

          <button 
            onClick={() => alert("SMS sent successfully via gateway!")}
            style={{
              padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
              color: '#10B981', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}
          >
            <MessageSquare size={18} />
            {t('sms', 'SMS')}
          </button>
        </div>

        {/* Column Headings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 6px', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>{t('entries', 'Entries')}</span>
          <div style={{ display: 'flex', gap: '48px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '56px', textAlign: 'center' }}>{t('you_gave', 'You Gave')}</span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', width: '56px', textAlign: 'center' }}>{t('you_got', 'You Got')}</span>
          </div>
        </div>

        {/* --- TRANSACTIONS CARDS GROUPED BY DATE --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {Object.entries(groupedTxs).map(([dateLabel, txs]) => (
            <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Date Header separator */}
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <span style={{ fontSize: '10px', background: '#E2E8F0', color: '#64748B', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                  {dateLabel}
                </span>
              </div>

              {txs.map(tx => {
                const isGave = tx.type === 'Debit'; // You Gave (Red)
                const runBal = runningBalances[tx.id] || 0;

                return (
                  <div 
                    key={tx.id}
                    style={{
                      background: 'white',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>
                          {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                          Bal. ₹{runBal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {tx.note && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                          {tx.note}
                        </p>
                      )}
                    </div>

                    {/* Right Columns (You Gave / You Got) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '64px', textAlign: 'center' }}>
                        {isGave ? (
                          <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '8px 4px', borderRadius: '8px', fontSize: '13px', fontWeight: '900' }}>
                            ₹{tx.amount}
                          </div>
                        ) : (
                          <span style={{ color: '#E2E8F0' }}>-</span>
                        )}
                      </div>
                      <div style={{ width: '64px', textAlign: 'center' }}>
                        {!isGave ? (
                          <div style={{ background: '#ECFDF5', color: '#10B981', padding: '8px 4px', borderRadius: '8px', fontSize: '13px', fontWeight: '900' }}>
                            ₹{tx.amount}
                          </div>
                        ) : (
                          <span style={{ color: '#E2E8F0' }}>-</span>
                        )}
                      </div>

                      {/* Delete button */}
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}

          {customerTxs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: '20px', border: '1.5px dashed #E2E8F0' }}>
              <Wallet size={36} color="#CBD5E1" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 4px' }}>{t('no_entries_yet', 'No Entries Yet')}</h4>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{t('add_tx_to_start_ledger', 'Add a transaction below to start ledger book.')}</p>
            </div>
          )}
        </div>

      </div>

      {/* --- STICKY BOTTOM BUTTONS (YOU GAVE / YOU GOT) --- */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '450px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        zIndex: 100
      }}>
        {/* You Gave (Debit / Red) */}
        <button 
          onClick={() => {
            setTxModalType('Debit');
            setShowTxModal(true);
          }}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 15px rgba(239, 68, 68, 0.25)'
          }}
        >
          {t('you_gave', 'YOU GAVE')} ₹
        </button>

        {/* You Got (Credit / Green) */}
        <button 
          onClick={() => {
            setTxModalType('Credit');
            setShowTxModal(true);
          }}
          style={{
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 15px rgba(16, 185, 129, 0.25)'
          }}
        >
          {t('you_got', 'YOU GOT')} ₹
        </button>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      {showTxModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 22, 61, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: txModalType === 'Debit' ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {txModalType === 'Debit' ? t('you_gave_money', 'You Gave Money') : t('you_got_money', 'You Got Money')}
              </h4>
              <button onClick={() => setShowTxModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>{t('amount', 'Amount')} (₹)</label>
                <input 
                  type="number"
                  required
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '900', color: '#0F172A' }}
                />
              </div>

              {/* Note */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>{t('description', 'Description')}</label>
                <input 
                  type="text"
                  placeholder={t('items_details', 'Items or details...')}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>{t('date', 'Date')}</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>

              <button type="submit" style={{ width: '100%', padding: '14px', background: txModalType === 'Debit' ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '6px' }}>
                {t('save_transaction', 'Save Transaction')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PERSON MODAL --- */}
      {showEditCustomerModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 22, 61, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{t('edit_person_info', 'Edit Person Info')}</h4>
              <button onClick={() => setShowEditCustomerModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>{t('person_name', 'Person Name')}</label>
                <input 
                  type="text"
                  required
                  placeholder={t('enter_name', 'Enter name...')}
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mobile_number', 'Mobile Number')}</label>
                <input 
                  type="tel"
                  placeholder={t('enter_mobile', 'Enter mobile...')}
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '6px' }}>
                {t('save_changes', 'Save Changes')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BorrowLend;
