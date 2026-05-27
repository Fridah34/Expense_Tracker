import { useState, useEffect, useCallback } from 'react';
import { expenseAPI, categoryAPI } from '../services/api';

const fmt = (n) =>
  `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Shared styles ───────────────────────────────────────────────────
const card = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #EFEFEF', overflow: 'hidden',
};

const inputStyle = (err) => ({
  width: '100%', height: 40, padding: '0 12px', fontSize: 13.5,
  borderRadius: 10, border: `1px solid ${err ? '#FCA5A5' : '#E5E7EB'}`,
  background: err ? '#FFF7F7' : '#FAFAFA', color: '#111827', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
});

const btnPrimary = {
  height: 40, padding: '0 20px', background: '#7C3AED', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  boxShadow: '0 2px 8px rgba(124,58,237,0.25)', transition: 'opacity 0.15s',
};

const btnSecondary = {
  height: 40, padding: '0 18px', background: '#fff', color: '#374151',
  border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13.5,
  fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s',
};

// ─── Spinner ─────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = '#fff' }) => (
  <>
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}30`, borderTopColor: color,
      animation: 'spin 0.6s linear infinite', flexShrink: 0,
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

// ─── Modal ───────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  }}>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(2px)' }} />
    <div style={{
      position: 'relative', background: '#fff', borderRadius: 20,
      boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
      width: '100%', maxWidth: 460, padding: 28, zIndex: 1,
      animation: 'modalIn 0.18s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{
          background: '#F3F4F6', border: 'none', borderRadius: 8,
          width: 30, height: 30, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#6B7280',
        }}>
          <i className="ti ti-x" style={{ fontSize: 14 }} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Expense Form ────────────────────────────────────────────────────
const ExpenseForm = ({ initial, categories, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    amount: initial?.amount || '',
    type: initial?.type || 'expense',
    date: initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    categoryId: initial?.category_id || '',
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(), amount: Number(form.amount),
        type: form.type, date: form.date,
        notes: form.notes || undefined,
        categoryId: form.categoryId || undefined,
      });
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong' });
    } finally { setSaving(false); }
  };

  const isExpense = form.type === 'expense';

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.server && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, fontSize: 13, color: '#DC2626' }}>
          {errors.server}
        </div>
      )}

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        {['expense', 'income'].map((t) => (
          <button key={t} type="button" onClick={() => set('type', t)} style={{
            flex: 1, padding: '10px 0', fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            transition: 'all 0.15s',
            background: form.type === t ? (t === 'expense' ? '#FEF2F2' : '#ECFDF5') : '#F9FAFB',
            color: form.type === t ? (t === 'expense' ? '#DC2626' : '#059669') : '#9CA3AF',
          }}>
            <i className={`ti ${t === 'expense' ? 'ti-trending-down' : 'ti-trending-up'}`} style={{ marginRight: 6 }} />
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
        <input style={inputStyle(errors.title)} value={form.title}
          onChange={(e) => set('title', e.target.value)} placeholder="e.g. Lunch at KFC" />
        {errors.title && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.title}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount (KES)</label>
          <input style={inputStyle(errors.amount)} type="number" min="0.01" step="0.01"
            value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0.00" />
          {errors.amount && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.amount}</p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
          <input style={inputStyle(errors.date)} type="date"
            value={form.date} onChange={(e) => set('date', e.target.value)} />
          {errors.date && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.date}</p>}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
        <select style={{ ...inputStyle(false), cursor: 'pointer' }}
          value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</label>
        <textarea style={{ ...inputStyle(false), height: 72, padding: '10px 12px', resize: 'none' }}
          value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional note…" />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onClose} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
          {saving ? <Spinner /> : <i className="ti ti-check" style={{ fontSize: 15 }} />}
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
};

// ─── Delete Confirm ──────────────────────────────────────────────────
const DeleteConfirm = ({ expense, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  const handle = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', background: '#FEF2F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
      }}>
        <i className="ti ti-trash" style={{ fontSize: 22, color: '#DC2626' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>Delete this transaction?</p>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 6px' }}>"{expense.title}"</p>
      <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '0 0 22px' }}>This cannot be undone.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
        <button onClick={handle} disabled={busy} style={{
          ...btnPrimary, flex: 1, justifyContent: 'center',
          background: '#DC2626', boxShadow: '0 2px 8px rgba(220,38,38,0.25)', opacity: busy ? 0.7 : 1,
        }}>
          {busy ? <Spinner /> : null}
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', categoryId: '', startDate: '', endDate: '', search: '', page: 1 });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { limit: 10, ...filters };
      Object.keys(params).forEach((k) => { if (params[k] === '') delete params[k]; });
      const [eRes, cRes] = await Promise.all([expenseAPI.getAll(params), categoryAPI.getAll()]);
      setExpenses(eRes.data.data.expenses);
      setPagination({ page: eRes.data.data.page, totalPages: eRes.data.data.totalPages, total: eRes.data.data.total });
      setCategories(cRes.data.data.categories);
    } catch { setError('Failed to load expenses.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }));
  const clearFilters = () => setFilters({ type: '', categoryId: '', startDate: '', endDate: '', search: '', page: 1 });
  const hasFilters = filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.search;

  const handleAdd = async (data) => { await expenseAPI.create(data); setShowAdd(false); load(); };
  const handleEdit = async (data) => { await expenseAPI.update(editing.id, data); setEditing(null); load(); };
  const handleDelete = async () => { await expenseAPI.delete(deleting.id); setDeleting(null); load(); };

  const filterInput = {
    height: 38, padding: '0 12px', fontSize: 13, borderRadius: 9,
    border: '1px solid #E5E7EB', background: '#FAFAFA', color: '#374151',
    outline: 'none', cursor: 'pointer',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>Expenses</h1>
          <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: '4px 0 0' }}>
            {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={btnPrimary}>
          <i className="ti ti-plus" style={{ fontSize: 16 }} />
          Add transaction
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EFEFEF', padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 }} />
            <input style={{ ...filterInput, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
              placeholder="Search transactions…"
              value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <select style={filterInput} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select style={filterInput} value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" style={filterInput} value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)} />
          <input type="date" style={filterInput} value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)} />
          {hasFilters && (
            <button onClick={clearFilters} style={{
              height: 38, padding: '0 14px', background: 'none', border: '1px solid #E5E7EB',
              borderRadius: 9, fontSize: 13, color: '#7C3AED', cursor: 'pointer', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, fontSize: 13.5, color: '#DC2626', marginBottom: 16 }}>
          {error} <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', textDecoration: 'underline', fontSize: 13.5 }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Spinner size={28} color="#7C3AED" />
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <i className="ti ti-receipt-off" style={{ fontSize: 36, color: '#D1D5DB', display: 'block', marginBottom: 10 }} />
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0, fontWeight: 500 }}>No transactions found</p>
            {hasFilters
              ? <button onClick={clearFilters} style={{ marginTop: 8, fontSize: 13, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear filters</button>
              : <button onClick={() => setShowAdd(true)} style={{ marginTop: 8, fontSize: 13, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Add your first transaction</button>
            }
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '3fr 1.5fr 1.2fr 1.5fr 60px',
              padding: '10px 20px', borderBottom: '1px solid #F3F4F6',
              fontSize: 11, fontWeight: 700, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span style={{ textAlign: 'right' }}>Amount</span>
              <span />
            </div>

            {expenses.map((tx, i) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} style={{
                  display: 'grid', gridTemplateColumns: '3fr 1.5fr 1.2fr 1.5fr 60px',
                  padding: '13px 20px', alignItems: 'center',
                  borderBottom: i < expenses.length - 1 ? '1px solid #F9FAFB' : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isIncome ? '#ECFDF5' : '#FEF2F2',
                      color: isIncome ? '#059669' : '#DC2626',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                    }}>
                      <i className={`ti ${isIncome ? 'ti-trending-up' : 'ti-trending-down'}`} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.title}</p>
                      {tx.notes && <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.notes}</p>}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    {tx.category_name ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, padding: '3px 10px', borderRadius: 20,
                        background: `${tx.category_color || '#7C3AED'}15`,
                        color: tx.category_color || '#7C3AED', fontWeight: 500,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: tx.category_color || '#7C3AED', flexShrink: 0 }} />
                        {tx.category_name}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                    )}
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: 12.5, color: '#6B7280' }}>{fmtDate(tx.date)}</span>

                  {/* Amount */}
                  <span style={{
                    fontSize: 14, fontWeight: 700, textAlign: 'right',
                    color: isIncome ? '#059669' : '#DC2626',
                  }}>
                    {isIncome ? '+' : '−'} {fmt(tx.amount)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <button onClick={() => setEditing(tx)} title="Edit" style={{
                      width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none',
                      cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EDE9FE'; e.currentTarget.style.color = '#7C3AED'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}>
                      <i className="ti ti-pencil" style={{ fontSize: 14 }} />
                    </button>
                    <button onClick={() => setDeleting(tx)} title="Delete" style={{
                      width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none',
                      cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}>
                      <i className="ti ti-trash" style={{ fontSize: 14 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button key={i} onClick={() => setFilters((p) => ({ ...p, page: i + 1 }))} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
                background: pagination.page === i + 1 ? '#7C3AED' : '#fff',
                color: pagination.page === i + 1 ? '#fff' : '#374151',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}

      {showAdd && <Modal title="Add transaction" onClose={() => setShowAdd(false)}><ExpenseForm categories={categories} onSave={handleAdd} onClose={() => setShowAdd(false)} /></Modal>}
      {editing && <Modal title="Edit transaction" onClose={() => setEditing(null)}><ExpenseForm initial={editing} categories={categories} onSave={handleEdit} onClose={() => setEditing(null)} /></Modal>}
      {deleting && <Modal title="Delete transaction" onClose={() => setDeleting(null)}><DeleteConfirm expense={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} /></Modal>}
    </div>
  );
};

export default Expenses;