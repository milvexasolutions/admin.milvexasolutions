import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Shield, Users, Settings, Mail, Phone, KeyRound,
  LogOut, Save, Eye, EyeOff, User, RefreshCw,
  CheckCircle, XCircle, Lock, ChevronRight, ChevronDown,
  Copy, BarChart2
} from 'lucide-react';

const ADMIN_CODE_KEY = 'milvexa_admin_code';
const ADMIN_INFO_KEY = 'milvexa_admin_info';

const getAdminCode = () => localStorage.getItem(ADMIN_CODE_KEY) || 'milvexa786';
const getAdminInfo = () => {
  try { return JSON.parse(localStorage.getItem(ADMIN_INFO_KEY)) || { name: 'Support Team', phone: '+91 9624745944', email: 'kishansevaofficial@gmail.com' }; }
  catch { return { name: 'Support Team', phone: '+91 9624745944', email: 'kishansevaofficial@gmail.com' }; }
};

const NB = '#0A1F5C'; // navy blue primary
const NB2 = '#0D2878'; // navy blue secondary
const NB_LIGHT = '#EEF2FF'; // light navy bg

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');

  const [adminInfo, setAdminInfo] = useState(getAdminInfo());
  const [adminCodeData, setAdminCodeData] = useState({ newCode: '', confirmCode: '' });
  const [showNewCode, setShowNewCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSaveAdminInfo = (e) => {
    e.preventDefault();
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminInfo));
    setSaveMsg('Contact details saved!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleChangeAdminCode = (e) => {
    e.preventDefault();
    setSaveErr('');
    if (adminCodeData.newCode.length < 4) { setSaveErr('Code must be at least 4 characters!'); return; }
    if (adminCodeData.newCode !== adminCodeData.confirmCode) { setSaveErr('Codes do not match!'); return; }
    localStorage.setItem(ADMIN_CODE_KEY, adminCodeData.newCode);
    setAdminCodeData({ newCode: '', confirmCode: '' });
    setSaveMsg('Admin code updated successfully!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_authenticated'); navigate('/login'); };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 1500);
  };

  const filteredUsers = users.filter(u => {
    const name = (u.full_name || u.owner_name || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || phone.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    if (filter === 'ACTIVE') return matchSearch && u.is_active !== false;
    if (filter === 'BLOCKED') return matchSearch && u.is_blocked;
    if (filter === 'INACTIVE') return matchSearch && u.is_active === false;
    return matchSearch;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active !== false && !u.is_blocked).length;
  const blockedUsers = users.filter(u => u.is_blocked).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'Outfit','Roboto',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #94A3B8; }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${NB} 0%, ${NB2} 100%)`, padding: '48px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'white' }}>Admin Panel</h1>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Management Suite</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={14} /> Exit
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: `linear-gradient(135deg, ${NB} 0%, ${NB2} 100%)`, padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
          {[{ id: 'users', label: 'USERS', icon: <Users size={14} /> }, { id: 'settings', label: 'SETTINGS', icon: <Settings size={14} /> }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '11px 8px', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? NB : 'rgba(255,255,255,0.6)', transition: 'all 0.2s', letterSpacing: '0.5px' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'TOTAL', value: totalUsers, color: '#0F172A' },
                { label: 'ACTIVE', value: activeUsers, color: '#0D9488' },
                { label: 'BLOCKED', value: blockedUsers, color: '#DC2626' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', borderRadius: '14px', padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(10,31,92,0.08)' }}>
                  <p style={{ margin: 0, fontSize: '9px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                  <h2 style={{ margin: '4px 0 0', fontSize: '26px', fontWeight: '900', color: stat.color }}>{stat.value}</h2>
                </div>
              ))}
            </div>

            {/* Search + Refresh */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <User size={14} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, mobile or email..."
                  style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#0F172A', outline: 'none' }}
                />
              </div>
              <button onClick={fetchUsers} style={{ width: '44px', height: '44px', background: 'white', border: `1.5px solid ${NB_LIGHT}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <RefreshCw size={16} color={NB} />
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {['ALL', 'ACTIVE', 'BLOCKED', 'INACTIVE'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: '100px', border: filter === f ? 'none' : '1.5px solid #CBD5E1', background: filter === f ? NB : 'white', color: filter === f ? 'white' : '#475569', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* User Cards */}
            {usersLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontWeight: '700', background: 'white', borderRadius: '16px' }}>Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontWeight: '700', background: 'white', borderRadius: '16px' }}>No users found</div>
            ) : (
              filteredUsers.map((u, i) => {
                const isExpanded = expandedUser === u.id;
                const isBlocked = u.is_blocked;
                const isActive = u.is_active !== false && !isBlocked;
                return (
                  <div key={u.id} style={{ background: 'white', borderRadius: '18px', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(10,31,92,0.08)', border: isExpanded ? `1.5px solid ${NB}` : '1.5px solid transparent' }}>
                    {/* Card Top */}
                    <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>{u.full_name || u.owner_name || 'Unnamed User'}</h3>
                        {u.farm_name && <p style={{ margin: '2px 0 0', fontSize: '11px', color: NB, fontWeight: '700' }}>🏡 {u.farm_name}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px', background: isBlocked ? '#FEE2E2' : isActive ? '#ECFDF5' : '#F1F5F9', color: isBlocked ? '#DC2626' : isActive ? '#059669' : '#64748B' }}>
                          {isBlocked ? 'BLOCKED' : isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <button onClick={() => setExpandedUser(isExpanded ? null : u.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: NB_LIGHT, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {isExpanded ? <ChevronDown size={14} color={NB} /> : <ChevronRight size={14} color={NB} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div>
                        <div style={{ margin: '0 16px', height: '1px', background: '#F1F5F9' }} />
                        <div style={{ padding: '14px 16px' }}>
                          <p style={{ margin: '0 0 10px', fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Details</p>

                          {u.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{u.phone}</span>
                              <button onClick={() => copyToClipboard(u.phone, `phone-${u.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === `phone-${u.id}` ? '#059669' : '#94A3B8' }}>
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                          {u.email && <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{u.email}</p>}
                          {u.created_at && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Registered: {new Date(u.created_at).toLocaleDateString('en-GB').replace(/\//g, '/')}</p>}

                          <div style={{ marginTop: '10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px', background: NB_LIGHT, color: NB }}>USER</span>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
                            <button style={{ padding: '11px 4px', borderRadius: '12px', border: 'none', background: '#FF8C00', color: 'white', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                              DEACTIVATE
                            </button>
                            <button style={{ padding: '11px 4px', borderRadius: '12px', border: 'none', background: '#DC2626', color: 'white', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                              BLOCK
                            </button>
                            <button style={{ padding: '11px 4px', borderRadius: '12px', border: `1.5px solid #DC2626`, background: 'white', color: '#DC2626', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <>
            {saveMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', fontSize: '13px', fontWeight: '700', marginBottom: '12px', border: '1px solid #A7F3D0' }}>
                <CheckCircle size={16} /> {saveMsg}
              </div>
            )}
            {saveErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#FEF2F2', borderRadius: '12px', color: '#DC2626', fontSize: '13px', fontWeight: '700', marginBottom: '12px', border: '1px solid #FEE2E2' }}>
                <XCircle size={16} /> {saveErr}
              </div>
            )}

            {/* Admin Contact Info */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 12px rgba(10,31,92,0.08)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color={NB} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Admin Contact Info <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>(Visible to Users)</span></h3>
              </div>
              <form onSubmit={handleSaveAdminInfo} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Name</label>
                  <input type="text" value={adminInfo.name} onChange={e => setAdminInfo({ ...adminInfo, name: e.target.value })} placeholder="Support Team" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Phone Number (WhatsApp/Call)</label>
                  <input type="tel" value={adminInfo.phone} onChange={e => setAdminInfo({ ...adminInfo, phone: e.target.value })} placeholder="+91 9876543210" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Email</label>
                  <input type="email" value={adminInfo.email} onChange={e => setAdminInfo({ ...adminInfo, email: e.target.value })} placeholder="admin@milvexa.com" style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${NB}, ${NB2})`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px' }}>
                  SAVE CONTACT DETAILS
                </button>
              </form>
            </div>

            {/* Update Admin Code */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 12px rgba(10,31,92,0.08)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={18} color={NB} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Update Admin Code</h3>
              </div>
              <form onSubmit={handleChangeAdminCode} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Admin Code</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewCode ? 'text' : 'password'} value={adminCodeData.newCode} onChange={e => setAdminCodeData({ ...adminCodeData, newCode: e.target.value })} placeholder="New Admin Code" style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                    <button type="button" onClick={() => setShowNewCode(!showNewCode)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                      {showNewCode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Code</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmCode ? 'text' : 'password'} value={adminCodeData.confirmCode} onChange={e => setAdminCodeData({ ...adminCodeData, confirmCode: e.target.value })} placeholder="Confirm New Code" style={{ width: '100%', padding: '14px 44px 14px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#0F172A', outline: 'none' }} required />
                    <button type="button" onClick={() => setShowConfirmCode(!showConfirmCode)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                      {showConfirmCode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${NB}, ${NB2})`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.5px', opacity: (!adminCodeData.newCode || !adminCodeData.confirmCode) ? 0.5 : 1 }}>
                  <KeyRound size={16} /> UPDATE ADMIN CODE
                </button>
              </form>
            </div>

            {/* Summary */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 12px rgba(10,31,92,0.08)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={18} color={NB} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>Summary</h3>
              </div>
              <div style={{ padding: '6px 0' }}>
                {[
                  { label: 'Total Users', value: users.length, color: '#0F172A' },
                  { label: 'Blocked', value: users.filter(u => u.is_blocked).length, color: '#DC2626' },
                  { label: 'Active', value: users.filter(u => u.is_active !== false && !u.is_blocked).length, color: '#059669' },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < 2 ? '1px solid #F8FAFC' : 'none' }}>
                    <span style={{ fontSize: '14px', fontWeight: i === 2 ? '800' : '600', color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Note */}
            <div style={{ padding: '14px 16px', background: 'rgba(251,191,36,0.1)', borderRadius: '14px', border: '1px solid rgba(251,191,36,0.3)', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: '700', lineHeight: 1.6 }}>
                ⚠️ Admin code is stored securely on this device. Use this code on the Login screen to access Admin Panel.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
