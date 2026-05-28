import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Scale, PiggyBank,
  Building2, AlertTriangle, CheckCircle2, Plus,
  ReceiptText, BarChart3, ArrowRight,
} from 'lucide-react';
import { expenseAPI, categoryAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

// ─── Helpers ────────────────────────────────────────────────────────
const fmt = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtShort = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const getPeriodDates = (period) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (period === 'weekly') {
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(d - (dow === 0 ? 6 : dow - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      label: `Week of ${monday.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`,
      short: 'week',
    };
  }
  if (period === 'yearly') {
    return {
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
      label: `Year ${y}`,
      short: 'year',
    };
  }
  const lastDay = new Date(y, m + 1, 0).getDate();
  return {
    startDate: `${y}-${String(m + 1).padStart(2, '0')}-01`,
    endDate: `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`,
    label: now.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
    short: 'month',
  };
};

// ─── Budget Ring SVG ─────────────────────────────────────────────────
const BudgetRing = ({ pct, color }) => {
  const size = 88;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="shrink-0 -rotate-90"
    >
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#F3F4F6" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, Icon, accentClass, bgClass, highlight, highlightColor }) => (
  <div className={`rounded-2xl p-5 flex flex-col gap-3 ${
    highlight
      ? `text-white shadow-lg border-0`
      : 'bg-white border border-gray-100'
  }`}
    style={highlight ? { background: highlightColor, boxShadow: `0 8px 24px ${highlightColor}40` } : {}}
  >
    <div className="flex items-center justify-between">
      <span className={`text-xs font-semibold uppercase tracking-wider ${
        highlight ? 'text-white/70' : 'text-gray-400'
      }`}>
        {label}
      </span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        highlight ? 'bg-white/20' : `${bgClass}`
      }`}>
        <Icon size={16} className={highlight ? 'text-white' : accentClass} />
      </div>
    </div>
    <div>
      <p className={`text-xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-1 ${highlight ? 'text-white/60' : 'text-gray-400'}`}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── Transaction Row ─────────────────────────────────────────────────
const TxRow = ({ tx }) => {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
      }`}>
        {isIncome
          ? <TrendingUp size={15} />
          : <TrendingDown size={15} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{tx.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {tx.category_name || 'Uncategorized'} ·{' '}
          {new Date(tx.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <span className={`text-sm font-bold shrink-0 ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '−'}{fmtShort(tx.amount)}
      </span>
    </div>
  );
};

// ─── Category Bar ────────────────────────────────────────────────────
const CatBar = ({ cat, max, totalExpense }) => {
  const spent  = Number(cat.total_spent || 0);
  const pct    = max > 0 ? Math.round((spent / max) * 100) : 0;
  const share  = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
  const color  = cat.color || '#4F46E5';

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs"
            style={{ background: `${color}18`, color }}
          >
            <i className={`ti ${cat.icon || 'ti-tag'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{fmtShort(spent)}</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color }}
          >
            {share}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Overspend Alert Banner ──────────────────────────────────────────
const OverspendAlert = ({ budgetPct, expense, income }) => {
  if (budgetPct < 70) return null;

  const isOver   = budgetPct >= 100;
  const isCritical = budgetPct >= 90;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border mb-4 ${
      isOver
        ? 'bg-red-50 border-red-200'
        : isCritical
        ? 'bg-orange-50 border-orange-200'
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <AlertTriangle
        size={18}
        className={`shrink-0 mt-0.5 ${
          isOver ? 'text-red-500' : isCritical ? 'text-orange-500' : 'text-yellow-600'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${
          isOver ? 'text-red-700' : isCritical ? 'text-orange-700' : 'text-yellow-700'
        }`}>
          {isOver
            ? 'You have gone over budget'
            : isCritical
            ? 'Almost at your budget limit'
            : 'Approaching your budget limit'}
        </p>
        <p className={`text-xs mt-0.5 ${
          isOver ? 'text-red-500' : isCritical ? 'text-orange-500' : 'text-yellow-600'
        }`}>
          {isOver
            ? `You have spent ${fmtShort(expense - income)} more than your income. This is coming from your savings.`
            : `You have used ${budgetPct}% of your income. ${fmtShort(income - expense)} remaining.`}
        </p>
      </div>
    </div>
  );
};

// ─── Category Budget Row ─────────────────────────────────────────────
// Shows per-category budget usage for categories that have total_spent > 0
const CategoryBudgetRow = ({ cat, totalIncome }) => {
  const spent    = Number(cat.total_spent || 0);
  const color    = cat.color || '#4F46E5';
  // We don't have per-category budgets in backend yet,
  // so we flag categories that account for > 30% of income as heavy spend
  const pctOfIncome = totalIncome > 0 ? Math.round((spent / totalIncome) * 100) : 0;
  const isHeavy = pctOfIncome > 30;
  const isMedium = pctOfIncome > 15;

  if (spent === 0) return null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div
        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
        style={{ background: `${color}18`, color }}
      >
        <i className={`ti ${cat.icon || 'ti-tag'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{fmtShort(spent)}</span>
            {isHeavy && (
              <span className="text-xs font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> High
              </span>
            )}
            {!isHeavy && isMedium && (
              <span className="text-xs font-semibold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                Medium
              </span>
            )}
            {!isHeavy && !isMedium && (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} /> OK
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pctOfIncome * 2, 100)}%`,
              background: isHeavy ? '#DC2626' : isMedium ? '#D97706' : color,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pctOfIncome}% of income</p>
      </div>
    </div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [period, setPeriod]       = useState('monthly');
  const [summary, setSummary]     = useState(null);
  const [expenses, setExpenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const { startDate, endDate, label, short } = getPeriodDates(period);

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

  // ── Derived values ────────────────────────────────────────────────
  const income      = Number(summary?.income || 0);
  const expense     = Number(summary?.expense || 0);
  const balance     = income - expense;
  const count       = summary?.count || 0;
  const savingsAmt  = Math.max(balance, 0);
  const savingsRate = income > 0 ? Math.round((savingsAmt / income) * 100) : 0;
  const budgetPct   = income > 0 ? Math.min(Math.round((expense / income) * 100), 100) : 0;
  const budgetColor = budgetPct >= 100 ? '#DC2626' : budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#4F46E5';

  const spentCats = categories
    .filter((c) => Number(c.total_spent) > 0)
    .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
    .slice(0, 5);
  const maxSpent = spentCats.length > 0
    ? Math.max(...spentCats.map((c) => Number(c.total_spent))) : 0;

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-9 h-9 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-indigo-600 underline"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting}, {user?.firstName} 
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Financial snapshot · {label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
            {[['weekly', 'Week'], ['monthly', 'Month'], ['yearly', 'Year']].map(([p, lbl]) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <Link
            to="/expenses"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add transaction
          </Link>
        </div>
      </div>

      {/* ── Overspend alert ── */}
      <OverspendAlert budgetPct={budgetPct} expense={expense} income={income} />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Salary / Income"
          value={fmt(income)}
          sub={label}
          Icon={Building2}
          highlightColor="#4F46E5"
          highlight
        />
        <StatCard
          label="Total Expenses"
          value={fmt(expense)}
          sub={`${count} transaction${count !== 1 ? 's' : ''}`}
          Icon={TrendingDown}
          accentClass="text-red-500"
          bgClass="bg-red-50"
        />
        <StatCard
          label="Net Balance"
          value={fmt(balance)}
          sub="Income − Expenses"
          Icon={Scale}
          accentClass={balance >= 0 ? 'text-emerald-600' : 'text-red-500'}
          bgClass={balance >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
        />
        <StatCard
          label="Going to Savings"
          value={fmt(savingsAmt)}
          sub={`${savingsRate}% of income`}
          Icon={PiggyBank}
          accentClass="text-sky-600"
          bgClass="bg-sky-50"
        />
      </div>

      {/* ── Budget usage + Savings ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Budget ring */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <BudgetRing pct={budgetPct} color={budgetColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold leading-none" style={{ color: budgetColor }}>
                {budgetPct}%
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">used</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 mb-1">Budget usage</p>
            <p className="text-xs text-gray-500 mb-3">
              {budgetPct >= 100
                ? 'Over budget — spending from savings'
                : budgetPct > 70
                ? 'Getting close to your limit'
                : 'Spending is within budget'}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Spent</span>
                <span className="text-xs font-semibold text-red-500">{fmtShort(expense)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Remaining</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {fmtShort(Math.max(income - expense, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Income</span>
                <span className="text-xs font-semibold text-gray-700">{fmtShort(income)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900">
              Savings this {short}
            </p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              savingsRate >= 20
                ? 'bg-emerald-50 text-emerald-700'
                : savingsRate >= 10
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-red-50 text-red-600'
            }`}>
              {savingsRate >= 20 ? '✓ On track' : savingsRate >= 10 ? 'Fair' : 'Low'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {fmt(savingsAmt)}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {savingsRate}% of {fmtShort(income)} income
          </p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(savingsRate * 5, 100)}%`,
                background: savingsRate >= 20
                  ? '#059669'
                  : savingsRate >= 10
                  ? '#D97706'
                  : '#DC2626',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>Goal: 20%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ReceiptText size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Recent transactions</span>
            </div>
            <Link
              to="/expenses"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {expenses.length === 0 ? (
            <div className="py-10 text-center">
              <ReceiptText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No transactions yet</p>
              <Link to="/expenses" className="text-xs text-indigo-600 hover:underline mt-1 block">
                Add your first →
              </Link>
            </div>
          ) : (
            expenses.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </div>

        {/* Spending by category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Spending by category</span>
            </div>
            <Link
              to="/categories"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          {spentCats.length === 0 ? (
            <div className="py-10 text-center">
              <BarChart3 size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No spending data yet</p>
              <Link to="/categories" className="text-xs text-indigo-600 hover:underline mt-1 block">
                Create a category →
              </Link>
            </div>
          ) : (
            spentCats.map((c) => (
              <CatBar key={c.id} cat={c} max={maxSpent} totalExpense={expense} />
            ))
          )}
        </div>
      </div>

      {/* ── Per-category budget tracking ── */}
      {income > 0 && spentCats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Budget tracking by category</span>
            </div>
            <span className="text-xs text-gray-400">Based on % of income</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            {spentCats.map((cat) => (
              <CategoryBudgetRow key={cat.id} cat={cat} totalIncome={income} />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> OK — under 15% of income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Medium — 15–30%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High — over 30%
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;