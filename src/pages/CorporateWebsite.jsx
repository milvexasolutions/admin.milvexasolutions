import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Globe, 
  Database, 
  Cpu, 
  Share2, 
  Workflow, 
  ArrowRight, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Sun, 
  Moon, 
  Send,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  Shield,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CorporateWebsite() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

  // Form states
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', phone: '', message: '' });
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);

  // Dynamic CMS Data states (initialized cleanly, preserving defaults for profile and services)
  const [profile, setProfile] = React.useState({
    company_name: 'Milvexa Solutions Pvt. Ltd.',
    tagline: 'Innovative Software & Mobile App Solutions',
    description: 'We build powerful Android apps, web applications, admin panels, and business solutions that help enterprises grow and automate their business efficiently.',
    years_experience: 5,
    projects_completed: 50,
    client_satisfaction: '100%',
    support_hours: '24/7',
    contact_email: 'support@milvexasolutions.in',
    contact_phone: '+91 96247 45944',
    address: 'Anand, Gujarat, India',
    social_links: { github: '', linkedin: '', twitter: '' }
  });

  const [services, setServices] = React.useState([
    { id: '1', title: 'Android App Development', description: 'High performance and feature-rich Android applications tailored for smartphones and enterprise tablets.', icon_name: 'Smartphone' },
    { id: '2', title: 'Website Development', description: 'Modern, responsive, secure, and fast websites optimized for excellent user experience and performance.', icon_name: 'Globe' },
    { id: '3', title: 'Admin Panel Systems', description: 'Powerful admin dashboards and internal management portals to track operational data, roles, and records.', icon_name: 'Database' },
    { id: '4', title: 'Cloud & API Integration', description: 'Secure cloud server architecture and robust API connectivity to synchronize your backend services smoothly.', icon_name: 'Cpu' },
    { id: '5', title: 'Business Automation', description: 'Automate manual workflow cycles, data logging, analytics report generation, and enhance team productivity.', icon_name: 'Workflow' },
    { id: '6', title: 'Custom Software Development', description: 'Tailor-made software architectures built specifically to address the unique bottlenecks of your business model.', icon_name: 'Layers' }
  ]);

  const [projects, setProjects] = React.useState([]);
  const [apks, setApks] = React.useState([]);

  // Load dynamic data from Supabase
  React.useEffect(() => {
    async function fetchDynamicData() {
      try {
        // Fetch Profile
        const { data: profileData, error: profileErr } = await supabase
          .from('company_profile')
          .select('*')
          .maybeSingle();
        if (!profileErr && profileData) {
          setProfile(profileData);
        }

        // Fetch Services
        const { data: servicesData, error: servicesErr } = await supabase
          .from('corporate_services')
          .select('*')
          .order('created_at', { ascending: true });
        if (!servicesErr && servicesData && servicesData.length > 0) {
          setServices(servicesData);
        }

        // Fetch Projects
        const { data: projectsData, error: projectsErr } = await supabase
          .from('corporate_projects')
          .select('*')
          .order('created_at', { ascending: true });
        if (!projectsErr) {
          setProjects(projectsData || []);
        }

        // Fetch APKs
        const { data: apksData, error: apksErr } = await supabase
          .from('corporate_apks')
          .select('*')
          .order('created_at', { ascending: true });
        if (!apksErr) {
          setApks(apksData || []);
        }
      } catch (err) {
        console.warn('Database fetch failed.', err);
      }
    }
    fetchDynamicData();
  }, []);

  // Dynamic Scrollspy to track active section while scrolling
  React.useEffect(() => {
    const sections = ['home', 'services', 'projects', 'downloads', 'guides', 'about', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('contact_queries')
        .insert([contactForm]);
      
      if (!error) {
        setFormSubmitted(true);
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        throw error;
      }
    } catch (err) {
      // Fallback local storage log
      console.warn('Supabase lead submit error. Saving locally to browser localStorage.', err);
      const prevLeads = JSON.parse(localStorage.getItem('contact_leads') || '[]');
      prevLeads.push({ ...contactForm, id: Date.now().toString(), created_at: new Date().toISOString() });
      localStorage.setItem('contact_leads', JSON.stringify(prevLeads));
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } finally {
      setFormLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone size={24} />;
      case 'Globe': return <Globe size={24} />;
      case 'Database': return <Database size={24} />;
      case 'Cpu': return <Cpu size={24} />;
      case 'Workflow': return <Workflow size={24} />;
      case 'Layers': return <Layers size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  const getApkIconComponent = (iconType) => {
    switch (iconType) {
      case 'dog':
        return (
          <div style={{ width: '48px', height: '48px', background: '#10B981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontSize: '24px' }}>🐄</span>
          </div>
        );
      case 'wallet':
        return (
          <div style={{ width: '48px', height: '48px', background: '#3B82F6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontSize: '24px' }}>💳</span>
          </div>
        );
      case 'briefcase':
        return (
          <div style={{ width: '48px', height: '48px', background: '#8B5CF6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontSize: '24px' }}>💼</span>
          </div>
        );
      case 'package':
        return (
          <div style={{ width: '48px', height: '48px', background: '#F59E0B', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
          </div>
        );
      default:
        return (
          <div style={{ width: '48px', height: '48px', background: '#94A3B8', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Smartphone size={24} />
          </div>
        );
    }
  };

  const colors = {
    bg: isDarkMode ? '#030712' : '#FFFFFF',
    surface: isDarkMode ? '#0F172A' : '#F8FAFC',
    surfaceSecondary: isDarkMode ? '#1E293B' : '#F1F5F9',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11, 31, 77, 0.08)',
    shadow: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(11, 31, 77, 0.06)',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    navyBg: '#091E3A'
  };

  // Nav actions wrapper
  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      backgroundColor: colors.bg, 
      color: colors.textMain, 
      fontFamily: 'Outfit, Inter, sans-serif', 
      minHeight: '100vh',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        .glow-circle {
          animation: pulse-glow 8s ease-in-out infinite;
        }
      `}} />

      {/* 1. Header/Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: isDarkMode ? 'rgba(3, 7, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 5vw, 60px)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '900',
            fontSize: '20px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
          }}>
            M
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '900', color: colors.textMain, margin: 0, lineHeight: 1.1 }}>Milvexa</h1>
            <p style={{ fontSize: '9px', fontWeight: '700', color: colors.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solutions Pvt. Ltd.</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '32px', position: 'relative' }} className="desktop-nav-links">
          {['home', 'services', 'projects', 'downloads', 'guides', 'about', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeSection === item ? '#3B82F6' : colors.textMain,
                fontWeight: '700',
                fontSize: '15px',
                textTransform: 'capitalize',
                position: 'relative',
                padding: '4px 0',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              {item}
              {activeSection === item && (
                <motion.div
                  layoutId="activeUnderline"
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#3B82F6',
                    borderRadius: '10px'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'flex',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textMain,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Embedded Breakpoint CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .desktop-nav-links { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .hero-grid { grid-template-columns: 1.1fr 0.9fr !important; gap: 40px !important; text-align: left !important; }
          .hero-info-panel { align-items: flex-start !important; }
          .hero-graphic-box { display: block !important; }
          .about-panel { grid-template-columns: 1.1fr 0.9fr !important; }
        }
      `}} />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          background: colors.bg,
          borderBottom: `1px solid ${colors.border}`,
          zIndex: 888,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          gap: '16px',
          boxShadow: `0 20px 40px ${colors.shadow}`
        }}>
          {['home', 'services', 'projects', 'downloads', 'guides', 'about', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: activeSection === item ? '#3B82F6' : colors.textMain,
                fontWeight: '800',
                fontSize: '18px',
                padding: '12px 8px',
                borderRadius: '12px',
                backgroundColor: activeSection === item ? colors.surface : 'transparent'
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* 2. Hero Section */}
      <section id="home" style={{
        padding: 'clamp(40px, 10vw, 100px) clamp(16px, 5vw, 60px) clamp(40px, 8vw, 80px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Neon Glow Circle 1 */}
        <div className="glow-circle" style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        {/* Hero Content Grid */}
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Hero Left info */}
          <div className="hero-info-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Tag Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '100px',
              color: '#3B82F6',
              fontSize: '13px',
              fontWeight: '800'
            }}>
              🚀 Building Smart Digital Solutions
            </div>

            {/* Main Headings */}
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: '900',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              margin: 0
            }}>
              {profile.company_name}
            </h2>

            <h3 style={{
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontWeight: '800',
              color: '#3B82F6',
              margin: 0,
              lineHeight: 1.2
            }}>
              {profile.tagline}
            </h3>

            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: colors.textMuted,
              lineHeight: 1.6,
              fontWeight: '600',
              maxWidth: '620px',
              margin: 0
            }}>
              {profile.description}
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '8px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => scrollToSection('projects')}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '15px',
                  boxShadow: '0 12px 28px rgba(59, 130, 246, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                View Projects <ArrowRight size={18} />
              </button>
              <button
                onClick={() => scrollToSection('downloads')}
                style={{
                  padding: '16px 32px',
                  background: colors.surface,
                  color: colors.textMain,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Download APK <Download size={18} />
              </button>
            </div>

            {/* Feature Checkpoints */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              width: '100%',
              maxWidth: '500px',
              marginTop: '16px',
              textAlign: 'left'
            }}>
              {[
                { title: 'Modern Solutions', icon: <Sparkles size={16} color="#3B82F6" /> },
                { title: 'High Performance', icon: <Cpu size={16} color="#3B82F6" /> },
                { title: 'Secure & Reliable', icon: <Shield size={16} color="#3B82F6" /> },
                { title: 'User Focused', icon: <CheckCircle size={16} color="#3B82F6" /> }
              ].map((val, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {val.icon}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: colors.textMain }}>{val.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="hero-graphic-box" style={{
            display: 'none',
            position: 'relative'
          }}>
            {/* Background Glow */}
            <div className="glow-circle" style={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}></div>

            {/* Floating Mockup Laptop Graphic */}
            <div className="float-animation" style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: `1px solid ${colors.border}`,
              borderRadius: '24px',
              boxShadow: `0 30px 60px ${colors.shadow}`,
              overflow: 'hidden',
              padding: '16px'
            }}>
              {/* Image showing code screen */}
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1.5px solid ${colors.border}`,
                background: '#091E3A'
              }}>
                <img 
                  src="https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/hero_laptop_glowing.png" 
                  alt="Milvexa Tech Dashboard Preview" 
                  style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.95 }}
                  onError={(e) => {
                    // Fallback to placeholder image if custom upload doesn't load
                    e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                
                {/* Floating overlay chip */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(9, 30, 58, 0.75)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} className="spin-animation"></span>
                  Active Node Deploy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services Section ("What We Offer") */}
      <section id="services" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)',
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px' }}>Our Services</p>
            <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', color: colors.textMain, margin: 0 }}>What We Offer</h3>
            <div style={{ width: '60px', height: '3px', background: '#3B82F6', margin: '14px auto 0', borderRadius: '10px' }}></div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {services.map((service) => (
              <div 
                key={service.id} 
                style={{
                  background: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px 24px',
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 10px 20px ${colors.shadow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Glowing Top line decorative */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(to right, #3B82F6, #10B981)',
                  opacity: 0.15
                }}></div>

                {/* Icon box */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.06)',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIconComponent(service.icon_name)}
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>{service.title}</h4>
                
                <p style={{ fontSize: '14.5px', color: colors.textMuted, lineHeight: 1.5, fontWeight: '600', margin: 0 }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. About Us & Dynamic Stats Counters */}
      <section id="about" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="about-panel" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Info details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>About Us</p>
              <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', margin: 0 }}>Delivering Intelligent Digital Solutions</h3>
              
              <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: 1.6, fontWeight: '600', margin: 0 }}>
                {profile.description || "We build powerful Android apps, web applications, admin panels, and business solutions that help enterprises grow and automate their business efficiently."}
              </p>
            </div>

            {/* Dynamic Counters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {[
                { count: `${profile.years_experience}+`, label: 'Years Experience', bg: 'rgba(59, 130, 246, 0.05)', color: '#3B82F6' },
                { count: `${profile.projects_completed}+`, label: 'Projects Completed', bg: 'rgba(16, 185, 129, 0.05)', color: '#10B981' },
                { count: profile.client_satisfaction, label: 'Client Satisfaction', bg: 'rgba(139, 92, 246, 0.05)', color: '#8B5CF6' },
                { count: profile.support_hours, label: 'Support Available', bg: 'rgba(245, 158, 11, 0.05)', color: '#F59E0B' }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderRadius: '24px',
                    padding: '24px',
                    border: `1.5px solid ${colors.border}`,
                    boxShadow: `0 8px 16px ${colors.shadow}`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', color: stat.color }}>{stat.count}</h3>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: colors.textMuted }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Projects Showcase Section */}
      <section id="projects" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)',
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px' }}>Our Projects</p>
            <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', margin: 0 }}>Our Projects</h3>
            <div style={{ width: '60px', height: '3px', background: '#3B82F6', margin: '14px auto 0', borderRadius: '10px' }}></div>
          </div>

          {/* Projects Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px'
          }}>
            {projects.map((project) => (
              <div 
                key={project.id} 
                style={{
                  background: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderRadius: '24px',
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 16px 30px ${colors.shadow}`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Visual mockup window header */}
                <div style={{
                  background: isDarkMode ? '#0F172A' : '#EFF6FF',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: colors.textMuted }}>{project.title.replace(/\s+/g, '') + '.config'}</span>
                </div>

                {/* Body Content info */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      fontSize: '11px',
                      fontWeight: '800',
                      marginBottom: '8px'
                    }}>
                      {project.category}
                    </span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>{project.title}</h4>
                  </div>

                  <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.5, fontWeight: '600', margin: 0, flex: 1 }}>
                    {project.short_description}
                  </p>

                  {/* Tech stack */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {project.technologies.map((tech, i) => (
                      <span 
                        key={i} 
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 8px',
                          background: colors.surface,
                          borderRadius: '6px',
                          border: `1px solid ${colors.border}`,
                          color: colors.textMain
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                    <button
                      onClick={() => setSelectedProject(project)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: colors.surface,
                        border: `1.5px solid ${colors.border}`,
                        color: colors.textMain,
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      View Specs <Layers size={14} />
                    </button>
                    {project.live_url && project.live_url !== '#' && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        Live Demo <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. "Our Android Apps" & Dynamic APKs Download Desk */}
      <section id="downloads" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px' }}>Downloads Center</p>
            <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', margin: 0 }}>Our Android Apps</h3>
            <p style={{ margin: '8px 0 0', fontSize: '14.5px', color: colors.textMuted, fontWeight: '600' }}>Directly download official production APKs or scan the QR codes on your mobile phone to install immediately.</p>
            <div style={{ width: '60px', height: '3px', background: '#3B82F6', margin: '14px auto 0', borderRadius: '10px' }}></div>
          </div>

          {/* App Cards Desk */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {apks.map((app) => (
              <div 
                key={app.id} 
                style={{
                  background: isDarkMode ? '#0F172A' : '#FFFFFF',
                  borderRadius: '24px',
                  padding: '24px',
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 10px 20px ${colors.shadow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between'
                }}
              >
                {/* App Main Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {app.icon_type.startsWith('http') ? (
                    <img src={app.icon_type} alt="logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '14px' }} />
                  ) : (
                    getApkIconComponent(app.icon_type)
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>
                      {app.app_name.toUpperCase().includes('MILVEXA') ? profile.company_name : app.app_name}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: colors.textMuted }}>v{app.version}</span>
                      <span style={{ fontSize: '11px', color: colors.border }}>|</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: colors.textMuted }}>{app.file_size}</span>
                    </div>
                  </div>
                </div>

                {/* Subinfo Updated date */}
                <div style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted }}>
                  Last updated: <span style={{ fontWeight: '800', color: colors.textMain }}>{app.release_date}</span>
                </div>

                {/* Action panel showing Download Button and QR Code */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  borderTop: `1px solid ${colors.border}`, 
                  paddingTop: '16px' 
                }}>
                  {/* Download Action button */}
                  <a
                    href={app.download_url}
                    onClick={(e) => {
                      if (app.download_url === '#') {
                        e.preventDefault();
                        alert('App upload pending. You can update/add the downloadable APK binary inside the Admin Panel Corporate CMS tab!');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '13px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    }}
                  >
                    Download APK <Download size={14} />
                  </a>

                  {/* Automatic QR Code display */}
                  <div 
                    title="Scan QR Code to download on your phone"
                    style={{
                      width: '48px',
                      height: '48px',
                      border: `1.5px solid ${colors.border}`,
                      borderRadius: '10px',
                      padding: '2px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    onClick={() => {
                      if (app.download_url !== '#') {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(app.download_url)}`, '_blank');
                      }
                    }}
                  >
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(app.download_url === '#' ? 'https://milvexasolutions.in' : app.download_url)}`}
                      alt="APK Download QR Code"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Guides & Documentation Preview Section */}
      <section id="guides" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)',
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px' }}>Documentation desk</p>
            <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', margin: 0 }}>Guides & Manuals</h3>
            <p style={{ margin: '8px 0 0', fontSize: '14.5px', color: colors.textMuted, fontWeight: '600' }}>Read quick references and setup manuals to optimize your cattle farm integrations.</p>
            <div style={{ width: '60px', height: '3px', background: '#3B82F6', margin: '14px auto 0', borderRadius: '10px' }}></div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              { title: 'Farmer App Initial Setup Guide', desc: 'Step-by-step instructions to download the Cattle Farm App, register, connect your dairy society ID, and configure notifications.', category: 'Setup manual', readTime: '5 min read' },
              { title: 'Automated Calf Lifecycle Promotion rules', desc: 'Understand growth thresholds for heifers, female calves, bull promotion rules, and how local data models coordinate state.', category: 'Herd Science', readTime: '8 min read' },
              { title: 'Dairy Society Milk Billing Ledger API', desc: 'Developer reference detailing standard price rates structures, SNF parameters, fat content calculation queries formulas.', category: 'API Integration', readTime: '12 min read' }
            ].map((blog, idx) => (
              <div 
                key={idx} 
                style={{
                  background: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderRadius: '24px',
                  padding: '24px',
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 10px 20px ${colors.shadow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => alert(`"${blog.title}" manual is loaded via local files. You can configure complete blog logs dynamically later!`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>{blog.category}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted }}>{blog.readTime}</span>
                </div>
                <h4 style={{ margin: 0, fontSize: '16.5px', fontWeight: '900', lineHeight: 1.3 }}>{blog.title}</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: colors.textMuted, lineHeight: 1.5, fontWeight: '600' }}>{blog.desc}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3B82F6', fontSize: '12px', fontWeight: '800', marginTop: '6px' }}>
                  Read Manual <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Dynamic Contact Form Form Panel */}
      <section id="contact" style={{
        padding: 'clamp(50px, 8vw, 80px) clamp(16px, 5vw, 60px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px' }}>Get in Touch</p>
            <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '900', margin: 0 }}>Contact Milvexa Solutions</h3>
            <p style={{ margin: '8px 0 0', fontSize: '14.5px', color: colors.textMuted, fontWeight: '600' }}>Drop a message and our enterprise software consulting team will contact you back immediately.</p>
            <div style={{ width: '60px', height: '3px', background: '#3B82F6', margin: '14px auto 0', borderRadius: '10px' }}></div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px',
            alignItems: 'stretch'
          }} className="about-panel">
            {/* Info details contacts */}
            <div style={{
              background: '#091E3A',
              color: 'white',
              borderRadius: '24px',
              padding: '36px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background graphic glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 75%)',
                pointerEvents: 'none'
              }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Corporate Channels</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontWeight: '600', margin: 0 }}>
                  Feel free to reach out via direct phone lines, emails, or physical offices to set up custom software architecture consultations.
                </p>
              </div>

              {/* Direct channels links list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase' }}>Send Email</p>
                    <a href={`mailto:${profile.contact_email}`} style={{ margin: 0, fontSize: '14.5px', color: 'white', fontWeight: '800', textDecoration: 'none' }}>{profile.contact_email}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase' }}>Phone Hotline</p>
                    <a href={`tel:${profile.contact_phone.replace(/\s+/g, '')}`} style={{ margin: 0, fontSize: '14.5px', color: 'white', fontWeight: '800', textDecoration: 'none' }}>{profile.contact_phone}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase' }}>Office Headquarters</p>
                    <h5 style={{ margin: 0, fontSize: '14.5px', color: 'white', fontWeight: '800' }}>{profile.address}</h5>
                  </div>
                </div>
              </div>

              {/* Legal copyright badge */}
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                © 2026 Milvexa Solutions Pvt. Ltd. | All rights reserved.
              </div>
            </div>

            {/* Actual Form Panel */}
            <div style={{
              background: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderRadius: '24px',
              padding: '36px 30px',
              border: `1.5px solid ${colors.border}`,
              boxShadow: `0 16px 30px ${colors.shadow}`
            }}>
              {formSubmitted ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '40px 0',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle size={36} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Message Received Successfully!</h4>
                  <p style={{ fontSize: '14px', color: colors.textMuted, fontWeight: '600', maxWidth: '320px', margin: 0 }}>
                    Thank you! Our enterprise solution specialist will contact you back on your provided channels shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    style={{
                      marginTop: '12px',
                      padding: '10px 20px',
                      background: colors.surfaceSecondary,
                      color: colors.textMain,
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Name field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tausif Patel"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      style={{
                        padding: '14px 16px',
                        background: colors.surface,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: '12px',
                        color: colors.textMain,
                        fontSize: '14.5px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Double row email & phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="about-panel">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. client@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{
                          padding: '14px 16px',
                          background: colors.surface,
                          border: `1.5px solid ${colors.border}`,
                          borderRadius: '12px',
                          color: colors.textMain,
                          fontSize: '14.5px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        style={{
                          padding: '14px 16px',
                          background: colors.surface,
                          border: `1.5px solid ${colors.border}`,
                          borderRadius: '12px',
                          color: colors.textMain,
                          fontSize: '14.5px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Message *</label>
                    <textarea 
                      required
                      rows="4"
                      placeholder="Detail your custom software requests or consult needs..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      style={{
                        padding: '14px 16px',
                        background: colors.surface,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: '12px',
                        color: colors.textMain,
                        fontSize: '14.5px',
                        fontWeight: '600',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      color: 'white',
                      borderRadius: '14px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                      opacity: formLoading ? 0.7 : 1
                    }}
                  >
                    {formLoading ? 'Sending Lead...' : 'Send Message'} <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Specifications Details Popup Modal */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 8, 20, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: colors.bg,
            border: `1.5px solid ${colors.border}`,
            borderRadius: '28px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: `0 25px 50px -12px ${colors.shadow}`,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>Project Technical Specs</h4>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: colors.surface,
                  border: 'none',
                  color: colors.textMain,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#3B82F6' }}>{selectedProject.title}</h5>
                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '700' }}>{selectedProject.category}</span>
              </div>

              <div>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase' }}>Description Details</p>
                <p style={{ margin: 0, fontSize: '14px', color: colors.textMuted, lineHeight: 1.5, fontWeight: '600' }}>
                  {selectedProject.long_description}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: colors.textMain, textTransform: 'uppercase' }}>Installed Architecture & Tech</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProject.technologies.map((tech, i) => (
                    <span 
                      key={i} 
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        padding: '6px 12px',
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        color: colors.textMain
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close Details
              </button>
              {selectedProject.live_url && selectedProject.live_url !== '#' && (
                <a
                  href={selectedProject.live_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '13px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  Launch App
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
