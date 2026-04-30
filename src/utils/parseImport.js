import { parseRupiahInput, toISODate } from './format.js';

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Parse a duration string like "25 hari lagi", "3 hari lewat", "Hari ini",
// "Lunas". Returns { dueDate: ISO yyyy-mm-dd, status: 'belum'|'lunas' }.
export const parseDuration = (text, today = new Date()) => {
  const t = (text || '').trim().toLowerCase();
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);

  if (!t) return null;
  if (t === 'lunas') {
    return { dueDate: toISODate(base), status: 'lunas' };
  }
  if (t === 'hari ini' || t === 'today') {
    return { dueDate: toISODate(base), status: 'belum' };
  }
  const lagi = t.match(/^(\d+)\s*hari\s*lagi$/);
  if (lagi) {
    return {
      dueDate: toISODate(addDays(base, parseInt(lagi[1], 10))),
      status: 'belum',
    };
  }
  const lewat = t.match(/^(\d+)\s*hari\s*(lewat|telat|lalu)$/);
  if (lewat) {
    return {
      dueDate: toISODate(addDays(base, -parseInt(lewat[1], 10))),
      status: 'belum',
    };
  }
  // Try ISO yyyy-mm-dd
  const iso = t.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return { dueDate: t, status: 'belum' };
  // Try DD/MM/YYYY
  const dmy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return {
      dueDate: `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`,
      status: 'belum',
    };
  }
  return null;
};

// Parse the import format:
//
//   NAME
//   | durasi | nominal | bank
//   | durasi | nominal | bank
//
// Multiple persons supported — any non-pipe non-empty line resets the current name.
// Returns { items: [{name, bank, amount, dueDate, status, raw}], errors: [{line, raw, reason}] }.
export const parseImportText = (text, today = new Date()) => {
  const items = [];
  const errors = [];
  if (!text || !text.trim()) return { items, errors };

  let currentName = '';
  const lines = text.split(/\r?\n/);

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith('|')) {
      if (!currentName) {
        errors.push({
          line: idx + 1,
          raw: rawLine,
          reason: 'Baris hutang muncul sebelum nama orang.',
        });
        return;
      }
      // Strip leading & trailing pipes, then split.
      const inner = line.replace(/^\|/, '').replace(/\|$/, '');
      const parts = inner.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length < 3) {
        errors.push({
          line: idx + 1,
          raw: rawLine,
          reason: 'Format minimal: | durasi | nominal | bank',
        });
        return;
      }
      const [durStr, amountStr, ...bankParts] = parts;
      const bank = bankParts.join(' ').trim();
      const amount = parseRupiahInput(amountStr);
      const dur = parseDuration(durStr, today);
      if (!dur) {
        errors.push({
          line: idx + 1,
          raw: rawLine,
          reason: `Durasi "${durStr}" tidak dikenali.`,
        });
        return;
      }
      if (!amount) {
        errors.push({
          line: idx + 1,
          raw: rawLine,
          reason: `Nominal "${amountStr}" tidak terbaca.`,
        });
        return;
      }
      if (!bank) {
        errors.push({
          line: idx + 1,
          raw: rawLine,
          reason: 'Nama bank kosong.',
        });
        return;
      }
      items.push({
        name: currentName,
        bank,
        amount,
        dueDate: dur.dueDate,
        status: dur.status,
        raw: rawLine,
      });
    } else {
      // Header line — new person name.
      currentName = line.replace(/[*•\-_]+\s*$/, '').trim();
    }
  });

  return { items, errors };
};
