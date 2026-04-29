// Initial demo data shown when the app is first opened.
const today = new Date();
const offsetIso = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const offsetMonthIso = (m, day = 15) => {
  const d = new Date(today.getFullYear(), today.getMonth() + m, day);
  return d.toISOString().split('T')[0];
};

let counter = 1;
const id = () => `seed-${counter++}`;

export const SEED_DEBTS = [
  {
    id: id(),
    name: 'Andi Wijaya',
    bank: 'BCA',
    amount: 12_500_000,
    dueDate: offsetIso(7),
    status: 'belum',
    note: 'Pinjaman renovasi rumah.',
    createdAt: offsetMonthIso(-2, 4),
  },
  {
    id: id(),
    name: 'Siti Rahma',
    bank: 'Mandiri',
    amount: 4_750_000,
    dueDate: offsetIso(-3),
    status: 'belum',
    note: 'Cicilan motor.',
    createdAt: offsetMonthIso(-1, 12),
  },
  {
    id: id(),
    name: 'Budi Santoso',
    bank: 'BNI',
    amount: 8_000_000,
    dueDate: offsetIso(20),
    status: 'lunas',
    note: '',
    createdAt: offsetMonthIso(-3, 8),
  },
  {
    id: id(),
    name: 'PT Nusantara Jaya',
    bank: 'BRI',
    amount: 25_000_000,
    dueDate: offsetIso(45),
    status: 'belum',
    note: 'Hutang dagang.',
    createdAt: offsetMonthIso(-1, 22),
  },
  {
    id: id(),
    name: 'Dewi Lestari',
    bank: 'CIMB Niaga',
    amount: 2_300_000,
    dueDate: offsetIso(-12),
    status: 'lunas',
    note: '',
    createdAt: offsetMonthIso(-4, 2),
  },
  {
    id: id(),
    name: 'Rian Pratama',
    bank: 'BTN',
    amount: 6_900_000,
    dueDate: offsetIso(2),
    status: 'belum',
    note: 'KPR tambahan.',
    createdAt: offsetMonthIso(0, 1),
  },
  {
    id: id(),
    name: 'Maya Putri',
    bank: 'BCA',
    amount: 1_500_000,
    dueDate: offsetIso(15),
    status: 'belum',
    note: '',
    createdAt: offsetMonthIso(-2, 19),
  },
  {
    id: id(),
    name: 'CV Sinar Abadi',
    bank: 'Mandiri',
    amount: 17_250_000,
    dueDate: offsetIso(60),
    status: 'belum',
    note: 'Termin pembayaran proyek.',
    createdAt: offsetMonthIso(-2, 25),
  },
  {
    id: id(),
    name: 'Toko Berkah',
    bank: 'BRI',
    amount: 3_400_000,
    dueDate: offsetIso(-25),
    status: 'lunas',
    note: '',
    createdAt: offsetMonthIso(-5, 10),
  },
];

export const BANKS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'BTN',
  'CIMB Niaga',
  'Permata',
  'Danamon',
  'BSI',
  'OCBC NISP',
  'Maybank',
  'Lainnya',
];
