import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const supabaseEnabled = !!supabase;

const fromRow = (row) => ({
  id: row.id,
  name: row.name,
  bank: row.bank,
  amount: Number(row.amount) || 0,
  dueDate: row.due_date,
  status: row.status,
  note: row.note || '',
  createdAt: row.created_at,
});

const toRow = (debt) => ({
  id: debt.id,
  name: debt.name,
  bank: debt.bank,
  amount: Number(debt.amount) || 0,
  due_date: debt.dueDate,
  status: debt.status,
  note: debt.note || '',
  created_at: debt.createdAt,
});

export const debtsApi = {
  async list() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromRow);
  },

  async insert(debt) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('debts')
      .insert(toRow(debt))
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async update(id, patch) {
    if (!supabase) throw new Error('Supabase not configured');
    const row = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.bank !== undefined) row.bank = patch.bank;
    if (patch.amount !== undefined) row.amount = Number(patch.amount) || 0;
    if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.note !== undefined) row.note = patch.note;
    const { data, error } = await supabase
      .from('debts')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async remove(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
  },

  async clearAll() {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('debts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  },

  async bulkInsert(debts) {
    if (!supabase) throw new Error('Supabase not configured');
    if (!debts.length) return [];
    const rows = debts.map(toRow);
    const { data, error } = await supabase
      .from('debts')
      .insert(rows)
      .select();
    if (error) throw error;
    return (data || []).map(fromRow);
  },
};
