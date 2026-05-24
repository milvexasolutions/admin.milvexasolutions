import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  DollarSign,
  Dog,
  Milk,
  Building2,
  Users,
  Briefcase
} from 'lucide-react';

const BalanceSheet = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Aggregated states
  const [financials, setFinancials] = useState({
    milkSales: 0,
    cattleSales: 0,
    generalIncome: 0,
    cattlePurchase: 0,
    feedPurchase: 0,
    supplierPurchase: 0,
    vetDoctorFees: 0,
    staffSalaries: 0,
    generalExpense: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchAndAggregateData();
  }, [user, filterRange, customStartDate, customEndDate]);

  const isDateInRange = (dateString, range) => {
    if (!dateString) return false;
    // Format YYYY-MM-DD
    const date = new Date(dateString);
    const now = new Date();
    
    // Normalize times
    const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    switch(range) {
      case 'This Month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'Last Month': {
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
      }
      case 'This Quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const dateQuarter = Math.floor(date.getMonth() / 3);
        return currentQuarter === dateQuarter && date.getFullYear() === now.getFullYear();
      }
      case 'This Year':
        return date.getFullYear() === now.getFullYear();
      case 'Custom': {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return date >= start && date <= end;
      }
      case 'AllTime':
      default:
        return true;
    }
  };

  const fetchAndAggregateData = async () => {
    if (!user) return;
    setLoading(true);

    // If Demo User, generate highly realistic local mock data
    if (user.id === 'demo-user') {
      setTimeout(() => {
        setFinancials({
          milkSales: 0,
          cattleSales: 0,
          generalIncome: 0,
          cattlePurchase: 0,
          feedPurchase: 0,
          supplierPurchase: 0,
          vetDoctorFees: 0,
          staffSalaries: 0,
          generalExpense: 0,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          transactionCount: 0
        });
        setLoading(false);
      }, 400);
      return;
    }

    try {
      // 1. Fetch General Payments
      const { data: payments } = await supabase.from('payments').select('*');
      
      // 2. Fetch Milk Production & Direct Sales
      const { data: milk } = await supabase.from('milk_production').select('total_amount, production_date');
      
      // 3. Fetch Animal Transactions
      const { data: animals } = await supabase.from('animals').select('purchase_price, purchase_date, sale_price, sale_date');
      
      // 4. Fetch Doctor Ledgers
      const { data: doctors } = await supabase.from('doctor_ledger').select('paid_amount, date');
      
      // 5. Fetch Staff transactions
      const { data: staff } = await supabase.from('staff_transactions').select('amount, date');
      
      // 6. Fetch Feed purchases
      const { data: feeds } = await supabase.from('feed_purchases').select('total_amount, date');

      // 7. Fetch Supplier purchases
      const { data: suppliers } = await supabase.from('supplier_purchases').select('total_amount, purchase_date');

      // Filter and aggregate
      let milkSales = 0;
      let cattleSales = 0;
      let generalIncome = 0;
      
      let cattlePurchase = 0;
      let feedPurchase = 0;
      let supplierPurchase = 0;
      let vetDoctorFees = 0;
      let staffSalaries = 0;
      let generalExpense = 0;
      let txCount = 0;

      // Aggregations
      (payments || []).forEach(p => {
        if (isDateInRange(p.date, filterRange)) {
          txCount++;
          if (p.type === 'Income') {
            generalIncome += parseFloat(p.amount) || 0;
          } else {
            generalExpense += parseFloat(p.amount) || 0;
          }
        }
      });

      (milk || []).forEach(m => {
        if (isDateInRange(m.production_date, filterRange)) {
          milkSales += parseFloat(m.total_amount) || 0;
        }
      });

      (animals || []).forEach(a => {
        if (a.sale_date && isDateInRange(a.sale_date, filterRange)) {
          cattleSales += parseFloat(a.sale_price) || 0;
        }
        if (a.purchase_date && isDateInRange(a.purchase_date, filterRange)) {
          cattlePurchase += parseFloat(a.purchase_price) || 0;
        }
      });

      (doctors || []).forEach(d => {
        if (isDateInRange(d.date, filterRange)) {
          vetDoctorFees += parseFloat(d.paid_amount) || 0;
        }
      });

      (staff || []).forEach(s => {
        if (isDateInRange(s.date, filterRange)) {
          staffSalaries += parseFloat(s.amount) || 0;
        }
      });

      (feeds || []).forEach(f => {
        if (isDateInRange(f.date, filterRange)) {
          feedPurchase += parseFloat(f.total_amount) || 0;
        }
      });

      (suppliers || []).forEach(sp => {
        if (isDateInRange(sp.purchase_date, filterRange)) {
          supplierPurchase += parseFloat(sp.total_amount) || 0;
        }
      });

      const totalIncome = milkSales + cattleSales + generalIncome;
      const totalExpense = cattlePurchase + feedPurchase + supplierPurchase + vetDoctorFees + staffSalaries + generalExpense;

      setFinancials({
        milkSales,
        cattleSales,
        generalIncome,
        cattlePurchase,
        feedPurchase,
        supplierPurchase,
        vetDoctorFees,
        staffSalaries,
        generalExpense,
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: txCount
      });

    } catch (err) {
      console.error('Error compiling balance sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 88px)' }}>
      <PageHeader title={t('balance_sheet', 'Balance Sheet')} showBack={true} />
      
      <div className="container-padding" style={{ padding: '20px' }}>
        
        {/* Filter Controls (Hidden in Print) */}
        <div className="no-print" style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(11, 31, 77, 0.05)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              {t('select_period', 'Select Period')}
            </span>
            <button 
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#0B1F4D',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(11, 31, 77, 0.15)'
              }}
            >
              <Printer size={14} />
              {t('print', 'Print Report')}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {[
              { id: 'This Month', label: t('this_month', 'This Month') },
              { id: 'Last Month', label: t('last_month', 'Last Month') },
              { id: 'This Quarter', label: t('this_quarter', 'This Quarter') },
              { id: 'This Year', label: t('this_year', 'This Year') },
              { id: 'Custom', label: t('custom_range', 'Custom') },
              { id: 'AllTime', label: t('all_time', 'All Time') }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setFilterRange(range.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: filterRange === range.id ? 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)' : '#F1F5F9',
                  color: filterRange === range.id ? 'white' : '#64748B',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          {filterRange === 'Custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '4px' }}>START DATE</label>
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '4px' }}>END DATE</label>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Printable Statement Layout */}
        <div id="print-sheet" style={{ background: 'white', borderRadius: '28px', padding: '24px', boxShadow: '0 10px 30px rgba(11, 31, 77, 0.04)', border: '1px solid #E2E8F0' }}>
          
          {/* Header Info (Visible in print) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '2px solid #F1F5F9', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0B1F4D', margin: 0 }}>MILVEXA FARM STATEMENT</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '700' }}>
                Period: {filterRange} {filterRange === 'Custom' && `(${customStartDate} to ${customEndDate})`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: '900', background: '#EFF6FF', color: 'var(--accent)', padding: '4px 8px', borderRadius: '8px' }}>
                OFFICIAL REPORT
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="loading-spinner" /></div>
          ) : (
            <>
              {/* Summary Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '28px' }}>
                
                {/* Net Profit Card */}
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '24px', 
                  background: financials.netBalance >= 0 ? 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)' : 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 24px rgba(2, 44, 34, 0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('net_profit_loss', 'Net Profit / Loss (शुद्ध लाभ/हानि)')}
                      </span>
                      <h1 style={{ fontSize: '32px', fontWeight: '950', margin: '4px 0 0' }}>
                        ₹{financials.netBalance.toLocaleString('en-IN')}
                      </h1>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {financials.netBalance >= 0 ? <TrendingUp size={24} color="#10B981" /> : <TrendingDown size={24} color="#EF4444" />}
                    </div>
                  </div>
                </div>

                {/* Income vs Expense Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  
                  {/* Revenue Card */}
                  <div style={{ padding: '16px', background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', marginBottom: '4px' }}>
                      <ArrowUpRight size={16} />
                      <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{t('total_revenue', 'Total Revenue')}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#047857', margin: 0 }}>
                      ₹{financials.totalIncome.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  {/* Expense Card */}
                  <div style={{ padding: '16px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', marginBottom: '4px' }}>
                      <ArrowDownLeft size={16} />
                      <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{t('total_expense', 'Total Expense')}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#B91C1C', margin: 0 }}>
                      ₹{financials.totalExpense.toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Detailed Balance Sheet Statement Table */}
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0B1F4D', marginBottom: '12px', borderLeft: '4px solid var(--accent)', paddingLeft: '8px' }}>
                {t('statement_breakdown', 'Statement Category Breakdown')}
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '24px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '800', color: '#475569' }}>{t('category', 'Category')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#475569' }}>{t('inflow', 'Inflow (₹)')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#475569' }}>{t('outflow', 'Outflow (₹)')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Milk Income */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Milk size={16} color="#0B1F4D" />
                        {t('milk_sales_revenue', 'Milk Sales Revenue (दूध बिक्री आय)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#10B981' }}>
                        ₹{financials.milkSales.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>₹0</td>
                    </tr>

                    {/* Cattle Transactions */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Dog size={16} color="#0B1F4D" />
                        {t('cattle_buy_sell', 'Cattle Purchases/Sales (पशु व्यापार)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#10B981' }}>
                        ₹{financials.cattleSales.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.cattlePurchase.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Feed Purchases */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#0B1F4D" />
                        {t('feed_purchases_exp', 'Feed purchases (चारे और राशन खर्च)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>₹0</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.feedPurchase.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Direct Supplier Purchases */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={16} color="#0B1F4D" />
                        {t('supplier_stock', 'Direct Stock Purchases (आपूर्तिकर्ता खरीद)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>₹0</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.supplierPurchase.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Staff Salaries */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#0B1F4D" />
                        {t('staff_salary_exp', 'Staff Salaries (कर्मचारी वेतन खर्च)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>₹0</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.staffSalaries.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Vet / Doctor ledger */}
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} color="#0B1F4D" />
                        {t('medical_vet_exp', 'Medical & Veterinary Fees (डॉक्टर शुल्क)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>₹0</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.vetDoctorFees.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* General/Miscellaneous Transactions */}
                    <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0B1F4D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={16} color="#0B1F4D" />
                        {t('misc_tx', 'General Transactions (अन्य खर्च/आय)')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#10B981' }}>
                        ₹{financials.generalIncome.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                        ₹{financials.generalExpense.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Total Sum Row */}
                    <tr style={{ background: '#F8FAFC', fontWeight: '900' }}>
                      <td style={{ padding: '14px 8px', color: '#0B1F4D' }}>{t('total_sum', 'TOTAL SUMMARY')}</td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', color: '#10B981', fontSize: '15px' }}>
                        ₹{financials.totalIncome.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', color: '#EF4444', fontSize: '15px' }}>
                        ₹{financials.totalExpense.toLocaleString('en-IN')}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Note / Declaration (Visible in Print) */}
              <div style={{ border: '1px dashed #CBD5E1', padding: '16px', borderRadius: '16px', background: '#F8FAFC', fontSize: '12px', color: '#64748B', marginTop: '20px' }}>
                <strong>Declaration / Note:</strong> This statement represents an automated aggregation of cattle farm records from the Milvexa mobile database. All transactions, milk pour sheets, and animal valuations are computed directly from records registered under user ID: {user?.id}.
              </div>
            </>
          )}

        </div>

      </div>
      
      {/* Styles for print mode */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #print-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Hide bottom navigation and page headers in print */
          header, footer, nav, .bottom-nav-container, .page-header-container, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BalanceSheet;
