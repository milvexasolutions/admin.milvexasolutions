import React from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  LayoutDashboard,
  Dog,
  Milk,
  Package,
  User,
  X,
  LogOut,
  LifeBuoy,
  Settings as SettingsIcon,
  Users,
  Briefcase,
  Truck,
  Building2,
  Heart,
  IndianRupee,
  PlusCircle,
  Bell,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  ArrowUpRight,
  History,
  Wallet,
  Calendar,
  RefreshCcw,
  FileText,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  AlertCircle,
  Syringe,
  Stethoscope
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';




import { useTranslation } from 'react-i18next';
import './index.css';





import { AuthProvider, useAuth } from './context/AuthContext';
import { HeaderProvider } from './context/HeaderContext';
import PullToRefresh from './components/PullToRefresh';
import { useResponsive } from './hooks/useResponsive';
import { scheduleDailyReminders } from './lib/notifications';




import { supabase } from './lib/supabase';
import { demoService } from './lib/demoService';
import { dataService } from './lib/dataService';
import PageHeader, { GlobalPageHeader } from './components/PageHeader';
import ErrorBoundary from './components/ErrorBoundary';

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', flexDirection: 'column', gap: '16px' }}>
    <div className="loading-spinner" />
    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '14px', animation: 'pulse 1.5s infinite' }}>Loading...</p>
  </div>
);

const CattleMilkChart = React.lazy(() => import('./components/CattleMilkChart'));
const AddAnimal = React.lazy(() => import('./pages/AddAnimal'));
const AnimalList = React.lazy(() => import('./pages/AnimalList'));
const CattleManagement = React.lazy(() => import('./pages/CattleManagement'));
const MilkManagement = React.lazy(() => import('./pages/MilkManagement'));
const AddMilk = React.lazy(() => import('./pages/AddMilk'));
const MilkReport = React.lazy(() => import('./pages/MilkReport'));
const SellMilk = React.lazy(() => import('./pages/SellMilk'));
const AddSociety = React.lazy(() => import('./pages/AddSociety'));
const SocietyList = React.lazy(() => import('./pages/SocietyList'));
const FeedPurchase = React.lazy(() => import('./pages/FeedPurchase'));
const AddDoctor = React.lazy(() => import('./pages/AddDoctor'));
const DoctorList = React.lazy(() => import('./pages/DoctorList'));
const DoctorLedger = React.lazy(() => import('./pages/DoctorLedger'));
const AddStaff = React.lazy(() => import('./pages/AddStaff'));
const StaffList = React.lazy(() => import('./pages/StaffList'));
const StaffSalary = React.lazy(() => import('./pages/StaffSalary'));
const AddSupplier = React.lazy(() => import('./pages/AddSupplier'));
const SupplierList = React.lazy(() => import('./pages/SupplierList'));
const SupplierPurchase = React.lazy(() => import('./pages/SupplierPurchase'));
const AddBreeding = React.lazy(() => import('./pages/AddBreeding'));
const BreedingList = React.lazy(() => import('./pages/BreedingList'));
const AddTransaction = React.lazy(() => import('./pages/AddTransaction'));
const TransactionHistory = React.lazy(() => import('./pages/TransactionHistory'));
const SellAnimal = React.lazy(() => import('./pages/SellAnimal'));
const EditAnimal = React.lazy(() => import('./pages/EditAnimal'));
const EditDoctor = React.lazy(() => import('./pages/EditDoctor'));
const EditStaff = React.lazy(() => import('./pages/EditStaff'));
const EditSociety = React.lazy(() => import('./pages/EditSociety'));
const EditSupplier = React.lazy(() => import('./pages/EditSupplier'));
const EditBreeding = React.lazy(() => import('./pages/EditBreeding'));
const EditMilk = React.lazy(() => import('./pages/EditMilk'));
const EditTransaction = React.lazy(() => import('./pages/EditTransaction'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const ChatBot = React.lazy(() => import('./pages/ChatBot'));
const DairyLedger = React.lazy(() => import('./pages/DairyLedger'));
const BalanceSheet = React.lazy(() => import('./pages/BalanceSheet'));
const BorrowLend = React.lazy(() => import('./pages/BorrowLend'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const CorporateWebsite = React.lazy(() => import('./pages/CorporateWebsite'));

// Page Imports removed as requested

const Dashboard = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    total_animals: 0,
    healthy_animals: 0,
    sick_animals: 0,
    pregnant_animals: 0,
    cow_count: 0,
    buffalo_count: 0,
    calf_count: 0,
    bull_count: 0,
    milking_count: 0,
    dry_count: 0,
    milk_today: 0,
    morning_milk: 0,
    evening_milk: 0,
    milk_chart_data: [],
    feed_stock: 0,
    monthly_expense: 0
  });
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Auto-promote calves whose ages exceed thresholds:
      // - Female Cow Calf >= 15 months -> Cow
      // - Female Buffalo Calf >= 20 months -> Buffalo
      // - Male Calf >= 24 months -> Bull
      try {
        const { data: activeCalves } = await supabase
          .from('animals')
          .select('id, name, gender, calf_mother_type, purchase_date, note')
          .eq('owner_id', user.id)
          .eq('type', 'Calf')
          .not('purchase_date', 'is', null);

        if (activeCalves && activeCalves.length > 0) {
          const currentDate = new Date();
          const promotionPromises = [];

          for (const calf of activeCalves) {
            const birthDate = new Date(calf.purchase_date);
            const diffTime = Math.abs(currentDate - birthDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffMonths = diffDays / 30.4375;

            let promotedType = null;
            let promotedStatus = null;
            const mType = calf.calf_mother_type || 'Cow';

            if (calf.gender === 'Female') {
              if (mType === 'Cow' && diffMonths >= 15) {
                promotedType = 'Cow';
                promotedStatus = 'Dry';
              } else if (mType === 'Buffalo' && diffMonths >= 20) {
                promotedType = 'Buffalo';
                promotedStatus = 'Dry';
              }
            } else if (calf.gender === 'Male' && diffMonths >= 24) {
              promotedType = 'Bull';
              promotedStatus = 'Bull';
            }

            if (promotedType) {
              promotionPromises.push(
                supabase
                  .from('animals')
                  .update({
                    type: promotedType,
                    status: promotedStatus,
                    note: `${calf.note || ''} (Auto-promoted from Calf to ${promotedType} after reaching growth threshold)`.trim()
                  })
                  .eq('id', calf.id)
              );
            }
          }

          if (promotionPromises.length > 0) {
            await Promise.all(promotionPromises);
          }
        }
      } catch (promoErr) {
        console.error('Error during calf auto-promotion check:', promoErr);
      }

      const ds = dataService(user.id);

      const { data: allAnimals } = await ds.from('animals').select();
      const animals = allAnimals?.filter(a => a.status !== 'Sold' && a.status !== 'Dead') || [];
      const total_animals = animals.length;
      const healthy_animals = animals.filter(a => a.health_status === 'Healthy').length;
      const sick_animals = animals.filter(a => a.health_status === 'Sick').length;
      const pregnant_animals = animals.filter(a => a.pregnant_status === 'Pregnant').length;
      const cow_count = animals.filter(a => a.type === 'Cow').length;
      const buffalo_count = animals.filter(a => a.type === 'Buffalo').length;
      const calf_count = animals.filter(a => a.status === 'Calf').length;
      const bull_count = animals.filter(a => a.status === 'Bull').length;
      const milking_count = animals.filter(a => a.status === 'Milking' || a.status === 'Milch').length;
      const dry_count = animals.filter(a => a.status === 'Dry').length;

      const { data: milkRecords } = await ds.from('milk_production').select('*');

      const today = new Date().toISOString().split('T')[0];
      const todayRecords = milkRecords?.filter(r => r.production_date === today && !r.price_per_liter) || [];
      const morning_milk = todayRecords.filter(r => r.shift === 'Morning').reduce((sum, rec) => sum + (Number(rec.quantity) || 0), 0);
      const evening_milk = todayRecords.filter(r => r.shift === 'Evening').reduce((sum, rec) => sum + (Number(rec.quantity) || 0), 0);
      const milk_today = morning_milk + evening_milk;

      // Group by date for chart
      const chartDataMap = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        chartDataMap[dateStr] = { name: dayStr, amount: 0 };
      }

      if (milkRecords) {
        milkRecords.forEach(rec => {
          if (chartDataMap[rec.production_date] && !rec.price_per_liter) {
            chartDataMap[rec.production_date].amount += Number(rec.quantity) || 0;
          }
        });
      }
      const milk_chart_data = Object.values(chartDataMap).reverse();

      const { data: inventory } = await ds.from('inventory').select('*', { eq: ['category', 'Feed'] });
      const feed_stock = inventory?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;

      const { data: payments } = await ds.from('payments').select();
      const currentMonth = new Date().getMonth();
      const monthly_expense = payments?.filter(p => p.type === 'Expense' && new Date(p.date).getMonth() === currentMonth)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

      const { data: ledgerRecords } = await ds.from('dairy_ledger').select('*', { order: ['period_start', { ascending: true }] });

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();

      const currentMonthLedgers = ledgerRecords?.filter(l => {
        const d = new Date(l.period_start);
        return d.getMonth() === currentMonth && d.getFullYear() === new Date().getFullYear();
      }) || [];

      const prevMonthLedgers = ledgerRecords?.filter(l => {
        const d = new Date(l.period_start);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }) || [];

      setStats({
        total_animals,
        healthy_animals,
        sick_animals,
        pregnant_animals,
        cow_count,
        buffalo_count,
        calf_count,
        bull_count,
        milking_count,
        dry_count,
        milk_today,
        morning_milk,
        evening_milk,
        milk_chart_data,
        feed_stock,
        monthly_expense,
        currentMonthLedgers,
        prevMonthLedgers
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [user, profile]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const alerts = [];
  if (stats.sick_animals > 0) {
    alerts.push({
      id: 'sick',
      type: 'error',
      icon: <Activity size={18} color="#DC2626" />,
      title: t('health_alert', 'Health Alert'),
      message: t('sick_alert_msg', '{{count}} animals require medical attention.', { count: stats.sick_animals })
    });
  }
  if (stats.feed_stock < 50) {
    alerts.push({
      id: 'feed',
      type: 'warning',
      icon: <AlertCircle size={18} color="#D97706" />,
      title: t('low_feed_stock', 'Low Feed Stock'),
      message: t('low_feed_stock_msg', 'Only {{count}}T feed remaining in inventory.', { count: stats.feed_stock })
    });
  }
  if (stats.pregnant_animals > 0) {
    alerts.push({
      id: 'pregnant',
      type: 'info',
      icon: <Heart size={18} color="#2563EB" />,
      title: t('pregnancy_care', 'Pregnancy Care'),
      message: t('pregnant_msg', '{{count}} animals are currently pregnant.', { count: stats.pregnant_animals })
    });
  }

  return (
    <div className="animate-fade-in" style={{
      background: '#F8FAFC',
      minHeight: '100vh',
      paddingTop: 'calc(var(--safe-top) + 88px)',
      paddingBottom: '90px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <PageHeader
        title="MILVEXA - Cattle Farm Management"
        showMenu={true}
        onOpenSidebar={onOpenSidebar}
        rightAction={
          <button
            onClick={() => navigate('/notifications')}
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Bell size={22} />
            {alerts.length > 0 && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #0B1F4D' }} />}
          </button>
        }
      />

      {/* 4 Dashboard Cards */}
      <div style={{ padding: '0 20px', marginTop: '-28px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {/* Card 1: Cattle */}
          <div className="animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', boxShadow: '0 6px 15px rgba(11, 31, 77, 0.06)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', height: '64px', boxSizing: 'border-box' }}>
            <div style={{ width: '36px', height: '36px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Dog size={18} color="#3B82F6" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t('animals', 'Cattle')}</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.total_animals}</h2>
            </div>
          </div>

          {/* Card 2: Milk Today */}
          <div className="animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', boxShadow: '0 6px 15px rgba(11, 31, 77, 0.06)', borderRadius: '16px', animationDelay: '0.1s', display: 'flex', alignItems: 'center', gap: '12px', height: '64px', boxSizing: 'border-box' }}>
            <div style={{ width: '36px', height: '36px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Milk size={18} color="#10B981" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t('milk_today', 'Milk Today')}</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.milk_today}<span style={{ fontSize: '12px', marginLeft: '2px' }}>L</span></h2>
            </div>
          </div>

          {/* Card 3: Feed Stock */}
          <div className="animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', boxShadow: '0 6px 15px rgba(11, 31, 77, 0.06)', borderRadius: '16px', animationDelay: '0.2s', display: 'flex', alignItems: 'center', gap: '12px', height: '64px', boxSizing: 'border-box' }}>
            <div style={{ width: '36px', height: '36px', background: '#FFFBEB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} color="#F59E0B" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t('feed_stock', 'Feed Stock')}</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.feed_stock}<span style={{ fontSize: '12px', marginLeft: '2px' }}>T</span></h2>
            </div>
          </div>

          {/* Card 4: Expense */}
          <div className="animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', boxShadow: '0 6px 15px rgba(11, 31, 77, 0.06)', borderRadius: '16px', animationDelay: '0.3s', display: 'flex', alignItems: 'center', gap: '12px', height: '64px', boxSizing: 'border-box' }}>
            <div style={{ width: '36px', height: '36px', background: '#FEF2F2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IndianRupee size={18} color="#EF4444" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t('expense', 'Expense')}</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>₹{stats.monthly_expense.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Dairy Salary Analytics */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>{t('dairy_salary_analytics', 'Dairy Salary Analytics')}</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', borderRadius: '24px', padding: '16px', animationDelay: '0.2s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch' }}>

            {/* Current Month */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('this_month', 'This Month')}</p>
                <h3 style={{ margin: '4px 0 12px', fontSize: '20px', fontWeight: '900', color: '#10B981' }}>
                  ₹{stats.currentMonthLedgers?.reduce((sum, l) => sum + (Number(l.total_milk_amount) || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.currentMonthLedgers?.length > 0 ? stats.currentMonthLedgers.map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ color: '#64748B', fontWeight: '700' }}>{new Date(l.period_start).getDate()}-{new Date(l.period_end).getDate()}</span>
                    <span style={{ color: '#0B1F4D', fontWeight: '800' }}>₹{l.total_milk_amount}</span>
                  </div>
                )) : (
                  <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', minHeight: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('no_periods_yet', 'No periods yet')}</p>
                )}
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: '1px', background: '#E2E8F0' }} />

            {/* Previous Month */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('last_month', 'Last Month')}</p>
                <h3 style={{ margin: '4px 0 12px', fontSize: '20px', fontWeight: '900', color: '#3B82F6' }}>
                  ₹{stats.prevMonthLedgers?.reduce((sum, l) => sum + (Number(l.total_milk_amount) || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.prevMonthLedgers?.length > 0 ? stats.prevMonthLedgers.map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ color: '#64748B', fontWeight: '700' }}>{new Date(l.period_start).getDate()}-{new Date(l.period_end).getDate()}</span>
                    <span style={{ color: '#0B1F4D', fontWeight: '800' }}>₹{l.total_milk_amount}</span>
                  </div>
                )) : (
                  <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', minHeight: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('no_periods_found', 'No periods found')}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Cattle Category Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>{t('cattle_category', 'Cattle Category')}</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', borderRadius: '24px', padding: '20px', animationDelay: '0.35s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('cow', 'Cow')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.cow_count}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('buffalo', 'Buffalo')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.buffalo_count}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('calf', 'Calf')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.calf_count}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('bull', 'Bull')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.bull_count}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Cattle Milking Status Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>{t('cattle_milking_status', 'Cattle Milking Status')}</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', borderRadius: '24px', padding: '20px', animationDelay: '0.4s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('milking', 'Milking')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>{stats.milking_count}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('dry', 'Dry')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>{stats.dry_count}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Cattle Health Status Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>{t('cattle_health_status', 'Cattle Health Status')}</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', borderRadius: '24px', padding: '20px', animationDelay: '0.45s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#166534', fontWeight: '800', textTransform: 'uppercase' }}>{t('healthy', 'Healthy')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#15803D' }}>{stats.healthy_animals}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase' }}>{t('sick', 'Sick')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#B91C1C' }}>{stats.sick_animals}</h3>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#9D174D', fontWeight: '800', textTransform: 'uppercase' }}>{t('pregnant', 'Pregnant')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#BE185D' }}>{stats.pregnant_animals}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Milk Analytics Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>{t('milk_analytics', 'Milk Analytics')}</h3>

        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid rgba(11, 31, 77, 0.08)', borderRadius: '24px', padding: '20px', animationDelay: '0.5s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('morning', 'Morning')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#F59E0B' }}>{stats.morning_milk} L</h3>
            </div>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>{t('evening', 'Evening')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#0B1F4D' }}>{stats.evening_milk} L</h3>
            </div>
            <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '16px', textAlign: 'center', border: '1px solid #DBEAFE' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#3B82F6', fontWeight: '800', textTransform: 'uppercase' }}>{t('today_total', 'Today Total')}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#1D4ED8' }}>{stats.milk_today} L</h3>
            </div>
          </div>

          <React.Suspense fallback={
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '16px', color: '#64748B', fontSize: '12px', fontWeight: '700' }}>
              Loading Analytics Chart...
            </div>
          }>
            <CattleMilkChart chartData={stats.milk_chart_data} trendLabel={t('last_7_days_trend', 'Last 7 Days Trend')} />
          </React.Suspense>
        </div>
      </div>

      {/* Smart Alerts Section (Bottom) */}
      {alerts.length > 0 && (
        <div style={{ padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '8px' }}>{t('alerts_notifications', 'Alerts & Notifications')}</h3>
          {alerts.map(alert => (
            <div key={alert.id} className="animate-slide-up" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '16px',
              background: alert.type === 'error' ? '#FEF2F2' : alert.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
              border: `1px solid ${alert.type === 'error' ? '#FEE2E2' : alert.type === 'warning' ? '#FEF3C7' : '#DBEAFE'}`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {alert.icon}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: alert.type === 'error' ? '#991B1B' : alert.type === 'warning' ? '#92400E' : '#1E40AF' }}>{alert.title}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: '700', color: alert.type === 'error' ? '#DC2626' : alert.type === 'warning' ? '#D97706' : '#2563EB' }}>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuickActions, setShowQuickActions] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('home', 'Home'), path: '/' },
    { icon: Dog, label: t('animals', 'Cattle'), path: '/animals' },
    { icon: Plus, label: t('add', 'Add'), isFab: true },
    { icon: Milk, label: t('milk', 'Milk'), path: '/milk' },
    { icon: Wallet, label: t('borrow_lend', 'Credit & Debit'), path: '/finance/borrow-lend' },
  ];

  const quickCategories = [
    {
      title: t('milk_transactions', 'Milk Transactions'),
      items: [
        { icon: Milk, label: t('add_milk', 'Add Milk'), color: '#10B981', path: '/milk/add' },
        { icon: ArrowUpRight, label: t('sell_milk', 'Sell Milk'), color: '#3B82F6', path: '/milk/sell' },
      ]
    },
    {
      title: t('finance_transactions', 'Finance & Transactions'),
      items: [
        { icon: IndianRupee, label: t('add_transaction', 'Transaction'), color: '#F59E0B', path: '/finance/add' },
        { icon: FileText, label: t('balance_sheet', 'Balance Sheet'), color: '#10B981', path: '/finance/balance-sheet' },
        { icon: Wallet, label: t('borrow_lend', 'Credit & Debit'), color: '#D97706', path: '/finance/borrow-lend' },
        { icon: Users, label: t('pay_salary', 'Pay Salary'), color: '#8B5CF6', path: '/finance/add' },
        { icon: Package, label: t('feed_buy', 'Feed Buy'), color: '#3B82F6', path: '/finance/add' },
      ]
    },
    {
      title: t('cattle_breeding', 'Cattle & Breeding'),
      items: [
        { icon: Dog, label: t('add_animal', 'Add Animal'), color: '#EC4899', path: '/animals/add' },
        { icon: PlusCircle, label: t('breed_heat', 'Heat/AI Record'), color: '#EF4444', path: '/breeding/add' },
      ]
    }
  ];

  return (
    <>
      {/* Quick Actions Overlay (Vyapar Style) */}
      {showQuickActions && (
        <div
          onClick={() => setShowQuickActions(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5, 22, 61, 0.6)',
            backdropFilter: 'blur(10px)', zIndex: 950,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: '0px', animation: 'fadeIn 0.3s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{
              width: '100%', padding: '24px', paddingBottom: '32px',
              borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              borderBottomLeftRadius: '0', borderBottomRightRadius: '0',
              background: 'white',
              animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingBottom: '60px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{t('quick_actions', 'Quick Actions')}</h3>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '16px', width: '100%' }}>
                {quickCategories.map((category, idx) => (
                  <div key={idx} className="animate-slide-up" style={{ background: '#F8FAFC', padding: '16px', borderRadius: '24px', border: '1px solid #E2E8F0', width: 'fit-content', animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category.title}</h4>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      {category.items.map((action, i) => {
                        const Icon = action.icon;
                        return (
                          <Link
                            key={i}
                            to={action.path}
                            onClick={() => setShowQuickActions(false)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                              background: 'none',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                          >
                            <div style={{
                              width: '56px', height: '56px', borderRadius: '18px',
                              background: 'white', color: action.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 6px 16px rgba(11, 31, 77, 0.12)'
                            }}>
                              <Icon size={24} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textAlign: 'center', lineHeight: '1.2' }}>{action.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button (Vyapar style black circle) */}
            <div
              style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
            >
              <button
                onClick={() => setShowQuickActions(false)}
                style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: '#0F172A', color: 'white',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.3)', cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');

          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="fab-button"
                style={{
                  transform: showQuickActions ? 'rotate(135deg) scale(1.1)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: showQuickActions ? '0 16px 32px rgba(239, 68, 68, 0.4)' : '0 12px 24px rgba(11, 31, 77, 0.3)',
                  background: showQuickActions ? '#EF4444' : 'var(--primary)',
                  border: showQuickActions ? '4px solid #FEE2E2' : '4px solid white',
                }}
              >
                <Plus size={32} strokeWidth={3} />
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => { if (item.path) navigate(item.path); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                color: isActive ? 'var(--primary)' : '#94A3B8', flex: 1, background: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 'var(--icon-md)', height: 'var(--icon-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isActive ? 'scale(1.1)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <Icon size="var(--icon-sm)" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{
                fontSize: '9px', fontWeight: isActive ? '900' : '700',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

const Sidebar = ({ isOpen, onClose, isPermanent = false }) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimalOpen, setIsAnimalOpen] = React.useState(false);
  const [isMilkOpen, setIsMilkOpen] = React.useState(false);
  const [isSocietyOpen, setIsSocietyOpen] = React.useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = React.useState(false);
  const [isStaffOpen, setIsStaffOpen] = React.useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = React.useState(false);
  const [isBreedingOpen, setIsBreedingOpen] = React.useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = React.useState(false);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = React.useState(false);

  const drawerClass = isPermanent ? 'premium-drawer open' : `premium-drawer ${isOpen ? 'open' : ''}`;
  const backdropClass = `drawer-backdrop ${isOpen ? 'open' : ''}`;

  return (
    <>
      {!isPermanent && (
        <div className={backdropClass} onClick={onClose} />
      )}
      <div className={drawerClass} style={{
        ...(isPermanent ? { position: 'sticky', top: 0, borderRadius: 0, borderRight: '1px solid #F1F5F9', boxShadow: 'none' } : {}),
        display: 'flex', flexDirection: 'column', background: 'white'
      }}>
        {/* Top Header: App Branding (Fixed) */}
        <div style={{
          background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)',
          padding: '40px 24px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          overflow: 'hidden'
        }}>
          {/* Close Button (only for mobile) */}
          {!isPermanent && (
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '6px', color: 'white' }}
            >
              <X size={20} />
            </button>
          )}

          {/* App Branding */}
          <style>{`
            .sidebar-brand-title::after {
              content: 'Milvexa';
            }
            .sidebar-brand-subtitle::after {
              content: 'Cattle Farm Management';
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
              <img src="/icon.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
            </div>
            <div className="notranslate" translate="no" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="sidebar-brand-title notranslate" translate="no" style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: 'white', lineHeight: 1.2, textTransform: 'none' }}></h2>
              <p className="sidebar-brand-subtitle notranslate" translate="no" style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: '700', opacity: 0.6, color: 'white', textTransform: 'none', letterSpacing: '0.5px' }}></p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Wrapper */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'white' }} className="no-scrollbar">
          {/* User Info Section */}
          <div style={{ padding: '20px 20px 10px', background: 'white' }}>
            <div className="glass-card" style={{
              padding: '16px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 12px 25px rgba(11, 31, 77, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.2px' }}>{profile?.full_name || 'Farm Owner'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: '600', color: '#64748B', wordBreak: 'break-all' }}>{user?.email || 'owner@milvexa.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div style={{ padding: '10px 20px 20px', background: 'white' }}>
            <button
              onClick={() => { navigate('/'); onClose(); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '16px',
                background: location.pathname === '/' || location.pathname === '/dashboard' ? '#EFF6FF' : 'transparent',
                color: location.pathname === '/' || location.pathname === '/dashboard' ? 'var(--accent)' : '#64748B',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                color: location.pathname === '/' || location.pathname === '/dashboard' ? 'var(--accent)' : '#94A3B8'
              }}>
                <LayoutDashboard size={18} />
              </div>
              <span style={{ fontWeight: '800', fontSize: '14px' }}>{t('dashboard', 'Dashboard')}</span>
            </button>

            {/* Animal Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsAnimalOpen(!isAnimalOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Dog size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('animals', 'Animal')}</span>
                {isAnimalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isAnimalOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('purchase_animal', 'Purchase Animal'), path: '/animals/add' },
                    { label: t('sell_animal', 'Sell Animal'), path: '/animals/sell' },
                    { label: t('cattle_list', 'Cattle List'), path: '/animals/list' },
                    { label: t('purchase_record', 'Purchase Record'), path: '/animals/purchase-record' },
                    { label: t('sell_record', 'Sell Record'), path: '/animals/sell-record' },
                    { label: t('death_record', 'Death Record'), path: '/animals/death-record' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Milk Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsMilkOpen(!isMilkOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Milk size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('milk_management', 'Milk Management')}</span>
                {isMilkOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isMilkOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_milk', 'Add Milk'), path: '/milk/add' },
                    { label: t('sell_milk', 'Sell Milk'), path: '/milk/sell' },
                    { label: t('milk_report', 'Milk Report'), path: '/milk/report' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Society Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsSocietyOpen(!isSocietyOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Building2 size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('dairy_management', 'Dairy Management')}</span>
                {isSocietyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isSocietyOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_dairy', 'Add Dairy'), path: '/societies/add' },
                    { label: t('dairy_list', 'Dairy List'), path: '/societies' },
                    { label: t('dairy_ledger', 'Dairy Ledger'), path: '/milk/dairy-ledger' },
                    { label: t('purchase_feed', 'Feed Purchase'), path: '/societies/feed' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsDoctorOpen(!isDoctorOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Stethoscope size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('doctor_management', 'Doctor Management')}</span>
                {isDoctorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isDoctorOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_doctor', 'Add Doctor'), path: '/doctors/add' },
                    { label: t('doctor_list', 'Doctor List'), path: '/doctors' },
                    { label: t('doctor_ledger', 'Doctor Ledger'), path: '/doctors/ledger' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsStaffOpen(!isStaffOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Users size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('staff_management', 'Staff Management')}</span>
                {isStaffOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isStaffOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_staff', 'Add Staff'), path: '/staff/add' },
                    { label: t('staff_list', 'Staff List'), path: '/staff' },
                    { label: t('salary_advance', 'Salary & Advance'), path: '/staff/salary' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Supplier Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsSupplierOpen(!isSupplierOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Truck size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('supplier_management', 'Supplier Management')}</span>
                {isSupplierOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isSupplierOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_supplier', 'Add Supplier'), path: '/suppliers/add' },
                    { label: t('supplier_list', 'Supplier List'), path: '/suppliers' },
                    { label: t('purchase_feed', 'Purchase Feed'), path: '/suppliers/purchase' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Breeding Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsBreedingOpen(!isBreedingOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Heart size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('breeding_management', 'Heat Registrar')}</span>
                {isBreedingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isBreedingOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_breeding', 'Add Heat Record'), path: '/breeding/add' },
                    { label: t('breeding_list', 'Heat Registrar'), path: '/breeding' }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Finance Dropdown */}
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  color: '#94A3B8'
                }}>
                  <Wallet size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('finance_management', 'Finance Management')}</span>
                {isFinanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isFinanceOpen && (
                <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: t('add_income_exp', 'Add Income/Exp'), path: '/finance/add' },
                    { label: t('transaction_history', 'Transaction History'), path: '/finance' },
                    { label: t('balance_sheet', 'Balance Sheet'), path: '/finance/balance-sheet' },
                    { label: t('borrow_lend', 'Credit & Debit'), path: '/finance/borrow-lend' }
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Settings & Help & Support Collapsible Dropdown */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: 'white' }}>
          <button
            onClick={() => { navigate('/settings'); onClose(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px', background: '#F8FAFC', color: '#475569', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
          >
            <SettingsIcon size={18} />
            <span style={{ fontWeight: '700', fontSize: '14px' }}>{t('settings', 'Settings')}</span>
          </button>

          <div>
            <button
              onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: 'var(--accent)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <LifeBuoy size={18} />
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>{t('help_support', 'Help & Support')}</span>
              {isSupportDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isSupportDropdownOpen && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                paddingLeft: '12px',
                animation: 'slideDown 0.2s ease-out'
              }}>
                <button
                  onClick={() => { navigate('/chatbot'); onClose(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  💬 {t('chat_bot_assistant', 'Chat Bot Assistant')}
                </button>
                <a
                  href="mailto:support@milvexa.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: '#475569',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  ✉️ support@milvexa.com
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: '#2E7D32',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '800'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E8F5E9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  🟢 {t('whatsapp_support', 'WhatsApp Support')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};


const PlaceholderPage = ({ title }) => (
  <div style={{
    background: '#F8FAFC',
    minHeight: '100vh',
    paddingTop: 'calc(var(--safe-top) + 88px)',
    paddingBottom: '90px'
  }}>
    <PageHeader title={title} showBack={true} />
    <div style={{ padding: '24px 20px', textAlign: 'center', color: '#64748B' }}>
      <Activity size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0B1F4D' }}>Coming Soon</h2>
      <p style={{ fontSize: '14px' }}>The {title} module is currently under development.</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [updateInfo, setUpdateInfo] = React.useState(null);
  const [announcementBanner, setAnnouncementBanner] = React.useState(null);
  const [maintenanceInfo, setMaintenanceInfo] = React.useState(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(true); // Start as true to check updates along with splash
  const navigate = useNavigate();
  const location = useLocation();
  const { isLargeScreen } = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isAdminDomain = window.location.hostname.includes('admin.milvexasolutions.in') || window.location.hostname.includes('admin.localhost') || window.location.pathname.startsWith('/admin');
  const isAppDomain = window.location.hostname.includes('app.milvexasolutions.in') || window.location.hostname.includes('app.localhost') || window.location.pathname.startsWith('/app');

  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen]);

  const APP_VERSION = "v1.1.1"; // Current installed version

  // Expose triggers to allow Settings.jsx to initiate a manual update check
  React.useEffect(() => {
    window.globalSetUpdateInfo = setUpdateInfo;
    window.globalHandleCheckUpdates = handleCheckUpdates;
    return () => {
      delete window.globalSetUpdateInfo;
      delete window.globalHandleCheckUpdates;
    };
  }, []);

  const handleCheckUpdates = async (manual = false) => {
    if (isAdminDomain) {
      setIsCheckingUpdate(false);
      return;
    }
    if (manual) {
      setIsCheckingUpdate(false); // Don't show splash loader for manual clicks
    }

    // Set up a promise for the updates query
    const dbPromise = supabase
      .from('system_updates')
      .select('*')
      .eq('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      .single();

    // Splash timeout: If the database is slow, bypass within 1.8 seconds to avoid freeze
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 1800)
    );

    try {
      const result = manual
        ? await dbPromise
        : await Promise.race([dbPromise, timeoutPromise]);

      if (result && result.timeout) {
        console.log('Update checker timed out to prevent splash hang.');
        setIsCheckingUpdate(false);
        return;
      }

      const { data, error } = result;

      if (!error && data) {
        if (data.global_announcement) {
          let announceText = data.global_announcement;
          let announceImage = '';
          let isMaint = false;
          let maintMsg = '';
          if (announceText.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(announceText);
              announceText = parsed.text || '';
              announceImage = parsed.image || '';
              isMaint = parsed.is_maintenance || false;
              maintMsg = parsed.maintenance_message || '';
            } catch (e) { }
          }
          if (isMaint) {
            setMaintenanceInfo({ text: maintMsg || 'System is currently undergoing scheduled maintenance.' });
            setAnnouncementBanner(null);
          } else {
            setMaintenanceInfo(null);
            if (announceText || announceImage) {
              setAnnouncementBanner({ text: announceText, image: announceImage });
            } else {
              setAnnouncementBanner(null);
            }
          }
        } else {
          setMaintenanceInfo(null);
          setAnnouncementBanner(null);
        }

        if (data.latest_version) {
          const current = APP_VERSION.replace(/[^\d.]/g, '').split('.').map(Number);
          const latest = data.latest_version.replace(/[^\d.]/g, '').split('.').map(Number);
          let isNewer = false;
          for (let i = 0; i < Math.max(current.length, latest.length); i++) {
            const c = current[i] || 0;
            const l = latest[i] || 0;
            if (l > c) { isNewer = true; break; }
            if (l < c) { break; }
          }
          if (isNewer) {
            setUpdateInfo(data);
          } else if (manual) {
            // Trigger manual "all set" callback if registered on window
            if (typeof window.onUpdateStatusCallback === 'function') {
              window.onUpdateStatusCallback({ isUpToDate: true, latestVersion: data.latest_version });
            } else {
              alert(`App is up to date!\nInstalled: ${APP_VERSION}\nLatest: ${data.latest_version}`);
            }
          }
        }
      } else if (manual) {
        if (typeof window.onUpdateStatusCallback === 'function') {
          window.onUpdateStatusCallback({ isUpToDate: false, error: 'No version data found in database.' });
        } else {
          alert('No version data found in database. Please check system_updates table.');
        }
      }
    } catch (e) {
      console.log('Update check failed', e);
      if (manual) {
        if (typeof window.onUpdateStatusCallback === 'function') {
          window.onUpdateStatusCallback({ isUpToDate: false, error: e.message || 'Unknown error occurred' });
        } else {
          alert(`Update check failed: ${e.message || 'Unknown error'}`);
        }
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  React.useEffect(() => {
    // Initial check
    handleCheckUpdates();

    // Request notification permission and schedule daily reminders
    const initNotifications = async () => {
      try {
        const status = await LocalNotifications.checkPermissions();
        let granted = status.display === 'granted';
        if (!granted) {
          const reqStatus = await LocalNotifications.requestPermissions();
          granted = reqStatus.display === 'granted';
        }
        if (granted) {
          await scheduleDailyReminders();
        }
      } catch (e) {
        console.error('Notification permission/scheduling error', e);
      }
    };
    initNotifications();

    // Initialize demo data
    demoService.initialize();
  }, []);

  React.useEffect(() => {
    if (user && location.pathname === '/login') {
      navigate('/');
    }
  }, [user, location.pathname]);

  // Coordinate splash screen fadeout once both auth check and update check are completed
  React.useEffect(() => {
    if (!authLoading && !isCheckingUpdate) {
      const timer = setTimeout(() => {
        if (typeof window.hideSplash === 'function') {
          window.hideSplash();
        }
      }, 500); // 500ms delay to let React fully mount the underlying screen
      return () => clearTimeout(timer);
    }
  }, [authLoading, isCheckingUpdate]);

  React.useEffect(() => {
    let listener = null;

    const setupListener = async () => {
      const handleBackButton = () => {
        if (location.pathname === '/') {
          CapApp.exitApp();
        } else {
          navigate(-1);
        }
      };

      try {
        listener = await CapApp.addListener('backButton', handleBackButton);
      } catch (err) {
        console.log('back button error', err);
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [location.pathname, navigate]);

  // Simple Loading State for Auth
  if (authLoading && (isAppDomain || isAdminDomain)) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div className="loader"></div>
      </div>
    );
  }

  // Parse release notes text into a gorgeous premium structured layout
  const renderReleaseNotes = (notes) => {
    if (!notes) {
      return (
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600', lineHeight: '1.6' }}>
          We've added new features and performance enhancements to make your cattle farm management even smoother.
        </p>
      );
    }

    const lines = notes.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[\s\-\*\•\d\.\)]+/, '').trim()); // Strip bullet prefixes

    if (lines.length <= 1) {
      return (
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600', lineHeight: '1.6' }}>
          {notes}
        </p>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '900',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              ✓
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', fontWeight: '600', lineHeight: '1.5' }}>
              {line}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // Maintenance Mode screen
  if (maintenanceInfo && isAppDomain && !isAdminDomain && !window.location.pathname.startsWith('/admin')) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#F8FAFC',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Dynamic CSS animations injection */}
        <style>{`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.35; }
          }
        `}</style>

        {/* Animated Glow Background Effects */}
        <div style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
          top: '20%',
          left: '10%',
          animation: 'pulse-slow 6s infinite ease-in-out',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          bottom: '15%',
          right: '5%',
          animation: 'pulse-slow 8s infinite ease-in-out',
          pointerEvents: 'none'
        }} />

        {/* Main Content Container */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'float 4s infinite ease-in-out',
          position: 'relative',
          zIndex: 1
        }}>

          {/* Animated Gear Cluster */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Big Gear */}
            <div style={{
              position: 'absolute',
              color: '#3B82F6',
              animation: 'spin-slow 12s infinite linear'
            }}>
              <SettingsIcon size={72} strokeWidth={1.5} />
            </div>
            {/* Secondary Gear */}
            <div style={{
              position: 'absolute',
              top: '55px',
              right: '5px',
              color: '#10B981',
              animation: 'spin-reverse 8s infinite linear'
            }}>
              <SettingsIcon size={44} strokeWidth={1.5} />
            </div>
            {/* Warning Shield Badge */}
            <div style={{
              position: 'absolute',
              background: '#EF4444',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
              top: '12px',
              left: '10px'
            }}>
              ⚠️
            </div>
          </div>

          {/* Heading */}
          <h2 style={{
            margin: '0 0 16px',
            fontSize: '24px',
            fontWeight: '900',
            background: 'linear-gradient(to right, #F8FAFC, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            System Maintenance
          </h2>

          {/* Maintenance Message */}
          <p style={{
            margin: '0 0 28px',
            fontSize: '14.5px',
            color: '#94A3B8',
            fontWeight: '600',
            lineHeight: 1.6
          }}>
            {maintenanceInfo.text}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                handleCheckUpdates(true);
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCcw size={16} /> Check Server Status
            </button>

            {/* Helpline Button */}
            <a
              href="tel:+919876543210"
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              📞 Call Support Helpdesk
            </a>
          </div>

          {/* Footer Info */}
          <p style={{ margin: '24px 0 0', fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Milvexa Enterprise Cloud Solutions
          </p>
        </div>
      </div>
    );
  }

  // Update Popup (Frosted Glassmorphism UI)
  if (updateInfo && !isAdminDomain) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 8, 20, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {/* Animated Background Glows */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          top: '25%',
          left: '15%',
          animation: 'pulse 4s infinite ease-in-out'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(11, 31, 77, 0.4) 0%, transparent 70%)',
          bottom: '20%',
          right: '5%',
          animation: 'pulse 6s infinite ease-in-out'
        }}></div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            width: '100%',
            maxWidth: '380px',
            borderRadius: '36px',
            overflow: 'hidden',
            boxShadow: '0 30px 70px -15px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.7)',
            position: 'relative',
            animation: 'scaleUp 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Header Section */}
          <div style={{
            height: '145px',
            background: 'linear-gradient(135deg, #091e3a 0%, #004d3d 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.35,
              background: 'radial-gradient(at 0% 0%, #10b981 0px, transparent 60%), radial-gradient(at 100% 100%, #1e40af 0px, transparent 65%)'
            }}></div>

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{
                width: '76px',
                height: '76px',
                background: 'white',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                margin: '0 auto',
                animation: 'pulse 2.2s infinite ease-in-out',
                border: '1.5px solid rgba(255,255,255,0.8)'
              }}>
                <img
                  src="https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/icon.png"
                  alt="Milvexa App Icon"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Version floating tag */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(16, 185, 129, 0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '1.2px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '1px'
            }}>
              {t('new_version', 'NEW VERSION')}
            </div>
          </div>

          {/* Details & Action section */}
          <div style={{ padding: '30px 24px 28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#0f172a',
                marginBottom: '6px',
                letterSpacing: '-0.5px'
              }}>
                Time to Upgrade!
              </h2>
              <p style={{ color: '#64748b', fontSize: '14.5px', fontWeight: '700' }}>
                Version {updateInfo.latest_version} is now available
              </p>
            </div>

            {/* Structured Release Notes Box */}
            <div style={{
              background: 'rgba(248, 250, 252, 0.6)',
              padding: '20px',
              borderRadius: '24px',
              marginBottom: '26px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '7px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlusCircle size={14} />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: '900',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px'
                }}>
                  Release Highlights
                </p>
              </div>

              {renderReleaseNotes(updateInfo.release_notes)}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => window.open(updateInfo.download_link, '_system')}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #0b1f4d 0%, #004d3d 100%)',
                  color: 'white',
                  borderRadius: '18px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 12px 28px rgba(11, 31, 77, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                UPGRADE NOW
                <ArrowUpRight size={18} />
              </button>

              {!updateInfo.is_mandatory && (
                <button
                  onClick={() => setUpdateInfo(null)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'transparent',
                    color: '#64748b',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#334155'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
                >
                  Skip for later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminDomain) {
    return (
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<AdminPanel />} />
        </Routes>
      </React.Suspense>
    );
  }

  if (!isAppDomain) {
    return (
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<CorporateWebsite />} />
        </Routes>
      </React.Suspense>
    );
  }

  if (!user) {
    return (
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </React.Suspense>
    );
  }



  return (
    <div className="app-container">
      {announcementBanner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(2, 8, 20, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              width: '100%',
              maxWidth: '380px',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.6)',
              position: 'relative',
              animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1)'
            }}
          >
            {/* Header Ribbon */}
            <div style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
              color: 'white',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              position: 'relative'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '16px' }}>📢</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', letterSpacing: '0.3px' }}>Milvexa Announcement</h3>

              <button
                onClick={() => setAnnouncementBanner(null)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  opacity: 0.8
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Optional Broadcast Image */}
              {announcementBanner.image && (
                <div
                  onClick={() => window.open(announcementBanner.image, '_blank')}
                  title="Click to view full size in browser"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img
                    src={announcementBanner.image}
                    alt="Announcement Media"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    pointerEvents: 'none'
                  }}>
                    <span>🔍 Click to expand</span>
                  </div>
                </div>
              )}

              {/* Announcement Message Text */}
              <p style={{
                margin: '0 0 24px',
                fontSize: '15px',
                color: '#1E293B',
                lineHeight: '1.6',
                fontWeight: '700',
                textAlign: announcementBanner.image ? 'left' : 'center'
              }}>
                {announcementBanner.text}
              </p>

              {/* Action Button */}
              <button
                onClick={() => setAnnouncementBanner(null)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
                  color: 'white',
                  borderRadius: '14px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(30, 64, 175, 0.25)',
                  transition: '0.2s'
                }}
              >
                OK, UNDERSTOOD
              </button>
            </div>
          </div>
        </div>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <GlobalPageHeader />

      <PullToRefresh onRefresh={async () => {
        setRefreshKey(prev => prev + 1);
      }}>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard onOpenSidebar={() => setIsSidebarOpen(true)} />} />
            <Route path="/dashboard" element={<Dashboard onOpenSidebar={() => setIsSidebarOpen(true)} />} />
            <Route path="/animals/add" element={<AddAnimal />} />
            <Route path="/animals/edit/:id" element={<EditAnimal />} />
            <Route path="/animals" element={<CattleManagement />} />
            <Route path="/animals/list" element={<AnimalList recordType="active" />} />
            <Route path="/animals/purchase-record" element={<AnimalList recordType="purchase" />} />
            <Route path="/animals/sell-record" element={<AnimalList recordType="sell" />} />
            <Route path="/animals/sell/:id?" element={<SellAnimal />} />
            <Route path="/animals/death-record" element={<AnimalList recordType="death" />} />
            <Route path="/milk" element={<MilkManagement />} />
            <Route path="/milk/add" element={<AddMilk />} />
            <Route path="/milk/sell" element={<SellMilk />} />
            <Route path="/milk/report" element={<MilkReport />} />
            <Route path="/milk/edit/:id" element={<EditMilk />} />
            <Route path="/milk/dairy-ledger" element={<DairyLedger />} />
            <Route path="/societies/add" element={<AddSociety />} />
            <Route path="/societies" element={<SocietyList />} />
            <Route path="/societies/feed" element={<FeedPurchase />} />
            <Route path="/societies/edit/:id" element={<EditSociety />} />
            <Route path="/doctors/add" element={<AddDoctor />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/doctors/ledger" element={<DoctorLedger />} />
            <Route path="/doctors/edit/:id" element={<EditDoctor />} />
            <Route path="/staff/add" element={<AddStaff />} />
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/salary" element={<StaffSalary />} />
            <Route path="/staff/edit/:id" element={<EditStaff />} />
            <Route path="/suppliers/add" element={<AddSupplier />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/purchase" element={<SupplierPurchase />} />
            <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
            <Route path="/breeding/add" element={<AddBreeding />} />
            <Route path="/breeding" element={<BreedingList />} />
            <Route path="/breeding/edit/:id" element={<EditBreeding />} />
            <Route path="/finance/add" element={<AddTransaction />} />
            <Route path="/finance" element={<TransactionHistory />} />
            <Route path="/finance/balance-sheet" element={<BalanceSheet />} />
            <Route path="/finance/borrow-lend" element={<BorrowLend />} />
            <Route path="/finance/edit/:id" element={<EditTransaction />} />
            <Route path="/payments" element={<PlaceholderPage title="Finance" />} />
            <Route path="/tasks" element={<PlaceholderPage title="Tasks" />} />
            <Route path="/workers" element={<PlaceholderPage title="Workers" />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chatbot" element={<ChatBot />} />
          </Routes>
        </React.Suspense>
      </PullToRefresh>
    </div>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HeaderProvider>
          <AppContent />
          <BottomNavWrapper />
        </HeaderProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const BottomNavWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { isLargeScreen } = useResponsive();

  if (!user || isLargeScreen) return null;

  // Show only on dashboard routes
  const isDashboardRoute = location.pathname === '/' || location.pathname === '/dashboard';
  if (!isDashboardRoute) return null;

  return <BottomNav />;
};

export default App;
