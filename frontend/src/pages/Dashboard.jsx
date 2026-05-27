import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI, categoryAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

// ─── Helpers ────────────────────────────────────────────────────────
const fmt = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const getPeriodDates = (period) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(d - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      label: `Week of ${monday.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`,
    };
  }
  if (period === 'yearly') {
    return {
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
      label: `Year ${y}`,
    };
  }
  // monthly (default)
  const lastDay = new Date(y, m + 1, 0).getDate();
  return {
    startDate: `${y}-${String(m + 1).padStart(2, '0')}-01`,
    endDate: `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`,
    label: now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
  };
};

// ─── Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent, bg, highlight }) => (
  <div style={{
    background: highlight ? accent : '#fff',
    borderRadius: 16, padding: '20px 22px',
    border: highlight ? 'none' : '1px solid #EFEFEF',
    display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: highlight ? `0 8px 24px ${accent}40` : 'none',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? 'rgba(255,255,255,0.75)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: highlight ? 'rgba(255,255,255,0.2)' : bg,
        color: highlight ? '#fff' : accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>
        <i className={`ti ${icon}`} />
      </div>
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', margin: 0, color: highlight ? '#fff' : '#111827' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, margin: '4px 0 0', color: highlight ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── Budget Ring ─────────────────────────────────────────────────────
const BudgetRing = ({ pct, color, size = 80 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
};

// ─── Transaction Row ─────────────────────────────────────────────────
const TxRow = ({ tx }) => {
  const isIncome = tx.type === 'income';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F9FAFB' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: isIncome ? '#ECFDF5' : '#FEF2F2',
        color: isIncome ? '#059669' : '#DC2626',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>
        <i className={`ti ${isIncome ? 'ti-trending-up' : 'ti-trending-down'}`} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.title}
        </p>
        <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: '2px 0 0' }}>
          {tx.category_name || 'Uncategorized'} · {new Date(tx.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: isIncome ? '#059669' : '#DC2626', flexShrink: 0 }}>
        {isIncome ? '+' : '−'}{fmtShort(tx.amount)}
      </span>
    </div>
  );
};

// ─── Category Bar ────────────────────────────────────────────────────
const CatBar = ({ cat, max }) => {
  const pct = max > 0 ? Math.round((Number(cat.total_spent) / max) * 100) : 0;
  const color = cat.color || '#4F46E5';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: `${color}18`, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
          }}>
            <i className={`ti ${cat.icon || 'ti-tag'}`} />
          </div>
          <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{cat.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{fmtShort(cat.total_spent)}</span>
          <span style={{ fontSize: 11, color, fontWeight: 600, background: `${color}15`, padding: '1px 7px', borderRadius: 20 }}>
            {pct}%
          </span>
        </div>
      </div>
      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.7s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { startDate, endDate, label } = getPeriodDates(period);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [sRes, eRes, cRes] = await Promise.all([
          expenseAPI.getSummary({ startDate, endDate }),
          expenseAPI.getAll({ limit: 6, page: 1 }),
          categoryAPI.getAll(),
        ]);
        setSummary(sRes.data.data.summary);
        setExpenses(eRes.data.data.expenses);
        setCategories(cRes.data.data.categories);
      } catch {
        setError('Failed to load dashboard data.');
      } finally { setLoading(false); }
    };
    load();
  }, [startDate, endDate]);

  const income   = Number(summary?.income || 0);
  const expense  = Number(summary?.expense || 0);
  const balance  = income - expense;
  const count    = summary?.count || 0;

  // Savings: money left over = balance (what wasn't spent)
  const savingsAmt  = Math.max(balance, 0);
  const savingsRate = income > 0 ? Math.round((savingsAmt / income) * 100) : 0;

  // Budget usage
  const budgetPct  = income > 0 ? Math.min(Math.round((expense / income) * 100), 100) : 0;
  const budgetColor = budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#4F46E5';

  const spentCats = categories
    .filter((c) => Number(c.total_spent) > 0)
    .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
    .slice(0, 5);
  const maxSpent = spentCats.length > 0
    ? Math.max(...spentCats.map((c) => Number(c.total_spent))) : 0;

  const periodBtn = (p, lbl) => (
    <button onClick={() => setPeriod(p)} style={{
      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 12.5, fontWeight: 600,
      background: period === p ? '#4F46E5' : 'transparent',
      color: period === p ? '#fff' : '#6B7280',
      transition: 'all 0.15s',
    }}>{lbl}</button>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #EDE9FE', borderTopColor: '#4F46E5', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, fontSize: 13, color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            {greeting}, {user?.firstName} 
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '3px 0 0' }}>
            Financial snapshot · {label}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Period switcher */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 3, gap: 2 }}>
            {periodBtn('weekly', 'Week')}
            {periodBtn('monthly', 'Month')}
            {periodBtn('yearly', 'Year')}
          </div>
          <Link to="/expenses" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#4F46E5', color: '#fff', padding: '9px 16px',
            borderRadius: 10, textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 3px 10px rgba(79,70,229,0.3)',
          }}>
            <i className="ti ti-plus" style={{ fontSize: 15 }} />
            Add transaction
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="Salary / Income" value={fmt(income)} sub={label}
          icon="ti-building-bank" accent="#4F46E5" bg="#EEF2FF" highlight />
        <StatCard label="Total Expenses" value={fmt(expense)}
          sub={`${count} transaction${count !== 1 ? 's' : ''}`}
          icon="ti-trending-down" accent="#DC2626" bg="#FEF2F2" />
        <StatCard label="Net Balance" value={fmt(balance)} sub="Income − expenses"
          icon="ti-scale" accent={balance >= 0 ? '#059669' : '#DC2626'}
          bg={balance >= 0 ? '#ECFDF5' : '#FEF2F2'} />
        <StatCard label="Going to savings" value={fmt(savingsAmt)}
          sub={`${savingsRate}% of income saved`}
          icon="ti-piggy-bank" accent="#0284C7" bg="#F0F9FF" />
      </div>

      {/* ── Budget usage + savings breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>

        {/* Budget ring card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <BudgetRing pct={budgetPct} color={budgetColor} size={88} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: budgetColor, lineHeight: 1 }}>{budgetPct}%</span>
              <span style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>used</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Budget usage</p>
            <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 12px' }}>
              {budgetPct > 90 ? '⚠️ Over budget — dipping into savings'
                : budgetPct > 70 ? 'Getting close to your limit'
                : 'Spending is within budget'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Spent</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>{fmtShort(expense)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Remaining</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>{fmtShort(Math.max(income - expense, 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Savings this {period === 'weekly' ? 'week' : period === 'yearly' ? 'year' : 'month'}</p>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: savingsRate >= 20 ? '#ECFDF5' : savingsRate >= 10 ? '#FEF9C3' : '#FEF2F2',
              color: savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#92400E' : '#DC2626',
            }}>
              {savingsRate >= 20 ? 'On track' : savingsRate >= 10 ? 'Fair' : 'Low'}
            </span>
          </div>

          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {fmt(savingsAmt)}
          </p>
          <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '0 0 16px' }}>
            {savingsRate}% of {fmtShort(income)} income
          </p>

          {/* Savings bar */}
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${Math.min(savingsRate, 100)}%`, height: '100%', borderRadius: 99,
              background: savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#D97706' : '#DC2626',
              transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
          <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
            Goal: save at least 20% of income each {period === 'weekly' ? 'week' : period === 'yearly' ? 'year' : 'month'}
          </p>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Recent transactions */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Recent transactions</span>
            <Link to="/expenses" style={{ fontSize: 12, color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {expenses.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <i className="ti ti-receipt-off" style={{ fontSize: 28, color: '#D1D5DB', display: 'block', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No transactions yet</p>
              <Link to="/expenses" style={{ fontSize: 12, color: '#4F46E5', textDecoration: 'none', display: 'block', marginTop: 6 }}>Add your first →</Link>
            </div>
          ) : (
            expenses.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </div>

        {/* Spending by category */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Spending by category</span>
            <Link to="/categories" style={{ fontSize: 12, color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>Manage →</Link>
          </div>
          {spentCats.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <i className="ti ti-chart-bar-off" style={{ fontSize: 28, color: '#D1D5DB', display: 'block', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No spending data yet</p>
              <Link to="/categories" style={{ fontSize: 12, color: '#4F46E5', textDecoration: 'none', display: 'block', marginTop: 6 }}>Create a category →</Link>
            </div>
          ) : (
            spentCats.map((c) => <CatBar key={c.id} cat={c} max={maxSpent} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;