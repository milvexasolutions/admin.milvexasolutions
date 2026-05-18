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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';




import { useTranslation } from 'react-i18next';
import './index.css';





import { AuthProvider, useAuth } from './context/AuthContext';
import PullToRefresh from './components/PullToRefresh';
import { useResponsive } from './hooks/useResponsive';




import { supabase } from './lib/supabase';
import { demoService } from './lib/demoService';
import { dataService } from './lib/dataService';
import PageHeader from './components/PageHeader';

import AddAnimal from './pages/AddAnimal';
import AnimalList from './pages/AnimalList';
import CattleManagement from './pages/CattleManagement';
import MilkManagement from './pages/MilkManagement';
import AddMilk from './pages/AddMilk';
import MilkReport from './pages/MilkReport';
import SellMilk from './pages/SellMilk';
import AddSociety from './pages/AddSociety';
import SocietyList from './pages/SocietyList';
import FeedPurchase from './pages/FeedPurchase';
import AddDoctor from './pages/AddDoctor';
import DoctorList from './pages/DoctorList';
import DoctorLedger from './pages/DoctorLedger';
import AddStaff from './pages/AddStaff';
import StaffList from './pages/StaffList';
import StaffSalary from './pages/StaffSalary';
import AddSupplier from './pages/AddSupplier';
import SupplierList from './pages/SupplierList';
import SupplierPurchase from './pages/SupplierPurchase';
import AddBreeding from './pages/AddBreeding';
import BreedingList from './pages/BreedingList';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import SellAnimal from './pages/SellAnimal';
import EditAnimal from './pages/EditAnimal';
import EditDoctor from './pages/EditDoctor';
import EditStaff from './pages/EditStaff';
import EditSociety from './pages/EditSociety';
import EditSupplier from './pages/EditSupplier';
import EditBreeding from './pages/EditBreeding';
import EditMilk from './pages/EditMilk';
import EditTransaction from './pages/EditTransaction';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import ChatBot from './pages/ChatBot';

// Page Imports removed as requested

const Dashboard = ({ onOpenSidebar }) => {
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
        monthly_expense
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
      title: 'Health Alert',
      message: `${stats.sick_animals} animals require medical attention.`
    });
  }
  if (stats.feed_stock < 50) {
    alerts.push({
      id: 'feed',
      type: 'warning',
      icon: <AlertCircle size={18} color="#D97706" />,
      title: 'Low Feed Stock',
      message: `Only ${stats.feed_stock}T feed remaining in inventory.`
    });
  }
  if (stats.pregnant_animals > 0) {
    alerts.push({
      id: 'pregnant',
      type: 'info',
      icon: <Heart size={18} color="#2563EB" />,
      title: 'Pregnancy Care',
      message: `${stats.pregnant_animals} animals are currently pregnant.`
    });
  }

  return (
    <div className="animate-fade-in" style={{ 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      paddingTop: 'calc(var(--safe-top) + 80px)',
      paddingBottom: '90px', 
      width: '100%', 
      overflowX: 'hidden' 
    }}>
      <PageHeader 
        title="Milvexa - Farm Manager" 
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
      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {/* Card 1: Cattle */}
          <div className="glass-card animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Dog size={18} color="#3B82F6" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Cattle</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.total_animals}</h2>
            </div>
          </div>

          {/* Card 2: Milk Today */}
          <div className="glass-card animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderRadius: '16px', animationDelay: '0.1s', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Milk size={18} color="#10B981" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Milk Today</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.milk_today}<span style={{ fontSize: '12px' }}>L</span></h2>
            </div>
          </div>

          {/* Card 3: Feed Stock */}
          <div className="glass-card animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderRadius: '16px', animationDelay: '0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#FFFBEB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} color="#F59E0B" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Feed Stock</p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>{stats.feed_stock}<span style={{ fontSize: '12px' }}>T</span></h2>
            </div>
          </div>

          {/* Card 4: Expense */}
          <div className="glass-card animate-slide-up" style={{ padding: '12px', background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderRadius: '16px', animationDelay: '0.3s', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#FEF2F2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IndianRupee size={18} color="#EF4444" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Expense</p>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0B1F4D', lineHeight: 1.2 }}>₹{stats.monthly_expense.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Cattle Category Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>Cattle Category</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '24px', padding: '20px', animationDelay: '0.35s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Cow</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.cow_count}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Buffalo</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.buffalo_count}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Calf</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.calf_count}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Bull</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: '#0B1F4D' }}>{stats.bull_count}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Cattle Milking Status Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>Cattle Milking Status</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '24px', padding: '20px', animationDelay: '0.4s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Milking</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>{stats.milking_count}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Dry</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>{stats.dry_count}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Cattle Health Status Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>Cattle Health Status</h3>
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '24px', padding: '20px', animationDelay: '0.45s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#166534', fontWeight: '800', textTransform: 'uppercase' }}>Healthy</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#15803D' }}>{stats.healthy_animals}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase' }}>Sick</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#B91C1C' }}>{stats.sick_animals}</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#9D174D', fontWeight: '800', textTransform: 'uppercase' }}>Pregnant</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#BE185D' }}>{stats.pregnant_animals}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Milk Analytics Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '12px' }}>Milk Analytics</h3>
        
        <div className="glass-card animate-slide-up" style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '24px', padding: '20px', animationDelay: '0.5s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Morning</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#F59E0B' }}>{stats.morning_milk} L</h3>
            </div>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Evening</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#0B1F4D' }}>{stats.evening_milk} L</h3>
            </div>
            <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '16px', textAlign: 'center', border: '1px solid #DBEAFE' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#3B82F6', fontWeight: '800', textTransform: 'uppercase' }}>Today Total</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#1D4ED8' }}>{stats.milk_today} L</h3>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '16px' }}>Last 7 Days Trend</p>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.milk_chart_data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 800 }}
                    itemStyle={{ color: '#0B1F4D', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMilk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts Section (Bottom) */}
      {alerts.length > 0 && (
        <div style={{ padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D', marginBottom: '8px' }}>Alerts & Notifications</h3>
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
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuickActions, setShowQuickActions] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: Dog, label: 'Cattle', path: '/animals' },
    { icon: Plus, label: 'Add', isFab: true },
    { icon: Milk, label: 'Milk', path: '/milk' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
  ];

  const quickActions = [
    { icon: Milk, label: 'Milk Entry', color: '#10B981', path: '/milk' },
    { icon: ShoppingCart, label: 'Purchase', color: '#3B82F6', path: '/animals/add' },
    { icon: ArrowUpRight, label: 'Sell Animal', color: '#EF4444', path: '/animals/sell' },
    { icon: Heart, label: 'Health Rec', color: '#EF4444', path: '/breeding' },
    { icon: IndianRupee, label: 'Expense', color: '#F59E0B', path: '/payments' },
    { icon: Calendar, label: 'New Task', color: '#8B5CF6', path: '/tasks' },
    { icon: Users, label: 'Worker', color: '#EC4899', path: '/workers' },
  ];

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div 
          onClick={() => setShowQuickActions(false)}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(5, 22, 61, 0.6)', 
            backdropFilter: 'blur(10px)', zIndex: 950, 
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: '90px', animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ 
              width: '90%', maxWidth: '400px', padding: '24px', 
              borderRadius: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
              animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link 
                  key={idx}
                  to={action.path}
                  onClick={() => setShowQuickActions(false)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    background: 'none', padding: '12px 0',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '18px', 
                    background: `${action.color}15`, color: action.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 20px ${action.color}20`
                  }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>{action.label}</span>
                </Link>
              );
            })}
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
                style={{ transform: showQuickActions ? 'rotate(45deg)' : 'none' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
              <img src="/icon.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'white', lineHeight: 1 }}>Milvexa</h2>
              <p style={{ margin: '2px 0 0', fontSize: '10px', fontWeight: '700', opacity: 0.6, color: 'white', textTransform: 'uppercase' }}>Cattle Farm Management</p>
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
            <span style={{ fontWeight: '800', fontSize: '14px' }}>Dashboard</span>
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Animal</span>
              {isAnimalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isAnimalOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Purchase Animal', path: '/animals/add' },
                  { label: 'Sell Animal', path: '/animals/sell' },
                  { label: 'Cattle List', path: '/animals/list' },
                  { label: 'Purchase Record', path: '/animals/purchase-record' },
                  { label: 'Sell Record', path: '/animals/sell-record' },
                  { label: 'Death Record', path: '/animals/death-record' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Milk Management</span>
              {isMilkOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isMilkOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Milk', path: '/milk/add' },
                  { label: 'Sell Milk', path: '/milk/sell' },
                  { label: 'Milk Report', path: '/milk/report' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Society Management</span>
              {isSocietyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isSocietyOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Society', path: '/societies/add' },
                  { label: 'Society List', path: '/societies' },
                  { label: 'Feed Purchase', path: '/societies/feed' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Doctor Management</span>
              {isDoctorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isDoctorOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Doctor', path: '/doctors/add' },
                  { label: 'Doctor List', path: '/doctors' },
                  { label: 'Doctor Ledger', path: '/doctors/ledger' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Staff Management</span>
              {isStaffOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isStaffOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Staff', path: '/staff/add' },
                  { label: 'Staff List', path: '/staff' },
                  { label: 'Salary & Advance', path: '/staff/salary' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Supplier Management</span>
              {isSupplierOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isSupplierOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Supplier', path: '/suppliers/add' },
                  { label: 'Supplier List', path: '/suppliers' },
                  { label: 'Purchase Feed', path: '/suppliers/purchase' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Breeding Management</span>
              {isBreedingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isBreedingOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Breeding', path: '/breeding/add' },
                  { label: 'Breeding List', path: '/breeding' }
                ].map((item) => (
                  <Link 
                    key={item.label}
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
              <span style={{ fontWeight: '800', fontSize: '14px', flex: 1, textAlign: 'left' }}>Finance Management</span>
              {isFinanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isFinanceOpen && (
              <div style={{ paddingLeft: '48px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Add Income/Exp', path: '/finance/add' },
                  { label: 'Transaction History', path: '/finance' }
                ].map((item) => (
                  <button 
                    key={item.label}
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

        {/* Bottom Section: Settings & Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: 'white' }}>
          <button 
            onClick={() => { navigate('/settings'); onClose(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px', background: '#F8FAFC', color: '#475569', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
          >
            <SettingsIcon size={18} />
            <span style={{ fontWeight: '700', fontSize: '14px' }}>Settings</span>
          </button>
          <button 
            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); onClose(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px', background: '#FEF2F2', color: '#EF4444', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            <span style={{ fontWeight: '800', fontSize: '14px' }}>Logout</span>
          </button>
        </div>
      </div>

    </>
  );
};


const PlaceholderPage = ({ title }) => (
  <div style={{ 
    background: '#F8FAFC', 
    minHeight: '100vh', 
    paddingTop: 'calc(var(--safe-top) + 80px)',
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
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(true); // Start as true to check updates along with splash
  const navigate = useNavigate();
  const location = useLocation();
  const { isLargeScreen } = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen]);

  const APP_VERSION = "v1.0.0"; // Current installed version

  const handleCheckUpdates = async (manual = false) => {
    const startTime = Date.now();
    if (manual) setIsCheckingUpdate(false); // Don't show splash for manual check
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('latest_version', { ascending: false })
        .limit(1)
        .single();

      if (!error && data && data.latest_version) {
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
          alert(`App is up to date!\nInstalled: ${APP_VERSION}\nLatest: ${data.latest_version}`);
        }
      } else if (manual) {
        alert('No version data found in database. Please check app_settings table.');
      }
    } catch (e) {
      console.log('Update check failed', e);
      if (manual) alert(`Update check failed: ${e.message || 'Unknown error'}\n\nPlease ensure your Supabase 'app_settings' table is public.`);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  React.useEffect(() => {
    // Initial check
    handleCheckUpdates();

    // Request notification permission
    const requestPermission = async () => {
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (e) {
        console.error('Notification permission error', e);
      }
    };
    requestPermission();
    
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
  if (authLoading) {
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

  // Update Popup (Ultra Premium Modern UI)
  if (updateInfo) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        background: 'rgba(0, 10, 20, 0.7)', 
        backdropFilter: 'blur(20px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '24px' 
      }}>
        {/* Animated Background Decor */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', top: '20%', left: '10%', animation: 'pulse 4s infinite' }}></div>
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 38, 72, 0.2) 0%, transparent 70%)', bottom: '10%', right: '-5%', animation: 'pulse 6s infinite' }}></div>

        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            width: '100%', 
            maxWidth: '390px', 
            borderRadius: '40px', 
            overflow: 'hidden',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.5)',
            position: 'relative',
            animation: 'scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Decorative Header */}
          <div style={{ height: '160px', background: 'linear-gradient(225deg, #002648 0%, #004d3d 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Mesh Gradient Overlay */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(at 0% 0%, #10b981 0px, transparent 50%), radial-gradient(at 100% 100%, #002648 0px, transparent 50%)' }}></div>
            
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ 
                width: '90px', 
                height: '90px', 
                background: 'white', 
                borderRadius: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                margin: '0 auto 12px',
                animation: 'pulse 2s infinite ease-in-out'
              }}>
                <img 
                  src="https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/icon.png" 
                  alt="App Icon"
                  style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Version Floating Badge */}
            <div style={{ 
              position: 'absolute', 
              top: '24px', 
              right: '24px', 
              background: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(10px)',
              padding: '6px 14px', 
              borderRadius: '14px', 
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '1px'
            }}>
              NEW VERSION
            </div>
          </div>

          <div style={{ padding: '36px 28px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.8px' }}>
                Time to Upgrade!
              </h2>
              <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
                Version {updateInfo.latest_version} is here with major improvements
              </p>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              padding: '24px', 
              borderRadius: '28px', 
              marginBottom: '32px', 
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusCircle size={16} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Release Highlights</p>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', lineHeight: '1.7', fontWeight: '600' }}>
                {updateInfo.release_notes || 'We\'ve added new tools and enhanced security to make your farm management even smoother.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => window.open(updateInfo.download_link, '_system')}
                style={{ 
                  width: '100%', 
                  padding: '22px', 
                  background: 'linear-gradient(to right, #002648, #001830)', 
                  color: 'white', 
                  borderRadius: '22px', 
                  border: 'none', 
                  fontSize: '18px', 
                  fontWeight: '900', 
                  cursor: 'pointer',
                  boxShadow: '0 15px 35px rgba(0, 38, 72, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: '0.3s'
                }}
              >
                UPGRADE NOW
                <ArrowUpRight size={22} />
              </button>
              
              {!updateInfo.is_force_update && (
                <button
                  onClick={() => setUpdateInfo(null)}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    background: 'transparent', 
                    color: '#94a3b8', 
                    borderRadius: '20px', 
                    border: 'none', 
                    fontSize: '15px', 
                    fontWeight: '800', 
                    cursor: 'pointer' 
                  }}
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

  if (!user && location.pathname !== '/admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (location.pathname === '/admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    );
  }



  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <PullToRefresh onRefresh={async () => {
        setRefreshKey(prev => prev + 1);
      }}>
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
          <Route path="/finance/edit/:id" element={<EditTransaction />} />
          <Route path="/payments" element={<PlaceholderPage title="Finance" />} />
          <Route path="/tasks" element={<PlaceholderPage title="Tasks" />} />
          <Route path="/workers" element={<PlaceholderPage title="Workers" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chatbot" element={<ChatBot />} />
        </Routes>
      </PullToRefresh>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <AppContent />
      <BottomNavWrapper />
    </AuthProvider>
  );
}

const BottomNavWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { isLargeScreen } = useResponsive();
  
  if (!user || isLargeScreen) return null;
  
  // Show on all authenticated pages
  return <BottomNav />;
};

export default App;
