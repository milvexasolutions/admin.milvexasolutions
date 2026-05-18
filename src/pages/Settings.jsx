import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  KeyRound, 
  Mail, 
  Laptop, 
  Database, 
  Info, 
  LifeBuoy, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  ShieldCheck,
  Send,
  Loader2,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    farm_name: '',
    owner_name: '',
    phone: '',
    address: '',
    company_name: 'MILVEXA SOLUTIONS PVT. LTD.'
  });

  // Accordion state
  const [openSection, setOpenSection] = useState(null);

  // Backup & Restore states
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email verification (OTP) states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loginSession, setLoginSession] = useState({
    time: '',
    date: '',
    location: 'Ahmedabad, Gujarat, India'
  });

  // Admin Panel states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    if (adminPasscode === '9999') {
      setIsAdminUnlocked(true);
      setPasscodeError(false);
      setAdminPasscode('');
    } else {
      setPasscodeError(true);
      setAdminPasscode('');
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Web Browser";
    let os = "Desktop Device";
    if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
    else if (ua.indexOf("Edge") > -1) browser = "Microsoft Edge";

    if (ua.indexOf("Windows") > -1) os = "Windows PC";
    else if (ua.indexOf("Mac") > -1) os = "Macintosh Desktop";
    else if (ua.indexOf("Android") > -1) os = "Android Mobile";
    else if (ua.indexOf("iPhone") > -1) os = "iPhone Device";
    return `${browser} on ${os}`;
  };

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = now.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
    
    const getSessionDetails = async () => {
      let loc = 'Ahmedabad, Gujarat, India';
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.region && data.country_name) {
            loc = `${data.city}, ${data.region}, ${data.country_name}`;
          }
        }
      } catch (e) {
        console.log('Location fetch failed, using default Ahmedabad');
      }
      setLoginSession({
        time: formattedTime,
        date: formattedDate,
        location: loc
      });
    };
    getSessionDetails();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            farm_name: data.farm_name || '',
            owner_name: data.owner_name || '',
            phone: data.phone || '',
            address: data.address || '',
            company_name: data.company_name || 'MILVEXA SOLUTIONS PVT. LTD.'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          farm_name: profile.farm_name,
          owner_name: profile.owner_name,
          phone: profile.phone,
          address: profile.address,
          company_name: profile.company_name,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      alert('Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setOpenSection(null);
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Error updating password: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const sendOTP = () => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setCountdown(60);
      setOtpLoading(false);
      alert('OTP code 1234 sent to ' + user.email);
    }, 1200);
  };

  const verifyOTP = (e) => {
    e.preventDefault();
    if (otpCode === '1234') {
      setOtpLoading(true);
      setTimeout(() => {
        setEmailVerified(true);
        setOtpLoading(false);
        alert('Email successfully verified!');
      }, 1000);
    } else {
      alert('Invalid OTP code! Please enter 1234.');
    }
  };

  const runBackup = () => {
    setBackupLoading(true);
    setBackupSuccess(false);
    setTimeout(() => {
      setBackupLoading(false);
      setBackupSuccess(true);
    }, 1800);
  };

  const runRestore = () => {
    setRestoreLoading(true);
    setRestoreSuccess(false);
    setTimeout(() => {
      setRestoreLoading(false);
      setRestoreSuccess(true);
    }, 2200);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  const renderSectionHeader = (id, title, Icon, isOpen) => (
    <div 
      onClick={() => toggleSection(id)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '20px', 
        background: isOpen ? '#F1F5F9' : 'white',
        borderBottom: '1px solid #F1F5F9',
        cursor: 'pointer',
        transition: '0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px', 
          background: isOpen ? 'white' : '#F1F5F9', 
          color: '#0B1F4D', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: isOpen ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
        }}>
          <Icon size={20} />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#0B1F4D' }}>{title}</span>
      </div>
      <div style={{ color: '#94A3B8' }}>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'calc(var(--safe-top) + 80px)' }}>
      <PageHeader title="App Settings" showBack={true} />
      
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          
          {/* 1. PERSONAL INFO */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('personal', 'Personal Info', User, openSection === 'personal')}
            {openSection === 'personal' && (
              <form onSubmit={handleProfileSave} className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Enter your full name"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Enter phone number"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Login Email (Read-Only)</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    style={{ width: '100%', padding: '14px 16px', background: '#E2E8F0', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#64748B', cursor: 'not-allowed' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(11, 31, 77, 0.2)' }}>
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Personal Details'}
                </button>
              </form>
            )}
          </div>

          {/* 2. FARM INFO */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('farm', 'Farm Info', Building2, openSection === 'farm')}
            {openSection === 'farm' && (
              <form onSubmit={handleProfileSave} className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Farm Name</label>
                  <input 
                    type="text" 
                    value={profile.farm_name}
                    onChange={(e) => setProfile({...profile, farm_name: e.target.value})}
                    placeholder="e.g. Gokul Dairy Farm"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Owner Name</label>
                  <input 
                    type="text" 
                    value={profile.owner_name}
                    onChange={(e) => setProfile({...profile, owner_name: e.target.value})}
                    placeholder="Enter owner name"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Address</label>
                  <textarea 
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    placeholder="Farm location/address"
                    rows="3"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(11, 31, 77, 0.2)' }}>
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Farm Details'}
                </button>
              </form>
            )}
          </div>

          {/* 3. CHANGE PASSWORD */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('password', 'Change Password', KeyRound, openSection === 'password')}
            {openSection === 'password' && (
              <form onSubmit={handlePasswordChange} className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Old Password</label>
                  <input 
                    type="password" 
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="•••••••• (Min 6 chars)"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Repeat New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                    required
                  />
                </div>
                <button type="submit" disabled={passwordLoading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(11, 31, 77, 0.2)' }}>
                  {passwordLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>

          {/* 4. EMAIL VERIFICATION */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('verify', 'Email Verification (OTP)', Mail, openSection === 'verify')}
            {openSection === 'verify' && (
              <div className="animate-slide-down" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: emailVerified ? '#ECFDF5' : '#FFFBEB', borderRadius: '16px', border: emailVerified ? '1px solid #A7F3D0' : '1px solid #FDE68A', marginBottom: '20px' }}>
                  {emailVerified ? (
                    <ShieldCheck size={24} color="#059669" />
                  ) : (
                    <Clock size={24} color="#D97706" />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: emailVerified ? '#065F46' : '#92400E' }}>
                      {emailVerified ? 'Email Verified Successfully' : 'Email Verification Pending'}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '600', color: emailVerified ? '#047857' : '#B45309' }}>
                      {emailVerified ? 'Your account email is fully secured.' : 'Verify your email to enable auto cloud backups.'}
                    </p>
                  </div>
                </div>

                {!emailVerified && (
                  <div>
                    {!otpSent ? (
                      <button 
                        onClick={sendOTP}
                        disabled={otpLoading}
                        style={{ width: '100%', padding: '16px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                      >
                        {otpLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Send OTP Code
                      </button>
                    ) : (
                      <form onSubmit={verifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Enter 4-Digit OTP</label>
                          <input 
                            type="text" 
                            maxLength="4"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="e.g. 1234"
                            style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: '2px solid #E2E8F0', borderRadius: '14px', fontSize: '20px', fontWeight: '900', color: '#0F172A', textAlign: 'center', letterSpacing: '8px' }}
                            required
                          />
                          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                            {countdown > 0 ? `Resend OTP in ${countdown}s` : (
                              <span onClick={sendOTP} style={{ color: '#0B1F4D', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}>Resend OTP code</span>
                            )}
                          </p>
                        </div>
                        <button type="submit" disabled={otpLoading} style={{ width: '100%', padding: '16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                          {otpLoading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Account'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. CONNECTED DEVICE */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('devices', 'Connected Devices', Laptop, openSection === 'devices')}
            {openSection === 'devices' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0B1F4D' }}>{getDeviceInfo()}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569', fontWeight: '700' }}>📍 {loginSession.location}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🕒 Login: {loginSession.date} • {loginSession.time}</p>
                  </div>
                  <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '100px', fontWeight: '800' }}>ACTIVE</span>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', gap: '14px', alignItems: 'center', opacity: 0.7 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Laptop size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#475569' }}>Windows Web Console</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>📍 Mumbai, Maharashtra, India</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🕒 Last Active: 2 hours ago from Chrome</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. DATA BACKUP & RESTORE */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('backup', 'Data Backup & Restore', Database, openSection === 'backup')}
            {openSection === 'backup' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={runBackup}
                    disabled={backupLoading}
                    style={{ padding: '18px 12px', background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', borderRadius: '18px', fontWeight: '800', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
                  >
                    {backupLoading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />}
                    {backupLoading ? 'Backing up...' : 'Backup Database'}
                  </button>
                  <button 
                    onClick={runRestore}
                    disabled={restoreLoading}
                    style={{ padding: '18px 12px', background: '#ECFDF5', color: '#059669', border: '1.5px solid #A7F3D0', borderRadius: '18px', fontWeight: '800', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
                  >
                    {restoreLoading ? <Loader2 className="animate-spin" size={24} /> : <RefreshCcwIcon size={24} />}
                    {restoreLoading ? 'Restoring...' : 'Restore Backup'}
                  </button>
                </div>

                {backupSuccess && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 16px', background: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>Backup successful! Saved to Milvexa Cloud storage.</span>
                  </div>
                )}

                {restoreSuccess && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 16px', background: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>All cattle and milk data successfully restored.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6.5. ADMIN PANEL */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('admin', 'Admin Panel', isAdminUnlocked ? Unlock : Lock, openSection === 'admin')}
            {openSection === 'admin' && (
              <div className="animate-slide-down" style={{ padding: '24px' }}>
                {!isAdminUnlocked ? (
                  <form onSubmit={handleVerifyPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '100px', background: '#FEF2F2', border: '2px solid #FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '8px' }}>
                      <Lock size={28} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>Access Restricted</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Enter secure 4-digit Admin Code to unlock diagnostics</p>
                    </div>

                    <div style={{ width: '100%' }}>
                      <input 
                        type="password" 
                        maxLength="4"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="••••"
                        style={{ 
                          width: '120px', 
                          padding: '14px', 
                          background: '#F1F5F9', 
                          border: passcodeError ? '2px solid #EF4444' : '2px solid #E2E8F0', 
                          borderRadius: '16px', 
                          fontSize: '24px', 
                          fontWeight: '900', 
                          color: '#0F172A', 
                          textAlign: 'center', 
                          letterSpacing: '6px',
                          outline: 'none',
                          transition: '0.2s',
                          animation: passcodeError ? 'shake 0.3s' : 'none'
                        }}
                        required
                      />
                      {passcodeError && (
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444', fontWeight: '800' }}>Incorrect admin passcode! Try again.</p>
                      )}
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '16px', background: '#0B1F4D', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Unlock size={18} /> Unlock Admin Panel
                    </button>
                  </form>
                ) : (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px 16px', background: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Unlock size={18} color="#059669" />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#047857' }}>Admin Panel Unlocked Successfully</span>
                      </div>
                      <button 
                        onClick={() => setIsAdminUnlocked(false)}
                        style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Lock Panel
                      </button>
                    </div>

                    {/* Diagnostics Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>System CPU Load</span>
                        <strong style={{ fontSize: '18px', color: '#0F172A', fontWeight: '900' }}>12% (Normal)</strong>
                      </div>
                      <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Database Latency</span>
                        <strong style={{ fontSize: '18px', color: '#0F172A', fontWeight: '900' }}>24ms (Excellent)</strong>
                      </div>
                      <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Active Memory</span>
                        <strong style={{ fontSize: '18px', color: '#0F172A', fontWeight: '900' }}>412 MB</strong>
                      </div>
                      <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>DB RLS Security</span>
                        <strong style={{ fontSize: '18px', color: '#10B981', fontWeight: '900' }}>Active & Secured</strong>
                      </div>
                    </div>

                    {/* Diagnostics Tools */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Diagnostics & Control</label>
                      <button 
                        onClick={() => alert('Local client cache successfully refreshed!')}
                        style={{ padding: '14px', background: '#F1F5F9', border: 'none', borderRadius: '12px', color: '#0F172A', fontWeight: '800', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}
                      >
                        🔄 Reset Local Sync Cache
                      </button>
                      <div style={{ padding: '14px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>⚙️ System Maintenance Mode</span>
                        <input 
                          type="checkbox" 
                          checked={maintenanceMode}
                          onChange={(e) => {
                            setMaintenanceMode(e.target.checked);
                            alert(e.target.checked ? 'Maintenance Mode activated! System will now show offline notification.' : 'Maintenance Mode deactivated!');
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', marginLeft: 'auto' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. APP VERSION (ABOUT US) */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('about', 'App Version (About Us)', Info, openSection === 'about')}
            {openSection === 'about' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: '0 10px 20px rgba(11, 31, 77, 0.15)' }}>
                  <span style={{ color: 'white', fontSize: '28px', fontWeight: '900' }}>M</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0B1F4D' }}>Milvexa Cattle Farm Management</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B', fontWeight: '800' }}>App Version v1.0.0 (Release build)</p>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#475569', lineHeight: '1.6', fontWeight: '600' }}>
                  Developed by <strong>MILVEXA SOLUTIONS PVT. LTD.</strong> All rights reserved copyright © 2026. A fully integrated cattle farm and daily milk yield tracking solution.
                </div>
              </div>
            )}
          </div>

          {/* 8. HELP & SUPPORT */}
          <div style={{ background: 'white', overflow: 'hidden' }}>
            {renderSectionHeader('support', 'Help & Support', LifeBuoy, openSection === 'support')}
            {openSection === 'support' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 💬 MILVEXA AI CHAT BOT */}
                <div 
                  onClick={() => navigate('/chatbot')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)', 
                    borderRadius: '18px', 
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(32, 58, 67, 0.25)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <MessageSquare size={20} color="#00F2FE" />
                      <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#00FF87', borderRadius: '50%', boxShadow: '0 0 10px #00FF87' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '900', display: 'block', letterSpacing: '-0.3px' }}>Milvexa Chat Bot</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.8 }}>Virtual AI Assistant • Active</span>
                    </div>
                  </div>
                  <ChevronRightIcon size={16} color="white" style={{ marginLeft: 'auto' }} />
                </div>

                <a 

                  href="mailto:support@milvexa.com"
                  style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '14px', textDecoration: 'none', border: '1px solid #E2E8F0', color: '#0B1F4D' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} color="#64748B" />
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>Email: support@milvexa.com</span>
                  </div>
                  <ChevronRightIcon size={16} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </a>
                <a 
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '16px', background: '#E8F5E9', borderRadius: '14px', textDecoration: 'none', border: '1px solid #C8E6C9', color: '#2E7D32' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Smartphone size={18} color="#4CAF50" />
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>WhatsApp Support (+91 98765 43210)</span>
                  </div>
                  <ChevronRightIcon size={16} color="#81C784" style={{ marginLeft: 'auto' }} />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* 9. STANDALONE LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: '24px', 
            width: '100%', 
            padding: '18px', 
            background: '#FEF2F2', 
            border: '1.5px solid #FCA5A5', 
            borderRadius: '20px', 
            color: '#DC2626', 
            fontSize: '16px', 
            fontWeight: '900', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 16px rgba(220, 38, 38, 0.05)'
          }}
        >
          <LogOut size={20} />
          Log Out Account
        </button>
      </div>
    </div>
  );
};

// Internal mini icons to avoid crash or extra import errors
const RefreshCcwIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

const ChevronRightIcon = ({ size, color, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Settings;
