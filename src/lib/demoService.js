import { initialDemoData } from './initialDemoData';

const DEMO_STORAGE_KEY = 'smart_dairy_demo_data';
const DEMO_TIMESTAMP_KEY = 'smart_dairy_demo_timestamp';
const EXPIRY_DAYS = 7;

export const demoService = {
  // Initialize data if not exists or expired
  initialize: () => {
    const timestamp = localStorage.getItem(DEMO_TIMESTAMP_KEY);
    const now = Date.now();
    
    if (timestamp) {
      const daysSinceInit = (now - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
      if (daysSinceInit > EXPIRY_DAYS) {
        console.log('Demo data expired. Resetting...');
        localStorage.removeItem(DEMO_STORAGE_KEY);
        localStorage.removeItem(DEMO_TIMESTAMP_KEY);
      }
    }

    if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialDemoData));
      localStorage.setItem(DEMO_TIMESTAMP_KEY, now.toString());
      console.log('Demo data initialized in localStorage.');
    }
  },

  getAllData: () => {
    const data = localStorage.getItem(DEMO_STORAGE_KEY);
    return data ? JSON.parse(data) : initialDemoData;
  },

  saveData: (data) => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  },

  // Generic CRUD
  getFromTable: (table) => {
    const data = demoService.getAllData();
    return data[table] || [];
  },

  insertIntoTable: (table, item) => {
    const data = demoService.getAllData();
    if (!data[table]) data[table] = [];
    const newItem = { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    data[table].unshift(newItem);
    demoService.saveData(data);
    return { data: newItem, error: null };
  },

  updateInTable: (table, id, updates) => {
    const data = demoService.getAllData();
    if (!data[table]) return { error: { message: 'Table not found' } };
    
    data[table] = data[table].map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    demoService.saveData(data);
    return { error: null };
  },

  deleteFromTable: (table, id) => {
    const data = demoService.getAllData();
    if (!data[table]) return { error: { message: 'Table not found' } };
    
    data[table] = data[table].filter(item => item.id !== id);
    demoService.saveData(data);
    return { error: null };
  },

  // Specific queries that mimic Supabase select
  select: (table, options = {}) => {
    let list = demoService.getFromTable(table);
    
    // Simple filter simulation
    if (options.eq) {
      const [key, value] = options.eq;
      list = list.filter(item => item[key] === value);
    }
    if (options.neq) {
      const [key, value] = options.neq;
      list = list.filter(item => item[key] !== value);
    }
    
    return { data: list, error: null };
  }
};
