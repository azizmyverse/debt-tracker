export const formatRupiah = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(num));
};

export const formatNumberID = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(Number(num));
};

// Parse user input "12.000" or "Rp 12.000" -> 12000
export const parseRupiahInput = (str) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const digits = String(str).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

// Convert ISO yyyy-mm-dd or Date -> "DD/MM/YYYY"
export const formatDateID = (input) => {
  if (!input) return '-';
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const toISODate = (input) => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const isoToday = () => toISODate(new Date());

export const daysUntil = (iso) => {
  if (!iso) return null;
  const due = new Date(iso);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
};

export const monthLabelID = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
};
