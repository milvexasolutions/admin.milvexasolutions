import React from 'react';
import { MoreVertical, Activity, Droplets, History, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const AnimalCard = ({ animal, onEdit, onDelete, onSell, onDeath }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [milkHistory, setMilkHistory] = React.useState([]);
  const { t } = useTranslation();

  const fetchAnimalHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('milk_production')
      .select('*')
      .eq('animal_id', animal.id)
      .order('production_date', { ascending: false })
      .limit(14); // 7 days * 2 shifts
    
    if (data) {
      const grouped = {};
      data.forEach(h => {
        if (!grouped[h.production_date]) grouped[h.production_date] = { morning: 0, evening: 0 };
        if (h.shift === 'Morning') grouped[h.production_date].morning = h.quantity;
        if (h.shift === 'Evening') grouped[h.production_date].evening = h.quantity;
      });
      setMilkHistory(Object.entries(grouped).map(([date, qty]) => ({ date, ...qty })));
    }
    setLoadingHistory(false);
  };

  React.useEffect(() => {
    if (showHistory) fetchAnimalHistory();
  }, [showHistory]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return '#f0fdf4';
      case 'Sick': return '#fef2f2';
      case 'Pregnant': return '#fff7ed';
      case 'Milch': return '#f0f9ff';
      case 'Dry': return '#f8fafc';
      case 'Sold': return '#fef2f2';
      default: return '#f8fafc';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Healthy': return '#166534';
      case 'Sick': return '#dc2626';
      case 'Pregnant': return '#9a3412'; // Orange/Brownish
      case 'Milch': return '#0369a1';
      case 'Sold': return '#991b1b';
      case 'Dry': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <>
      <div className="glass-card" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isExpanded ? '16px' : '4px', 
          position: 'relative', 
          background: 'white',
          border: animal.status === 'Sold' ? '1.5px dashed #E2E8F0' : (isExpanded ? '1px solid #EFF6FF' : 'none'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          boxShadow: isExpanded ? '0 15px 35px rgba(11, 31, 77, 0.1)' : '0 4px 10px rgba(0,0,0,0.02)'
        }}
      >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Animal Avatar/Icon */}
        <div style={{ 
          width: isExpanded ? '64px' : '48px', 
          height: isExpanded ? '64px' : '48px', 
          borderRadius: isExpanded ? '20px' : '14px', 
          background: animal.type === 'Cow' ? 'linear-gradient(135deg, #0B1F4D 0%, #1E3A8A 100%)' : 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: isExpanded ? '24px' : '18px',
          fontWeight: '800',
          boxShadow: '0 8px 16px rgba(11, 31, 77, 0.1)',
          flexShrink: 0,
          transition: '0.3s'
        }}>
          {animal.name ? animal.name[0].toUpperCase() : <Activity size={isExpanded ? 28 : 20} />}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h3 style={{ fontSize: isExpanded ? '18px' : '15px', fontWeight: '800', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {animal.name || 'Unnamed'}
                {animal.status === 'Sold' && isExpanded && (
                  <span style={{ fontSize: '10px', background: 'var(--error)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontWeight: '800' }}>SOLD</span>
                )}
              </h3>
              <p style={{ fontSize: isExpanded ? '13px' : '12px', fontWeight: '700', color: 'var(--accent)', margin: '2px 0 0' }}>
                Tag: {animal.tag_number ? animal.tag_number.replace(/_(sold|dead|old).*/i, '') : ''}
              </p>
              {isExpanded && (
                <p className="animate-fade-in" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {animal.breed || 'Common Breed'} • {animal.type}
                </p>
              )}
            </div>

            <div style={{ position: 'relative', zIndex: showMenu ? 2000 : 10 }}>
              {animal.status !== 'Sold' && animal.status !== 'Dead' && (
                <>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setShowMenu(!showMenu); 
                    }}
                    style={{ 
                      background: showMenu ? '#F1F5F9' : '#F8FAFC', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      padding: '12px', 
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: '0.2s'
                    }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} 
                        style={{ position: 'fixed', inset: 0, zIndex: 9999 }} 
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        right: 0, 
                        background: 'white', 
                        borderRadius: '18px', 
                        boxShadow: '0 20px 40px rgba(11, 31, 77, 0.2)', 
                        zIndex: 10000,
                        minWidth: '180px',
                        padding: '10px',
                        marginTop: '10px',
                        border: '1px solid #F1F5F9',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.location.href = `/animals/edit/${animal.id}`; 
                            setShowMenu(false);
                          }} 
                          className="menu-item-premium"
                        >
                          Edit Details
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.location.href = `/animals/sell/${animal.id}`; 
                            setShowMenu(false);
                          }} 
                          className="menu-item-premium" 
                          style={{ color: 'var(--accent)' }}
                        >
                          Sell Animal
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeath(); setShowMenu(false); }} 
                          className="menu-item-premium" 
                          style={{ color: '#9D174D' }}
                        >
                          Death Animal
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowHistory(true); setShowMenu(false); }} 
                          className="menu-item-premium"
                        >
                          Production History
                        </button>
                        <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 10px' }} />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }} 
                          className="menu-item-premium" 
                          style={{ color: 'var(--error)' }}
                        >
                          Remove Record
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '100px', 
              fontSize: '11px', 
              fontWeight: '800',
              backgroundColor: getStatusColor(animal.status),
              color: getStatusTextColor(animal.status),
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              {animal.status}
            </span>
            {animal.health_status && animal.health_status !== 'Healthy' && (
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '100px', 
                fontSize: '11px', 
                fontWeight: '800',
                backgroundColor: getStatusColor(animal.health_status),
                color: getStatusTextColor(animal.health_status),
                textTransform: 'uppercase',
                border: '1px solid currentColor'
              }}>
                {animal.health_status}
              </span>
            )}
          </div>

          {/* Stats Section */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            padding: '16px', 
            background: animal.status === 'Sold' ? '#FEF2F2' : '#F8FAFC', 
            borderRadius: '20px',
            border: animal.status === 'Sold' ? '1px solid #FEE2E2' : '1px solid #F1F5F9'
          }}>
            {animal.status === 'Sold' ? (
              <>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase' }}>Sold For</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#B91C1C' }}>₹{animal.sale_price?.toLocaleString() || 0}</p>
                </div>
                <div style={{ width: '1px', background: '#FEE2E2' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#991B1B', fontWeight: '800', textTransform: 'uppercase' }}>Sold On</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '900', color: '#B91C1C' }}>{animal.sale_date ? new Date(animal.sale_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Total Milk</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>{animal.total_milk?.toFixed(1) || 0}<span style={{ fontSize: '12px', fontWeight: '700', marginLeft: '2px' }}>L</span></p>
                </div>
                <div style={{ width: '1px', background: '#E2E8F0' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Daily Avg</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: 'var(--accent)' }}>{animal.avg_milk?.toFixed(1) || 0}<span style={{ fontSize: '12px', fontWeight: '700', marginLeft: '2px' }}>L</span></p>
                </div>
              </>
            )}
          </div>

          {/* Purchase Details if not sold */}
          {animal.status !== 'Sold' && (animal.purchase_price || animal.purchase_date) && (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '12px 16px', 
              background: '#F1F5F9', 
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '9px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Purchase Price</p>
                <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>₹{animal.purchase_price?.toLocaleString() || 'N/A'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '9px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Purchase Date</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '800', color: '#475569' }}>{animal.purchase_date ? new Date(animal.purchase_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {animal.status !== 'Sold' && animal.status !== 'Dead' ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.href = `/milk?animalId=${animal.id}`; }}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  padding: '12px', 
                  borderRadius: '14px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontSize: '13px', 
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(11, 31, 77, 0.15)'
                }}
              >
                <Droplets size={16} />
                Record Milk
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.href = `/breeding?animalId=${animal.id}`; }}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  padding: '12px', 
                  borderRadius: '14px', 
                  background: 'white', 
                  color: 'var(--primary)', 
                  fontSize: '13px', 
                  fontWeight: '800',
                  border: '1.5px solid #E2E8F0'
                }}
              >
                <Activity size={16} />
                Breeding
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '14px', 
                  background: '#F1F5F9', 
                  color: '#475569', 
                  fontSize: '13px', 
                  fontWeight: '800',
                  border: '1.5px solid #E2E8F0'
                }}
              >
                <History size={16} />
                View Production History
              </button>
            </div>
          )}
        </div>
      )}
    </div>

      {/* History Modal */}
      {showHistory && (
        <div 
          onClick={(e) => { e.stopPropagation(); setShowHistory(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(11, 31, 77, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-card" 
            style={{ width: '100%', maxWidth: '450px', background: 'white', padding: '28px', borderRadius: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', position: 'relative', zIndex: 10001 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: 'var(--primary)' }}>Production History</h2>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>{animal.name} ({animal.tag_number ? animal.tag_number.replace(/_(sold|dead|old).*/i, '') : ''})</p>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: '#F8FAFC', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '12px' }}>
                <X size={24} />
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', borderBottom: '2px solid #F1F5F9', padding: '0 8px 12px' }}>
                  <span>DATE</span>
                  <span>MOR</span>
                  <span>EVE</span>
                  <span style={{ textAlign: 'right' }}>TOTAL</span>
                </div>
                {milkHistory.map(h => (
                  <div key={h.date} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '14px', padding: '12px 8px', borderBottom: '1px solid #F8FAFC' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{h.morning}L</span>
                    <span style={{ color: 'var(--text-muted)' }}>{h.evening}L</span>
                    <span style={{ textAlign: 'right', fontWeight: '900', color: 'var(--accent)' }}>{(parseFloat(h.morning) + parseFloat(h.evening)).toFixed(1)}L</span>
                  </div>
                ))}
                {milkHistory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Droplets size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <p style={{ margin: 0 }}>No records found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .menu-item-premium {
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          border-radius: 10px;
          transition: background 0.2s;
        }
        .menu-item-premium:hover {
          background: #F8FAFC;
        }
      `}</style>
    </>
  );
};

export default AnimalCard;
