# Debt Tracker — Premium SaaS Dashboard

A modern, clean, and highly-interactive debt tracking dashboard built with **React + Vite + TailwindCSS**. Designed in the spirit of premium fintech SaaS products (Stripe / Linear / Notion).

## Features

- **Dashboard** with hero highlight, animated stat cards (Total Hutang, Jumlah Data, Hutang Jatuh Tempo, Hutang Lunas), 6-month trend chart, and upcoming-due list.
- **Data Hutang** page with a modal form (Indonesian Rupiah auto-format, modern date picker, bank suggestions), realtime search, status filter, sortable columns, pagination, and overdue badges.
- **Analytics** page with bar chart (per-month), pie chart (status), line chart (paid vs unpaid), and a top-banks ranking — all with smooth animations.
- **Settings** page for theme switching, account info, and data management (reset to demo / clear all).
- **Login** page with glassmorphism, animated background, and hardcoded admin credentials persisted via `localStorage`.
- **Dark mode + light mode** with smooth transitions and persistent preference.
- **Toast notifications**, **confirmation dialogs**, **loading skeletons**, and **empty states**.
- Fully responsive — collapsible sidebar, mobile drawer, and adaptive layouts.

## Tech Stack

- React 19 + Vite
- TailwindCSS 3 (with custom `brand` / `ink` palettes, soft shadows, and animation utilities)
- React Router DOM 6
- Recharts for charts
- Lucide React for icons
- `clsx` for conditional class names
- `localStorage` for persistence (auth, debts, theme, sidebar state)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo credentials

```
Username: admin
Password: admin123
```

### Scripts

| Script           | Description                  |
| ---------------- | ---------------------------- |
| `npm run dev`    | Start the dev server         |
| `npm run build`  | Build for production         |
| `npm run lint`   | Run ESLint                   |
| `npm run preview`| Preview the production build |

## Project Structure

```
src/
├── components/         # UI building blocks
│   ├── ui/             # Modal, ConfirmDialog, Skeleton, EmptyState
│   ├── AppLayout.jsx
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── StatCard.jsx
│   ├── PageHeader.jsx
│   ├── Logo.jsx
│   ├── DebtForm.jsx
│   └── DebtTable.jsx
├── context/            # React contexts
│   ├── AuthContext.jsx
│   ├── DebtsContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── pages/              # Route-level pages
│   ├── Dashboard.jsx
│   ├── DataHutang.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   └── Login.jsx
├── hooks/
│   └── useCountUp.js
├── utils/
│   ├── format.js       # Rupiah, dates, numbers
│   └── cn.js
├── data/
│   └── seed.js         # Demo data
├── App.jsx             # Routes + ProtectedRoute
└── main.jsx            # Providers (Theme, Toast, Auth, Debts)
```

## License

MIT
