import { supabase } from './supabase';
import { demoService } from './demoService';

export const dataService = (userId) => {
  const isDemo = userId === '00000000-0000-0000-0000-000000000000' || userId === 'demo-user';

  return {
    from: (table) => ({
      select: async (query = '*', options = {}) => {
        if (isDemo) {
          return demoService.select(table, options);
        }
        let q = supabase.from(table).select(query);
        if (options.eq) q = q.eq(options.eq[0], options.eq[1]);
        if (options.neq) q = q.neq(options.neq[0], options.neq[1]);
        if (options.order) q = q.order(options.order[0], { ascending: options.order[1]?.ascending });
        return await q;
      },
      insert: async (data) => {
        if (isDemo) {
          return demoService.insertIntoTable(table, Array.isArray(data) ? data[0] : data);
        }
        return await supabase.from(table).insert(data);
      },
      update: async (data, options = {}) => {
        if (isDemo) {
          // Simplistic ID based update for demo
          const id = data.id || options.id; 
          return demoService.updateInTable(table, id, data);
        }
        let q = supabase.from(table).update(data);
        if (options.eq) q = q.eq(options.eq[0], options.eq[1]);
        return await q;
      },
      delete: async (options = {}) => {
        if (isDemo) {
          return demoService.deleteFromTable(table, options.eq[1]);
        }
        let q = supabase.from(table).delete();
        if (options.eq) q = q.eq(options.eq[0], options.eq[1]);
        return await q;
      }
    })
  };
};
