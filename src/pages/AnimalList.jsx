import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import AnimalCard from '../components/AnimalCard';

const AnimalList = ({ recordType = 'active' }) => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const getTitle = () => {
    if (recordType === 'sell') return 'Sell Record';
    if (recordType === 'death') return 'Death Record';
    if (recordType === 'purchase') return 'Purchase Record';
    return 'Cattle List';
  };

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      animal.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.id_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'All' || animal.type === filterType;

    const matchesRecordType = 
      recordType === 'sell' ? animal.status === 'Sold' :
      recordType === 'death' ? animal.status === 'Dead' :
      recordType === 'purchase' ? animal.purchase_date != null || animal.purchase_price != null :
      (animal.status !== 'Sold' && animal.status !== 'Dead');
    
    return matchesSearch && matchesFilter && matchesRecordType;
  });

  const handleSell = (animal) => {
    navigate(`/animals/sell/${animal.id}`);
  };

  const handleDeath = async (animal) => {
    const cleanTag = animal.tag_number ? animal.tag_number.replace(/_(sold|dead|old).*/i, '') : '';
    const displayName = animal.name ? `${animal.name} (${cleanTag})` : cleanTag;

    if (!window.confirm(`Are you sure you want to mark ${displayName} as Dead?`)) return;
    try {
      const suffix = `_dead_${Math.floor(Date.now() / 1000)}`;
      const updatedTagNumber = animal.tag_number ? `${animal.tag_number.replace(/_(sold|dead|old).*/i, '')}${suffix}` : null;
      const updatedTagId = animal.tag_id ? `${animal.tag_id.replace(/_(sold|dead|old).*/i, '')}${suffix}` : null;

      const { error } = await supabase
        .from('animals')
        .update({ 
          status: 'Dead',
          tag_number: updatedTagNumber,
          tag_id: updatedTagId
        })
        .eq('id', animal.id);
      if (error) throw error;
      fetchAnimals();
    } catch (err) {
      alert('Error updating animal: ' + err.message);
    }
  };

  const handleDelete = async (animal) => {
    if (!window.confirm(`Are you sure you want to completely remove ${animal.name || animal.tag_number}? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animal.id);
      if (error) throw error;
      fetchAnimals();
    } catch (err) {
      alert('Error deleting animal: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px' }}>
      <PageHeader 
        title={getTitle()} 
        showBack={true} 
      />

      <div style={{ padding: '24px 20px 0', position: 'relative', zIndex: 5, marginTop: '-10px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search name or tag #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 14px 14px 48px', 
              background: 'white', 
              border: '1px solid #E2E8F0', 
              borderRadius: '16px', 
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#0F172A',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Categories Filter */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }} className="no-scrollbar">
          {['All', 'Cow', 'Buffalo', 'Calf', 'Bull'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{ 
                padding: '10px 20px', 
                borderRadius: '12px', 
                border: 'none', 
                fontSize: '13px', 
                fontWeight: '800',
                background: filterType === type ? '#0B1F4D' : 'white',
                color: filterType === type ? 'white' : '#64748B',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap',
                transition: '0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Animals List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#64748B', fontWeight: '700' }}>Fetching herd data...</p>
          </div>
        ) : filteredAnimals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAnimals.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal}
                onEdit={() => navigate(`/animals/edit/${animal.id}`)}
                onDelete={() => handleDelete(animal)}
                onSell={() => handleSell(animal)}
                onDeath={() => handleDeath(animal)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px dashed #E2E8F0' }}>
            <Activity size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B1F4D', margin: '0 0 8px' }}>No Records Found</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>There are no entries in this record category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalList;
