import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, X, Pencil, Trash2, Check,
  TrendingUp, TrendingDown, AlertCircle, ReceiptText,
  ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { expenseAPI, categoryAPI } from '../services/api';

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ cls = 'w-4 h-4 border-white/30 border-t-white' }) => (
  <div className={`rounded-full border-2 animate-spin shrink-0 ${cls}`} />
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-[modalIn_0.18s_cubic-bezier(.34,1.56,.64,1)]">
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, optional, error, children }) => (
  <div className="mb-4">
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {label}
      {optional && <span className="font-normal normal-case tracking-normal text-gray-300 ml-1">(optional)</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = (err) =>
  `w-full h-10 px-3 rounded-xl border text-sm text-gray-900 bg-gray-50 outline-none transition-colors
   focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
   ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;

// ─── Expense Form ─────────────────────────────────────────────────────────────
const ExpenseForm = ({ initial, categories, onSave, onClose }) => {
  const [form, setForm] = useState({
    title:      initial?.title       || '',
    amount:     initial?.amount      || '',
    type:       initial?.type        || 'expense',
    date:       initial?.date        ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    categoryId: initial?.category_id || '',
    notes:      initial?.notes       || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                                  e.title  = 'Title is required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Enter a valid positive amount';
    if (!form.date)                                          e.date   = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({
        title:      form.title.trim(),
        amount:     Number(form.amount),
        type:       form.type,
        date:       form.date,
        notes:      form.notes      || undefined,
        categoryId: form.categoryId || undefined,
      });
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong.' });
      setSaving(false);
    }
  };

  const isIncome = form.type === 'income';

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Server error */}
      {errors.server && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} className="shrink-0" /> {errors.server}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
        {[
          { val: 'expense', label: 'Expense', Icon: TrendingDown, active: 'bg-red-50 text-red-600', inactive: 'bg-gray-50 text-gray-400' },
          { val: 'income',  label: 'Income',  Icon: TrendingUp,   active: 'bg-emerald-50 text-emerald-600', inactive: 'bg-gray-50 text-gray-400' },
        ].map(({ val, label, Icon, active, inactive }) => (
          <button
            key={val}
            type="button"
            onClick={() => set('type', val)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              form.type === val ? active : inactive
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Title */}
      <Field label="Title" error={errors.title}>
        <input
          className={inputCls(errors.title)}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Lunch at KFC, Groceries, Rent…"
          autoFocus
        />
      </Field>

      {/* Amount + Date */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (KES)" error={errors.amount}>
          <input
            type="number" min="0.01" step="0.01"
            className={inputCls(errors.amount)}
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Date" error={errors.date}>
          <input
            type="date"
            className={inputCls(errors.date)}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </Field>
      </div>

      {/* Category */}
      <Field label="Category">
        <select
          className={`${inputCls(false)} cursor-pointer`}
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      {/* Notes */}
      <Field label="Notes" optional>
        <textarea
          className={`${inputCls(false)} h-20 py-2.5 resize-none`}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Add a note about this transaction…"
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 ${
            isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saving ? <Spinner /> : <Check size={15} strokeWidth={2.5} />}
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────
const DeleteConfirm = ({ expense, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const handle = async () => {
    setBusy(true);
    try { await onConfirm(); }
    catch (e) { setErr(e.response?.data?.message || 'Could not delete. Try again.'); setBusy(false); }
  };

  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" strokeWidth={1.8} />
      </div>
      <p className="text-base font-bold text-gray-900 mb-1">Delete this transaction?</p>
      <p className="text-sm text-gray-500 mb-1">"{expense.title}"</p>
      <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
      {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handle}
          disabled={busy}
          className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {busy && <Spinner cls="w-4 h-4 border-white/30 border-t-white" />}
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Expenses Page ───────────────────────────────────────────────────────
const Expenses = () => {
  const [expenses,   setExpenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    type: '', categoryId: '', startDate: '', endDate: '', search: '', page: 1,
  });

  const [showAdd,  setShowAdd]  = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  // ── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { limit: 10, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k] && params[k] !== 0) delete params[k]; });

      const [eRes, cRes] = await Promise.all([
        expenseAPI.getAll(params),
        categoryAPI.getAll(),
      ]);

      const eBody   = eRes.data?.data || eRes.data || {};
      const expList = Array.isArray(eBody) ? eBody : (eBody.expenses || []);
      const pag     = eBody.pagination || { page: filters.page, totalPages: 1, total: expList.length };

      setExpenses(expList);
      setPagination({ page: pag.page || 1, totalPages: pag.totalPages || 1, total: pag.total || expList.length });

      const cBody  = cRes.data?.data || cRes.data || [];
      const catList = Array.isArray(cBody) ? cBody : (cBody.categories || []);
      setCategories(catList);
    } catch {
      setError('Failed to load. Check your connection and try again.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setFilter    = (k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }));
  const clearFilters = ()     => setFilters({ type: '', categoryId: '', startDate: '', endDate: '', search: '', page: 1 });
  const hasFilters   = filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.search;
  const activeFilterCount = [filters.type, filters.categoryId, filters.startDate, filters.endDate].filter(Boolean).length;

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd    = async (data) => { await expenseAPI.create(data);             setShowAdd(false); load(); };
  const handleEdit   = async (data) => { await expenseAPI.update(editing.id, data); setEditing(null);  load(); };
  const handleDelete = async ()     => { await expenseAPI.delete(deleting.id);      setDeleting(null); load(); };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'Loading…' : `${pagination.total} transaction${pagination.total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add transaction
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">

        {/* Row 1 — search + type toggle + filter toggle */}
        <div className="flex gap-3 flex-wrap items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
              placeholder="Search transactions…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>

          {/* Type toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5 shrink-0">
            {[
              { val: '',        label: 'All',     activeColor: 'bg-indigo-600 text-white' },
              { val: 'expense', label: 'Expenses', activeColor: 'bg-red-500 text-white'    },
              { val: 'income',  label: 'Income',  activeColor: 'bg-emerald-600 text-white' },
            ].map(({ val, label, activeColor }) => (
              <button
                key={val}
                onClick={() => setFilter('type', val)}
                className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all ${
                  filters.type === val ? activeColor : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-sm font-semibold transition-colors shrink-0 ${
              showFilters || activeFilterCount > 0
                ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Row 2 — expanded filters (category + date range) */}
        {showFilters && (
          <div className="flex gap-3 flex-wrap items-center pt-1 border-t border-gray-50">
            {/* Category */}
            <select
              className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors cursor-pointer"
              value={filters.categoryId}
              onChange={(e) => setFilter('categoryId', e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium shrink-0">From</span>
              <input
                type="date"
                className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                value={filters.startDate}
                onChange={(e) => setFilter('startDate', e.target.value)}
              />
              <span className="text-gray-300 text-sm">→</span>
              <span className="text-xs text-gray-400 font-medium shrink-0">To</span>
              <input
                type="date"
                className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                value={filters.endDate}
                onChange={(e) => setFilter('endDate', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={load} className="font-semibold text-indigo-600 hover:underline shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-400">
            <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            Loading transactions…
          </div>
        )}

        {/* Empty */}
        {!loading && expenses.length === 0 && (
          <div className="py-16 text-center">
            <ReceiptText size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 mb-1">No transactions found</p>
            {hasFilters ? (
              <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline">
                Clear filters
              </button>
            ) : (
              <button onClick={() => setShowAdd(true)} className="text-xs text-indigo-600 hover:underline">
                Add your first transaction
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!loading && expenses.length > 0 && (
          <>
            {/* Header */}
            <div className="grid grid-cols-[3fr_1.4fr_1.1fr_1.4fr_68px] px-5 py-2.5 border-b border-gray-50 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            {expenses.map((tx, i) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-[3fr_1.4fr_1.1fr_1.4fr_68px] px-5 py-3.5 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                      isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {isIncome ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{tx.title}</p>
                      {tx.notes && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{tx.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    {tx.category_name ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full max-w-full truncate"
                        style={{
                          background: `${tx.category_color || '#4F46E5'}18`,
                          color: tx.category_color || '#4F46E5',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: tx.category_color || '#4F46E5' }}
                        />
                        {tx.category_name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-500">{fmtDate(tx.date)}</span>

                  {/* Amount */}
                  <span className={`text-sm font-bold text-right ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isIncome ? '+' : '−'} {fmt(tx.amount)}
                  </span>

                  {/* Actions — visible on hover */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditing(tx)}
                      title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleting(tx)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex items-center gap-1.5">

            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {/* Page number window */}
            {(() => {
              const total = pagination.totalPages;
              const cur   = pagination.page;
              let start   = Math.max(1, cur - 2);
              let end     = Math.min(total, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
                <button
                  key={n}
                  onClick={() => setFilters((p) => ({ ...p, page: n }))}
                  className={`w-8 h-8 rounded-lg border text-sm font-semibold transition-colors ${
                    pagination.page === n
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ));
            })()}

            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <Modal title="Add transaction" onClose={() => setShowAdd(false)}>
          <ExpenseForm categories={categories} onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit transaction" onClose={() => setEditing(null)}>
          <ExpenseForm initial={editing} categories={categories} onSave={handleEdit} onClose={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete transaction" onClose={() => setDeleting(null)}>
          <DeleteConfirm expense={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />
        </Modal>
      )}
    </div>
  );
};

export default Expenses;
