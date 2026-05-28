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
  AlertTriangle, AlertCircle, FolderX,
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
// Kept as inline style because the border color is dynamic (passed as prop).
// Tailwind can't build arbitrary dynamic color values at runtime.
const Spinner = ({ size = 16, color = '#fff' }) => (
  <div
    className="rounded-full flex-shrink-0 animate-[catSpin_0.55s_linear_infinite]"
    style={{
      width: size, height: size,
      border: `2px solid ${color}40`,
      borderTopColor: color,
    }}
  />
);

// ─── Portal Modal ─────────────────────────────────────────────────────────────
// createPortal mounts on document.body so position:fixed is never clipped by
// an ancestor's overflow or stacking context.
const Modal = ({ title, onClose, wide, children }) =>
  createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-0"
      />

      {/* Card */}
      <div
        className={`
          relative z-10 bg-white rounded-[20px] shadow-2xl w-full flex flex-col
          max-h-[88vh] overflow-y-auto
          animate-[catIn_0.18s_cubic-bezier(.34,1.4,.64,1)]
          ${wide ? 'max-w-[560px]' : 'max-w-[420px]'}
        `}
      >
        {/* Sticky header */}
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

        {/* Body */}
        <div className="px-6 pt-[18px] pb-6 flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );

// ─── Icon picker button ───────────────────────────────────────────────────────
// The selected background color is dynamic (comes from form.color), so we keep
// background as inline style only for the selected state. Unselected uses Tailwind.
const IconBtn = ({ icon, selected, accentColor, onSelect }) => (
  <button
    type="button"
    title={icon.name}
    onClick={() => onSelect(icon.id)}
    className={`
      w-[38px] h-[38px] rounded-[10px] border-none cursor-pointer
      flex items-center justify-center transition-all flex-shrink-0
      ${selected ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
    `}
    style={selected ? { background: accentColor } : {}}
  >
    <CatIcon iconKey={icon.id} size={17} />
  </button>
);

// ─── Category form ────────────────────────────────────────────────────────────
const CategoryForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:         initial?.name         || '',
    color:        initial?.color        || COLORS[0].hex,
    icon:         initial?.icon         || 'tag',
    budget:       initial?.budget       || '',
    budgetPeriod: initial?.budgetPeriod || 'monthly',
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
      await onSave({ name: form.name.trim(), color: form.color, icon: form.icon });
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
      {/* Step progress bar — color is dynamic so background stays inline */}
      <div className="flex gap-[5px] mb-5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="flex-1 h-[3px] rounded-full transition-colors duration-200"
            style={{ background: s <= step ? form.color : '#F3F4F6' }}
          />
        ))}
      </div>

      {/* Live preview pill — border/background colors are dynamic */}
      <div
        className="flex items-center gap-3 px-[14px] py-[11px] mb-5 rounded-[14px]"
        style={{ background: `${form.color}0C`, border: `1px solid ${form.color}25` }}
      >
        <div
          className="w-11 h-11 rounded-[13px] flex-shrink-0 flex items-center justify-center"
          style={{ background: `${form.color}1A`, color: form.color, border: `1.5px solid ${form.color}30` }}
        >
          <CatIcon iconKey={form.icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 m-0 truncate">
            {form.name || 'Category name'}
          </p>
          <p className="text-xs text-gray-400 mt-[3px] mb-0">
            {selectedIconName}&nbsp;·&nbsp;
            <span style={{ color: form.color }}>{selectedColorName}</span>
            {form.budget > 0 && (
              <span>&nbsp;·&nbsp;Budget:&nbsp;
                <strong className="text-gray-700">{formatKES(form.budget)}/{form.budgetPeriod}</strong>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Server error */}
      {errors.server && (
        <div className="mb-4 px-[14px] py-[10px] rounded-[10px] bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />
          {errors.server}
        </div>
      )}

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <form onSubmit={handleNext} noValidate>

          {/* Name */}
          <div className="mb-[18px]">
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
              placeholder="e.g. Food & Groceries, Rent, Transport…"
              autoFocus
            />
            {errors.name && <p className="mt-[5px] text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Color swatches — outline/transform are dynamic so kept inline */}
          <div className="mb-[18px]">
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
                  className="w-[30px] h-[30px] rounded-[9px] border-none cursor-pointer relative flex-shrink-0 transition-transform duration-100"
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

          {/* Icon picker */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Icon
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="w-full h-9 pl-8 pr-3 text-[13px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-900 outline-none focus:border-violet-400 box-border"
                placeholder="Search icons…  e.g. food, health, car"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </div>

            {/* Results or grouped grid */}
            {searchResults ? (
              searchResults.length === 0
                ? <p className="text-[13px] text-gray-400 text-center py-3">No icons found for "{iconSearch}"</p>
                : (
                  <div className="grid gap-[6px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))' }}>
                    {searchResults.map((ic) => (
                      <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />
                    ))}
                  </div>
                )
            ) : (
              ICON_GROUPS.map((group) => (
                <div key={group.label} className="mb-[14px]">
                  <p className="text-[10.5px] font-bold text-gray-300 uppercase tracking-[0.07em] mb-[7px] mt-0">
                    {group.label}
                  </p>
                  <div className="grid gap-[6px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))' }}>
                    {group.icons.map((ic) => (
                      <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[42px] bg-white border border-gray-200 rounded-[10px] text-[13.5px] font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] h-[42px] border-none rounded-[10px] text-[13.5px] font-bold text-white cursor-pointer flex items-center justify-center gap-[6px] hover:opacity-90 transition-opacity"
              style={{ background: form.color }}
            >
              Next: Set budget
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-[13.5px] text-gray-500 mb-5 leading-relaxed">
            Set a spending limit for <strong className="text-gray-900">{form.name}</strong>.
            Helps you know when you're approaching your limit.{' '}
            <span className="text-gray-400">You can skip this.</span>
          </p>

          {/* Period tabs */}
          <div className="mb-[18px]">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Budget period
            </label>
            <div className="flex bg-gray-100 rounded-[10px] p-[3px] gap-[3px]">
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('budgetPeriod', p)}
                  className={`
                    flex-1 h-[34px] border-none rounded-lg cursor-pointer text-[13px] font-semibold transition-all
                    ${form.budgetPeriod === p
                      ? 'bg-white shadow-sm'
                      : 'bg-transparent text-gray-400 hover:text-gray-600'}
                  `}
                  style={form.budgetPeriod === p ? { color: form.color } : {}}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Budget amount */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.07em]">
              Budget amount (KES)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-gray-400 pointer-events-none">KES</span>
              <input
                type="number"
                min="0"
                step="100"
                className="w-full h-10 pl-11 pr-3 text-[13.5px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-900 outline-none focus:border-violet-400 box-border"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {Number(form.budget) > 0 && form.budgetPeriod === 'monthly' && (
              <p className="mt-[6px] text-xs text-gray-400">
                ≈ {formatKES(Number(form.budget) / 4.33)} /week &nbsp;·&nbsp; {formatKES(Number(form.budget) * 12)} /year
              </p>
            )}
            {Number(form.budget) > 0 && form.budgetPeriod === 'weekly' && (
              <p className="mt-[6px] text-xs text-gray-400">
                ≈ {formatKES(Number(form.budget) * 4.33)} /month &nbsp;·&nbsp; {formatKES(Number(form.budget) * 52)} /year
              </p>
            )}
            {Number(form.budget) > 0 && form.budgetPeriod === 'yearly' && (
              <p className="mt-[6px] text-xs text-gray-400">
                ≈ {formatKES(Number(form.budget) / 12)} /month &nbsp;·&nbsp; {formatKES(Number(form.budget) / 52)} /week
              </p>
            )}
          </div>

          <p className="text-xs text-gray-300 mb-[22px]">
            Budget is optional — leave it blank to skip.
          </p>

          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-[42px] px-4 bg-white border border-gray-200 rounded-[10px] text-[13.5px] font-medium text-gray-700 cursor-pointer flex items-center gap-[6px] hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={15} strokeWidth={2.5} /> Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 h-[42px] border-none rounded-[10px] text-[13.5px] font-bold text-white flex items-center justify-center gap-[7px] transition-opacity ${saving ? 'opacity-75 cursor-default' : 'cursor-pointer hover:opacity-90'}`}
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
      <div className="w-[52px] h-[52px] rounded-full bg-red-50 flex items-center justify-center mx-auto mb-[14px]">
        <Trash2 size={22} color="#DC2626" strokeWidth={1.8} />
      </div>
      <p className="text-[15px] font-bold text-gray-900 mb-[6px]">
        Delete "{category.name}"?
      </p>

      {count > 0 ? (
        <div className="mb-5 px-[14px] py-[11px] bg-amber-50 border border-amber-200 rounded-[10px] text-[13px] text-amber-800 text-left flex gap-2">
          <AlertTriangle size={15} className="flex-shrink-0 mt-[1px]" />
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

      <div className="flex gap-[10px]">
        <button
          onClick={onClose}
          className="flex-1 h-10 bg-white border border-gray-200 rounded-[10px] text-[13.5px] text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handle}
          disabled={busy}
          className={`flex-1 h-10 bg-red-600 border-none rounded-[10px] text-[13.5px] font-bold text-white flex items-center justify-center gap-[7px] transition-opacity ${busy ? 'opacity-70 cursor-default' : 'cursor-pointer hover:bg-red-700'}`}
        >
          {busy && <Spinner size={14} />}
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ─── Row action button ────────────────────────────────────────────────────────
// hover:bg-* and hover:text-* cover the interaction without any JS state.
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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await categoryAPI.getAll();
      const body = res.data;
      const rows =
        Array.isArray(body?.data)               ? body.data
        : Array.isArray(body?.data?.categories) ? body.data.categories
        : Array.isArray(body?.categories)        ? body.categories
        : Array.isArray(body)                    ? body
        : [];
      setCategories(rows);
    } catch {
      setError('Failed to load categories. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd    = async (data) => { await categoryAPI.create(data);              setShowAdd(false); load(); };
  const handleEdit   = async (data) => { await categoryAPI.update(editing.id, data);  setEditing(null);  load(); };
  const handleDelete = async ()     => { await categoryAPI.delete(deleting.id);       setDeleting(null); load(); };

  const filtered = useMemo(() => {
    let list = search.trim()
      ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : [...categories];

    if      (sortBy === 'spent') list.sort((a, b) => Number(b.total_spent   || 0) - Number(a.total_spent   || 0));
    else if (sortBy === 'count') list.sort((a, b) => Number(b.expense_count || 0) - Number(a.expense_count || 0));
    else                         list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [categories, search, sortBy]);

  const maxSpent   = filtered.length > 0 ? Math.max(...filtered.map((c) => Number(c.total_spent || 0))) : 0;
  const totalSpent = categories.reduce((s, c) => s + Number(c.total_spent   || 0), 0);
  const totalItems = categories.reduce((s, c) => s + Number(c.expense_count || 0), 0);

  return (
    <div>
      {/* Keyframe animations — only animations can't move to Tailwind without config */}
      <style>{`
        @keyframes catSpin { to { transform: rotate(360deg); } }
        @keyframes catIn   { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">
            Categories
          </h1>
          <p className="text-[13.5px] text-gray-400 mt-1 mb-0">
            {loading
              ? 'Loading…'
              : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} · ${totalItems} expenses · ${formatKES(totalSpent)} total`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-[7px] h-10 px-[18px] bg-[#534AB7] text-white border-none rounded-[10px] text-[13.5px] font-semibold cursor-pointer hover:bg-[#4740a0] transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New category
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-[#EFEFEF] rounded-xl px-[14px] py-[10px] mb-[14px] flex items-center gap-[10px] flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-40" style={{ flexBasis: '200px' }}>
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full h-9 pl-8 pr-3 text-[13.5px] border border-gray-200 rounded-[9px] bg-gray-50 text-gray-900 outline-none focus:border-violet-400 box-border"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort buttons */}
        <div className="flex gap-[5px] flex-wrap">
          {[
            { key: 'spent', label: 'Spending'  },
            { key: 'count', label: 'Frequency' },
            { key: 'name',  label: 'Name'      },
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

        {/* Clear search */}
        {search && (
          <button
            onClick={() => setSearch('')}
            className="h-9 px-3 bg-transparent border border-gray-200 rounded-[9px] text-[13px] text-gray-500 cursor-pointer flex items-center gap-[5px] hover:bg-gray-50 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="text-xs text-gray-300 ml-auto whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13.5px] text-red-600 mb-4 flex items-center gap-[10px]">
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center items-center gap-[10px] py-20 text-gray-400 text-sm">
          <Spinner size={22} color="#534AB7" />
          Loading categories…
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && categories.length === 0 && !error && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl py-20 px-6 text-center">
          <div className="w-[60px] h-[60px] rounded-[18px] bg-[#EEEDFE] flex items-center justify-center mx-auto mb-4">
            <FolderX size={26} color="#534AB7" strokeWidth={1.5} />
          </div>
          <p className="text-base font-bold text-gray-900 mb-2">No categories yet</p>
          <p className="text-[13.5px] text-gray-400 mb-6 leading-relaxed">
            Create categories like Food &amp; Groceries, Rent, or Transport<br />
            to organise your spending and set budgets.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-[7px] h-[42px] px-[22px] bg-[#534AB7] text-white border-none rounded-[10px] text-[13.5px] font-semibold cursor-pointer hover:bg-[#4740a0] transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} /> Create first category
          </button>
        </div>
      )}

      {/* ── No search results ── */}
      {!loading && categories.length > 0 && filtered.length === 0 && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl py-[60px] px-6 text-center">
          <Search size={28} color="#D1D5DB" className="block mx-auto mb-[10px]" />
          <p className="text-sm text-gray-500 mb-2">No categories match "{search}"</p>
          <button
            onClick={() => setSearch('')}
            className="text-[13px] text-[#534AB7] bg-transparent border-none cursor-pointer underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Category table ── */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-[#EFEFEF] rounded-2xl overflow-hidden">

          {/* Column headers */}
          <div
            className="grid px-5 py-[10px] border-b border-gray-100 text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.07em]"
            style={{ gridTemplateColumns: '2fr 90px 160px 1fr 72px' }}
          >
            <span>Category</span>
            <span>Expenses</span>
            <span>Total spent</span>
            <span>Share of spending</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((cat, i) => {
            const spent    = Number(cat.total_spent   || 0);
            const count    = Number(cat.expense_count || 0);
            const color    = cat.color || '#534AB7';
            const barWidth = maxSpent > 0 ? Math.round((spent / maxSpent) * 100) : 0;
            const sharePct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

            return (
              <div
                key={cat.id}
                className={`grid px-5 py-[13px] items-center transition-colors hover:bg-gray-50 ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
                style={{ gridTemplateColumns: '2fr 90px 160px 1fr 72px' }}
              >
                {/* Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-[38px] h-[38px] rounded-[11px] flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${color}18`, color }}
                  >
                    <CatIcon iconKey={cat.icon} size={17} />
                  </div>
                  <p className="text-[13.5px] font-semibold text-gray-900 m-0 truncate">
                    {cat.name}
                  </p>
                </div>

                {/* Count */}
                <span className="text-[13px] text-gray-500">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>

                {/* Total spent */}
                <span className={`text-[13.5px] font-semibold ${spent > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                  {spent > 0 ? formatKES(spent) : '—'}
                </span>

                {/* Spend bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500 ease-in-out"
                      style={{ width: `${barWidth}%`, background: color }}
                    />
                  </div>
                  <span className="text-[11.5px] text-gray-400 min-w-[32px] text-right">
                    {spent > 0 ? `${sharePct}%` : '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-[2px]">
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
          {totalSpent > 0 && (
            <div
              className="grid px-5 py-[11px] border-t border-gray-100 bg-gray-50"
              style={{ gridTemplateColumns: '2fr 90px 160px 1fr 72px' }}
            >
              <span className="text-xs font-bold text-gray-400">Total</span>
              <span className="text-xs text-gray-400">{totalItems} items</span>
              <span className="text-[13.5px] font-bold text-gray-900">{formatKES(totalSpent)}</span>
              <span className="text-xs text-gray-400">100%</span>
              <span />
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <Modal title="New category" wide onClose={() => setShowAdd(false)}>
          <CategoryForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit category" wide onClose={() => setEditing(null)}>
          <CategoryForm initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} />
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