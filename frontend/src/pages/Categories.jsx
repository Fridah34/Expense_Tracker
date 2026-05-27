import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { categoryAPI } from '../services/api'; // ✅ FIXED: was categoryAPI (no 's')

// ─── Lucide-react icon imports ────────────────────────────────────────────────
import {
  Pizza, Coffee, UtensilsCrossed, Beer, Fish, Apple,
  Home, Zap, Droplets, Shirt, Wrench, BedDouble,
  Car, Bus, Plane, Bike, Fuel, MapPin,
  HeartPulse, Pill, Dumbbell, Brain, Stethoscope, Syringe,
  Laptop, BookOpen, GraduationCap, Briefcase, Award, PenLine,
  Smartphone, Music, Tv2, Gift, PawPrint, Wallet,
  Tag, Receipt, ShoppingCart, ShoppingBag, CreditCard, Banknote,
  Gamepad2, Scissors, Camera, Building2, PiggyBank, TrendingUp,
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

// Normalizes stored key → lucide component.
// Handles old Tabler-style keys ('ti-tag' → 'tag') from previously saved data.
const renderIcon = (key, size = 16) => {
  const normalized = typeof key === 'string' && key.startsWith('ti-')
    ? key.slice(3) : (key || 'tag');
  const Comp = ICON_REGISTRY[normalized] || Tag;
  return <Comp size={size} strokeWidth={1.8} />;
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = [
  { hex: '#534AB7', name: 'Violet' },  { hex: '#4F46E5', name: 'Indigo' },
  { hex: '#2563EB', name: 'Blue' },    { hex: '#0891B2', name: 'Cyan' },
  { hex: '#3B6D11', name: 'Green' },   { hex: '#65A30D', name: 'Lime' },
  { hex: '#D97706', name: 'Amber' },   { hex: '#EA580C', name: 'Orange' },
  { hex: '#DC2626', name: 'Red' },     { hex: '#A32D2D', name: 'Maroon' },
  { hex: '#DB2777', name: 'Pink' },    { hex: '#0F766E', name: 'Teal' },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = '#fff' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    border: `2px solid ${color}40`, borderTopColor: color,
    animation: 'catSpin 0.55s linear infinite',
  }} />
);

// ─── Close button ─────────────────────────────────────────────────────────────
// WHY not <i className="ti ti-x">: the webfont glyph is small and can be missed.
// A plain × character at 18px is always visible, no font dependency.
const CloseBtn = ({ onClose }) => (
  <button
    onClick={onClose}
    title="Close"
    style={{
      width: 32, height: 32, border: 'none', borderRadius: 8,
      background: '#F3F4F6', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#374151', fontSize: 18, lineHeight: 1, fontWeight: 400,
      transition: 'background 0.12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
    onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
  >
    ×
  </button>
);

// ─── Portal Modal wrapper ─────────────────────────────────────────────────────
// createPortal renders directly on document.body so position:fixed isn't affected
// by any ancestor's overflow or z-index stacking context.
const Modal = ({ title, onClose, wide, children }) =>
  createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: wide ? 560 : 420,
        maxHeight: '92vh', overflowY: 'auto',
        padding: '24px 26px 22px', zIndex: 1,
        animation: 'catIn 0.18s cubic-bezier(.34,1.4,.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
          {/* ✅ FIXED: prominent close X in top-right of every modal */}
          <CloseBtn onClose={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );

// ─── Icon picker button ───────────────────────────────────────────────────────
const IconBtn = ({ icon, selected, accentColor, onSelect }) => (
  <button type="button" title={icon.name} onClick={() => onSelect(icon.id)}
    style={{
      width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: selected ? accentColor : '#F3F4F6',
      color: selected ? '#fff' : '#6B7280',
      transition: 'all 0.12s',
    }}>
    {renderIcon(icon.id, 17)}
  </button>
);

// ─── Category Form ────────────────────────────────────────────────────────────
const CategoryForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:         initial?.name         || '',
    color:        initial?.color        || COLORS[0].hex,
    icon:         initial?.icon         || 'tag',
    budget:       initial?.budget       || '',
    budgetPeriod: initial?.budgetPeriod || 'monthly',
  });
  const [iconSearch, setIconSearch] = useState('');
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [step, setStep]             = useState(1);

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
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

  const labelSt = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em',
  };
  const inputSt = (err) => ({
    width: '100%', height: 40, padding: '0 12px', fontSize: 13.5,
    border: `1px solid ${err ? '#FCA5A5' : '#E5E7EB'}`,
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
    background: err ? '#FFF7F7' : '#FAFAFA', color: '#111827',
  });

  return (
    <div>
      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
        {[1, 2].map((s) => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: s <= step ? form.color : '#F3F4F6',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>

      {/* Live preview pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', marginBottom: 20, borderRadius: 14,
        background: `${form.color}0C`, border: `1px solid ${form.color}25`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${form.color}1A`, color: form.color,
          border: `1.5px solid ${form.color}30`,
        }}>
          {renderIcon(form.icon, 20)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {form.name || 'Category name'}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>
            {selectedIconName}&nbsp;·&nbsp;
            <span style={{ color: form.color }}>{selectedColorName}</span>
            {form.budget && <span>&nbsp;·&nbsp;Budget: <strong style={{ color: '#374151' }}>{formatKES(form.budget)}/{form.budgetPeriod}</strong></span>}
          </p>
        </div>
      </div>

      {errors.server && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
          {errors.server}
        </div>
      )}

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <form onSubmit={handleNext} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label style={labelSt}>Category name</label>
            <input style={inputSt(!!errors.name)} value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Food & Groceries, Rent, Transport…" autoFocus />
            {errors.name && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelSt}>Color</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map(({ hex, name }) => (
                <button key={hex} type="button" title={name} onClick={() => set('color', hex)}
                  style={{
                    width: 30, height: 30, borderRadius: 9, border: 'none', background: hex,
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                    outline: form.color === hex ? `3px solid ${hex}` : '3px solid transparent',
                    outlineOffset: 2,
                    transform: form.color === hex ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.1s',
                  }}>
                  {form.color === hex && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelSt}>Icon</label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13, pointerEvents: 'none' }} />
              <input style={{ ...inputSt(false), paddingLeft: 32, height: 36, fontSize: 13 }}
                placeholder="Search icons… e.g. food, health, travel"
                value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} />
            </div>
            {searchResults ? (
              searchResults.length === 0
                ? <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>No icons found for "{iconSearch}"</p>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                    {searchResults.map((ic) => <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />)}
                  </div>
            ) : (
              ICON_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 7px' }}>{group.label}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                    {group.icons.map((ic) => <IconBtn key={ic.id} icon={ic} selected={form.icon === ic.id} accentColor={form.color} onSelect={(id) => set('icon', id)} />)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, height: 42, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit"
              style={{ flex: 2, height: 42, background: form.color, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Next: Set budget
              <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
            </button>
          </div>
        </form>
      )}

      {/* ══ STEP 2 ══ */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
            Set a spending limit for <strong style={{ color: '#111827' }}>{form.name}</strong>. Helps you track when you're approaching your limit. You can skip this.
          </p>

          <div style={{ marginBottom: 18 }}>
            <label style={labelSt}>Budget period</label>
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 3, gap: 3 }}>
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <button key={p} type="button" onClick={() => set('budgetPeriod', p)}
                  style={{
                    flex: 1, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.12s',
                    background: form.budgetPeriod === p ? '#fff' : 'transparent',
                    color: form.budgetPeriod === p ? form.color : '#9CA3AF',
                    boxShadow: form.budgetPeriod === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Budget amount (KES)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12.5, color: '#9CA3AF', pointerEvents: 'none' }}>KES</span>
              <input type="number" min="0" step="100"
                style={{ ...inputSt(false), paddingLeft: 44 }}
                value={form.budget} onChange={(e) => set('budget', e.target.value)}
                placeholder="0.00" autoFocus />
            </div>
            {form.budget > 0 && form.budgetPeriod === 'monthly' && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                ≈ {formatKES(Number(form.budget) / 4.33)} per week &nbsp;·&nbsp; {formatKES(Number(form.budget) * 12)} per year
              </p>
            )}
            {form.budget > 0 && form.budgetPeriod === 'weekly' && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                ≈ {formatKES(Number(form.budget) * 4.33)} per month &nbsp;·&nbsp; {formatKES(Number(form.budget) * 52)} per year
              </p>
            )}
            {form.budget > 0 && form.budgetPeriod === 'yearly' && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                ≈ {formatKES(Number(form.budget) / 12)} per month &nbsp;·&nbsp; {formatKES(Number(form.budget) / 52)} per week
              </p>
            )}
          </div>

          <p style={{ fontSize: 12, color: '#D1D5DB', margin: '0 0 22px' }}>Budget is optional — you can add or change it later.</p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setStep(1)}
              style={{ height: 42, padding: '0 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
            </button>
            <button type="submit" disabled={saving}
              style={{
                flex: 1, height: 42, border: 'none', borderRadius: 10,
                fontSize: 13.5, fontWeight: 700, color: '#fff',
                background: form.color, cursor: saving ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                opacity: saving ? 0.75 : 1,
              }}>
              {saving && <Spinner size={14} />}
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────
const DeleteConfirm = ({ category, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  const handle = async () => {
    setBusy(true);
    try { await onConfirm(); }
    catch (e) { setErr(e.response?.data?.message || 'Could not delete. Try again.'); setBusy(false); }
  };

  const count = Number(category.expense_count || 0);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <i className="ti ti-trash" style={{ fontSize: 22, color: '#DC2626' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Delete "{category.name}"?</p>
      {count > 0 ? (
        <div style={{ margin: '0 0 20px', padding: '11px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, color: '#92400E', textAlign: 'left', display: 'flex', gap: 8 }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
          <span><strong>{count}</strong> {count === 1 ? 'expense' : 'expenses'} will become uncategorized. They won't be deleted. This cannot be undone.</span>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>This action cannot be undone.</p>
      )}
      {err && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose}
          style={{ flex: 1, height: 40, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, color: '#374151', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handle} disabled={busy}
          style={{ flex: 1, height: 40, background: '#DC2626', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: busy ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: busy ? 0.7 : 1 }}>
          {busy && <Spinner size={14} />}
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ─── Action button ────────────────────────────────────────────────────────────
// WHY always visible (not hidden until hover):
// Opacity-0-until-hover makes the action undiscoverable — users don't know to hover.
// For a data management page, visible buttons are better UX.
// Default color #6B7280 (gray-500) is clearly readable on white. On hover it becomes
// the accent color with a tinted background.
const ActionBtn = ({ label, icon, hoverBg, hoverColor, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} title={label} aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // ✅ FIXED: was '#C4C9D4' (near-invisible on white). Now '#6B7280' — clearly readable.
        background: hovered ? hoverBg    : 'transparent',
        color:      hovered ? hoverColor : '#6B7280',
        transition: 'all 0.12s',
      }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
    </button>
  );
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

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await categoryAPI.getAll(); // ✅ FIXED: was categoryAPI
      const body = res.data;
      // Defensive shape resolver — handles { success:true, data:[...] } and variations.
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

  // ✅ FIXED: all three handlers now use categoriesAPI (was categoryAPI)
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

  const maxSpent   = filtered.length > 0 ? Math.max(...filtered.map((c) => Number(c.total_spent   || 0))) : 0;
  const totalSpent = categories.reduce((s, c) => s + Number(c.total_spent   || 0), 0);
  const totalItems = categories.reduce((s, c) => s + Number(c.expense_count || 0), 0);

  return (
    // ✅ FIXED: removed maxWidth:900. Expenses has no maxWidth so it fills the layout.
    // Categories now fills the same container width — they match.
    <div>
      <style>{`
        @keyframes catSpin { to { transform: rotate(360deg); } }
        @keyframes catIn   { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .cat-row:hover     { background: #FAFAFA !important; }
      `}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>Categories</h1>
          <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: '4px 0 0' }}>
            {loading ? 'Loading…' : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} · ${totalItems} expenses · ${formatKES(totalSpent)} total`}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          <i className="ti ti-plus" style={{ fontSize: 15 }} /> New category
        </button>
      </div>

      {/* Search + Sort bar */}
      <div style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13, pointerEvents: 'none' }} />
          <input
            style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 12, fontSize: 13.5, border: '1px solid #E5E7EB', borderRadius: 9, background: '#FAFAFA', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[{ key: 'spent', label: 'Spending' }, { key: 'count', label: 'Frequency' }, { key: 'name', label: 'Name' }].map((s) => (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              style={{
                height: 36, padding: '0 12px', fontSize: 13, borderRadius: 9, cursor: 'pointer', transition: 'all 0.12s',
                border:     `1px solid ${sortBy === s.key ? '#C4B5FD' : '#E5E7EB'}`,
                background: sortBy === s.key ? '#EEEDFE' : '#fff',
                color:      sortBy === s.key ? '#534AB7' : '#6B7280',
                fontWeight: sortBy === s.key ? 600 : 400,
              }}>
              {s.label}
            </button>
          ))}
        </div>
        {search && (
          <button onClick={() => setSearch('')}
            style={{ height: 36, padding: '0 12px', background: 'none', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: '#C4C9D4', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, fontSize: 13.5, color: '#DC2626', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
          {error}
          <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#534AB7', fontSize: 13, fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '80px 0', color: '#9CA3AF', fontSize: 14 }}>
          <Spinner size={22} color="#534AB7" /> Loading categories…
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && !error && (
        <div style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: 16, padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="ti ti-folder-off" style={{ fontSize: 26, color: '#534AB7' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>No categories yet</p>
          <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.7 }}>
            Create categories like Food &amp; Groceries, Rent, or Transport<br />to organise your spending and set budgets.
          </p>
          <button onClick={() => setShowAdd(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 42, padding: '0 22px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            <i className="ti ti-plus" style={{ fontSize: 15 }} /> Create first category
          </button>
        </div>
      )}

      {/* No search results */}
      {!loading && categories.length > 0 && filtered.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
          <i className="ti ti-search" style={{ fontSize: 28, color: '#D1D5DB', display: 'block', marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 8px' }}>No categories match "{search}"</p>
          <button onClick={() => setSearch('')} style={{ fontSize: 13, color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>
        </div>
      )}

      {/* Category table */}
      {!loading && filtered.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: 16, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 160px 170px 72px', padding: '10px 20px', borderBottom: '1px solid #F3F4F6', fontSize: 10.5, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            <span>Category</span><span>Expenses</span><span>Total spent</span><span>Share of spending</span><span />
          </div>

          {filtered.map((cat, i) => {
            const spent    = Number(cat.total_spent   || 0);
            const count    = Number(cat.expense_count || 0);
            const color    = cat.color || '#534AB7';
            const barWidth = maxSpent > 0 ? Math.round((spent / maxSpent) * 100) : 0;
            const sharePct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

            return (
              <div key={cat.id} className="cat-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 90px 160px 170px 72px', padding: '13px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none', background: 'transparent', transition: 'background 0.1s' }}>

                {/* Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, color }}>
                    {renderIcon(cat.icon, 17)}
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </p>
                </div>

                {/* Count */}
                <span style={{ fontSize: 13, color: '#6B7280' }}>{count} {count === 1 ? 'item' : 'items'}</span>

                {/* Spent */}
                <span style={{ fontSize: 13.5, fontWeight: 600, color: spent > 0 ? '#111827' : '#D1D5DB' }}>
                  {spent > 0 ? formatKES(spent) : '—'}
                </span>

                {/* Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${barWidth}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                  <span style={{ fontSize: 11.5, color: '#9CA3AF', minWidth: 30, textAlign: 'right' }}>
                    {spent > 0 ? `${sharePct}%` : '—'}
                  </span>
                </div>

                {/* Actions — ✅ FIXED: always visible at #6B7280, not hidden */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <ActionBtn label="Edit"   icon="ti-pencil" hoverBg="#EEEDFE" hoverColor="#534AB7" onClick={() => setEditing(cat)}  />
                  <ActionBtn label="Delete" icon="ti-trash"  hoverBg="#FEF2F2" hoverColor="#DC2626" onClick={() => setDeleting(cat)} />
                </div>
              </div>
            );
          })}

          {/* Footer totals */}
          {totalSpent > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 160px 170px 72px', padding: '11px 20px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF' }}>Total</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{totalItems} items</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{formatKES(totalSpent)}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>100%</span>
              <span />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
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