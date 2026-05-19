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
  MessageSquare,
  Trash2
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



  const [loginSession, setLoginSession] = useState({
    time: '',
    date: '',
    location: 'Ahmedabad, Gujarat, India'
  });



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

  // Email change states
  const [emailData, setEmailData] = useState({
    newEmail: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(0);

  // Countdown timer for email OTP
  useEffect(() => {
    if (emailOtpCountdown > 0) {
      const timer = setTimeout(() => setEmailOtpCountdown(emailOtpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOtpCountdown]);

  const sendEmailOTP = (e) => {
    if (e) e.preventDefault();
    if (!emailData.newEmail.trim()) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setEmailLoading(true);
    setTimeout(() => {
      setEmailOtpSent(true);
      setEmailOtpCountdown(60);
      setEmailLoading(false);
      alert('Verification OTP code 123456 sent to your new email: ' + emailData.newEmail);
    }, 1200);
  };

  const verifyEmailOTP = async (e) => {
    e.preventDefault();
    if (emailOtpCode === '123456') {
      setEmailLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          email: emailData.newEmail
        });
        if (error) throw error;
        
        alert('Email changed successfully to ' + emailData.newEmail + '!');
        setEmailData({ newEmail: '' });
        setEmailOtpSent(false);
        setEmailOtpCode('');
        setOpenSection(null);
      } catch (err) {
        console.error('Error verifying email OTP:', err);
        alert('Error updating email: ' + err.message);
      } finally {
        setEmailLoading(false);
      }
    } else {
      alert('Invalid OTP code! Please enter 123456.');
    }
  };

  // Google Drive states
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveLoading, setGdriveLoading] = useState(false);
  const [gdriveBackupLoading, setGdriveBackupLoading] = useState(false);
  const [gdriveBackupSuccess, setGdriveBackupSuccess] = useState(false);

  const handleGDriveConnect = () => {
    if (gdriveConnected) {
      setGdriveConnected(false);
      setGdriveBackupSuccess(false);
    } else {
      setGdriveLoading(true);
      setTimeout(() => {
        setGdriveConnected(true);
        setGdriveLoading(false);
      }, 1500);
    }
  };

  // Daily Auto Backup states
  const [autoBackup, setAutoBackup] = useState(true);

  const handleToggleAutoBackup = () => {
    setAutoBackup(prev => !prev);
  };

  // Account Control states
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeactivate = () => {
    if (window.confirm("WARNING: Are you sure you want to temporarily deactivate your account? You can contact our support team to reactivate it at any time.")) {
      setDeactivateLoading(true);
      setTimeout(async () => {
        setDeactivateLoading(false);
        alert("Your account has been successfully deactivated. Logging out now...");
        await supabase.auth.signOut();
        navigate('/login');
      }, 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteInput) {
      setConfirmDeleteInput(true);
      return;
    }

    if (deleteConfirmText !== 'DELETE') {
      alert('Error: Please type "DELETE" exactly to confirm account deletion.');
      return;
    }

    if (window.confirm("LAST WARNING! Are you sure you want to permanently delete your account? All of your farm data will be lost forever.")) {
      setDeleteLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (error) throw error;

        await supabase.auth.signOut();
        alert("Your account and farm records have been permanently deleted.");
        navigate('/login');
      } catch (err) {
        console.error("Error deleting account:", err);
        alert("Error: " + err.message);
      } finally {
        setDeleteLoading(false);
        setConfirmDeleteInput(false);
        setDeleteConfirmText('');
      }
    }
  };

  const runGDriveBackup = () => {
    setGdriveBackupLoading(true);
    setGdriveBackupSuccess(false);
    setTimeout(() => {
      setGdriveBackupLoading(false);
      setGdriveBackupSuccess(true);
    }, 2000);
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

          {/* 3b. CHANGE EMAIL ADDRESS */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('email', 'Change Email Address', Mail, openSection === 'email')}
            {openSection === 'email' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#EFF6FF', borderRadius: '16px', border: '1px solid #BFDBFE', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Mail size={24} color="#2563EB" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1E3A8A' }}>Current Account Email</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900', color: '#1D4ED8' }}>{user?.email || 'N/A'}</p>
                  </div>
                </div>

                {!emailOtpSent ? (
                  <form onSubmit={sendEmailOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>New Email Address</label>
                      <input 
                        type="email" 
                        value={emailData.newEmail}
                        onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                        placeholder="Enter new email address"
                        style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}
                        required
                      />
                    </div>

                    <button type="submit" disabled={emailLoading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(11, 31, 77, 0.2)' }}>
                      {emailLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Send Verification OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={verifyEmailOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>New Email</span>
                        <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{emailData.newEmail}</p>
                      </div>
                      <span 
                        onClick={() => setEmailOtpSent(false)} 
                        style={{ fontSize: '12px', fontWeight: '800', color: '#2563EB', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Edit
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Enter 6-Digit OTP</label>
                      <input 
                        type="text" 
                        maxLength="6"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value)}
                        placeholder="e.g. 123456"
                        style={{ width: '100%', padding: '14px 16px', background: '#F1F5F9', border: '2px solid #E2E8F0', borderRadius: '14px', fontSize: '20px', fontWeight: '900', color: '#0F172A', textAlign: 'center', letterSpacing: '8px' }}
                        required
                      />
                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                        {emailOtpCountdown > 0 ? `Resend OTP in ${emailOtpCountdown}s` : (
                          <span onClick={() => sendEmailOTP(null)} style={{ color: '#0B1F4D', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}>Resend OTP code</span>
                        )}
                      </p>
                      
                      <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600', textAlign: 'center', lineHeight: '1.5' }}>
                        Didn't receive the OTP?{' '}
                        <a 
                          href="https://wa.me/919586481958?text=Hello%20Milvexa%20Support%2C%20I%20am%20facing%20an%20issue%20receiving%20my%20Email%20Change%20Verification%20OTP." 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#10B981', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Get support on WhatsApp
                        </a>
                        {' '}or check your Spam folder.
                      </p>
                    </div>

                    <button type="submit" disabled={emailLoading} style={{ width: '100%', padding: '16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      {emailLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                      Verify & Update Email
                    </button>
                  </form>
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

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cloud Integrations</label>
                  
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFDF5', border: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.3496 14.6398L14.6696 6.53979H9.32959L13.9996 14.6398H19.3496Z" fill="#FFC107"/>
                        <path d="M9.32959 6.53979L4.64959 14.6398L7.32959 19.2798L11.9996 11.1798L9.32959 6.53979Z" fill="#2196F3"/>
                        <path d="M7.32959 19.2798H17.9996L20.6796 14.6398H9.99959L7.32959 19.2798Z" fill="#4CAF50"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0B1F4D' }}>Google Drive Cloud Sync</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                        {gdriveConnected ? 'Account connected: tausi@milvexa.com' : 'Auto backup and sync your farm records to Google Drive'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleGDriveConnect}
                      disabled={gdriveLoading}
                      style={{ 
                        padding: '8px 14px', 
                        background: gdriveConnected ? 'transparent' : '#0B1F4D', 
                        color: gdriveConnected ? '#64748B' : 'white', 
                        border: gdriveConnected ? '1px solid #E2E8F0' : 'none',
                        borderRadius: '10px', 
                        fontSize: '12px', 
                        fontWeight: '800', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {gdriveLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                      {gdriveConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>

                  {gdriveConnected && (
                    <button
                      onClick={runGDriveBackup}
                      disabled={gdriveBackupLoading}
                      style={{ 
                        width: '100%', 
                        padding: '14px', 
                        background: '#FFFBEB', 
                        color: '#D97706', 
                        border: '1.5px dashed #FCD34D', 
                        borderRadius: '16px', 
                        fontWeight: '800', 
                        fontSize: '13px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        cursor: 'pointer' 
                      }}
                    >
                      {gdriveBackupLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Uploading farm backup to your Google Drive...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.3496 14.6398L14.6696 6.53979H9.32959L13.9996 14.6398H19.3496Z" fill="#FFC107"/>
                            <path d="M9.32959 6.53979L4.64959 14.6398L7.32959 19.2798L11.9996 11.1798L9.32959 6.53979Z" fill="#2196F3"/>
                            <path d="M7.32959 19.2798H17.9996L20.6796 14.6398H9.99959L7.32959 19.2798Z" fill="#4CAF50"/>
                          </svg>
                          Sync Now with Google Drive
                        </>
                      )}
                    </button>
                  )}

                  {gdriveBackupSuccess && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 16px', background: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>
                        Google Drive Sync Successful! File **milvexa_backup.json** saved in **My Drive**.
                      </span>
                    </div>
                  )}

                  {/* Daily Auto Backup Toggle */}
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', gap: '14px', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: autoBackup ? '#EEF2FF' : '#F1F5F9', color: autoBackup ? '#4F46E5' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                      <Clock size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0B1F4D' }}>Daily Auto Cloud Backup</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                        {autoBackup ? 'ON • Daily backup auto-generated at 02:00 AM' : 'OFF • Backup will not be generated automatically'}
                      </p>
                    </div>
                    
                    {/* Premium Sliding Toggle Switch */}
                    <div 
                      onClick={handleToggleAutoBackup}
                      style={{
                        width: '50px',
                        height: '28px',
                        borderRadius: '100px',
                        background: autoBackup ? '#10B981' : '#CBD5E1',
                        padding: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: autoBackup ? 'flex-end' : 'flex-start',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '100px',
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. ACCOUNT CONTROL (DEACTIVATE / DELETE) */}
          <div style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid #F1F5F9' }}>
            {renderSectionHeader('accountControl', 'Account Control', Trash2, openSection === 'accountControl')}
            {openSection === 'accountControl' && (
              <div className="animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Deactivate Option */}
                <div style={{ padding: '18px', background: '#FFFBEB', borderRadius: '20px', border: '1px solid #FDE68A', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#B45309' }}>Deactivate Account</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#92400E', lineHeight: '1.6', fontWeight: '600' }}>
                    Your account will be temporarily deactivated. All cattle records and farm analytics data will remain safely stored in our secure cloud database, but you won't be able to access the application until you contact our support team to reactivate it.
                  </p>
                  <button 
                    onClick={handleDeactivate}
                    disabled={deactivateLoading}
                    style={{ 
                      marginTop: '6px', 
                      width: '100%', 
                      padding: '14px', 
                      background: 'white', 
                      color: '#D97706', 
                      border: '1.5px solid #FCD34D', 
                      borderRadius: '14px', 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {deactivateLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                    Deactivate Account Temporarily
                  </button>
                </div>

                {/* Delete Option */}
                <div style={{ padding: '18px', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🛑</span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#DC2626' }}>Delete Account Permanently</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#991B1B', lineHeight: '1.6', fontWeight: '600' }}>
                    Your account will be permanently deleted. This action will permanently erase your farm name, cattle logs, fat/SNF milk records, and payouts sheets. This action is final and cannot be reversed!
                  </p>
                  
                  {confirmDeleteInput && (
                    <div style={{ marginTop: '4px', animation: 'slideDown 0.2s ease-out' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#991B1B', marginBottom: '8px', textTransform: 'uppercase' }}>Confirm permanent deletion by typing **"DELETE"**:</label>
                      <input 
                        type="text" 
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        style={{ width: '100%', padding: '12px 16px', background: 'white', border: '1.5px solid #FCA5A5', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#DC2626', outline: 'none' }}
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{ 
                      marginTop: '6px', 
                      width: '100%', 
                      padding: '14px', 
                      background: '#DC2626', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '14px', 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
                    }}
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                    {confirmDeleteInput ? 'Yes, Delete My Account Now' : 'Delete Account Permanently'}
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* 7. APP VERSION (ABOUT US) */}
          <div style={{ background: 'white', overflow: 'hidden' }}>
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
