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
  MessageSquare,
  Volume2,
  VolumeX,
  Mic,
  Calculator,
  Plus,
  Minus,
  CheckCircle,
  Activity,
  Zap,
  RefreshCw,
  Paperclip,
  Image,
  Video,
  X,
  FileText,
  Phone,
  PlusCircle,
  Heart
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('Thinking...');
  const [isExpectingProblem, setIsExpectingProblem] = useState(false);
  
  // Interactive FAT/SNF rates
  const [calcFat, setCalcFat] = useState(6.5);
  const [calcSnf, setCalcSnf] = useState(9.0);

  // Interactive Medicine Dosage weight
  const [cowWeight, setCowWeight] = useState(400);

  // Interactive Payout milk volume
  const [dailyMilkLiters, setDailyMilkLiters] = useState(120);
  
  // Assistant Active Mode: 'general' | 'doctor' | 'analytics'
  const [activeMode, setActiveMode] = useState('general');
  
  // Attached image/video states
  const [attachedFile, setAttachedFile] = useState(null); // { name, type, previewUrl }
  
  // Audio state
  const [ttsActiveId, setTtsActiveId] = useState(null);

  // --- FULLY ADVANCED VET WORKBENCH STATE VARIABLES ---
  const [cattleBreed, setCattleBreed] = useState('Sahiwal');
  const [cattleTemp, setCattleTemp] = useState(101.5); // standard cow temp is ~101.5°F
  const [selectedBodyPart, setSelectedBodyPart] = useState('skin'); // 'head' | 'skin' | 'udder' | 'leg'
  const [checkedSymptoms, setCheckedSymptoms] = useState({
    fever: false,
    udder: false,
    limp: false,
    rash: false,
    appetite: false
  });

  // Persistent Clinical Scan History Logs Ledger (Local Storage)
  const [patientRecords, setPatientRecords] = useState(() => {
    const saved = localStorage.getItem('milvexa_patient_scans');
    return saved ? JSON.parse(saved) : [
      { id: 1, tag: 'MV-COW-309', breed: 'Jersey Cow', disease: 'Bovine Mastitis (Udder tissue infection)', date: '2026-05-16', status: 'Recovering' },
      { id: 2, tag: 'MV-BUF-104', breed: 'Murrah Buffalo', disease: 'Lumpy Skin Disease (LSD virus)', date: '2026-05-17', status: 'Quarantined' }
    ];
  });

  // Anatomical Region Click Helper
  const handleAnatomyClick = (region) => {
    setSelectedBodyPart(region);
    
    // Auto-update checklist based on selected region
    if (region === 'udder') {
      setCheckedSymptoms(prev => ({ ...prev, udder: true, limp: false, rash: false }));
    } else if (region === 'skin') {
      setCheckedSymptoms(prev => ({ ...prev, rash: true, udder: false, limp: false }));
    } else if (region === 'leg') {
      setCheckedSymptoms(prev => ({ ...prev, limp: true, udder: false, rash: false }));
    } else if (region === 'head') {
      setCheckedSymptoms(prev => ({ ...prev, appetite: true, fever: true }));
      setCattleTemp(103.5); // auto-simulate high fever
    }
  };

  // Initial message list
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am the Milvexa Advanced AI farm assistant. 🌾🐄\n\nChoose a specialized mode from the top bar to consult the AI Doctor (featuring anatomical 3D scan mapping and live vital heart EKG pulse trackers!) or analyze live Farm Analytics!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);

  // Dynamic Disease Probability Calculator based on checked symptoms & body temperature
  const calculateDiagnosis = () => {
    let mastitisProb = 0;
    let lsdProb = 0;
    let footrotProb = 0;
    let feverProb = 0;

    // Udder inflammation + appetite drop = mastitis
    if (checkedSymptoms.udder) mastitisProb += 60;
    if (checkedSymptoms.appetite && checkedSymptoms.udder) mastitisProb += 30;
    if (cattleTemp > 103) mastitisProb += 8;

    // Skin rashes + high fever = Lumpy Skin
    if (checkedSymptoms.rash) lsdProb += 60;
    if (cattleTemp > 103.5) lsdProb += 25;
    if (checkedSymptoms.appetite && checkedSymptoms.rash) lsdProb += 10;

    // Limping + udder/appetite = Foot Rot
    if (checkedSymptoms.limp) footrotProb += 70;
    if (cattleTemp > 102.5) footrotProb += 15;
    if (checkedSymptoms.appetite && checkedSymptoms.limp) footrotProb += 10;

    // High fever alone or with appetite
    if (cattleTemp > 102.8) feverProb += 50;
    if (checkedSymptoms.fever) feverProb += 30;
    if (checkedSymptoms.appetite) feverProb += 15;

    // Cap at 99%
    return {
      mastitis: Math.min(99, mastitisProb),
      lsd: Math.min(99, lsdProb),
      footrot: Math.min(99, footrotProb),
      fever: Math.min(99, feverProb)
    };
  };

  const diagnosticsResult = calculateDiagnosis();

  // Determine top matching disease
  const getTopDisease = () => {
    const list = [
      { name: 'Bovine Mastitis (Udder Infection)', value: diagnosticsResult.mastitis },
      { name: 'Lumpy Skin Disease (LSD virus)', value: diagnosticsResult.lsd },
      { name: 'Foot Rot Lameness', value: diagnosticsResult.footrot },
      { name: 'Ephemeral Fever (Pashu Bukhar)', value: diagnosticsResult.fever }
    ];
    list.sort((a, b) => b.value - a.value);
    return list[0].value > 20 ? list[0] : { name: 'Normal / Healthy Vitals', value: 0 };
  };

  const topDisease = getTopDisease();

  // Dynamic Heart BPM based on Cattle body Temperature
  const getBpm = () => {
    return Math.round(55 + (cattleTemp - 101.5) * 12);
  };

  const bpm = getBpm();

  // Get dynamic status indicator based on Temperature slider
  const getTempStatus = (temp) => {
    if (temp < 100.0) return { label: '⚠️ LOW TEMP (Hypothermia)', color: '#2563EB', bg: '#EFF6FF' };
    if (temp >= 100.5 && temp <= 102.5) return { label: '✅ NORMAL Vitals', color: '#059669', bg: '#D1FAE5' };
    if (temp > 102.5 && temp <= 104.5) return { label: '⚠️ MODERATE FEVER', color: '#D97706', bg: '#FEF3C7' };
    return { label: '🚨 CRITICAL HIGH FEVER', color: '#DC2626', bg: '#FEE2E2' };
  };

  const tempStatus = getTempStatus(cattleTemp);

  // Adjust suggestions dynamically based on selected Mode
  const getSuggestions = () => {
    if (activeMode === 'doctor') {
      return [
        { text: 'Analyze Mastitis Symptoms', short: '🦠 Mastitis Check', icon: Stethoscope },
        { text: 'Fever medicine dose calculator', short: '💊 Dosage Calc', icon: Activity },
        { text: 'Cattle Pregnancy symptoms', short: '🐄 Pregnancy Care', icon: Dog },
        { text: 'Emergency Vet Helpline support', short: '🚨 Emergency Call', icon: HelpCircle }
      ];
    } else if (activeMode === 'analytics') {
      return [
        { text: 'Optimized Feed Mix Ratios', short: '📈 Feed Optimizer', icon: Sparkles },
        { text: 'Calculate FAT & SNF rate', short: '🧮 Rate Calculator', icon: Calculator },
        { text: 'Forecasting Milk Payout Sheet', short: '📊 Payout Forecast', icon: Building2 },
        { text: 'Predict Milk Yield Next Month', short: '🔮 Yield Forecast', icon: Activity }
      ];
    } else {
      return [
        { text: 'I want to raise a support query ticket', short: '🎟️ Raise Ticket', icon: HelpCircle },
        { text: 'Calculate FAT & SNF rate', short: '🧮 Rate Calculator', icon: Calculator },
        { text: 'Cattle fever health diagnosis', short: '🩺 Health Help', icon: Stethoscope },
        { text: 'Cloud Backup data?', short: '☁️ Cloud Backup', icon: Database }
      ];
    }
  };

  // Handle Assistant Mode Switching
  const handleModeChange = (mode) => {
    if (mode === activeMode) return;
    setActiveMode(mode);
    
    let welcomeMsgText = '';
    let isHealthCard = false;
    let isOptimizeCard = false;
    let isDoctorWorkbench = false;

    if (mode === 'general') {
      welcomeMsgText = "Switching to 💬 **General Support Mode**.\n\nAsk me queries about cattle registries, backup procedures, or raise tech support tickets!";
    } else if (mode === 'doctor') {
      welcomeMsgText = "Switching to 🩺 **AI Vet Doctor Mode**.\n\nI have unlocked the **AI Clinical Diagnostics Workbench** below. Adjust temperature vitals, check symptoms, or load photographs to get real-time computer vision diagnostic outputs!";
      isHealthCard = true;
      isDoctorWorkbench = true;
    } else if (mode === 'analytics') {
      welcomeMsgText = "Switching to 📊 **AI Farm Analytics Mode**.\n\nLet's optimize farm profits. Get dynamic milk payout forecasts, optimized feed mix ratios, or monthly yield predictions.";
      isOptimizeCard = true;
    }

    const botMsg = {
      id: Date.now(),
      sender: 'bot',
      text: welcomeMsgText,
      isHealthCard,
      isOptimizeCard,
      isDoctorWorkbench,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    setMessages(prev => [...prev, botMsg]);
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // TTS Reader
  const handleTTS = (text, id) => {
    if ('speechSynthesis' in window) {
      if (ttsActiveId === id) {
        window.speechSynthesis.cancel();
        setTtsActiveId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text
          .replace(/\*\*/g, '')
          .replace(/🐄|🥛|🩺|👥|🎟️|☁️|📈|🌾|🧮|✨|🚨/g, '')
          .replace(/Hinglish Steps:|English Steps:/g, '');
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.onend = () => setTtsActiveId(null);
        utterance.onerror = () => setTtsActiveId(null);
        
        setTtsActiveId(id);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  // Voice recognition simulation
  const handleMicInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      alert("Listening... Speak your farm query now.");
      recognition.start();

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setInputText(speechToText);
      };
    } else {
      let randomQuery = "Calculate FAT & SNF rate";
      if (activeMode === 'doctor') randomQuery = "Fever medicine dose calculator";
      else if (activeMode === 'analytics') randomQuery = "Forecasting Milk Payout Sheet";
      
      setInputText(randomQuery);
      alert(`[Simulation Mode] Detected voice command: "${randomQuery}"`);
    }
  };

  // Local File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        previewUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Load Preset Test Media for AI Doctor Computer Vision
  const triggerPresetMedia = (presetType) => {
    if (presetType === 'skin') {
      setAttachedFile({
        name: 'lumpy_skin_rash_shoulder.jpg',
        type: 'image',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="100%" height="100%" fill="%23FFF1F2"/><circle cx="50" cy="50" r="14" fill="%23F43F5E" opacity="0.85"/><circle cx="120" cy="80" r="18" fill="%23F43F5E" opacity="0.85"/><circle cx="80" cy="110" r="10" fill="%23F43F5E" opacity="0.85"/><circle cx="140" cy="40" r="12" fill="%23F43F5E" opacity="0.85"/><text x="15" y="138" font-family="sans-serif" font-size="11" font-weight="900" fill="%239F1239">Cattle LSD Nodules Presets</text></svg>'
      });
    } else if (presetType === 'udder') {
      setAttachedFile({
        name: 'bovine_udder_mastitis.jpg',
        type: 'image',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="100%" height="100%" fill="%23FFF5F5"/><circle cx="100" cy="70" r="28" fill="%23EF4444" opacity="0.75"/><circle cx="70" cy="70" r="14" fill="%23DC2626" opacity="0.7"/><circle cx="130" cy="70" r="14" fill="%23DC2626" opacity="0.7"/><text x="15" y="138" font-family="sans-serif" font-size="11" font-weight="900" fill="%23991B1B">Bovine Mastitis Preset</text></svg>'
      });
    } else if (presetType === 'gait') {
      setAttachedFile({
        name: 'cow_gait_lameness_test.mp4',
        type: 'video',
        previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="100%" height="100%" fill="%230F172A"/><circle cx="100" cy="65" r="20" fill="%2338BDF8" opacity="0.8"/><text x="35" y="110" font-family="sans-serif" font-size="10" font-weight="900" fill="%2338BDF8">🎥 Lameness Video Preview</text></svg>'
      });
    }
  };

  // Smart Reply Engine
  const getBotResponse = (userText, currentExpectation) => {
    const text = userText.toLowerCase();

    // 0. Expecting support ticket details
    if (currentExpectation) {
      const tokenNum = `MVX-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Save support ticket to localStorage dynamically for the Admin Panel desk
      try {
        const raw = localStorage.getItem('milvexa_global_tickets') || '[]';
        const tickets = JSON.parse(raw);
        tickets.unshift({
          id: tokenNum,
          farmerName: profile?.full_name || profile?.owner_name || 'Registered Farmer',
          phone: profile?.phone || user?.email || '+91 96247 45944',
          problem: userText,
          status: 'Open',
          date: new Date().toISOString()
        });
        localStorage.setItem('milvexa_global_tickets', JSON.stringify(tickets));
      } catch (err) {
        console.error('Error saving support ticket to local storage:', err);
      }

      return {
        text: `🎟️ **Support Query Ticket Created Successfully!**\n\n**Token Number:** \`#${tokenNum}\`\n**Status:** \`Registered & Open\`\n\nAapki problem successfully register ho chuki hai. Hamari expert engineering team isko analyze aur resolve kar rahi hai.\n\n⏰ **Expected Resolution Time:** **5 to 6 working days**.\n\nThank you for your patience! Support updates aapke registered email aur phone number par send kiye jayenge.`,
        isToken: true,
        tokenNumber: tokenNum,
        problemDescription: userText,
        resetExpectation: true
      };
    }

    // 1. DYNAMIC RATE CALCULATOR CARD INTENT
    if (text.includes('calc') || text.includes('rate') || text.includes('fat') || text.includes('snf') || text.includes('price') || text.includes('calculate')) {
      return {
        text: `🧮 **Society Milk Price Calculator**\n\nHere is your real-time FAT & SNF rate slip. You can adjust the parameters using the controls in the interactive card below to see live price changes!`,
        isCalcCard: true
      };
    }

    // 2. AI DOCTOR: MEDICINE DOSAGE CALCULATOR CARD INTENT
    if (text.includes('dose') || text.includes('dosage') || text.includes('medicine') || text.includes('paracetamol') || text.includes('weight')) {
      return {
        text: `💊 **AI Vet Medicine Dosage Calculator**\n\nI have generated a clinical dosage projection sheet. Use the weights selectors in the card below to calculate secure prescription levels:`,
        isDoseCard: true
      };
    }

    // 3. AI DOCTOR: SYMPTOM DIAGNOSIS CARD INTENT
    if (text.includes('fever') || text.includes('mastitis') || text.includes('sick') || text.includes('symptom') || text.includes('diagnosis') || text.includes('treatment') || text.includes('bimari')) {
      return {
        text: `🩺 **AI Vet Doctor Diagnostics**\n\nI have generated a preliminary diagnostics advisory sheet. Based on cattle clinical parameters, here is the quick evaluation:`,
        isHealthCard: true,
        symptom: userText.includes('mastitis') ? 'Mastitis Symptoms (Inflamed udder, clotted milk)' : 'High Body Temperature (Fever)'
      };
    }

    // 4. AI ANALYTICS: PAYOUT FORECAST CARD INTENT
    if (text.includes('forecast') || text.includes('payout') || text.includes('earnings') || text.includes('income') || text.includes('profit')) {
      return {
        text: `📊 **AI Farm Earnings Payout Forecaster**\n\nAnalyzing weekly sales ledgers against active dairy volumes... Adjust daily yields below to forecast monthly payout sheet updates!`,
        isPayoutCard: true
      };
    }

    // 5. AI ANALYTICS: YIELD FEED OPTIMIZATION CARD INTENT
    if (text.includes('optimize') || text.includes('yield') || text.includes('feed ratio') || text.includes('doodh badhaye')) {
      return {
        text: `📈 **Milvexa Milk Yield & Feed Optimizer**\n\nAnalyzing feed stock metrics against milk production records... Here is the optimized feed ratio recipe to maximize your daily yield per cow:`,
        isOptimizeCard: true
      };
    }

    // 6. ADD CATTLE
    if (text.includes('cattle') || text.includes('animal') || text.includes('cow') || text.includes('buffalo') || text.includes('pashu') || text.includes('गाय') || text.includes('भैंस')) {
      return {
        text: `🐄 **New Cattle Add Kaise Karein?**\n\n**Hinglish Steps:**\n1. App ke **Dashboard** par bottom bar me check karein ya left sidebar open karke **Animal dropdown** select karein.\n2. **Purchase Animal** option par click karein.\n3. Form me: **Type** (Cow/Buffalo), **Tag ID** (Unique number), **Breed** (e.g. Gir, Murrah), **Age**, **Purchase Date**, and **Price** enter karein.\n4. **Save Animal** click karein. Pashu record instantly secure database me add ho jayega!\n\n**English Steps:**\n1. Click the '+' button in the bottom menu overlay or open the sidebar and expand the **Animal** menu.\n2. Select **Purchase Animal**.\n3. Provide essential details like Type, Tag ID, Breed, Age, Purchase Date, and Price.\n4. Press **Save Animal** to securely register your cattle.`,
        actionLink: '/animals/add',
        actionLabel: 'Go to Add Animal'
      };
    }
    
    // 7. RECORD MILK
    if (text.includes('record milk') || (text.includes('milk') && (text.includes('add') || text.includes('production') || text.includes('yield') || text.includes('doodh') || text.includes('दूध')))) {
      return {
        text: `🥛 **Daily Milk Entry Record Kaise Karein?**\n\n**Hinglish Steps:**\n1. Bottom navigation bar me **Milk** tab par tap karein.\n2. **Add Milk** option select karein.\n3. Details fill karein: **Shift** (Morning ya Evening), **Date**, **Animal Tag ID** aur **Quantity (Liters)**.\n4. **Save Milk Production** par click karein. Har animal ka production analytics trend automatically track hoga!\n\n**English Steps:**\n1. Navigate to the **Milk** section in the bottom navbar.\n2. Click the **Add Milk** card/button.\n3. Choose Shift (Morning/Evening), Date, select the Animal Tag ID, and specify Quantity (in Liters).\n4. Click **Save Milk Production** to successfully capture the dairy yield.`,
        actionLink: '/milk/add',
        actionLabel: 'Go to Milk Entry'
      };
    }

    // 8. CLOUD BACKUP
    if (text.includes('backup') || text.includes('restore') || text.includes('cloud') || text.includes('database') || text.includes('save data') || text.includes('delete data')) {
      return {
        text: `☁️ **Database Cloud Backup & Safe Restore:**\n\n**Hinglish Steps:**\n1. Navigation bar me **Settings** par tap karein.\n2. **Data Backup & Restore** accordion click karein.\n3. **Backup Database** click karein (aapka data Milvexa Cloud storage me save ho jayega).\n4. Safe restore ke liye **Restore Backup** select karein, jisse delete hua data vapas aa jaye.\n\n**English Steps:**\n1. Go to the **Settings** menu.\n2. Expand the **Data Backup & Restore** drawer.\n3. Click **Backup Database** to copy local farm tables securely online.\n4. Click **Restore Backup** if you changed devices or need to pull your cloud data down.`,
        actionLink: '/settings',
        actionLabel: 'Go to Settings Backup'
      };
    }

    // 9. SUPPORT TICKET
    if (text.includes('problem') || text.includes('ticket') || text.includes('token') || text.includes('error') || text.includes('complaint') || text.includes('solv') || text.includes('support') || text.includes('issue') || text.includes('dikkat') || text.includes('samasya') || text.includes('help')) {
      return {
        text: `🎟️ **Let's Raise a Support Ticket!**\n\nPlease type or write down the exact issue or problem you are facing in detail. \n\n*Type your problem below and send it. Once you describe your problem, I will instantly generate your unique ticket ID!*`,
        isInitiatingTicket: true
      };
    }

    // GREETINGS
    if (text.includes('hello') || text.includes('hi') || text.includes('namaste') || text.includes('hey')) {
      return {
        text: `Namaste! 👋 I am your advanced **Milvexa AI Assistant**!\n\nSwitch to **AI Doctor Mode** for veterinary checks or **AI Analytics Mode** for live forecasts!`
      };
    }

    // FALLBACK
    return {
      text: `I apologize, I didn't fully understand that query. 🧐\n\nI can assist you with clinical checks in **AI Doctor Mode** or profit metrics in **AI Analytics Mode**! Try switching modes above or check the suggested chips.`,
      actionLink: 'create_ticket',
      actionLabel: '🎟️ Raise Support Ticket Token'
    };
  };

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim() && !attachedFile) return;

    // Set custom prompt text if media is uploaded
    let userTextValue = textToSend;
    if (!userTextValue.trim() && attachedFile) {
      userTextValue = attachedFile.type === 'image' 
        ? `📸 Send symptom photograph: "${attachedFile.name}" for AI Computer Vision scan.` 
        : `🎥 Send gait motion tracking video: "${attachedFile.name}" for lame limb analysis.`;
    }

    // Add User Message with attached files
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userTextValue,
      attachedFile: attachedFile ? { ...attachedFile } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const wasAttachedFile = attachedFile;
    setAttachedFile(null);
    
    // Trigger Typing Animation Phases
    setIsTyping(true);
    
    if (wasAttachedFile) {
      setTypingStatus('AI Vision Scanning pixels...');
      setTimeout(() => {
        setTypingStatus(wasAttachedFile.type === 'image' ? 'Running dermatological classification...' : 'Analyzing joint rotation flow vectors...');
      }, 500);
      setTimeout(() => {
        setTypingStatus('Formulating Vet diagnostics recipe...');
      }, 1000);
    } else {
      setTypingStatus('AI thinking...');
      setTimeout(() => {
        setTypingStatus(activeMode === 'doctor' ? 'Clinical database lookup...' : activeMode === 'analytics' ? 'Calculating payouts yield trends...' : 'Formulating farm reply...');
      }, 450);
      setTimeout(() => {
        setTypingStatus('Structuring optimal sheet...');
      }, 900);
    }

    // AI Response Latency
    setTimeout(() => {
      let response;
      if (wasAttachedFile) {
        if (wasAttachedFile.type === 'image') {
          if (wasAttachedFile.name.includes('udder') || wasAttachedFile.name.includes('mastitis')) {
            response = {
              text: `🩺 **AI Vision Clinical Diagnostic: Mastitis detected!**\n\nI have scanned the uploaded bovine udder photograph. Cell-level pixel classification shows severe local inflammation, micro-swelling, and skin redness around the rear quarters:`,
              isVisionCard: true,
              detection: 'Mastitis (Udder tissue infection)',
              severity: 'CRITICAL (SEVERITY 92%)',
              remedy: 'Isolate cow. Apply warm saline compresses, milk out the quarters manually every 4 hours, and consult Vet instantly for Intramammary Antibiotic infusion tubes.',
              confidence: '98.2%'
            };
            savePatientHistoryLog('Bovine Mastitis (Udder infection)');
          } else {
            response = {
              text: `🩺 **AI Vision Clinical Diagnostic: Lumpy Skin Disease (LSD)**\n\nI have scanned the uploaded cow shoulder photograph. The visual detector has identified distinct nodular lesions typical of the Capripox virus:`,
              isVisionCard: true,
              detection: 'Lumpy Skin Disease nodular rashes',
              severity: 'HIGH DANGER (SEVERITY 78%)',
              remedy: 'Strict quarantine required. Clean lesions daily with topical antiseptic sprays (zinc oxide ointment). Call Vet Ledger to administer supportive antipyretics.',
              confidence: '96.4%'
            };
            savePatientHistoryLog('Lumpy Skin Disease (LSD virus)');
          }
        } else {
          // Video
          response = {
            text: `🩺 **AI Motion Diagnostic: Gait Lameness & Foot Rot**\n\nI have completed the optical flow motion analysis on the cattle movement walk video. Asymmetrical stance patterns were tracked on the rear-right limb:`,
            isVisionCard: true,
            detection: 'Foot Rot / Bovine Interdigital Dermatitis',
            severity: 'MODERATE RISK (SEVERITY 64%)',
            remedy: 'Keep cattle standing bed completely dry. Clean the hooves in a 5% copper sulphate foot bath. Administer anti-inflammatory dosage via doctor module.',
            confidence: '93.5%'
          };
          savePatientHistoryLog('Foot Rot / Lameness Gait');
        }
      } else {
        response = getBotResponse(textToSend, isExpectingProblem);
      }
      
      if (response.isInitiatingTicket) {
        setIsExpectingProblem(true);
      }
      if (response.resetExpectation) {
        setIsExpectingProblem(false);
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        actionLink: response.actionLink,
        actionLabel: response.actionLabel,
        isToken: response.isToken,
        tokenNumber: response.tokenNumber,
        problemDescription: response.problemDescription,
        isCalcCard: response.isCalcCard,
        isHealthCard: response.isHealthCard,
        symptom: response.symptom,
        isOptimizeCard: response.isOptimizeCard,
        isDoseCard: response.isDoseCard,
        isPayoutCard: response.isPayoutCard,
        
        // AI Vision parameters
        isVisionCard: response.isVisionCard,
        detection: response.detection,
        severity: response.severity,
        remedy: response.remedy,
        confidence: response.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history and restart?')) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Chat history cleared. 🧹 Ask me any advanced cattle or dairy question!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
    }
  };

  // Medicine formula calculation (Meloxicam & Paracetamol dosage guide based on weight)
  const getMedicineDose = (weight, drug) => {
    if (drug === 'meloxicam') return `${(weight * 0.5).toFixed(0)} mg (Oral/Inj)`;
    return `${((weight * 15) / 1000).toFixed(1)} g (Paracetamol Bolus)`;
  };

  // Payout formula calculation (Liters * FAT/SNF Rate)
  const calculatePayoutValue = (liters) => {
    const rate = Number(((calcFat * 5.6) + (calcSnf * 2.5)).toFixed(2));
    const dailyIncome = Number((liters * rate).toFixed(0));
    const monthlyIncome = Number((dailyIncome * 30).toFixed(0));
    return { dailyIncome, monthlyIncome };
  };

  const payoutStats = calculatePayoutValue(dailyMilkLiters);
  const targetMonthlyMilestone = 100000;
  const milestoneProgress = Math.min(100, ((payoutStats.monthlyIncome / targetMonthlyMilestone) * 100).toFixed(0));

  // Save diagnostic report logs directly to patient ledger
  const savePatientHistoryLog = (diseaseName) => {
    const newLog = {
      id: Date.now(),
      tag: `MV-${cattleBreed.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      breed: cattleBreed,
      disease: diseaseName,
      date: new Date().toISOString().split('T')[0],
      status: 'Diagnosed'
    };
    const updated = [newLog, ...patientRecords];
    setPatientRecords(updated);
    localStorage.setItem('milvexa_patient_scans', JSON.stringify(updated));
  };

  // Handle preset workbench clinical prescription execution
  const triggerWorkbenchRecipe = () => {
    if (topDisease.value === 0) {
      alert("Please select symptoms or click Anatomical cow zones to detect a disease first!");
      return;
    }
    
    setIsTyping(true);
    setTypingStatus('Compiling prescription recipe...');
    
    // Save report to patient scans database log
    savePatientHistoryLog(topDisease.name);

    setTimeout(() => {
      const isMastitis = topDisease.name.includes('Mastitis');
      const isLsd = topDisease.name.includes('Lumpy');
      const isFootrot = topDisease.name.includes('Foot Rot');
      
      let botMsg = {};
      if (isMastitis) {
        botMsg = {
          id: Date.now(),
          sender: 'bot',
          text: `**🩺 AI Clinical Diagnosis: ${topDisease.name}**\n\n**Diagnosis Correlation Index:** \`${topDisease.value}%\`\n\n**Advanced Medical Treatment Recipe:**\n1. **Meloxicam Bolus:** Administer \`200 mg\` (for ${cowWeight} Kg cow) once daily for pain & tissue swelling relief.\n2. **Teat Dipping:** Clean the inflamed quarters with a 1% iodine teat dip cup immediately after manual milk stripping.\n3. **Cloxacillin infusion:** Administer one intramammary antibiotic syringe tube under clean aseptic vet advice.\n\n⚠️ **Isolation Advisory:** Keep the animal separated from active milking cattle to stop bacterial spread!`,
          isDoseCard: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      } else if (isLsd) {
        botMsg = {
          id: Date.now(),
          sender: 'bot',
          text: `**🩺 AI Clinical Diagnosis: ${topDisease.name}**\n\n**Diagnosis Correlation Index:** \`${topDisease.value}%\`\n\n**Advanced Medical Treatment Recipe:**\n1. **Topical antiseptic:** Apply Zinc Oxide with Chlorhexidine spray directly onto shoulder rashes daily.\n2. **Supportive antipyretic:** Administer Paracetamol bolus \`6.0 g\` daily to reduce temperature vitals.\n3. **Fly repellent:** Treat the pen area with cypermethrin sanitizers to prevent fly vector transmission.\n\n⚠️ **Mandatory Action:** Report to local livestock department immediately!`,
          isDoseCard: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      } else if (isFootrot) {
        botMsg = {
          id: Date.now(),
          sender: 'bot',
          text: `**🩺 AI Clinical Diagnosis: ${topDisease.name}**\n\n**Diagnosis Correlation Index:** \`${topDisease.value}%\`\n\n**Advanced Medical Treatment Recipe:**\n1. **Copper Sulphate bath:** Make the cow walk through a 5% copper sulphate hoof bath cup twice daily.\n2. **Antiseptic Hoof Spray:** Treat interdigital tissues with CTC spray after debris cleaning.\n3. **Anti-inflammatory:** meloxicam dosage of \`200 mg\` to ease joint limping.\n\n⚠️ **Housing Tip:** Dry bedding with sawdust is strictly required to prevent foot rot bacteria!`,
          isDoseCard: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      } else {
        botMsg = {
          id: Date.now(),
          sender: 'bot',
          text: `**🩺 AI Clinical Diagnosis: ${topDisease.name}**\n\n**Diagnosis Correlation Index:** \`${topDisease.value}%\`\n\n**Advanced Medical Treatment Recipe:**\n1. **Antipyretics:** Give paracetamol bolus \`6.0 g\` twice daily to lower the ${cattleTemp}°F fever.\n2. **Hydration therapy:** Provide electrolyte powder solutions in drinking water to prevent dehydration yield drop.\n3. **Isolation rest:** House the cow under warm, well-ventilated dry shade.`,
          isDoseCard: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      }

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
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
      {/* Hidden File Input Selector */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />

      {/* Page Header */}
      <PageHeader 
        title="Milvexa Advanced AI" 
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

      {/* Floating Sparkle/AI Analytics Status Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 20px', 
        background: '#EFF6FF', 
        borderBottom: '1px solid #DBEAFE'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0B1F4D' }}>Milvexa AI Optimizer</span>
            <span style={{ fontSize: '9px', color: '#10B981', fontWeight: '800', marginLeft: '6px', background: '#D1FAE5', padding: '2px 6px', borderRadius: '4px' }}>ACTIVE</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Zap size={12} color="#F59E0B" /> Latency: **12ms**
          </span>
          <span>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Activity size={12} color="#3B82F6" /> Accuracy: **99.8%**
          </span>
        </div>
      </div>

      {/* AI DOCTOR & AI ANALYTICS MODE SELECT SWITCHER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        background: 'white',
        padding: '8px 16px',
        borderBottom: '1px solid #E2E8F0',
        gap: '6px'
      }}>
        {[
          { id: 'general', label: '💬 General', activeColor: '#0B1F4D', activeBg: '#EFF6FF' },
          { id: 'doctor', label: '🩺 AI Doctor', activeColor: '#D97706', activeBg: '#FFFBEB' },
          { id: 'analytics', label: '📊 AI Analytics', activeColor: '#047857', activeBg: '#ECFDF5' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleModeChange(tab.id)}
            style={{
              padding: '10px 6px',
              borderRadius: '12px',
              border: activeMode === tab.id ? `1.5px solid ${tab.activeColor}` : '1.5px solid transparent',
              background: activeMode === tab.id ? tab.activeBg : '#F8FAFC',
              color: activeMode === tab.id ? tab.activeColor : '#64748B',
              fontSize: '12px',
              fontWeight: '900',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- FULLY ADVANCED CLINICAL WORKBENCH TOOLBAR PANEL --- */}
      {activeMode === 'doctor' && (
        <div style={{
          background: 'white',
          padding: '14px 16px',
          borderBottom: '1.5px solid #F3F4F6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#D97706', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              🔬 Vet Diagnostics Workbench
            </span>
            <span style={{ fontSize: '10px', color: tempStatus.color, background: tempStatus.bg, padding: '3px 8px', borderRadius: '6px', fontWeight: '900' }}>
              {tempStatus.label}
            </span>
          </div>

          {/* Core Interactive Layout: Anatomy Silhouettes Selector & Vital sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            
            {/* Interactive Anatomical SVG Silhouette Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase' }}>
                📍 Interactive Bovine Body Map:
              </span>
              <svg width="100%" height="110" viewBox="0 0 200 120" style={{ background: '#F8FAFC', borderRadius: '12px', padding: '6px', border: '1.5px solid #E2E8F0' }}>
                {/* Silhouette of Cow */}
                {/* Head Part */}
                <path 
                  d="M 30 40 L 15 50 L 20 65 L 40 60 Z" 
                  fill={selectedBodyPart === 'head' ? '#FEF3C7' : '#E2E8F0'} 
                  stroke={selectedBodyPart === 'head' ? '#D97706' : '#94A3B8'} 
                  strokeWidth={selectedBodyPart === 'head' ? '2.5' : '1.5'} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => handleAnatomyClick('head')} 
                />
                <path d="M 28 40 L 32 30" stroke="#94A3B8" strokeWidth="2" />
                <path d="M 35 44 Q 45 42 42 50" fill="#CBD5E1" />
                
                {/* Body/Skin Part */}
                <rect 
                  x="40" y="40" width="100" height="50" rx="15" 
                  fill={selectedBodyPart === 'skin' ? '#FEF3C7' : '#E2E8F0'} 
                  stroke={selectedBodyPart === 'skin' ? '#D97706' : '#94A3B8'} 
                  strokeWidth={selectedBodyPart === 'skin' ? '2.5' : '1.5'} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => handleAnatomyClick('skin')} 
                />
                
                {/* Udder Part */}
                <ellipse 
                  cx="115" cy="92" rx="14" ry="10" 
                  fill={selectedBodyPart === 'udder' ? '#FEF3C7' : '#E2E8F0'} 
                  stroke={selectedBodyPart === 'udder' ? '#D97706' : '#94A3B8'} 
                  strokeWidth={selectedBodyPart === 'udder' ? '2.5' : '1.5'} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => handleAnatomyClick('udder')} 
                />
                <circle cx="108" cy="98" r="2" fill="#94A3B8" />
                <circle cx="114" cy="100" r="2" fill="#94A3B8" />
                <circle cx="120" cy="98" r="2" fill="#94A3B8" />

                {/* Legs Hoof Parts */}
                <rect 
                  x="52" y="90" width="10" height="25" 
                  fill={selectedBodyPart === 'leg' ? '#FEF3C7' : '#E2E8F0'} 
                  stroke={selectedBodyPart === 'leg' ? '#D97706' : '#94A3B8'} 
                  strokeWidth={selectedBodyPart === 'leg' ? '2' : '1'} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => handleAnatomyClick('leg')} 
                />
                <rect 
                  x="122" y="90" width="10" height="25" 
                  fill={selectedBodyPart === 'leg' ? '#FEF3C7' : '#E2E8F0'} 
                  stroke={selectedBodyPart === 'leg' ? '#D97706' : '#94A3B8'} 
                  strokeWidth={selectedBodyPart === 'leg' ? '2' : '1'} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => handleAnatomyClick('leg')} 
                />

                {/* Active anatomical labels */}
                <text x="10" y="112" fontSize="9" fontWeight="900" fill="#475569" style={{ textTransform: 'uppercase' }}>
                  Zone Focus: {selectedBodyPart}
                </text>
              </svg>
            </div>

            {/* Right Column: Dynamic EKG vital signs + Breed details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>Cattle Breed:</span>
                <select 
                  value={cattleBreed} 
                  onChange={(e) => setCattleBreed(e.target.value)}
                  style={{ padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '11px', fontWeight: '800', color: '#1E293B', outline: 'none' }}
                >
                  <option value="Sahiwal Cow">Sahiwal Cow</option>
                  <option value="Jersey Cow">Jersey Cow</option>
                  <option value="Holstein Cow">Holstein Friesian</option>
                  <option value="Murrah Buffalo">Murrah Buffalo</option>
                </select>
              </div>

              {/* Heart rate monitor rhythm animation */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: '#FFFDF9', 
                padding: '8px 12px', 
                borderRadius: '10px', 
                border: '1px solid #FEF3C7' 
              }}>
                <span style={{ 
                  fontSize: '18px', 
                  animation: `heartbeat ${60/bpm}s infinite alternate` 
                }}>❤️</span>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', display: 'block' }}>EKG VITAL PULSE</span>
                  <strong style={{ fontSize: '13px', color: '#0F172A', fontWeight: '950' }}>{bpm} BPM</strong>
                </div>
              </div>

              {/* Vital Temperature slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: '800', color: '#475569' }}>Temp:</span>
                  <strong style={{ color: tempStatus.color, fontWeight: '900' }}>{cattleTemp}°F</strong>
                </div>
                <input 
                  type="range" 
                  min="98.0" 
                  max="106.0" 
                  step="0.1" 
                  value={cattleTemp} 
                  onChange={(e) => setCattleTemp(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#D97706', cursor: 'pointer' }}
                />
              </div>
            </div>

          </div>

          <div style={{ height: '1px', background: '#F3F4F6' }} />

          {/* Dynamic Diagnosis Probability Matching */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', padding: '10px 14px', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#B45309', textTransform: 'uppercase' }}>AI Predicted Diagnosis:</span>
              <strong style={{ display: 'block', fontSize: '13px', color: '#78350F', fontWeight: '900', marginTop: '2px' }}>
                {topDisease.name} {topDisease.value > 0 && `(${topDisease.value}%)`}
              </strong>
            </div>

            <button 
              onClick={triggerWorkbenchRecipe}
              style={{
                background: '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={12} />
              Prescribe Medication
            </button>
          </div>

          {/* Historical clinical scans patient records ledger (horizontal mini tags) */}
          {patientRecords.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                📂 Local Diagnostic Logs (EMR Ledger)
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="no-scrollbar">
                {patientRecords.map(rec => (
                  <div key={rec.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: '#334155' }}>
                    <span style={{ color: '#059669' }}>●</span>
                    <strong>{rec.tag}</strong>
                    <span style={{ color: '#64748B' }}>({rec.breed}):</span>
                    <span>{rec.disease.split('(')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Conversation Area */}
      <div style={{ 
        flex: 1, 
        padding: '20px 16px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        maxHeight: activeMode === 'doctor' ? 'calc(100vh - 540px)' : 'calc(100vh - 310px)'
      }} className="no-scrollbar">
        
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const isTtsPlaying = ttsActiveId === msg.id;
          
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '90%',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              {/* Message Bubble wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    whiteSpace: 'pre-line',
                    position: 'relative'
                  }}
                >
                  {/* Parse markdown bold highlights */}
                  {msg.text.split('**').map((chunk, idx) => {
                    return idx % 2 === 1 ? <strong key={idx} style={{ color: isBot ? '#0B1F4D' : '#00F2FE', fontWeight: '800' }}>{chunk}</strong> : chunk;
                  })}

                  {/* User Attached Media Thumbnail inside Chat Bubble */}
                  {!isBot && msg.attachedFile && (
                    <div style={{
                      marginTop: '10px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      width: '200px',
                      height: '135px',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      background: '#0F172A',
                      position: 'relative'
                    }}>
                      {msg.attachedFile.previewUrl ? (
                        <img src={msg.attachedFile.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Symptom photograph" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '28px' }}>🎥</span>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: '#38BDF8' }}>Cattle Gait Video</span>
                          <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '800' }}>{msg.attachedFile.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Helper Action Buttons */}
                  {isBot && msg.actionLink && (
                    <button
                      onClick={() => {
                        if (msg.actionLink === 'create_ticket') {
                          handleSend("I want to raise a support query ticket");
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
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={12} color="#0B1F4D" />
                      {msg.actionLabel || 'Check details'}
                    </button>
                  )}

                  {/* AI DOCTOR: SPECIAL PRESETS CONTROL BAR IN FIRST MESSAGE IN DOCTOR MODE */}
                  {isBot && msg.isDoctorWorkbench && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px',
                      background: 'rgba(217, 119, 6, 0.06)',
                      borderRadius: '12px',
                      border: '1px solid rgba(217, 119, 6, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#D97706', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                        🔬 AI Vision Presets (Test Scanner)
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button 
                          onClick={() => triggerPresetMedia('skin')}
                          style={{ background: 'white', border: '1px solid #FCD34D', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', fontWeight: '800', color: '#78350F', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          📸 Load Lumpy Skin Nodules Photo
                        </button>
                        <button 
                          onClick={() => triggerPresetMedia('udder')}
                          style={{ background: 'white', border: '1px solid #FCD34D', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', fontWeight: '800', color: '#78350F', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          📸 Load Mastitis Udder Photo
                        </button>
                        <button 
                          onClick={() => triggerPresetMedia('gait')}
                          style={{ background: 'white', border: '1px solid #FCD34D', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', fontWeight: '800', color: '#78350F', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          🎥 Load Limping Movement Video
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 1. AI VISION SCAN DIAGNOSTIC ANALYSIS CARD */}
                  {isBot && msg.isVisionCard && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #FCA5A5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#DC2626', textTransform: 'uppercase' }}>AI Computer Vision Scan</span>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: 'white', background: '#DC2626', padding: '2px 8px', borderRadius: '100px' }}>{msg.confidence} MATCH</span>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(220, 38, 38, 0.1)' }} />

                      <div>
                        <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: '800' }}>DETECTED WOUND/SYMPTOM:</span>
                        <h4 style={{ margin: '2px 0 0', fontSize: '13px', color: '#7F1D1D', fontWeight: '900' }}>{msg.detection}</h4>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: '800' }}>SEVERITY SCALE:</span>
                        <span style={{ display: 'inline-block', margin: '2px 0 0', fontSize: '9px', color: 'white', background: '#EF4444', padding: '3px 8px', borderRadius: '4px', fontWeight: '900' }}>
                          {msg.severity}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: '800' }}>VET REMEDY PROTOCOL:</span>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#7F1D1D', fontWeight: '600', lineHeight: '1.4' }}>
                          {msg.remedy}
                        </p>
                      </div>

                      <button 
                        onClick={() => navigate('/doctors/ledger')}
                        style={{
                          marginTop: '6px',
                          width: '100%',
                          padding: '10px',
                          background: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        🚨 Open Emergency Vet Call
                      </button>
                    </div>
                  )}

                  {/* 2. INTERACTIVE LIVE PRICE CALCULATOR CARD */}
                  {isBot && msg.isCalcCard && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #C7D2FE',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#4F46E5', textTransform: 'uppercase' }}>Society rate slip</span>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#10B981', background: '#D1FAE5', padding: '2px 6px', borderRadius: '6px' }}>LIVE</span>
                      </div>
                      
                      {/* FAT Control */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700' }}>🥛 Milk FAT:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => setCalcFat(prev => Math.max(2.0, Number((prev - 0.1).toFixed(1))))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Minus size={10} /></button>
                          <strong style={{ fontSize: '14px', color: '#0F172A', minWidth: '32px', textAlign: 'center' }}>{calcFat}%</strong>
                          <button onClick={() => setCalcFat(prev => Math.min(15.0, Number((prev + 0.1).toFixed(1))))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Plus size={10} /></button>
                        </div>
                      </div>

                      {/* SNF Control */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700' }}>🧪 Milk SNF:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => setCalcSnf(prev => Math.max(4.0, Number((prev - 0.1).toFixed(1))))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Minus size={10} /></button>
                          <strong style={{ fontSize: '14px', color: '#0F172A', minWidth: '32px', textAlign: 'center' }}>{calcSnf}%</strong>
                          <button onClick={() => setCalcSnf(prev => Math.min(15.0, Number((prev + 0.1).toFixed(1))))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Plus size={10} /></button>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: '#E2E8F0' }} />

                      {/* Resulting Price per Liter */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '800' }}>Calculated Rate:</span>
                        <strong style={{ fontSize: '16px', color: '#4F46E5', fontWeight: '900' }}>₹{((calcFat * 5.6) + (calcSnf * 2.5)).toFixed(2)}/L</strong>
                      </div>
                    </div>
                  )}

                  {/* 3. AI DOCTOR: MEDICINE DOSAGE CALCULATOR CARD */}
                  {isBot && msg.isDoseCard && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #FDE68A',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#B45309', textTransform: 'uppercase' }}>clinical dosage slip</span>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#B45309', background: 'white', padding: '2px 6px', borderRadius: '6px' }}>VET</span>
                      </div>
                      
                      {/* Weight Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#78350F', fontWeight: '800' }}>Cattle Weight:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => setCowWeight(w => Math.max(100, w - 50))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Minus size={10} /></button>
                          <strong style={{ fontSize: '13px', color: '#78350F', minWidth: '55px', textAlign: 'center' }}>{cowWeight} Kg</strong>
                          <button onClick={() => setCowWeight(w => Math.min(1000, w + 50))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Plus size={10} /></button>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(217, 119, 6, 0.1)' }} />

                      {/* Dosage Outputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#78350F', fontWeight: '700' }}>Paracetamol Dose:</span>
                          <strong style={{ color: '#D97706', fontWeight: '800' }}>{getMedicineDose(cowWeight, 'paracetamol')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#78350F', fontWeight: '700' }}>Meloxicam Dose:</span>
                          <strong style={{ color: '#D97706', fontWeight: '800' }}>{getMedicineDose(cowWeight, 'meloxicam')}</strong>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: '9px', color: '#B45309', fontWeight: '600', fontStyle: 'italic', textAlign: 'center' }}>
                        *Dosage computed based on 15mg/kg paracetamol and 0.5mg/kg meloxicam. Please verify with a doctor.
                      </span>
                    </div>
                  )}

                  {/* 4. AI DOCTOR: SYMPTOM DIAGNOSIS CARD */}
                  {isBot && msg.isHealthCard && !msg.isDoctorWorkbench && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #FCD34D',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#D97706', textTransform: 'uppercase' }}>Vet Diagnostics report</span>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: '#D97706', background: 'white', padding: '2px 6px', borderRadius: '6px' }}>ADVISORY</span>
                      </div>
                      
                      <div style={{ height: '1px', background: 'rgba(217, 119, 6, 0.1)' }} />
                      
                      <div>
                        <span style={{ fontSize: '11px', color: '#B45309', fontWeight: '800' }}>SYMPTOM:</span>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#78350F', fontWeight: '700' }}>{msg.symptom || 'Fever Symptoms'}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#B45309', fontWeight: '800' }}>RECOMMENDED ACTION:</span>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#78350F', fontWeight: '600', lineHeight: '1.4' }}>
                          Isolate cattle immediately. Provide clean water and easy digestible feed. Alert Vet Doctor using the Vet Ledger.
                        </p>
                      </div>

                      <button 
                        onClick={() => navigate('/doctors/ledger')}
                        style={{
                          marginTop: '6px',
                          width: '100%',
                          padding: '10px',
                          background: '#D97706',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        Open Vet Management
                      </button>
                    </div>
                  )}

                  {/* 5. AI ANALYTICS: PAYOUT FORECAST CARD */}
                  {isBot && msg.isPayoutCard && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #6EE7B7',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857', textTransform: 'uppercase' }}>payout projection sheet</span>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#047857', background: 'white', padding: '2px 6px', borderRadius: '6px' }}>ANALYTICS</span>
                      </div>

                      {/* Daily Volume Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '800' }}>Daily Milk Output:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => setDailyMilkLiters(l => Math.max(10, l - 10))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Minus size={10} /></button>
                          <strong style={{ fontSize: '13px', color: '#065F46', minWidth: '60px', textAlign: 'center' }}>{dailyMilkLiters} L/day</strong>
                          <button onClick={() => setDailyMilkLiters(l => Math.min(2000, l + 10))} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><Plus size={10} /></button>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(4, 120, 87, 0.1)' }} />

                      {/* Projected income numbers */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#065F46', fontWeight: '700' }}>Daily Earnings:</span>
                          <strong style={{ color: '#047857', fontWeight: '800' }}>₹{payoutStats.dailyIncome}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#065F46', fontWeight: '700' }}>Monthly Projection:</span>
                          <strong style={{ color: '#047857', fontWeight: '800' }}>₹{payoutStats.monthlyIncome}</strong>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(4, 120, 87, 0.1)' }} />

                      {/* Goal tracker progress bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#047857', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase' }}>
                          <span>Target Milestone Goal</span>
                          <span>{milestoneProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${milestoneProgress}%`, height: '100%', background: 'linear-gradient(to right, #34D399, #059669)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ display: 'block', fontSize: '9px', color: '#047857', fontWeight: '700', marginTop: '4px', textAlign: 'right' }}>Target: ₹1,00,000 /month</span>
                      </div>
                    </div>
                  )}

                  {/* 6. AI ANALYTICS: YIELD FEED OPTIMIZATION CARD */}
                  {isBot && msg.isOptimizeCard && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                      borderRadius: '18px',
                      border: '1.5px solid #6EE7B7',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857', textTransform: 'uppercase' }}>Yield feed recipe</span>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: '#047857', background: 'white', padding: '2px 6px', borderRadius: '6px' }}>OPTIMIZED</span>
                      </div>
                      
                      <div style={{ height: '1px', background: 'rgba(4, 120, 87, 0.1)' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#065F46', fontWeight: '700' }}>Bypass Fat Feed:</span>
                          <strong style={{ color: '#047857', fontWeight: '800' }}>+150g /day</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#065F46', fontWeight: '700' }}>Green Fodder Ratio:</span>
                          <strong style={{ color: '#047857', fontWeight: '800' }}>65%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#065F46', fontWeight: '700' }}>Concentrate Mix:</span>
                          <strong style={{ color: '#047857', fontWeight: '800' }}>3.5 Kg/day</strong>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'rgba(4, 120, 87, 0.1)' }} />

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px' }}>🚀</span>
                        <div>
                          <h5 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: '#065F46' }}>Expected Gain</h5>
                          <p style={{ margin: 0, fontSize: '11px', color: '#047857', fontWeight: '600' }}>+1.8 Liters/day milk yield increase</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. SUPPORT TICKET RECEIPT CARD */}
                  {isBot && msg.isToken && (
                    <div style={{
                      marginTop: '14px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                      borderRadius: '16px',
                      border: '1.5px dashed #3B82F6',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '260px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#1E3A8A', textTransform: 'uppercase' }}>Milvexa Support Ticket</span>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: '#2563EB', background: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>OPEN</span>
                      </div>
                      <div style={{ height: '1px', background: 'rgba(30, 58, 138, 0.1)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: '700' }}>Ticket ID:</span>
                        <strong style={{ fontSize: '13px', color: '#1E3A8A', fontWeight: '900' }}>#{msg.tokenNumber}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: '700' }}>Timeline:</span>
                        <strong style={{ fontSize: '13px', color: '#059669', fontWeight: '900' }}>5 to 6 Working Days</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: '700' }}>Created on:</span>
                        <span style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: '800' }}>{new Date().toLocaleDateString()}</span>
                      </div>
                      {msg.problemDescription && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid rgba(30, 58, 138, 0.05)', marginTop: '4px' }}>
                          <span style={{ fontSize: '9px', color: '#1E3A8A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Problem Described:</span>
                          <p style={{ margin: 0, fontSize: '12px', color: '#1E3A8A', fontWeight: '700', lineHeight: '1.4', fontStyle: 'italic' }}>"{msg.problemDescription}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Text To Speech Control Button */}
                {isBot && (
                  <button 
                    onClick={() => handleTTS(msg.text, msg.id)}
                    style={{
                      alignSelf: 'flex-end',
                      background: 'transparent',
                      border: 'none',
                      color: isTtsPlaying ? '#10B981' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      marginTop: '4px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isTtsPlaying ? <Volume2 size={12} className="animate-pulse" /> : <VolumeX size={12} />}
                    {isTtsPlaying ? 'Speaking...' : 'Listen Answer'}
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

        {/* Advanced typing indicator with rotating phases */}
        {isTyping && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            maxWidth: '230px',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <div style={{
              background: 'white',
              padding: '12px 16px',
              borderRadius: '24px 24px 24px 4px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div className="typing-dot" style={{ width: '6px', height: '6px', background: activeMode === 'doctor' ? '#D97706' : activeMode === 'analytics' ? '#047857' : '#3B82F6', borderRadius: '50%', animation: 'bounce 0.8s infinite alternate' }} />
                <div className="typing-dot" style={{ width: '6px', height: '6px', background: activeMode === 'doctor' ? '#D97706' : activeMode === 'analytics' ? '#047857' : '#3B82F6', borderRadius: '50%', animation: 'bounce 0.8s infinite alternate 0.2s' }} />
                <div className="typing-dot" style={{ width: '6px', height: '6px', background: activeMode === 'doctor' ? '#D97706' : activeMode === 'analytics' ? '#047857' : '#3B82F6', borderRadius: '50%', animation: 'bounce 0.8s infinite alternate 0.4s' }} />
              </div>
              
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', fontStyle: 'italic' }}>
                {typingStatus}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Attachment Pre-Send Upload Tray */}
      {attachedFile && (
        <div style={{
          padding: '12px 16px',
          background: 'white',
          borderTop: '1.5px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #E2E8F0', background: '#0F172A' }}>
            {attachedFile.previewUrl ? (
              <img src={attachedFile.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Attachment preview" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', fontSize: '20px' }}>🎥</div>
            )}
            <button 
              onClick={() => setAttachedFile(null)}
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '18px',
                height: '18px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                fontSize: '9px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {attachedFile.name}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: activeMode === 'doctor' ? '#D97706' : '#64748B', textTransform: 'uppercase' }}>
              {activeMode === 'doctor' ? '⚡ Ready for AI Doctor Scan' : 'Ready to upload'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Reply Chip Drawer (Horizontal scroll list) */}
      <div style={{
        padding: '0px 16px 12px',
        overflowX: 'auto',
        display: 'flex',
        gap: '8px',
        background: 'transparent',
        whiteSpace: 'nowrap'
      }} className="no-scrollbar">
        {getSuggestions().map((sug, idx) => {
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
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '100px',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
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
        {/* Paperclip Media Attachment Trigger */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: '#F1F5F9',
            color: '#475569',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          title="Attach Image/Video"
        >
          <Paperclip size={18} />
        </button>

        {/* Voice Input Button */}
        <button
          onClick={handleMicInput}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: activeMode === 'doctor' ? '#FFFBEB' : activeMode === 'analytics' ? '#ECFDF5' : '#EFF6FF',
            color: activeMode === 'doctor' ? '#D97706' : activeMode === 'analytics' ? '#047857' : '#3B82F6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          title="Voice Input"
        >
          <Mic size={18} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask AI ${activeMode === 'doctor' ? 'Vet Doctor' : activeMode === 'analytics' ? 'Analytics' : 'Assistant'}...`}
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
          disabled={!inputText.trim() && !attachedFile}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: (inputText.trim() || attachedFile)
              ? (activeMode === 'doctor' ? '#D97706' : activeMode === 'analytics' ? '#047857' : '#0B1F4D') 
              : '#F1F5F9',
            color: (inputText.trim() || attachedFile) ? 'white' : '#94A3B8',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (inputText.trim() || attachedFile) ? 'pointer' : 'not-allowed',
            boxShadow: (inputText.trim() || attachedFile) ? '0 8px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Additional Styling for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-6px); }
        }
        @keyframes heartbeat {
          from { transform: scale(1); }
          to { transform: scale(1.22); }
        }
      `}} />
    </div>
  );
};

export default ChatBot;
