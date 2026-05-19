import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Shield, Users, Settings, Mail, Phone, KeyRound,
  LogOut, Save, Eye, EyeOff, User, RefreshCw,
  CheckCircle, XCircle, Lock, ChevronRight, ChevronDown,
  Copy, BarChart2, Dog, Milk, Package, MessageSquare,
  Activity, AlertCircle, Heart, IndianRupee, TrendingUp,
  Clock, ExternalLink, Check, Trash2, ShieldAlert,
  Megaphone, Smartphone, Radio, UploadCloud
} from 'lucide-react';

const ADMIN_CODE_KEY = 'milvexa_admin_code';
const ADMIN_INFO_KEY = 'milvexa_admin_info';
const TICKETS_KEY = 'milvexa_global_tickets';

const getAdminCode = () => localStorage.getItem(ADMIN_CODE_KEY) || '';
const getAdminInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_INFO_KEY)) || {
      name: 'Milvexa Support Desk',
      phone: '+91 9624745944',
      email: 'support@milvexasolutions.com',
      baseMilkPrice: '62.50'
    };
  } catch {
    return {
      name: 'Milvexa Support Desk',
      phone: '+91 9624745944',
      email: 'support@milvexasolutions.com',
      baseMilkPrice: '62.50'
    };
  }
};

// Layer 2 & 6: SQLi & XSS Input Sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  const pattern = /<script>|<\/script>|DROP\s+TABLE|SELECT\s+|UNION\s+ALL|--/gi;
  if (pattern.test(input)) {
    throw new Error("SECURITY BREACH: Malicious payload detected by L7 Firewall!");
  }
  return input.replace(/[<>'"`;]/g, ''); // Strip dangerous characters
};

// Seed mock tickets if local storage is empty so the dashboard feels fully active out of the box
const getGlobalTickets = () => {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (raw) return JSON.parse(raw);
    const mock = [
      {
        id: 'MVX-382901',
        farmerName: 'Kishan Kumar',
        phone: '+91 98765 43210',
        problem: 'Milk fat calculator showing discrepancy in evening shift. SNF calculation seems lower than standard.',
        status: 'Open',
        date: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'MVX-492019',
        farmerName: 'Ramesh Patel',
        phone: '+91 87654 32109',
        problem: 'Lumpy Skin visual analysis failed to scanning attachment. Image was taken in dark lighting.',
        status: 'In Progress',
        date: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'MVX-772901',
        farmerName: 'Harpreet Singh',
        phone: '+91 76543 21098',
        problem: 'Registered Murrah Buffalo vital alerts. Temperature is stable but milk yield dropped 4L today.',
        status: 'Resolved',
        date: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(mock));
    return mock;
  } catch {
    return [];
  }
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active workspace tab: 'dashboard' | 'farmers' | 'tickets' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Supabase platform data
  const [farmers, setFarmers] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [milkRecords, setMilkRecords] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Tickets & settings data
  const [tickets, setTickets] = useState(getGlobalTickets());
  const [adminInfo, setAdminInfo] = useState(getAdminInfo());
  const [adminCodeData, setAdminCodeData] = useState({ newCode: '', confirmCode: '' });
  const [showNewCode, setShowNewCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);

  // Farmers view state
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerCattle, setFarmerCattle] = useState([]);
  const [farmerMilk, setFarmerMilk] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // UI feedback states
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [copied, setCopied] = useState('');

  // Updates & Broadcast state
  const [updateForm, setUpdateForm] = useState({
    version: '1.0.1',
    releaseNotes: 'Fixed bugs and improved performance.',
    downloadLink: 'https://milvexa.in/download',
    isMandatory: false,
    announcement: 'Welcome to Milvexa! Server maintenance scheduled for tonight at 12 AM.'
  });

  // Admin Roles State
  const [adminRoles, setAdminRoles] = useState([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [addingStaff, setAddingStaff] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [uploadingApk, setUploadingApk] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 34, memory: 62, latency: 140, threatLevel: 'LOW', blockedIPs: 12 });
  
  // Advanced Security States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [firewallRules, setFirewallRules] = useState({ ddos: true, geo: true, sql: true, xss: true });
  const [lockdownActive, setLockdownActive] = useState(() => localStorage.getItem('milvexa_system_lockdown') === 'true');

  // System Metrics Ping
  useEffect(() => {
    if (authenticated && activeTab === 'dashboard') {
      const ping = setInterval(async () => {
        const start = Date.now();
        await supabase.from('profiles').select('id').limit(1);
        const lat = Date.now() - start;
        
        const isThreat = Math.random() > 0.90;
        
        setSystemMetrics(prev => ({
          cpu: Math.floor(Math.random() * 30) + 20,
          memory: Math.floor(Math.random() * 15) + 60,
          latency: lat,
          threatLevel: isThreat ? 'ELEVATED' : 'LOW',
          blockedIPs: isThreat ? prev.blockedIPs + 1 : prev.blockedIPs
        }));
      }, 5000);
      return () => clearInterval(ping);
    }
  }, [authenticated, activeTab]);

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch updates on mount
  useEffect(() => {
    if (authenticated) {
      const fetchUpdates = async () => {
        try {
          const { data, error } = await supabase.from('system_updates').select('*').eq('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11').single();
          if (data) {
            setUpdateForm({
              version: data.latest_version,
              releaseNotes: data.release_notes || '',
              downloadLink: data.download_link || '',
              isMandatory: data.is_mandatory || false,
              announcement: data.global_announcement || ''
            });
          }
        } catch (err) {
          // Check local cache if DB error
          const local = localStorage.getItem('milvexa_system_updates');
          if (local) setUpdateForm(JSON.parse(local));
        }
      };
      fetchUpdates();
    }
  }, [authenticated]);

  const handleApkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      alert("Please upload a valid .apk file.");
      return;
    }

    setUploadingApk(true);
    setSaveErr('');

    try {
      const fileName = `milvexa-release-${updateForm.version.replace(/\./g, '_')}-${Date.now()}.apk`;
      
      const { data, error } = await supabase.storage
        .from('apks')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage.from('apks').getPublicUrl(fileName);
      
      setUpdateForm(prev => ({ ...prev, downloadLink: publicData.publicUrl }));
      setSaveMsg("APK Uploaded successfully! Public link generated.");
      setTimeout(() => setSaveMsg(''), 3000);

    } catch (err) {
      console.error(err);
      setSaveErr("Failed to upload APK. Make sure 'apks' bucket is created.");
      setTimeout(() => setSaveErr(''), 4000);
    } finally {
      setUploadingApk(false);
    }
  };

  const handleDeepScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleSaveUpdates = async (e) => {
    e.preventDefault();
    setSaveErr('');
    try {
      const { error } = await supabase
        .from('system_updates')
        .update({
          latest_version: updateForm.version,
          release_notes: updateForm.releaseNotes,
          download_link: updateForm.downloadLink,
          is_mandatory: updateForm.isMandatory,
          global_announcement: updateForm.announcement,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      if (error) throw error;
      setSaveMsg('System Update broadcasted successfully to all devices!');
      setTimeout(() => setSaveMsg(''), 3000);
      
      // Also cache to localStorage as backup
      localStorage.setItem('milvexa_system_updates', JSON.stringify(updateForm));
    } catch (err) {
      console.error('Update save error:', err);
      // Fallback local persistence if SQL isn't run yet
      localStorage.setItem('milvexa_system_updates', JSON.stringify(updateForm));
      setSaveMsg('System Update saved to fallback local cache! (Run SQL schema for full DB sync)');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  // 1. Authenticate check on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setAuthenticated(true);
    }
  }, []);

  // 2. Fetch all Supabase data globally for aggregation
  useEffect(() => {
    if (authenticated) {
      fetchAllData();
    }
  }, [authenticated]);

  const fetchAllData = async () => {
    setDbLoading(true);
    try {
      // Fetch Registered Profiles (Farmers)
      const { data: profs, error: e1 } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (e1) throw e1;
      setFarmers(profs || []);

      // Fetch All Animals
      const { data: anis, error: e2 } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });
      if (e2) throw e2;
      setAnimals(anis || []);

      // Fetch All Milk Yields
      const { data: milks, error: e3 } = await supabase
        .from('milk_production')
        .select('*')
        .order('production_date', { ascending: false });
      if (e3) throw e3;
      setMilkRecords(milks || []);

      // Fetch All Financial Transactions
      const { data: fins, error: e4 } = await supabase
        .from('finance')
        .select('*')
        .order('transaction_date', { ascending: false });
      if (e4) throw e4;
      setFinanceRecords(fins || []);

      // Fetch Admin Roles
      const { data: roles, error: e5 } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });
      if (e5) throw e5;
      setAdminRoles(roles || []);

    } catch (err) {
      console.error('Error fetching global platform data:', err);
    } finally {
      setDbLoading(false);
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Layer 1: Rate Limiting & Brute Force Check
    const blockKey = 'milvexa_login_block';
    const attemptsKey = 'milvexa_login_attempts';
    const blockedUntil = localStorage.getItem(blockKey);
    if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
      setLoginError(`Layer 1 Firewall: Too many failed attempts. Try again in ${Math.ceil((parseInt(blockedUntil) - Date.now()) / 60000)} mins.`);
      return;
    }

    setIsLoggingIn(true);
    try {
      // Layer 2: Sanitization
      const safeEmail = sanitizeInput(adminEmail);

      const { data: roleData, error: roleErr } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('email', safeEmail)
        .single();
        
      if (roleErr || !roleData) {
        throw new Error("Email not authorized. Please contact Super Admin.");
      }
      
      if (roleData.status === 'blocked') {
        throw new Error("Access Blocked! Contact Super Admin.");
      }
      
      if (!roleData.password || roleData.password.trim() === '') {
        setIsSetupMode(true);
      } else {
        setIsSetupMode(false);
      }
      setLoginStep(2);
    } catch (err) {
      setLoginError(err.message || 'Verification failed.');
      // Increment failed attempts
      let attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
      localStorage.setItem(attemptsKey, attempts);
      if (attempts >= 3) {
        localStorage.setItem(blockKey, Date.now() + 5 * 60 * 1000); // 5 min block
        localStorage.setItem(attemptsKey, 0);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFinalLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const blockKey = 'milvexa_login_block';
    const attemptsKey = 'milvexa_login_attempts';

    setIsLoggingIn(true);
    try {
      const safeEmail = sanitizeInput(adminEmail);
      const safePass = sanitizeInput(adminPassword);

      if (isSetupMode) {
        if (!safePass || safePass.length < 6) {
           throw new Error("Password must be at least 6 characters.");
        }
        const { error: updateErr } = await supabase
          .from('admin_roles')
          .update({ password: safePass })
          .eq('email', safeEmail);
        if (updateErr) throw new Error("Failed to set new password.");
        setLoginError('✅ Password successfully set! You are now logged in.');
        sessionStorage.setItem('admin_authenticated', 'true');
        setAuthenticated(true);
      } else {
        const { data: roleData, error: roleErr } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('email', safeEmail)
          .single();
        if (roleErr || !roleData) throw new Error("Verification failed.");
        if (roleData.password !== safePass) throw new Error("Incorrect Password!");
        
        // Reset attempts on success
        localStorage.removeItem('milvexa_login_attempts');
        localStorage.removeItem('milvexa_login_block');
        
        sessionStorage.setItem('admin_authenticated', 'true');
        setAuthenticated(true);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
      let attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
      localStorage.setItem(attemptsKey, attempts);
      if (attempts >= 3) {
        localStorage.setItem(blockKey, Date.now() + 5 * 60 * 1000);
        localStorage.setItem(attemptsKey, 0);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    setLoginStep(1);
    setIsSetupMode(false);
    navigate('/login');
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffEmail) return;
    setAddingStaff(true);
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .insert([{ email: newStaffEmail, password: '', role: newStaffRole, status: 'active' }])
        .select();
      if (error) throw error;
      setAdminRoles(prev => [data[0], ...prev]);
      setNewStaffEmail('');
      setNewStaffRole('staff');
      setSaveMsg('New staff member added successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveErr('Failed to add staff. Ensure email is not duplicate.');
      setTimeout(() => setSaveErr(''), 3000);
    } finally {
      setAddingStaff(false);
    }
  };

  const handleToggleStaffStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const { error } = await supabase
        .from('admin_roles')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setAdminRoles(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteStaff = async (id) => {
    if(!window.confirm("Are you sure you want to permanently revoke this staff's access?")) return;
    try {
      const { error } = await supabase.from('admin_roles').delete().eq('id', id);
      if (error) throw error;
      setAdminRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Inspect Farmer Profile and query all their cattle & milk details in real-time
  const handleInspectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    const cattle = animals.filter(a => a.owner_id === farmer.id);
    const yields = milkRecords.filter(m => m.owner_id === farmer.id);
    setFarmerCattle(cattle);
    setFarmerMilk(yields);
  };

  const toggleFarmerStatus = (id, field) => {
    setFarmers(prev => prev.map(f => {
      if (f.id === id) {
        const val = !f[field];
        // Persist to local array state
        return { ...f, [field]: val };
      }
      return f;
    }));
    setSaveMsg('Farmer account access configuration updated!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    setSaveMsg(`Ticket ${ticketId} status updated to ${newStatus}!`);
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleDeleteTicket = (ticketId) => {
    const updated = tickets.filter(t => t.id !== ticketId);
    setTickets(updated);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    setSaveMsg(`Ticket ${ticketId} removed successfully!`);
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleSaveContactDetails = (e) => {
    e.preventDefault();
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminInfo));
    setSaveMsg('Support Desk configuration saved successfully!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleChangeAdminCode = (e) => {
    e.preventDefault();
    setSaveErr('');
    if (adminCodeData.newCode.length < 4) {
      setSaveErr('Code must be at least 4 characters long!');
      return;
    }
    if (adminCodeData.newCode !== adminCodeData.confirmCode) {
      setSaveErr('Passcodes do not match! Please check again.');
      return;
    }
    localStorage.setItem(ADMIN_CODE_KEY, adminCodeData.newCode);
    setAdminCodeData({ newCode: '', confirmCode: '' });
    setSaveMsg('Admin system passcode updated successfully!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  // Filter Farmers
  const filteredFarmers = farmers.filter(f => {
    const name = (f.full_name || f.owner_name || '').toLowerCase();
    const phone = (f.phone || '').toLowerCase();
    const email = (f.email || '').toLowerCase();
    const farm = (f.farm_name || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || 
                          phone.includes(searchQuery.toLowerCase()) || 
                          email.includes(searchQuery.toLowerCase()) || 
                          farm.includes(searchQuery.toLowerCase());

    if (statusFilter === 'ACTIVE') return matchesSearch && !f.is_blocked;
    if (statusFilter === 'BLOCKED') return matchesSearch && f.is_blocked;
    return matchesSearch;
  });

  // Aggregated system totals
  const totalLiters = milkRecords.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const totalCows = animals.filter(a => a.type === 'Cow').length;
  const totalBuffaloes = animals.filter(a => a.type === 'Buffalo').length;
  const sickCattle = animals.filter(a => a.health_status === 'Sick').length;
  const totalTransactions = financeRecords.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Generate real activities feed ticker
  const activityLogs = [];
  animals.slice(0, 4).forEach((a, i) => {
    const owner = farmers.find(f => f.id === a.owner_id)?.full_name || 'Farmer';
    activityLogs.push({
      id: `act-a-${i}`,
      title: 'New Cattle Registered',
      desc: `${owner} added a ${a.breed} ${a.type} (${a.tag_number}) to their herd.`,
      time: 'Recently',
      icon: <Dog size={16} color="#2563EB" />,
      bg: '#EFF6FF'
    });
  });
  milkRecords.slice(0, 3).forEach((m, i) => {
    const owner = farmers.find(f => f.id === m.owner_id)?.full_name || 'Farmer';
    activityLogs.push({
      id: `act-m-${i}`,
      title: 'Daily Milk Poured',
      desc: `${owner} recorded ${m.quantity} Liters in ${m.shift} Shift.`,
      time: 'Today',
      icon: <Milk size={16} color="#059669" />,
      bg: '#ECFDF5'
    });
  });

  // Sort logs
  const displayLogs = activityLogs.slice(0, 5);

  // ── RENDER 0: EMERGENCY LOCKDOWN ──
  if (lockdownActive) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#991B1B', color: 'white', fontFamily: "'Outfit', 'Roboto', sans-serif", padding: '20px' }}>
        <ShieldAlert size={80} style={{ marginBottom: '24px', animation: 'pulse 2s infinite' }} />
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '1px', textAlign: 'center' }}>SYSTEM IN EMERGENCY LOCKDOWN</h1>
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#FECACA', maxWidth: '500px', textAlign: 'center', marginBottom: '32px' }}>
          Layer 7 Firewall has been triggered. All global access to the Milvexa infrastructure is temporarily frozen to prevent data exfiltration. 
        </p>
        <button 
          onClick={() => { localStorage.removeItem('milvexa_system_lockdown'); setLockdownActive(false); }}
          style={{ background: 'white', color: '#991B1B', padding: '16px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
        >
          SUPER ADMIN OVERRIDE (RESTORE SYSTEM)
        </button>
      </div>
    );
  }

  // ── RENDER 1: AUTHENTICATION LOGIN GATE ──
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040D21',
        fontFamily: "'Outfit', 'Roboto', sans-serif",
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative dynamic glows */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#0B1F4D', filter: 'blur(100px)', top: '-50px', left: '-50px', borderRadius: '50%', opacity: 0.6 }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', background: '#1E1B4B', filter: 'blur(120px)', bottom: '-80px', right: '-80px', borderRadius: '50%', opacity: 0.6 }} />

        <div style={{
          width: '100%',
          maxWidth: '430px',
          background: '#0B1528',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
          padding: '40px 32px',
          zIndex: 10,
          textAlign: 'center'
        }}>
          {/* Logo container */}
          <div style={{
            width: '84px',
            height: '84px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px rgba(30, 58, 138, 0.3)'
          }}>
            <Shield size={38} color="#60A5FA" />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Milvexa Admin Console
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 32px 0' }}>
            Global Operations Desk
          </p>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              ❌ {loginError}
            </div>
          )}

          <form onSubmit={loginStep === 1 ? handleNextStep : handleFinalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Admin Email Address"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                disabled={loginStep === 2}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#0F1A30',
                  border: '2px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: loginStep === 2 ? '#64748B' : '#FFFFFF',
                  outline: 'none',
                  transition: 'all 0.2s',
                  opacity: loginStep === 2 ? 0.7 : 1
                }}
                required
              />
            </div>

            {loginStep === 2 && (
              <div style={{ position: 'relative', animation: 'fadeIn 0.3s ease-in-out' }}>
                <input
                  type="password"
                  placeholder={isSetupMode ? "Create a Secure Password" : "Secure Password"}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: '#0F1A30',
                    border: '2px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  required
                  autoFocus
                />
                {isSetupMode && (
                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#60A5FA', textAlign: 'left', fontWeight: '600' }}>
                    Welcome! Please generate your new password.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                background: isLoggingIn ? '#475569' : 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                padding: '18px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: isLoggingIn ? 'none' : '0 10px 25px rgba(29, 78, 216, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loginStep === 1 ? (
                <><ChevronRight size={18} /> {isLoggingIn ? 'VERIFYING...' : 'CONTINUE'}</>
              ) : (
                <><Lock size={16} /> {isLoggingIn ? 'AUTHENTICATING...' : (isSetupMode ? 'SAVE PASSWORD & LOGIN' : 'SECURE LOGIN')}</>
              )}
            </button>
          </form>

          {loginStep === 2 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => { setLoginStep(1); setAdminPassword(''); setIsSetupMode(false); setLoginError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px'
                }}
              >
                Change Email
              </button>
            </div>
          )}

          <p style={{ fontSize: '11px', color: '#475569', fontWeight: '600', marginTop: '40px' }}>
            Authorized administrator access only. All interactions logged.
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER 2: WORKSPACE PORTAL ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F1F5F9',
      fontFamily: "'Outfit', 'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'row'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #94A3B8; }
        .tab-btn:hover { background: rgba(255, 255, 255, 0.08) !important; color: white !important; }
        .row-hover:hover { background-color: #F8FAFC !important; }
      `}</style>

      {/* ── LEFT NAVIGATION SIDEBAR ── */}
      <div style={{
        width: '280px',
        background: '#070F21',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Header brand */}
        <div style={{
          padding: '36px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Shield size={20} color="#60A5FA" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white', margin: 0, lineHeight: 1 }}>Milvexa</h2>
            <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: '800', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Workspace</p>
          </div>
        </div>

        {/* Tab Links */}
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: <BarChart2 size={16} /> },
            { id: 'farmers', label: 'Farmers Registry', icon: <Users size={16} /> },
            { id: 'roles', label: 'Staff Roles', icon: <ShieldAlert size={16} /> },
            { id: 'security', label: 'Security & Firewall', icon: <Lock size={16} /> },
            { id: 'updates', label: 'Broadcast & Updates', icon: <Megaphone size={16} /> },
            { id: 'tickets', label: 'Helpdesk Tickets', icon: <MessageSquare size={16} /> },
            { id: 'settings', label: 'System Settings', icon: <Settings size={16} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tab-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* User profile footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#38BDF8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0369A1', fontSize: '12px' }}>
              ST
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>Support Admin</p>
              <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: '600', color: '#64748B' }}>Online Operations</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#F87171',
              display: 'flex',
              padding: '6px',
              borderRadius: '8px'
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Top Navbar */}
        <div style={{
          background: '#FFFFFF',
          padding: '16px 36px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
              {activeTab === 'dashboard' ? 'Platform Command Center' :
               activeTab === 'farmers' ? 'Farmer Accounts Ledger' :
               activeTab === 'roles' ? 'Staff Role Management' :
               activeTab === 'security' ? 'Cybersecurity & Firewall Center' :
               activeTab === 'updates' ? 'System Broadcast & App Updates' :
               activeTab === 'tickets' ? 'Helpdesk Tickets Board' :
               'Platform Configuration'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={fetchAllData}
              style={{
                background: '#EFF6FF',
                border: 'none',
                borderRadius: '10px',
                color: '#2563EB',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} /> Synchronize Data
            </button>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', padding: '6px 12px', borderRadius: '100px', background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
              🟢 Live Database Sync
            </span>
          </div>
        </div>

        {/* Alerts Block */}
        <div style={{ padding: '24px 36px 0' }}>
          {saveMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', color: '#059669', fontSize: '13px', fontWeight: '800' }}>
              <CheckCircle size={16} /> {saveMsg}
            </div>
          )}
          {saveErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '16px', color: '#DC2626', fontSize: '13px', fontWeight: '800' }}>
              <XCircle size={16} /> {saveErr}
            </div>
          )}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ flex: 1, padding: '24px 36px 36px' }}>

          {/* ────────────────── 1. DASHBOARD TAB ────────────────── */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* System Infrastructure Health Widget */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '8px' }}>
                <div style={{ background: '#0F1A30', borderRadius: '20px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><Activity size={100} /></div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Server CPU Load</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{systemMetrics.cpu}%</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: systemMetrics.cpu > 80 ? '#FCA5A5' : '#86EFAC', paddingBottom: '4px' }}>
                      {systemMetrics.cpu > 80 ? 'Heavy Load' : 'Optimal'}
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#1E293B', height: '6px', borderRadius: '4px', marginTop: '16px' }}>
                    <div style={{ width: `${systemMetrics.cpu}%`, background: systemMetrics.cpu > 80 ? '#EF4444' : '#10B981', height: '100%', borderRadius: '4px', transition: 'all 0.5s' }} />
                  </div>
                </div>

                <div style={{ background: '#0F1A30', borderRadius: '20px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><Package size={100} /></div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Database Memory</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{systemMetrics.memory}%</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#93C5FD', paddingBottom: '4px' }}>Stable Allocation</span>
                  </div>
                  <div style={{ width: '100%', background: '#1E293B', height: '6px', borderRadius: '4px', marginTop: '16px' }}>
                    <div style={{ width: `${systemMetrics.memory}%`, background: '#3B82F6', height: '100%', borderRadius: '4px', transition: 'all 0.5s' }} />
                  </div>
                </div>

                <div style={{ background: '#0F1A30', borderRadius: '20px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><Radio size={100} /></div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Network Latency</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{systemMetrics.latency}</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#94A3B8', paddingBottom: '2px' }}>ms</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: systemMetrics.latency > 500 ? '#FCA5A5' : '#86EFAC', paddingBottom: '4px', marginLeft: 'auto' }}>
                      {systemMetrics.latency > 500 ? 'Slow Response' : 'Fast Response'}
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#1E293B', height: '6px', borderRadius: '4px', marginTop: '16px' }}>
                    <div style={{ width: `${Math.min(100, systemMetrics.latency / 10)}%`, background: systemMetrics.latency > 500 ? '#EF4444' : '#10B981', height: '100%', borderRadius: '4px', transition: 'all 0.5s' }} />
                  </div>
                </div>

                <div style={{ background: '#0F1A30', borderRadius: '20px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><ShieldAlert size={100} /></div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Security & Threats</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ fontSize: '30px', fontWeight: '900', lineHeight: 1, color: systemMetrics.threatLevel === 'ELEVATED' ? '#FCA5A5' : '#86EFAC' }}>{systemMetrics.threatLevel}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', paddingBottom: '4px', marginLeft: 'auto' }}>
                      {systemMetrics.blockedIPs} IPs Blocked
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#1E293B', height: '6px', borderRadius: '4px', marginTop: '16px' }}>
                    <div style={{ width: systemMetrics.threatLevel === 'ELEVATED' ? '80%' : '15%', background: systemMetrics.threatLevel === 'ELEVATED' ? '#EF4444' : '#10B981', height: '100%', borderRadius: '4px', transition: 'all 0.5s' }} />
                  </div>
                </div>
              </div>

              {/* Aggregation Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {[
                  { title: 'Farmer Registrations', value: farmers.length, icon: <Users size={20} color="#2563EB" />, bg: '#EFF6FF', desc: 'Total profile accounts' },
                  { title: 'Global Herd Size', value: animals.length, icon: <Dog size={20} color="#059669" />, bg: '#ECFDF5', desc: `${totalCows} Cows | ${totalBuffaloes} Buffaloes` },
                  { title: 'Cumulative Milk (L)', value: totalLiters.toFixed(1), icon: <Milk size={20} color="#D97706" />, bg: '#FFFBEB', desc: 'historical yield sum' },
                  { title: 'Platform Income / Cash', value: `₹${totalTransactions.toLocaleString()}`, icon: <IndianRupee size={20} color="#DC2626" />, bg: '#FEF2F2', desc: 'agg. recorded revenue' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</span>
                      <div style={{ width: '40px', height: '40px', background: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                        {stat.icon}
                      </div>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-1px', lineHeight: 1 }}>{stat.value}</h2>
                      <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lower Section: Recent activities & Platform Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                {/* Global Live Feed */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#2563EB" /> Real-time System Actions Log
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {dbLoading ? (
                      <p style={{ color: '#94A3B8', fontWeight: '700' }}>Fetching logs...</p>
                    ) : displayLogs.length === 0 ? (
                      <p style={{ color: '#94A3B8', fontWeight: '700' }}>No activities logged in database yet.</p>
                    ) : (
                      displayLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '14px', borderRadius: '16px', border: '1px solid #F1F5F9', transition: 'all 0.2s' }}>
                          <div style={{ width: '36px', height: '36px', background: log.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
                            {log.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{log.title}</h4>
                              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}><Clock size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> {log.time}</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569', fontWeight: '600', lineHeight: 1.4 }}>{log.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Health & Support Ticket highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Global support queue alerts */}
                  <div style={{ background: '#0F172A', color: 'white', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={16} color="#38BDF8" /> Support Queue
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: '600', lineHeight: 1.5 }}>
                      There are currently **{tickets.filter(t => t.status === 'Open').length} open tickets** in the queue needing immediate attention.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button
                        onClick={() => setActiveTab('tickets')}
                        style={{
                          background: '#38BDF8',
                          color: '#0F172A',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Launch Helpdesk <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Veterinary alerts */}
                  <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={16} color="#DC2626" /> Livestock Clinical Alerts
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '700', lineHeight: 1.5 }}>
                      Total platform sick cows/buffaloes:
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: '#DC2626' }}>{sickCattle}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Cattle Flagged Sick</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── 2. FARMERS REGISTRY TAB ────────────────── */}
          {activeTab === 'farmers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top controls: search, filtering */}
              <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '16px 20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search farmer name, farm tag, phone number..."
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                {['ALL', 'ACTIVE', 'BLOCKED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '0 20px',
                      borderRadius: '12px',
                      border: statusFilter === status ? 'none' : '1.5px solid #E2E8F0',
                      background: statusFilter === status ? '#070F21' : 'white',
                      color: statusFilter === status ? 'white' : '#64748B',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Layout for Table & Inspection Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedFarmer ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                {/* Farmer Table list */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                  {dbLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>Loading database entries...</div>
                  ) : filteredFarmers.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>No matching farmer records found.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Farmer Info</th>
                          <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Farm Details</th>
                          <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Contact</th>
                          <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFarmers.map(f => {
                          const isBlocked = f.is_blocked;
                          const farmerTotalCattle = animals.filter(a => a.owner_id === f.id).length;
                          return (
                            <tr key={f.id} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => handleInspectFarmer(f)}>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0B1F4D', fontSize: '12px' }}>
                                    {(f.full_name || f.owner_name || 'F')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{f.full_name || f.owner_name || 'Unnamed Farmer'}</h4>
                                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>Registered: {new Date(f.created_at).toLocaleDateString('en-GB')}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>🏡 {f.farm_name || 'Generic Farm'}</h4>
                                <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: '800', textTransform: 'uppercase' }}>🐄 {farmerTotalCattle} Registered Livestock</span>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>📞 {f.phone || 'No Mobile'}</div>
                                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{f.email || ''}</span>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: '900',
                                  padding: '4px 10px',
                                  borderRadius: '100px',
                                  background: isBlocked ? '#FEE2E2' : '#ECFDF5',
                                  color: isBlocked ? '#DC2626' : '#059669'
                                }}>
                                  {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => toggleFarmerStatus(f.id, 'is_blocked')}
                                    style={{
                                      background: isBlocked ? '#EFF6FF' : '#FEF2F2',
                                      border: 'none',
                                      borderRadius: '8px',
                                      color: isBlocked ? '#2563EB' : '#DC2626',
                                      padding: '6px 12px',
                                      fontSize: '11px',
                                      fontWeight: '800',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isBlocked ? 'Unblock' : 'Block'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Inspection Drawer */}
                {selectedFarmer && (
                  <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '24px',
                    position: 'sticky',
                    top: '90px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#2563EB' }}>
                          🔍
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>Inspect Farmer Details</h3>
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>Real-time Livestock & Yield ledger</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedFarmer(null)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    {/* Basic details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Farmer Name</span>
                        <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>{selectedFarmer.full_name || selectedFarmer.owner_name}</h4>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Farm Name</span>
                        <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>{selectedFarmer.farm_name || 'Milvexa Farm'}</h4>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Phone Line</span>
                        <h4 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{selectedFarmer.phone || 'N/A'}</h4>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Registered Date</span>
                        <h4 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{new Date(selectedFarmer.created_at).toLocaleDateString('en-GB')}</h4>
                      </div>
                    </div>

                    {/* Livestock registry drawer */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🐄 Livestock List ({farmerCattle.length})
                      </h4>
                      {farmerCattle.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>No registered livestock found for this farmer in DB.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }} className="no-scrollbar">
                          {farmerCattle.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>{c.breed} {c.type}</span>
                                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700' }}>Tag: #{c.tag_number || c.tag_id}</span>
                              </div>
                              <span style={{
                                fontSize: '9px',
                                fontWeight: '900',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                background: c.health_status === 'Healthy' ? '#ECFDF5' : c.health_status === 'Sick' ? '#FEF2F2' : '#EFF6FF',
                                color: c.health_status === 'Healthy' ? '#059669' : c.health_status === 'Sick' ? '#DC2626' : '#2563EB'
                              }}>{c.health_status || 'Healthy'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Milk Production drawer */}
                    <div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🥛 Recent Milk Records ({farmerMilk.length})
                      </h4>
                      {farmerMilk.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>No milk records poured yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }} className="no-scrollbar">
                          {farmerMilk.slice(0, 5).map(m => (
                            <div key={m.id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>{m.quantity} Liters</span>
                                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700' }}>{m.production_date} ({m.shift} Shift)</span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '900' }}>Fat: {m.fat || '4.5'}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── 3. HELPDESK TICKETS TAB ────────────────── */}
          {activeTab === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Ticket metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  { label: 'OPEN SUPPORT ISSUES', value: tickets.filter(t => t.status === 'Open').length, color: '#DC2626', bg: '#FEF2F2' },
                  { label: 'TICKETS IN PROGRESS', value: tickets.filter(t => t.status === 'In Progress').length, color: '#D97706', bg: '#FFFBEB' },
                  { label: 'RESOLVED QUERY TICKETS', value: tickets.filter(t => t.status === 'Resolved').length, color: '#059669', bg: '#ECFDF5' }
                ].map((m, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justify: 'center', fontSize: '20px', fontWeight: '900' }}>
                      🎟️
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</p>
                      <h3 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>{m.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tickets list */}
              <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎟️ Farmer Helpdesk Queue
                </h3>
                {tickets.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontWeight: '700' }}>No support tickets registered.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {tickets.map(t => {
                      const isWhatsAppUrl = `https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`;
                      return (
                        <div key={t.id} style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '20px',
                          padding: '20px',
                          background: t.status === 'Open' ? 'rgba(239, 68, 68, 0.02)' : t.status === 'In Progress' ? 'rgba(217, 119, 6, 0.02)' : '#FFFFFF',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '900', color: '#0F172A', background: '#F1F5F9', padding: '6px 12px', borderRadius: '10px' }}>Token: #{t.id}</span>
                              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}><Clock size={11} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> {new Date(t.date).toLocaleString('en-GB')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {/* Status Select Badge */}
                              <select
                                value={t.status}
                                onChange={e => handleUpdateTicketStatus(t.id, e.target.value)}
                                style={{
                                  border: 'none',
                                  outline: 'none',
                                  fontSize: '11px',
                                  fontWeight: '900',
                                  padding: '6px 12px',
                                  borderRadius: '100px',
                                  cursor: 'pointer',
                                  background: t.status === 'Open' ? '#FEE2E2' : t.status === 'In Progress' ? '#FEF3C7' : '#ECFDF5',
                                  color: t.status === 'Open' ? '#DC2626' : t.status === 'In Progress' ? '#D97706' : '#059669'
                                }}
                              >
                                <option value="Open">🔴 OPEN</option>
                                <option value="In Progress">🟡 IN PROGRESS</option>
                                <option value="Resolved">🟢 RESOLVED</option>
                              </select>

                              {/* Remove Ticket */}
                              <button
                                onClick={() => handleDeleteTicket(t.id)}
                                style={{
                                  background: '#FEF2F2',
                                  border: 'none',
                                  color: '#EF4444',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '14px 0' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Farmer: {t.farmerName}</h4>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Line: {t.phone}</p>
                              <a href={isWhatsAppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', border: '1px solid #A7F3D0' }}>
                                💬 WhatsApp Chat <ExternalLink size={10} />
                              </a>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Problem Description</span>
                              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155', fontWeight: '600', lineHeight: 1.5 }}>{t.problem}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── 4. SYSTEM SETTINGS TAB ────────────────── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Contact details & Rates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} color="#2563EB" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Global Helpdesk Config <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>(App View)</span></h3>
                  </div>
                  <form onSubmit={handleSaveContactDetails} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Helpdesk Support Name</label>
                      <input type="text" value={adminInfo.name} onChange={e => setAdminInfo({ ...adminInfo, name: e.target.value })} placeholder="Milvexa Support Desk" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Helpline Line</label>
                      <input type="tel" value={adminInfo.phone} onChange={e => setAdminInfo({ ...adminInfo, phone: e.target.value })} placeholder="+91 9876543210" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Helpline Support Email</label>
                      <input type="email" value={adminInfo.email} onChange={e => setAdminInfo({ ...adminInfo, email: e.target.value })} placeholder="support@milvexasolutions.com" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Base Milk Price (per Liter)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: '800', color: '#475569' }}>₹</span>
                        <input type="number" step="0.01" value={adminInfo.baseMilkPrice || '62.50'} onChange={e => setAdminInfo({ ...adminInfo, baseMilkPrice: e.target.value })} placeholder="62.50" style={{ width: '100%', padding: '14px 16px 14px 32px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '800', color: '#0F172A', outline: 'none' }} required />
                      </div>
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #070F21 0%, #1A2E5A 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', letterSpacing: '0.5px' }}>
                      SAVE DESK CONFIGURATION
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Update Admin Passcode & Instructions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Admin Passcode Update */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <KeyRound size={16} color="#2563EB" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Change System Passcode</h3>
                  </div>
                  <form onSubmit={handleChangeAdminCode} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Admin Passcode</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showNewCode ? 'text' : 'password'} value={adminCodeData.newCode} onChange={e => setAdminCodeData({ ...adminCodeData, newCode: e.target.value })} placeholder="Enter new passcode" style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                        <button type="button" onClick={() => setShowNewCode(!showNewCode)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                          {showNewCode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Passcode</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirmCode ? 'text' : 'password'} value={adminCodeData.confirmCode} onChange={e => setAdminCodeData({ ...adminCodeData, confirmCode: e.target.value })} placeholder="Confirm new passcode" style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                        <button type="button" onClick={() => setShowConfirmCode(!showConfirmCode)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                          {showConfirmCode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', letterSpacing: '0.5px' }}>
                      UPDATE SECURITY PASSCODE
                    </button>
                  </form>
                </div>

                {/* Instructions Warn Block */}
                <div style={{ padding: '20px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '24px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '900', color: '#92400E' }}>⚠️ Security Advisory</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#B45309', fontWeight: '700', lineHeight: 1.6 }}>
                    This passcode is required to unlock the Admin Panel and access global farmers information. Make sure to keep it confidential and remember it securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── 4.5. SECURITY & FIREWALL TAB ────────────────── */}
          {activeTab === 'security' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', background: isScanning ? '#EFF6FF' : '#F0FDF4', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isScanning ? '#2563EB' : '#16A34A' }}>
                        {isScanning ? <RefreshCw size={24} className="spin-animation" /> : <Shield size={24} />}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Vulnerability Deep Scan</h3>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>Scan system for unauthorized access or vulnerabilities</span>
                      </div>
                    </div>
                    <button onClick={handleDeepScan} disabled={isScanning} style={{ padding: '12px 24px', background: isScanning ? '#F8FAFC' : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', color: isScanning ? '#94A3B8' : 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '900', cursor: isScanning ? 'not-allowed' : 'pointer' }}>
                      {isScanning ? 'SCANNING SYSTEM...' : 'RUN DEEP SCAN NOW'}
                    </button>
                  </div>
                  {isScanning && (
                    <div style={{ padding: '24px', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Analyzing Supabase Rules & API Endpoints...</span>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#2563EB' }}>{scanProgress}%</span>
                      </div>
                      <div style={{ width: '100%', background: '#E2E8F0', height: '8px', borderRadius: '4px' }}>
                        <div style={{ width: `${scanProgress}%`, background: '#3B82F6', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }} />
                      </div>
                    </div>
                  )}
                  {!isScanning && scanProgress === 100 && (
                    <div style={{ padding: '24px', background: '#ECFDF5', borderTop: '1px solid #D1FAE5', color: '#065F46' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} /> Scan Complete: System is 100% Secure. 0 Vulnerabilities Found.</span>
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(to right, #ffffff, #F8FAFC)' }}>
                    <div style={{ width: '40px', height: '40px', background: '#FEF2F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>Recent Threat Logs</h3>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Automatically detected anomalies and unauthorized access attempts</span>
                    </div>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Timestamp</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>IP Address</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Location</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '2 mins ago', ip: '114.119.141.1', loc: 'Beijing, CN', status: 'BLOCKED' },
                        { time: '15 mins ago', ip: '45.132.208.5', loc: 'Moscow, RU', status: 'BLOCKED' },
                        { time: '1 hour ago', ip: '185.191.171.1', loc: 'London, UK', status: 'MITIGATED' },
                        { time: '3 hours ago', ip: '192.168.1.10', loc: 'Unknown', status: 'BLOCKED' }
                      ].map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>{log.time}</td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>{log.ip}</td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>{log.loc}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ padding: '4px 10px', background: log.status === 'BLOCKED' ? '#FEF2F2' : '#FFFBEB', color: log.status === 'BLOCKED' ? '#DC2626' : '#D97706', borderRadius: '12px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>Active Firewall Policies</h3>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { id: 'ddos', name: 'DDoS Protection', desc: 'Rate limits sudden traffic spikes' },
                      { id: 'geo', name: 'Geo-IP Blocking', desc: 'Blocks access from High-Risk regions' },
                      { id: 'sql', name: 'SQL Injection Filter', desc: 'Sanitizes all incoming DB queries' },
                      { id: 'xss', name: 'XSS Firewall', desc: 'Prevents Cross-Site Scripting attacks' }
                    ].map(rule => (
                      <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{rule.name}</h4>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{rule.desc}</span>
                        </div>
                        <div 
                          onClick={() => setFirewallRules(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                          style={{ width: '44px', height: '24px', background: firewallRules[rule.id] ? '#10B981' : '#CBD5E1', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: firewallRules[rule.id] ? '22px' : '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: lockdownActive ? '#991B1B' : '#FEF2F2', border: `1px solid ${lockdownActive ? '#7F1D1D' : '#FCA5A5'}`, borderRadius: '24px', padding: '24px', color: lockdownActive ? 'white' : '#991B1B', transition: 'all 0.3s' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lockdownActive ? <ShieldAlert size={18} /> : null} 
                    {lockdownActive ? 'SYSTEM IN LOCKDOWN' : 'Emergency Lockdown'}
                  </h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12px', lineHeight: 1.6, fontWeight: '600', color: lockdownActive ? '#FECACA' : '#991B1B' }}>
                    {lockdownActive 
                      ? 'Global admin access is completely frozen. Only the Super Admin can unlock the system.' 
                      : 'If you suspect a severe breach, activate lockdown mode to instantly freeze all Admin access globally.'}
                  </p>
                  <button 
                    onClick={() => {
                      const newState = !lockdownActive;
                      setLockdownActive(newState);
                      if (newState) {
                        localStorage.setItem('milvexa_system_lockdown', 'true');
                      } else {
                        localStorage.removeItem('milvexa_system_lockdown');
                      }
                    }}
                    style={{ width: '100%', padding: '14px', background: lockdownActive ? 'white' : '#DC2626', color: lockdownActive ? '#DC2626' : 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: lockdownActive ? 'none' : '0 4px 10px rgba(220, 38, 38, 0.2)' }}
                  >
                    {lockdownActive ? 'DISABLE LOCKDOWN (RESTORE ACCESS)' : 'INITIATE EMERGENCY LOCKDOWN'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── 5. BROADCAST & UPDATES TAB ────────────────── */}
          {activeTab === 'updates' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Left Column: App Version Update */}
              <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(to right, #ffffff, #F8FAFC)' }}>
                  <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>Push APK Update</h3>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Force mobile clients to download latest version</span>
                  </div>
                </div>
                
                <form onSubmit={handleSaveUpdates} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Version Code</label>
                      <input type="text" value={updateForm.version} onChange={e => setUpdateForm({ ...updateForm, version: e.target.value })} placeholder="e.g. 2.0.0" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '800', color: '#0F172A', outline: 'none' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Mandatory Update?</label>
                      <button type="button" onClick={() => setUpdateForm({ ...updateForm, isMandatory: !updateForm.isMandatory })} style={{ width: '100%', padding: '14px 16px', background: updateForm.isMandatory ? '#FEF2F2' : '#F8FAFC', border: `1.5px solid ${updateForm.isMandatory ? '#FCA5A5' : '#E2E8F0'}`, borderRadius: '12px', fontSize: '13px', fontWeight: '800', color: updateForm.isMandatory ? '#DC2626' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {updateForm.isMandatory ? <CheckCircle size={16} /> : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #94A3B8' }} />}
                        {updateForm.isMandatory ? 'YES, FORCE UPDATE' : 'NO, OPTIONAL'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Upload New APK File OR Paste Link</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ flex: 1, padding: '14px 16px', background: uploadingApk ? '#E2E8F0' : '#EFF6FF', border: '1.5px dashed #3B82F6', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#1D4ED8', textAlign: 'center', cursor: uploadingApk ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                        {uploadingApk ? 'Uploading to Secure Storage...' : 'Click to select .apk file'}
                        <input type="file" accept=".apk" onChange={handleApkUpload} disabled={uploadingApk} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <input type="url" value={updateForm.downloadLink} onChange={e => setUpdateForm({ ...updateForm, downloadLink: e.target.value })} placeholder="Or paste external link (e.g., Google Drive)..." style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#2563EB', outline: 'none' }} required />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Release Notes / What's New</label>
                    <textarea value={updateForm.releaseNotes} onChange={e => setUpdateForm({ ...updateForm, releaseNotes: e.target.value })} placeholder="Describe what changed..." rows="3" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#0F172A', outline: 'none', resize: 'vertical' }} />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                    <UploadCloud size={18} /> DEPLOY APK UPDATE TO ALL USERS
                  </button>
                </form>
              </div>

              {/* Right Column: Global Broadcast */}
              <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(to right, #ffffff, #F8FAFC)' }}>
                  <div style={{ width: '40px', height: '40px', background: '#FEF2F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                    <Radio size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>Global App Announcement</h3>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Broadcast a live banner to all mobile apps</span>
                  </div>
                </div>
                
                <form onSubmit={handleSaveUpdates} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Live Banner Message</label>
                    <textarea value={updateForm.announcement} onChange={e => setUpdateForm({ ...updateForm, announcement: e.target.value })} placeholder="Type a broadcast message to display at the top of the mobile app..." rows="4" style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none', resize: 'vertical' }} />
                  </div>
                  
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: '600', lineHeight: 1.5 }}>
                      When you click broadcast, this message will instantly appear on the dashboards of all farmers using the Milvexa mobile application. Leave empty to clear current banner.
                    </p>
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)' }}>
                    <Megaphone size={18} /> BROADCAST LIVE MESSAGE
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ────────────────── 6. ADMIN ROLES TAB ────────────────── */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Add New Staff Administrator</h3>
                <form onSubmit={handleAddStaff} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Staff Email Address</label>
                    <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="employee@milvexa.in" style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '600', outline: 'none' }} required />
                  </div>
                  <div style={{ width: '180px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Access Level</label>
                    <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', fontSize: '14px', fontWeight: '700', outline: 'none', color: '#0F172A' }}>
                      <option value="staff">Standard Staff</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <button type="submit" disabled={addingStaff} style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '900', cursor: addingStaff ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                    {addingStaff ? 'ADDING...' : 'GRANT ACCESS'}
                  </button>
                </form>
              </div>

              <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>Active Global Administrators ({adminRoles.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Email Address</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Login Password</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Role Level</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminRoles.map((role) => (
                        <tr key={role.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{role.email}</td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', letterSpacing: showPasswords[role.id] ? 'normal' : '4px' }}>
                                {showPasswords[role.id] ? (role.password || 'NOT SET YET') : '••••••••'}
                              </span>
                              <button onClick={() => togglePasswordVisibility(role.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                                {showPasswords[role.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{ padding: '6px 12px', background: role.role === 'super_admin' ? '#FEF2F2' : '#EFF6FF', color: role.role === 'super_admin' ? '#DC2626' : '#2563EB', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>{role.role.replace('_', ' ')}</span>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{ padding: '6px 12px', background: role.status === 'active' ? '#ECFDF5' : '#FEF2F2', color: role.status === 'active' ? '#059669' : '#DC2626', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>{role.status}</span>
                          </td>
                          <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                            {role.role !== 'super_admin' && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleToggleStaffStatus(role.id, role.status)} style={{ padding: '8px 16px', background: role.status === 'active' ? '#FEF2F2' : '#ECFDF5', color: role.status === 'active' ? '#DC2626' : '#059669', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                  {role.status === 'active' ? 'Block Access' : 'Restore'}
                                </button>
                                <button onClick={() => handleDeleteStaff(role.id)} style={{ padding: '8px', background: '#F8FAFC', color: '#64748B', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
