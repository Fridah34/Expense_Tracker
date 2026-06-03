import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { categoryAPI } from '../services/api';

import {
  Pizza, Coffee, UtensilsCrossed, Beer, Fish, Apple,
  Home, Zap, Droplets, Shirt, Wrench, BedDouble,
  Car, Bus, Plane, Bike, Fuel, MapPin,
  HeartPulse, Pill, Dumbbell, Brain, Stethoscope, Syringe,
  Laptop, BookOpen, GraduationCap, Briefcase, Award, PenLine,
  Smartphone, Music, Tv2, Gift, PawPrint, Wallet,
  Tag, Receipt, ShoppingCart, ShoppingBag, CreditCard, Banknote,
  Gamepad2, Scissors, Camera, Building2, PiggyBank, TrendingUp,
  Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight,
  AlertTriangle, AlertCircle, FolderX, Calendar,
} from 'lucide-react';

// ─── Icon registry ────────────────────────────────────────────────────────────
const ICON_REGISTRY = {
  'pizza': Pizza, 'coffee': Coffee, 'utensils': UtensilsCrossed,
  'beer': Beer, 'fish': Fish, 'apple': Apple,
  'home': Home, 'zap': Zap, 'droplets': Droplets,
  'shirt': Shirt, 'wrench': Wrench, 'bed': BedDouble,
  'car': Car, 'bus': Bus, 'plane': Plane,
  'bike': Bike, 'fuel': Fuel, 'map-pin': MapPin,
  'heart-pulse': HeartPulse, 'pill': Pill, 'dumbbell': Dumbbell,
  'brain': Brain, 'stethoscope': Stethoscope, 'syringe': Syringe,
  'laptop': Laptop, 'book': BookOpen, 'graduation': GraduationCap,
  'briefcase': Briefcase, 'award': Award, 'pen': PenLine,
  'smartphone': Smartphone, 'music': Music, 'tv': Tv2,
  'gift': Gift, 'paw': PawPrint, 'wallet': Wallet,
  'tag': Tag, 'receipt': Receipt, 'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag, 'credit-card': CreditCard, 'banknote': Banknote,
  'gamepad': Gamepad2, 'scissors': Scissors, 'camera': Camera,
  'building': Building2, 'piggy-bank': PiggyBank, 'trending-up': TrendingUp,
};

// ─── Icon groups ──────────────────────────────────────────────────────────────
const ICON_GROUPS = [
  { label: 'Food & Drink', icons: [
    { id: 'pizza', name: 'Pizza' }, { id: 'coffee', name: 'Coffee' },
    { id: 'utensils', name: 'Meals' }, { id: 'beer', name: 'Drinks' },
    { id: 'fish', name: 'Seafood' }, { id: 'apple', name: 'Fruits' },
  ]},
  { label: 'Home & Life', icons: [
    { id: 'home', name: 'Rent' }, { id: 'zap', name: 'Utilities' },
    { id: 'droplets', name: 'Water' }, { id: 'shirt', name: 'Clothing' },
    { id: 'wrench', name: 'Repairs' }, { id: 'bed', name: 'Bedroom' },
  ]},
  { label: 'Transport', icons: [
    { id: 'car', name: 'Car' }, { id: 'bus', name: 'Bus' },
    { id: 'plane', name: 'Flights' }, { id: 'bike', name: 'Cycling' },
    { id: 'fuel', name: 'Fuel' }, { id: 'map-pin', name: 'Travel' },
  ]},
  { label: 'Health & Wellness', icons: [
    { id: 'heart-pulse', name: 'Health' }, { id: 'pill', name: 'Medicine' },
    { id: 'dumbbell', name: 'Gym' }, { id: 'brain', name: 'Mental' },
    { id: 'stethoscope', name: 'Doctor' }, { id: 'syringe', name: 'Medical' },
  ]},
  { label: 'Work & Education', icons: [
    { id: 'laptop', name: 'Tech' }, { id: 'book', name: 'Books' },
    { id: 'graduation', name: 'Education' }, { id: 'briefcase', name: 'Work' },
    { id: 'award', name: 'Courses' }, { id: 'pen', name: 'Stationery' },
  ]},
  { label: 'Lifestyle', icons: [
    { id: 'smartphone', name: 'Phone' }, { id: 'music', name: 'Music' },
    { id: 'tv', name: 'TV' }, { id: 'gift', name: 'Gifts' },
    { id: 'paw', name: 'Pets' }, { id: 'gamepad', name: 'Gaming' },
  ]},
  { label: 'Finance', icons: [
    { id: 'wallet', name: 'Wallet' }, { id: 'banknote', name: 'Cash' },
    { id: 'credit-card', name: 'Card' }, { id: 'receipt', name: 'Bills' },
    { id: 'piggy-bank', name: 'Savings' }, { id: 'trending-up', name: 'Invest' },
  ]},
  { label: 'Other', icons: [
    { id: 'shopping-cart', name: 'Shopping' }, { id: 'shopping-bag', name: 'Retail' },
    { id: 'scissors', name: 'Beauty' }, { id: 'camera', name: 'Photo' },
    { id: 'building', name: 'Business' }, { id: 'tag', name: 'General' },
  ]},
];

const ALL_ICONS = ICON_GROUPS.flatMap((g) => g.icons);

// Strips legacy 'ti-' Tabler prefix from any DB-stored keys.
const CatIcon = ({ iconKey, size = 16 }) => {
  const key = typeof iconKey === 'string' && iconKey.startsWith('ti-')
    ? iconKey.slice(3)
    : (iconKey || 'tag');
  const Comp = ICON_REGISTRY[key] || Tag;
  return <Comp size={size} strokeWidth={1.8} />;
};

const getMonthDateRange = (month, year) => {
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;
  return { startDate, endDate };
};

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = [
  { hex: '#534AB7', name: 'Violet'  }, { hex: '#4F46E5', name: 'Indigo' },
  { hex: '#2563EB', name: 'Blue'    }, { hex: '#0891B2', name: 'Cyan'   },
  { hex: '#3B6D11', name: 'Green'   }, { hex: '#65A30D', name: 'Lime'   },
  { hex: '#D97706', name: 'Amber'   }, { hex: '#EA580C', name: 'Orange' },
  { hex: '#DC2626', name: 'Red'     }, { hex: '#A32D2D', name: 'Maroon' },
  { hex: '#DB2777', name: 'Pink'    }, { hex: '#0F766E', name: 'Teal'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = '#fff' }) => (
  <div
    className="rounded-full shrink-0 animate-[catSpin_0.55s_linear_infinite]"
    style={{
      width: size, height: size,
      border: `2px solid ${color}40`,
      borderTopColor: color,
    }}
  />
);

// ─── Portal Modal ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, wide, children }) =>
  createPortal(
    <div className="fixed inset-0 z-200 flex items-start justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-0"
      />
      <div
        className={`
          relative z-10 bg-white rounded-[20px] shadow-2xl w-full flex flex-col
          max-h-[88vh] overflow-y-auto
          animate-[catIn_0.18s_cubic-bezier(.34,1.4,.64,1)]
          ${wide ? 'max-w-140' : 'max-w-105'}
        `}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 sticky top-0 bg-white rounded-t-[20px] border-b border-gray-100 z-10">
          <h2 className="text-[15.5px] font-bold text-gray-900 m-0">{title}</h2>
          <button
            onClick={onClose}
            title="Close"
            className="w-8 h-8 border-none rounded-lg bg-gray-100 cursor-pointer flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 pt-4.5 pb-6 flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );

// ─── Icon picker button ───────────────────────────────────────────────────────
const IconBtn = ({ icon, selected, accentColor, onSelect }) => (
  <button
    type="button"
    title={icon.name}
    onClick={() => onSelect(icon.id)}
    className={`
      w-9.5 h-9.5 rounded-[10px] border-none cursor-pointer
      flex items-center justify-center transition-all shrink-0
      ${selected ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
    `}
    style={selected ? { background: accentColor } : {}}
  >
    <CatIcon iconKey={icon.id} size={17} />
  </button>
);

// ─── Monthly Budget Overrides Component ───────────────────────────────────────
const MonthlyBudgetManager = ({ color, initialMonthlyBudgets, onUpdate, isIncome = false }) => {
  const [monthlyBudgets, setMonthlyBudgets] = useState(initialMonthlyBudgets || {});
  const [showAllMonths, setShowAllMonths] = useState(false);
  
  const months = [
    { index: 0, name: 'January', short: 'Jan' },
    { index: 1, name: 'February', short: 'Feb' },
    { index: 2, name: 'March', short: 'Mar' },
    { index: 3, name: 'April', short: 'Apr' },
    { index: 4, name: 'May', short: 'May' },
    { index: 5, name: 'June', short: 'Jun' },
    { index: 6, name: 'July', short: 'Jul' },
    { index: 7, name: 'August', short: 'Aug' },
    { index: 8, name: 'September', short: 'Sep' },
    { index: 9, name: 'October', short: 'Oct' },
    { index: 10, name: 'November', short: 'Nov' },
    { index: 11, name: 'December', short: 'Dec' }
  ];
  
  const currentMonth = new Date().getMonth();
  const next6Months = months.slice(currentMonth, currentMonth + 6);
  
  const handleChange = (monthIndex, value) => {
    const newBudgets = { ...monthlyBudgets };
    if (value === '' || value === null || value === 0) {
      delete newBudgets[monthIndex];
    } else {
      newBudgets[monthIndex] = Number(value);
    }
    setMonthlyBudgets(newBudgets);
    onUpdate(newBudgets);
  };
  
  const displayedMonths = showAllMonths ? months : next6Months;
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-500" />
          <span className="text-[12px] font-semibold text-gray-700">
            {isIncome ? "Monthly Income Targets" : "Monthly Budget Allocation"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAllMonths(!showAllMonths)}
          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {showAllMonths ? '− Show fewer' : '+ Show all months'}
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
          💡 Set different budgets for each month - perfect for seasonal variations
        </p>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
          {displayedMonths.map((month) => (
            <div key={month.index} className="flex items-center gap-2">
              <span className="text-[12px] w-20 font-medium text-gray-700">{month.name}</span>
              <div className="flex-1 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">KES</span>
                <input
                  type="number"
                  step="100"
                  placeholder="No budget"
                  value={monthlyBudgets[month.index] || ''}
                  onChange={(e) => handleChange(month.index, e.target.value)}
                  className="w-full pl-11 pr-2 py-1.5 text-[12px] border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                  style={{ 
                    background: monthlyBudgets[month.index] ? `${color}08` : 'white',
                    borderColor: monthlyBudgets[month.index] ? color : undefined
                  }}
                />
              </div>
              {monthlyBudgets[month.index] && (
                <button
                  type="button"
                  onClick={() => handleChange(month.index, '')}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-200">
          Leave empty to track without a budget limit for that month
        </p>
      </div>
    </div>
  );
};

// ─── Category form ────────────────────────────────────────────────────────────
const CategoryForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:         initial?.name         || '',
    color:        initial?.color        || COLORS[0].hex,
    icon:         initial?.icon         || 'tag',
    monthlyBudgets: initial?.monthlyBudgets || initial?.monthly_overrides || {},
    categoryType: initial?.categoryType || initial?.type || 'expense',
  });
  const [iconSearch, setIconSearch] = useState('');
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [step,       setStep]       = useState(1);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Category name is required' }); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = {
        name: form.name.trim(),
        color: form.color,
        icon: form.icon,
        monthlyBudgets: form.monthlyBudgets,
        categoryType: form.categoryType,
      };
      await onSave(submitData);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong. Try again.' });
      setSaving(false);
    }
  };

  const searchResults = iconSearch.trim()
    ? ALL_ICONS.filter((ic) => ic.name.toLowerCase().includes(iconSearch.toLowerCase()))
    : null;

  const selectedColorName = COLORS.find((c) => c.hex === form.color)?.name || '';
  const selectedIconName  = ALL_ICONS.find((ic) => ic.id === form.icon)?.name || 'General';

  return (
    <div>
      <div className="flex gap-1.25 mb-5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="flex-1 h-[3px] rounded-full transition-colors duration-200"
            style={{ background: s <= step ? form.color : '#F3F4F6' }}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-3 px-3.5 py-2.75 mb-5 rounded-[14px]"
        style={{ background: `${form.color}0C`, border: `1px solid ${form.color}25` }}
      >
        <div
          className="w-11 h-11 rounded-[13px] shrink-0 flex items-center justify-center"
          style={{ background: `${form.color}1A`, color: form.color, border: `1.5px solid ${form.color}30` }}
        >
          <CatIcon iconKey={form.icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 m-0 truncate">
            {form.name || 'Category name'}
          </p>
          <p className="text-xs text-gray-400 mt-0.75 mb-0">
            {selectedIconName}&nbsp;·&nbsp;
            <span style={{ color: form.color }}>{selectedColorName}</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: `${form.color}15`, color: form.color }}>
              {form.categoryType === 'income' ? ' Income' : ' Expense'}
            </span>
          </p>
        </div>
      </div>

      {errors.server && (
        <div className="mb-4 px-3.5 py-2.5 rounded-[10px] bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />
          {errors.server}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNext} noValidate>
          <div className="mb-4.5">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Category name
            </label>
            <input
              className={`
                w-full h-10 px-3 text-[13.5px] rounded-[10px] outline-none box-border
                transition-colors text-gray-900
                ${errors.name
                  ? 'border border-red-300 bg-red-50'
                  : 'border border-gray-200 bg-gray-50 focus:border-violet-400'}
              `}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Salary, Freelance, Groceries, Rent..."
              autoFocus
            />
            {errors.name && <p className="mt-1.25 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="mb-4.5">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Category Type
            </label>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => set('categoryType', 'expense')}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all border ${
                  form.categoryType === 'expense'
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                 Expense
              </button>
              <button
                type="button"
                onClick={() => set('categoryType', 'income')}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all border ${
                  form.categoryType === 'income'
                    ? 'border-green-300 bg-green-50 text-green-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                 Income
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {form.categoryType === 'income' 
                ? "Income categories (Salary, Freelance) won't count toward your spending budget" 
                : "Expense categories track your spending against monthly budgets"}
            </p>
          </div>

          <div className="mb-4.5">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(({ hex, name }) => (
                <button
                  key={hex}
                  type="button"
                  title={name}
                  onClick={() => set('color', hex)}
                  className="w-7.5 h-7.5 rounded-[9px] border-none cursor-pointer relative shrink-0 transition-transform duration-100"
                  style={{
                    background: hex,
                    outline: form.color === hex ? `3px solid ${hex}` : '3px solid transparent',
                    outlineOffset: 2,
                    transform: form.color === hex ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {form.color === hex && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Icon
            </label>

            <div className="relative mb-3">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="w-full h-9 pl-8 pr-3 text-[13px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-900 outline-none focus:border-violet-400 box-border"
                placeholder="Search icons…  e.g. food, health, car"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </div>

            {searchResults ? (
              searchResults.length === 0
                ? <p className="text-[13px] text-gray-400 text-center py-3">No icons found for "{iconSearch}"</p>
                : (
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))' }}>
                    {searchResults.map((ic) => (
                      <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />
                    ))}
                  </div>
                )
            ) : (
              ICON_GROUPS.map((group) => (
                <div key={group.label} className="mb-3.5">
                  <p className="text-[10.5px] font-bold text-gray-300 uppercase tracking-[0.07em] mb-1.75 mt-0">
                    {group.label}
                  </p>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))' }}>
                    {group.icons.map((ic) => (
                      <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10.5 bg-white border border-gray-200 rounded-[10px] text-[13.5px] font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 h-10.5 border-none rounded-[10px] text-[13.5px] font-bold text-white cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              style={{ background: form.color }}
            >
              Next: Set Monthly Budgets
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-[13.5px] text-gray-500 mb-5 leading-relaxed">
            Set {form.categoryType === 'income' ? 'income targets' : 'spending limits'} for each month.
            {form.categoryType === 'expense' 
              ? ' Helps you track if you\'re staying within budget.' 
              : ' Track your monthly earnings goals.'}
          </p>

          <MonthlyBudgetManager
            color={form.color}
            initialMonthlyBudgets={form.monthlyBudgets}
            onUpdate={(budgets) => set('monthlyBudgets', budgets)}
            isIncome={form.categoryType === 'income'}
          />

          <p className="text-xs text-gray-300 mt-5 mb-5.5">
            Budgets are optional — leave months empty if you don't want to set a limit.
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-10.5 px-4 bg-white border border-gray-200 rounded-[10px] text-[13.5px] font-medium text-gray-700 cursor-pointer flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={15} strokeWidth={2.5} /> Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 h-10.5 border-none rounded-[10px] text-[13.5px] font-bold text-white flex items-center justify-center gap-1.75 transition-opacity ${saving ? 'opacity-75 cursor-default' : 'cursor-pointer hover:opacity-90'}`}
              style={{ background: form.color }}
            >
              {saving && <Spinner size={14} />}
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteConfirm = ({ category, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const handle = async () => {
    setBusy(true);
    try { await onConfirm(); }
    catch (e) { setErr(e.response?.data?.message || 'Could not delete. Try again.'); setBusy(false); }
  };

  const count = Number(category.expense_count || 0);

  return (
    <div className="text-center">
      <div className="w-13 h-13 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 size={22} color="#DC2626" strokeWidth={1.8} />
      </div>
      <p className="text-[15px] font-bold text-gray-900 mb-1.5">
        Delete "{category.name}"?
      </p>

      {count > 0 ? (
        <div className="mb-5 px-3.5 py-2.75 bg-amber-50 border border-amber-200 rounded-[10px] text-[13px] text-amber-800 text-left flex gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-px" />
          <span>
            <strong>{count}</strong> {count === 1 ? 'expense' : 'expenses'} will become
            uncategorized. They won't be deleted. This cannot be undone.
          </span>
        </div>
      ) : (
        <p className="text-[13px] text-gray-400 mb-5">
          This action cannot be undone.
        </p>
      )}

      {err && <p className="text-[13px] text-red-600 mb-3">{err}</p>}

      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 h-10 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handle}
          disabled={busy}
          className={`flex-1 h-10 bg-red-600 border-none rounded-[10px] text-[13.5px] font-bold text-white flex items-center justify-center gap-1.75 transition-opacity ${busy ? 'opacity-70 cursor-default' : 'cursor-pointer hover:bg-red-700'}`}
        >
          {busy && <Spinner size={14} />}
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ─── Row action button ────────────────────────────────────────────────────────
const ActionBtn = ({ label, Icon, hoverBg, hoverColor, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center text-gray-500 transition-all group"
    style={{ background: 'transparent' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = hoverBg;
      e.currentTarget.style.color = hoverColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6B7280';
    }}
  >
    <Icon size={15} strokeWidth={1.8} />
  </button>
);

// ─── Helper to get budget for specific month ───────────────────────────────
const getBudgetForMonth = (category, monthIndex, year) => {
  const monthlyBudgets = category.monthlyBudgets || {};
  
  // Check if there's a specific budget for this month
  if (monthlyBudgets[monthIndex] !== undefined && monthlyBudgets[monthIndex] !== null) {
    return Number(monthlyBudgets[monthIndex]);
  }
  
  // Return 0 if no budget set (means no limit)
  return 0;
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [sortBy,     setSortBy]     = useState('spent');
  const [showAdd,    setShowAdd]    = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);
      const res = await categoryAPI.getAll({ startDate, endDate });
      
      let rows = [];
      if (res.data?.data?.categories) {
        rows = res.data.data.categories;
      } else if (res.data?.data) {
        rows = Array.isArray(res.data.data) ? res.data.data : [];
      } else if (res.data?.categories) {
        rows = res.data.categories;
      } else if (Array.isArray(res.data)) {
        rows = res.data;
      }
      
      rows = rows.map(cat => {
        console.log(cat.name, '| type:', cat.type, '| categoryType:', cat.categoryType);
        return {
        id: cat.id,
        user_id: cat.user_id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        monthlyBudgets: cat.monthlyBudgets || cat.monthly_overrides || {},
        categoryType: cat.categoryType || cat.type || 'expense',
        total_spent: Number(cat.total_spent || cat.totalSpent || 0),
        expense_count: Number(cat.expense_count || cat.expenseCount || 0)
        };
      });
      
      console.log('loaded rows monthlyBudgets:', rows.map(r => ({ name: r.name, monthlyBudgets: r.monthlyBudgets })));
      setCategories(rows);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load categories. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleAdd = async (data) => {
    try {
      await categoryAPI.create(data);
      await load();
      setShowAdd(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Create error:', err);
      throw err;
    }
  };
  
  const handleEdit = async (data) => {
    console.log('handleEdit called', editing.id,data);
    try {
      const response = await categoryAPI.update(editing.id, data);
      console.log('raw update response:', JSON.stringify(response.data, null, 2));
      await load();
      setEditing(null);
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  };
  
  const handleDelete = async () => {
    try {
      await categoryAPI.delete(deleting.id);
      await load();
      setDeleting(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  // Filter out income categories from spending calculations
  const expenseCategories = useMemo(() => 
    categories.filter(c => c.categoryType !== 'income'),
    [categories]
  );
  
  const incomeCategories = useMemo(() => 
    categories.filter(c => c.categoryType === 'income'),
    [categories]
  );

  const filtered = useMemo(() => {
    let list = search.trim()
      ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : [...categories];

    if (sortBy === 'spent') {
      list.sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0));
    } else if (sortBy === 'count') {
      list.sort((a, b) => Number(b.expense_count || 0) - Number(a.expense_count || 0));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [categories, search, sortBy]);

  const currentMonthIndex = parseInt(selectedMonth) - 1;
  
  // Calculate totals for expense categories only
  const totalSpent = expenseCategories.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalItems = expenseCategories.reduce((s, c) => s + Number(c.expense_count || 0), 0);
  
  // Calculate total budget for current month (expense categories only)
  const totalBudget = expenseCategories.reduce((s, c) => {
    const monthlyBudget = getBudgetForMonth(c, currentMonthIndex, selectedYear);
    return s + monthlyBudget;
  }, 0);
  
  // Calculate total income for current month
  const totalIncome = incomeCategories.reduce((s, c) => {
    const monthlyIncome = getBudgetForMonth(c, currentMonthIndex, selectedYear);
    return s + monthlyIncome;
  }, 0);
  
  const maxSpent = filtered.length > 0 ? Math.max(...filtered.map((c) => Number(c.total_spent || 0))) : 0;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div key={refreshKey}>
      <style>{`
        @keyframes catSpin { to { transform: rotate(360deg); } }
        @keyframes catIn   { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">
            Categories
          </h1>
          <p className="text-[13.5px] text-gray-400 mt-1 mb-0">
            {loading
              ? 'Loading…'
              : `${expenseCategories.length} expense categories · ${totalItems} transactions · ${formatKES(totalSpent)} spent`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.75 h-10 px-4.5 bg-[#534AB7] text-white border-none rounded-[10px] text-[13.5px] font-semibold cursor-pointer hover:bg-[#4740a0] transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New category
        </button>
      </div>
      
      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-pointer"
        >
          {monthNames.map((month, idx) => (
            <option key={idx} value={String(idx + 1).padStart(2, '0')}>
              {month}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="w-24 h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        />
        
        {/* Summary Cards */}
        <div className="flex gap-2 ml-auto">
          <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <span className="text-[10px] text-green-600 uppercase tracking-wide">Income</span>
            <p className="text-sm font-bold text-green-700 m-0">{formatKES(totalIncome)}</p>
          </div>
          <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
            <span className="text-[10px] text-red-600 uppercase tracking-wide">Budget</span>
            <p className="text-sm font-bold text-red-700 m-0">{formatKES(totalBudget)}</p>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-[10px] text-blue-600 uppercase tracking-wide">Remaining</span>
            <p className={`text-sm font-bold m-0 ${(totalBudget - totalSpent) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatKES(totalIncome - totalSpent)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-xl px-3.5 py-2.5 mb-3.5 flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-40" style={{ flexBasis: '200px' }}>
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full h-9 pl-8 pr-3 text-[13.5px] border border-gray-200 rounded-[9px] bg-gray-50 text-gray-900 outline-none focus:border-violet-400 box-border"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.25 flex-wrap">
          {[
            { key: 'spent', label: 'Spending' },
            { key: 'count', label: 'Frequency' },
            { key: 'name',  label: 'Name' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`
                h-9 px-3 text-[13px] rounded-[9px] cursor-pointer transition-all border
                ${sortBy === s.key
                  ? 'border-violet-300 bg-[#EEEDFE] text-[#534AB7] font-semibold'
                  : 'border-gray-200 bg-white text-gray-500 font-normal hover:border-violet-200 hover:text-[#534AB7]'}
              `}
            >
              {s.label}
            </button>
          ))}
        </div>

        {search && (
          <button
            onClick={() => setSearch('')}
            className="h-9 px-3 bg-transparent border border-gray-200 rounded-[9px] text-[13px] text-gray-500 cursor-pointer flex items-center gap-1.25 hover:bg-gray-50 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="text-xs text-gray-300 ml-auto whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13.5px] text-red-600 mb-4 flex items-center gap-2.5">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
          <button
            onClick={load}
            className="ml-auto bg-transparent border-none cursor-pointer text-[#534AB7] text-[13px] font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center gap-2.5 py-15 text-gray-400 text-sm">
          <Spinner size={22} color="#534AB7" />
          Loading categories…
        </div>
      )}

      {!loading && categories.length === 0 && !error && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl py-15 px-6 text-center">
          <div className="w-15 h-15 rounded-[18px] bg-[#EEEDFE] flex items-center justify-center mx-auto mb-4">
            <FolderX size={26} color="#534AB7" strokeWidth={1.5} />
          </div>
          <p className="text-base font-bold text-gray-900 mb-2">No categories yet</p>
          <p className="text-[13.5px] text-gray-400 mb-6 leading-relaxed">
            Create categories to organize your spending and set monthly budgets
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.75 h-10.5 px-5.5 bg-[#534AB7] text-white border-none rounded-[10px] text-[13.5px] font-semibold cursor-pointer hover:bg-[#4740a0] transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} /> Create first category
          </button>
        </div>
      )}

      {!loading && categories.length > 0 && filtered.length === 0 && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl py-15 px-6 text-center">
          <Search size={28} color="#D1D5DB" className="block mx-auto mb-2.5" />
          <p className="text-sm text-gray-500 mb-2">No categories match "{search}"</p>
          <button
            onClick={() => setSearch('')}
            className="text-[13px] text-[#534AB7] bg-transparent border-none cursor-pointer underline"
          >
            Clear search
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div
            className="grid px-5 py-2.5 border-b border-gray-100 text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.07em]"
            style={{ gridTemplateColumns: '2fr 90px 120px 120px 1fr 72px' }}
          >
            <span>Category</span>
            <span>Expenses</span>
            <span>Monthly Budget</span>
            <span>Total spent</span>
            <span>Share of spending</span>
            <span />
          </div>

          {/* Table rows */}
          {filtered.map((cat, i) => {
            const spent = Number(cat.total_spent || 0);
            const count = Number(cat.expense_count || 0);
            const monthlyBudget = getBudgetForMonth(cat, currentMonthIndex, selectedYear);
            const color = cat.color || '#534AB7';
            const barWidth = maxSpent > 0 ? Math.round((spent / maxSpent) * 100) : 0;
            const sharePct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
            const isOverBudget = monthlyBudget > 0 && spent > monthlyBudget;
            const hasBudgetSet = monthlyBudget > 0;
            const isIncome = cat.categoryType === 'income';

            return (
              <div
                key={cat.id}
                className={`grid px-5 py-3.25 items-center transition-colors hover:bg-gray-50 ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
                style={{ gridTemplateColumns: '2fr 90px 120px 120px 1fr 72px' }}
              >
                {/* Category identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9.5 h-9.5 rounded-[11px] shrink-0 flex items-center justify-center"
                    style={{ background: `${color}18`, color }}
                  >
                    <CatIcon iconKey={cat.icon} size={17} />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-gray-900 m-0 truncate">
                      {cat.name}
                    </p>
                    {isIncome && (
                      <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                        Income
                      </span>
                    )}
                  </div>
                </div>

                {/* Expenses count */}
                <span className="text-[13px] text-gray-500">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>

                {/* Budget - Shows specific month's budget */}
                <div className="flex flex-col gap-1">
                  {hasBudgetSet ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className={`text-[13px] font-medium ${isOverBudget && !isIncome ? 'text-red-600' : isIncome ? 'text-green-600' : 'text-emerald-600'}`}>
                          {formatKES(monthlyBudget)}/{isIncome ? 'target' : 'budget'}
                        </span>
                      </div>
                      {isOverBudget && !isIncome && (
                        <span className="text-[10px] text-red-500 font-medium">
                          Over by {formatKES(spent - monthlyBudget)}
                        </span>
                      )}
                      {!isOverBudget && hasBudgetSet && !isIncome && monthlyBudget > 0 && (
                        <span className="text-[10px] text-emerald-600">
                          {formatKES(monthlyBudget - spent)} remaining
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[13px] text-gray-300">—</span>
                  )}
                </div>

                {/* Total spent */}
                <span className={`text-[13.5px] font-semibold ${spent > 0 ? (isIncome ? 'text-green-600' : 'text-gray-900') : 'text-gray-300'}`}>
                  {spent > 0 ? formatKES(spent) : '—'}
                </span>

                {/* Spend bar - only show for expenses */}
                <div className="flex items-center gap-2">
                  {!isIncome ? (
                    <>
                      <div className="flex-1 h-1.25 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-in-out"
                          style={{ width: `${barWidth}%`, background: color }}
                        />
                      </div>
                      <span className="text-[11.5px] text-gray-400 min-w-8 text-right">
                        {spent > 0 ? `${sharePct}%` : '—'}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-400">Income tracking</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-0.5">
                  <ActionBtn
                    label="Edit"
                    Icon={Pencil}
                    hoverBg="#EEEDFE"
                    hoverColor="#534AB7"
                    onClick={() => setEditing(cat)}
                  />
                  <ActionBtn
                    label="Delete"
                    Icon={Trash2}
                    hoverBg="#FEF2F2"
                    hoverColor="#DC2626"
                    onClick={() => setDeleting(cat)}
                  />
                </div>
              </div>
            );
          })}

          {/* Footer totals */}
          <div
            className="grid px-5 py-2.75 border-t border-gray-100 bg-gray-50"
            style={{ gridTemplateColumns: '2fr 90px 120px 120px 1fr 72px' }}
          >
            <span className="text-xs font-bold text-gray-400">Total</span>
            <span className="text-xs text-gray-400">{totalItems} items</span>
            <span className="text-xs font-semibold text-gray-600">
              {totalBudget > 0 ? formatKES(totalBudget) : '—'}
            </span>
            <span className="text-[13.5px] font-bold text-gray-900">{formatKES(totalSpent)}</span>
            <span className="text-xs text-gray-400">100%</span>
            <span />
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="New category" wide onClose={() => setShowAdd(false)}>
          <CategoryForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      
      {editing && (
        <Modal title="Edit category" wide onClose={() => setEditing(null)}>
          <CategoryForm
            key={editing.id}
            initial={editing}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      
      {deleting && (
        <Modal title="Delete category" onClose={() => setDeleting(null)}>
          <DeleteConfirm category={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />
        </Modal>
      )}
    </div>
  );
};

export default Categories;