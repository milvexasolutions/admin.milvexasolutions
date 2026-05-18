import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Dog, 
  Milk, 
  Building2, 
  Stethoscope, 
  Database,
  Users,
  MessageSquare
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ChatBot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Custom initial message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! Main Milvexa Support Chat Bot hu. 🙏\nAapki dairy cattle farm management me main kya madad kar sakta hu?\n\nChoose any question from the suggestions below, or type your query!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);

  // Suggested questions with category and icons
  const suggestions = [
    { text: 'How to add cattle?', short: '🐄 Add Cattle', category: 'animal', icon: Dog },
    { text: 'How to record milk?', short: '🥛 Record Milk', category: 'milk', icon: Milk },
    { text: 'How to sell milk?', short: '📈 Sell Milk', category: 'sell_milk', icon: Milk },
    { text: 'Doctor Ledger help?', short: '🩺 Doc Ledger', category: 'doctor', icon: Stethoscope },
    { text: 'Cloud Backup data?', short: '☁️ Cloud Backup', category: 'backup', icon: Database },
    { text: 'Staff Salary management?', short: '👥 Staff Salary', category: 'staff', icon: Users }
  ];

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Smart Reply Engine (Keywords and responses in English/Hinglish)
  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    
    // 1. ADD CATTLE
    if (text.includes('cattle') || text.includes('animal') || text.includes('cow') || text.includes('buffalo') || text.includes('pashu') || text.includes('गाय') || text.includes('भैंस')) {
      return {
        text: `🐄 **New Cattle Add Kaise Karein?**\n\n**Hinglish Steps:**\n1. App ke **Dashboard** par bottom bar me check karein ya left sidebar open karke **Animal dropdown** select karein.\n2. **Purchase Animal** option par click karein.\n3. Form me: **Type** (Cow/Buffalo), **Tag ID** (Unique number), **Breed** (e.g. Gir, Murrah), **Age**, **Purchase Date**, and **Price** enter karein.\n4. **Save Animal** click karein. Pashu record instantly secure database me add ho jayega!\n\n**English Steps:**\n1. Click the '+' button in the bottom menu overlay or open the sidebar and expand the **Animal** menu.\n2. Select **Purchase Animal**.\n3. Provide essential details like Type, Tag ID, Breed, Age, Purchase Date, and Price.\n4. Press **Save Animal** to securely register your cattle.`,
        actionLink: '/animals/add',
        actionLabel: 'Go to Add Animal'
      };
    }
    
    // 2. RECORD MILK
    if (text.includes('record milk') || (text.includes('milk') && (text.includes('add') || text.includes('production') || text.includes('yield') || text.includes('doodh') || text.includes('दूध')))) {
      return {
        text: `🥛 **Daily Milk Entry Record Kaise Karein?**\n\n**Hinglish Steps:**\n1. Bottom navigation bar me **Milk** tab par tap karein.\n2. **Add Milk** option select karein.\n3. Details fill karein: **Shift** (Morning ya Evening), **Date**, **Animal Tag ID** aur **Quantity (Liters)**.\n4. **Save Milk Production** par click karein. Har animal ka production analytics trend automatically track hoga!\n\n**English Steps:**\n1. Navigate to the **Milk** section in the bottom navbar.\n2. Click the **Add Milk** card/button.\n3. Choose Shift (Morning/Evening), Date, select the Animal Tag ID, and specify Quantity (in Liters).\n4. Click **Save Milk Production** to successfully capture the dairy yield.`,
        actionLink: '/milk/add',
        actionLabel: 'Go to Milk Entry'
      };
    }

    // 3. SELL MILK
    if (text.includes('sell') && text.includes('milk')) {
      return {
        text: `📈 **Milk Sales (Doodh Bechna) Record Kaise Karein?**\n\n**Hinglish Steps:**\n1. Menu tab se **Milk** section select karein.\n2. **Sell Milk** par tap karein.\n3. Client ya **Society** details choose karein, **FAT**, **SNF**, **Quantity**, aur **Price per Liter** enter karein.\n4. **Save** par tap karein. Payment record and total transactions sync ho jayengi!\n\n**English Steps:**\n1. Open the **Milk** tab in the application.\n2. Tap the **Sell Milk** dashboard tile.\n3. Input purchaser/Society data, specify Milk FAT/SNF, volume (liters), and standard price per liter.\n4. Click **Save Record** to push the transaction to ledgers.`,
        actionLink: '/milk/sell',
        actionLabel: 'Go to Sell Milk'
      };
    }

    // 4. DOCTOR LEDGER
    if (text.includes('doctor') || text.includes('ledger') || text.includes('doctor ledger') || text.includes('med') || text.includes('sick') || text.includes('dawa') || text.includes('doctor treatment')) {
      return {
        text: `🩺 **Doctor Treatment aur Medical Bills Records:**\n\n**Hinglish Steps:**\n1. Left drawer open karke **Doctor Management** dropdown select karein.\n2. Naye vet doctor register karne ke liye **Add Doctor** par jayein.\n3. Treatment history, visits cost aur due payments summary track karne ke liye **Doctor Ledger** dashboard use karein.\n\n**English Steps:**\n1. Expand the **Doctor Management** section in the sidebar.\n2. Use **Add Doctor** to save contacts for veterinarians.\n3. Access **Doctor Ledger** to check consultations history, medicine bills, and payout ledger statements.`,
        actionLink: '/doctors/ledger',
        actionLabel: 'Go to Doctor Ledger'
      };
    }

    // 5. CLOUD BACKUP
    if (text.includes('backup') || text.includes('restore') || text.includes('cloud') || text.includes('database') || text.includes('save data') || text.includes('delete data')) {
      return {
        text: `☁️ **Database Cloud Backup & Safe Restore:**\n\n**Hinglish Steps:**\n1. Navigation bar me **Settings** par tap karein.\n2. **Data Backup & Restore** accordion click karein.\n3. **Backup Database** click karein (aapka data Milvexa Cloud storage me save ho jayega).\n4. Safe restore ke liye **Restore Backup** select karein, jisse delete hua data vapas aa jaye.\n\n**English Steps:**\n1. Go to the **Settings** menu.\n2. Expand the **Data Backup & Restore** drawer.\n3. Click **Backup Database** to copy local farm tables securely online.\n4. Click **Restore Backup** if you changed devices or need to pull your cloud data down.`,
        actionLink: '/settings',
        actionLabel: 'Go to Settings Backup'
      };
    }

    // 6. STAFF SALARY
    if (text.includes('staff') || text.includes('salary') || text.includes('salary') || text.includes('kamdar') || text.includes('worker') || text.includes('advance')) {
      return {
        text: `👥 **Staff (Kamdaro ki Salary) and Payout Management:**\n\n**Hinglish Steps:**\n1. Sidebar expand karke **Staff Management** select karein.\n2. Naye workers ka records rakhne ke liye **Add Staff** check karein.\n3. Worker advances, daily milker salaries track karne ke liye **Salary & Advance** sheet use karein.\n\n**English Steps:**\n1. Open the sidebar navigation menu and click **Staff Management**.\n2. Add profiles for farm helpers using **Add Staff**.\n3. Log regular salaries, advances, or deductions under the **Salary & Advance** ledger sheet.`,
        actionLink: '/staff/salary',
        actionLabel: 'Go to Staff Salaries'
      };
    }


    // 8. HELLO / GREETINGS
    if (text.includes('hello') || text.includes('hi') || text.includes('namaste') || text.includes('hey') || text.includes('pranam') || text.includes('राम राम')) {
      return {
        text: `Namaste! 👋 Har pashupalak ka sathi, **Milvexa Support Bot**! \n\nAapki dairy farm tracking, daily morning/evening milk production entry aur society data ko secure karne me help karunga.\n\nAap niche diye suggestions tap kar sakte hain ya apna question type karein!`
      };
    }

    // FALLBACK RESPONSE
    return {
      text: `Apologies, main aapki query fully samajh nahi paya. 🧐\n\nMain aapki help kar sakta hu:\n- 🐄 Animals/Cattle register karne me.\n- 🥛 Milk yields and Sales log karne me.\n- 🩺 Doctor and Staff expenses maintain karne me.\n- ☁️ Cloud Backups safety settings me.\n\nType your query related to dairy farm management or contact our expert live team at support@milvexa.com!`,
      actionLink: 'mailto:support@milvexa.com',
      actionLabel: 'Email Milvexa Support Team'
    };
  };

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // 2. Trigger Typing Animation
    setIsTyping(true);

    // 3. Simulated AI Latency
    setTimeout(() => {
      const response = getBotResponse(textToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        actionLink: response.actionLink,
        actionLabel: response.actionLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleClearHistory = () => {
    if (window.confirm('Kya aap chat history delete karke restart karna chahte hain?')) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Chat history cleared. 🧹 Aapki cattle dairy management help ke liye main tayar hu! Please ask a question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
    }
  };

  return (
    <div style={{ 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      paddingTop: 'calc(var(--safe-top) + 80px)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Page Header */}
      <PageHeader 
        title="Milvexa AI ChatBot" 
        showBack={true} 
        rightAction={
          <button 
            onClick={handleClearHistory}
            style={{ 
              width: '40px', 
              height: '40px', 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              borderRadius: '12px', 
              color: 'white', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        }
      />

      {/* Floating Sparkle/AI Branding under Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '12px 20px', 
        background: '#EFF6FF', 
        borderBottom: '1px solid #DBEAFE'
      }}>
        <div style={{ 
          width: '28px', 
          height: '28px', 
          background: 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          <Sparkles size={14} color="#00F2FE" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0B1F4D' }}>Milvexa Smart Assistant</span>
          <span style={{ fontSize: '10px', color: '#3B82F6', fontWeight: '700', marginLeft: '6px' }}>● ONLINE</span>
        </div>
      </div>

      {/* Message Area */}
      <div style={{ 
        flex: 1, 
        padding: '20px 16px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        maxHeight: 'calc(100vh - 250px)'
      }} className="no-scrollbar">
        
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              {/* Message Bubble */}
              <div 
                style={{
                  background: isBot ? 'white' : 'linear-gradient(135deg, #05163D 0%, #0B1F4D 100%)',
                  color: isBot ? '#0F172A' : 'white',
                  padding: '16px',
                  borderRadius: isBot ? '24px 24px 24px 4px' : '24px 24px 4px 24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  border: isBot ? '1px solid #E2E8F0' : 'none',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontWeight: '600',
                  whiteSpace: 'pre-line'
                }}
              >
                {/* Parse basic markdown highlights */}
                {msg.text.split('**').map((chunk, idx) => {
                  return idx % 2 === 1 ? <strong key={idx} style={{ color: isBot ? '#0B1F4D' : '#00F2FE', fontWeight: '800' }}>{chunk}</strong> : chunk;
                })}

                {/* Helper Action Buttons if applicable */}
                {isBot && msg.actionLink && (
                  <button
                    onClick={() => {
                      if (msg.actionLink.startsWith('mailto:')) {
                        window.open(msg.actionLink, '_system');
                      } else {
                        navigate(msg.actionLink);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px',
                      padding: '8px 14px',
                      background: 'rgba(11, 31, 77, 0.05)',
                      border: '1px solid rgba(11, 31, 77, 0.1)',
                      borderRadius: '10px',
                      color: '#0B1F4D',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    <Sparkles size={12} color="#0B1F4D" />
                    {msg.actionLabel || 'Check it now'}
                  </button>
                )}
              </div>
              
              {/* Timestamp */}
              <span style={{ 
                fontSize: '10px', 
                color: '#94A3B8', 
                marginTop: '4px', 
                padding: '0 4px', 
                fontWeight: '600' 
              }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            maxWidth: '120px',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '24px 24px 24px 4px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%', animation: 'bounce 1s infinite alternate' }} />
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.2s' }} />
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chip Drawer (Horizontal scroll list) */}
      <div style={{
        padding: '0px 16px 12px',
        overflowX: 'auto',
        display: 'flex',
        gap: '8px',
        background: 'transparent',
        whiteSpace: 'nowrap'
      }} className="no-scrollbar">
        {suggestions.map((sug, idx) => {
          const SugIcon = sug.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(sug.text)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: '#white',
                border: '1px solid #E2E8F0',
                borderRadius: '100px',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                background: 'white',
                transition: '0.2s'
              }}
            >
              <SugIcon size={12} color="#0B1F4D" />
              {sug.short}
            </button>
          );
        })}
      </div>

      {/* Input Form at the bottom */}
      <div style={{
        padding: '16px',
        background: 'white',
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Milvexa AI a question..."
          style={{
            flex: 1,
            padding: '16px 18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#0F172A',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: inputText.trim() ? '#0B1F4D' : '#F1F5F9',
            color: inputText.trim() ? 'white' : '#94A3B8',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            boxShadow: inputText.trim() ? '0 8px 20px rgba(11, 31, 77, 0.2)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Additional Styling for Typing Dot Bounces */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-6px); }
        }
      `}} />
    </div>
  );
};

export default ChatBot;
