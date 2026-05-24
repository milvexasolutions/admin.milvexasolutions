import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, Calendar, Info, Activity, Search, FileText, User, Tag, IndianRupee, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { scheduleBreedingReminders } from '../lib/notifications';

const CowIcon = ({ size = 18, color = '#94A3B8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M6 10c0-2.5 1.5-5 6-5s6 2.5 6 5c0 2.5-1 4.5-3 5.5v2.5c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1v-2.5C7 14.5 6 12.5 6 10z" />
    <path d="M7 6C6.5 4.5 5 3.5 3.5 4" />
    <path d="M17 6c.5-1.5 2-2.5 3.5-2" />
    <path d="M5 9c-1-.5-2-2-1.5-3 .5-1 2-.5 2.5.5" />
    <path d="M19 9c1-.5 2-2 1.5-3-.5-1-2-.5-2.5.5" />
    <path d="M9 16c0-.5.5-1 1-1h4c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-4c-.5 0-1-.5-1-1v-2z" />
    <circle cx="10.5" cy="17.5" r="0.75" fill={color} />
    <circle cx="13.5" cy="17.5" r="0.75" fill={color} />
  </svg>
);

const AddBreeding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isManualDoctor, setIsManualDoctor] = useState(false);
  const [isManualBreed, setIsManualBreed] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    breeding_date: new Date().toISOString().split('T')[0],
    type: 'Natural', // Matches default selection in screenshot
    bull_details: '',
    symptoms: '',
    doctor_name: '',
    semen_breed: '',
    note: '',
    cost: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data: animalsData } = await supabase.from('animals')
        .select('id, name, tag_number, type')
        .in('type', ['Cow', 'Buffalo'])
        .neq('status', 'Sold')
        .neq('status', 'Dead')
        .order('name');
      setAnimals(animalsData || []);

      const { data: doctorsData } = await supabase.from('doctors')
        .select('id, name')
        .order('name');
      setDoctors(doctorsData || []);
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Pack extra fields into the note column to preserve table schema compatibility
      const notePayload = JSON.stringify({
        symptoms: formData.symptoms,
        doctor_name: formData.type === 'AI' ? formData.doctor_name : '',
        semen_breed: formData.type === 'AI' ? formData.semen_breed : '',
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        real_note: formData.note
      });

      const insertData = {
        animal_id: formData.animal_id,
        breeding_date: formData.breeding_date,
        type: formData.type, // 'AI' or 'Natural'
        bull_details: formData.type === 'Natural' ? formData.bull_details : '',
        note: notePayload,
        status: 'Pending',
        owner_id: user.id
      };

      const { data, error } = await supabase.from('breeding_records').insert([insertData]).select();

      if (error && error.code !== '42P01') throw error;

      // Schedule reminders when breeding record is successfully created
      try {
        const animal = animals.find(a => a.id === formData.animal_id);
        const animalTag = animal ? (animal.tag_number || animal.name) : 'Cattle';
        const recordId = data && data[0] ? data[0].id : Math.floor(Math.random() * 1000000);
        await scheduleBreedingReminders(animalTag, formData.breeding_date, recordId);
      } catch (err) {
        console.error('Failed to schedule breeding notification:', err);
      }
      
      alert(t('breeding_record_added_successfully', 'Breeding record added successfully!'));
      navigate('/breeding');
    } catch (err) {
      console.error('Error adding breeding record:', err);
      alert(t('error_prefix', 'Error: ') + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperStyle = {
    position: 'relative',
    width: '100%'
  };

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 48px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0B1F4D',
    marginBottom: '8px'
  };

  const sectionTitleStyle = {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0B1F4D',
    marginTop: '12px',
    marginBottom: '12px'
  };

  return (
    <div className="animate-fade-in" style={{ background: '#F8FAFC', minHeight: '100vh', paddingTop: 'calc(var(--safe-top) + 88px)', paddingBottom: '40px' }}>
      <PageHeader title={t('animal_heat_register')} showBack={true} />

      <form onSubmit={handleSubmit} style={{ padding: '0 20px', marginTop: '15px' }}>
        <div className="glass-card animate-slide-up" style={{ padding: '24px', background: 'white', borderRadius: '28px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Animal Selection */}
            <div>
              <label style={labelStyle}>
                {t('animal_id_name')}<span style={{ color: '#EF4444' }}> *</span>
              </label>
              <div style={inputWrapperStyle}>
                <div style={iconStyle}>
                  <CowIcon size={18} />
                </div>
                <select 
                  required
                  value={formData.animal_id}
                  onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '40px' }}
                >
                  <option value="" disabled hidden>{t('enter_animal_id_or_name')}</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.tag_number || 'No Tag'})</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Heat Date */}
            <div>
              <label style={labelStyle}>
                {t('heat_date')}<span style={{ color: '#EF4444' }}> *</span>
              </label>
              <div style={inputWrapperStyle}>
                <div style={iconStyle}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  required
                  value={formData.breeding_date}
                  onChange={(e) => setFormData({...formData, breeding_date: e.target.value})}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label style={labelStyle}>
                {t('symptoms')}<span style={{ color: '#EF4444' }}> *</span>
              </label>
              <div style={inputWrapperStyle}>
                <div style={{ ...iconStyle, top: '24px' }}>
                  <FileText size={18} />
                </div>
                <textarea 
                  required
                  placeholder={t('enter_symptoms')}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  style={{ ...inputStyle, height: '80px', padding: '14px 16px 14px 48px', resize: 'none' }}
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label style={labelStyle}>
                {t('service_type')}<span style={{ color: '#EF4444' }}> *</span>
              </label>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="Natural"
                    checked={formData.type === 'Natural'}
                    onChange={() => setFormData({...formData, type: 'Natural'})}
                    style={{ display: 'none' }}
                  />
                  <div style={{ 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '50%', 
                    border: '2px solid #0B1F4D', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {formData.type === 'Natural' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0B1F4D' }} />}
                  </div>
                  {t('natural_mating')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="AI"
                    checked={formData.type === 'AI'}
                    onChange={() => setFormData({...formData, type: 'AI'})}
                    style={{ display: 'none' }}
                  />
                  <div style={{ 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '50%', 
                    border: '2px solid #0B1F4D', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {formData.type === 'AI' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0B1F4D' }} />}
                  </div>
                  {t('ai_doctor')}
                </label>
              </div>
            </div>

            {/* Natural Mating Fields */}
            {formData.type === 'Natural' && (
              <div>
                <label style={labelStyle}>
                  {t('bull_name_id')}<span style={{ color: '#EF4444' }}> *</span>
                </label>
                <div style={inputWrapperStyle}>
                  <div style={iconStyle}>
                    <CowIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    required={formData.type === 'Natural'}
                    placeholder={t('enter_bull_name_id')}
                    value={formData.bull_details}
                    onChange={(e) => setFormData({...formData, bull_details: e.target.value})}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* AI (Doctor) Fields */}
            {formData.type === 'AI' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Doctor Name */}
                <div>
                  <label style={labelStyle}>
                    {t('doctor_name')}<span style={{ color: '#EF4444' }}> *</span>
                  </label>
                  <div style={inputWrapperStyle}>
                    <div style={iconStyle}>
                      <User size={18} />
                    </div>
                    <select 
                      required={formData.type === 'AI' && !isManualDoctor}
                      value={isManualDoctor ? '__manual__' : formData.doctor_name}
                      onChange={(e) => {
                        if (e.target.value === '__manual__') {
                          setIsManualDoctor(true);
                          setFormData({...formData, doctor_name: ''});
                        } else {
                          setIsManualDoctor(false);
                          setFormData({...formData, doctor_name: e.target.value});
                        }
                      }}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '40px' }}
                    >
                      <option value="" disabled hidden>{t('select_doctor', 'Select Doctor')}</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.name}>{doc.name}</option>
                      ))}
                      <option value="__manual__">✍️ {t('type_manually', 'Type Manually')}</option>
                    </select>
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>

                  {isManualDoctor && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ ...labelStyle, fontSize: '13px', color: '#64748B' }}>
                        {t('enter_manual_doctor_name', 'Enter Doctor Name Manually')}<span style={{ color: '#EF4444' }}> *</span>
                      </label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}>
                          <User size={18} />
                        </div>
                        <input 
                          type="text" 
                          required={formData.type === 'AI' && isManualDoctor}
                          placeholder={t('enter_doctor_name', 'Enter Doctor Name')}
                          value={formData.doctor_name}
                          onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Semen Breed */}
                <div>
                  <label style={labelStyle}>
                    {t('semen_breed')}<span style={{ color: '#EF4444' }}> *</span>
                  </label>
                  <div style={inputWrapperStyle}>
                    <div style={iconStyle}>
                      <Tag size={18} />
                    </div>
                    <select
                      required={formData.type === 'AI' && !isManualBreed}
                      value={isManualBreed ? '__manual__' : formData.semen_breed}
                      onChange={(e) => {
                        if (e.target.value === '__manual__') {
                          setIsManualBreed(true);
                          setFormData({...formData, semen_breed: ''});
                        } else {
                          setIsManualBreed(false);
                          setFormData({...formData, semen_breed: e.target.value});
                        }
                      }}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '40px' }}
                    >
                      <option value="" disabled hidden>{t('select_breed')}</option>
                      <option value="Gir">Gir</option>
                      <option value="Sahiwal">Sahiwal</option>
                      <option value="Jersey">Jersey</option>
                      <option value="HF">Holstein Friesian (HF)</option>
                      <option value="Kankrej">Kankrej</option>
                      <option value="Murrah">Murrah</option>
                      <option value="Mehsana">Mehsana</option>
                      <option value="Jafarabadi">Jafarabadi</option>
                      <option value="__manual__">✍️ {t('type_manually', 'Type Manually')}</option>
                    </select>
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>

                  {isManualBreed && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ ...labelStyle, fontSize: '13px', color: '#64748B' }}>
                        {t('enter_manual_semen_breed', 'Enter Semen Breed Manually')}<span style={{ color: '#EF4444' }}> *</span>
                      </label>
                      <div style={inputWrapperStyle}>
                        <div style={iconStyle}>
                          <Tag size={18} />
                        </div>
                        <input 
                          type="text" 
                          required={formData.type === 'AI' && isManualBreed}
                          placeholder={t('enter_semen_breed', 'Enter Semen Breed')}
                          value={formData.semen_breed}
                          onChange={(e) => setFormData({...formData, semen_breed: e.target.value})}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Notes */}
            <div>
              <label style={labelStyle}>{t('notes')}</label>
              <div style={inputWrapperStyle}>
                <div style={iconStyle}>
                  <FileText size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder={t('enter_notes')}
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Cost of Treatment */}
            <div>
              <label style={labelStyle}>{t('cost_of_treatment')}</label>
              <div style={inputWrapperStyle}>
                <div style={iconStyle}>
                  <IndianRupee size={18} />
                </div>
                <input 
                  type="number" 
                  placeholder={t('enter_cost')}
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  style={inputStyle}
                />
              </div>
            </div>

          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '20px', 
            background: '#0B1F4D', 
            color: 'white', 
            borderRadius: '16px', 
            border: 'none', 
            fontSize: '18px', 
            fontWeight: '900', 
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(11, 31, 77, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  );
};

export default AddBreeding;
