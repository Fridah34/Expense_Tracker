import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

const btnPrimary = {
  height: 40, padding: '0 22px', background: '#7C3AED', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
  boxShadow: '0 2px 8px rgba(124,58,237,0.25)', transition: 'opacity 0.15s',
};

const inputStyle = (err) => ({
  width: '100%', height: 40, padding: '0 12px', fontSize: 13.5,
  borderRadius: 10, border: `1px solid ${err ? '#FCA5A5' : '#E5E7EB'}`,
  background: err ? '#FFF7F7' : '#FAFAFA', color: '#111827', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
});

const labelStyle = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const sectionCard = {
  background: '#fff', borderRadius: 16, border: '1px solid #EFEFEF', padding: '24px 28px', marginBottom: 16,
};

const Spinner = ({ size = 15, color = '#fff' }) => (
  <>
    <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${color}30`, borderTopColor: color, animation: 'spin 0.6s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

const Alert = ({ type, msg }) => {
  if (!msg) return null;
  const styles = {
    success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', icon: 'ti-circle-check' },
    error: { bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B', icon: 'ti-alert-circle' },
  };
  const s = styles[type];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, fontSize: 13, color: s.color, marginBottom: 16 }}>
      <i className={`ti ${s.icon}`} style={{ fontSize: 15, flexShrink: 0 }} />
      {msg}
    </div>
  );
};

// ─── Section: Personal Info ───────────────────────────────────────────
const PersonalInfoSection = ({ user, onUpdate }) => {
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setServerError('');
    const errs = {};
    if (!form.firstName.trim() || form.firstName.length < 2) errs.firstName = 'At least 2 characters';
    if (!form.lastName.trim() || form.lastName.length < 2) errs.lastName = 'At least 2 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      onUpdate(res.data.data.user);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  return (
    <div style={sectionCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          <i className="ti ti-user" />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Personal information</h2>
          <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>Update your name</p>
        </div>
      </div>

      <Alert type="success" msg={success} />
      <Alert type="error" msg={serverError} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Read-only email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <div style={{
            ...inputStyle(false), display: 'flex', alignItems: 'center',
            background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed',
            paddingTop: 0, paddingBottom: 0, gap: 8,
          }}>
            <i className="ti ti-lock" style={{ fontSize: 14, color: '#9CA3AF' }} />
            <span>{user?.email}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>First name</label>
            <input style={inputStyle(errors.firstName)} value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)} placeholder="John" />
            {errors.firstName && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.firstName}</p>}
          </div>
          <div>
            <label style={labelStyle}>Last name</label>
            <input style={inputStyle(errors.lastName)} value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" />
            {errors.lastName && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.lastName}</p>}
          </div>
        </div>

        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Spinner /> : <i className="ti ti-check" style={{ fontSize: 15 }} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

// ─── Section: Change Password ─────────────────────────────────────────
const PasswordSection = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: '' })); };

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#DC2626', '#D97706', '#65A30D', '#059669'];
  const pwStrength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setServerError('');
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password required';
    if (!form.newPassword || form.newPassword.length < 8) errs.newPassword = 'At least 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) errs.newPassword = 'Needs uppercase, lowercase and number';
    if (form.confirmPassword !== form.newPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to change password.');
    } finally { setSaving(false); }
  };

  const PwField = ({ label, fieldKey, showKey }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show[showKey] ? 'text' : 'password'}
          style={{ ...inputStyle(errors[fieldKey]), paddingRight: 42 }}
          value={form[fieldKey]}
          onChange={(e) => set(fieldKey, e.target.value)}
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex',
        }}>
          <i className={`ti ${show[showKey] ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 16 }} />
        </button>
      </div>
      {errors[fieldKey] && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{errors[fieldKey]}</p>}
    </div>
  );

  return (
    <div style={sectionCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          <i className="ti ti-lock" />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Change password</h2>
          <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>Use a strong password</p>
        </div>
      </div>

      <Alert type="success" msg={success} />
      <Alert type="error" msg={serverError} />

      <form onSubmit={handleSubmit} noValidate>
        <PwField label="Current password" fieldKey="currentPassword" showKey="current" />
        <PwField label="New password" fieldKey="newPassword" showKey="new" />

        {/* Strength bar */}
        {form.newPassword && (
          <div style={{ marginTop: -8, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[1,2,3,4].map((i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: i <= pwStrength ? strengthColors[pwStrength] : '#F3F4F6',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: strengthColors[pwStrength] }}>
              {strengthLabels[pwStrength]}
            </span>
          </div>
        )}

        <PwField label="Confirm new password" fieldKey="confirmPassword" showKey="confirm" />

        <button type="submit" disabled={saving} style={{ ...btnPrimary, background: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.25)', opacity: saving ? 0.7 : 1, marginTop: 4 }}>
          {saving ? <Spinner /> : <i className="ti ti-shield-check" style={{ fontSize: 15 }} />}
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
};

// ─── Section: Delete Account ──────────────────────────────────────────
const DeleteSection = ({ logout }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password) { setError('Password is required'); return; }
    setBusy(true);
    try {
      await userAPI.deleteAccount({ password });
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password.');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ ...sectionCard, border: '1px solid #FEE2E2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: open ? 20 : 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          <i className="ti ti-user-x" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Delete account</h2>
          <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>Permanently remove your account and all data</p>
        </div>
        <button onClick={() => { setOpen((v) => !v); setError(''); setPassword(''); }} style={{
          height: 34, padding: '0 14px', background: open ? '#FEF2F2' : '#fff',
          border: '1px solid #FCA5A5', borderRadius: 9, fontSize: 13, fontWeight: 600,
          color: '#DC2626', cursor: 'pointer',
        }}>
          {open ? 'Cancel' : 'Delete account'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleDelete} noValidate>
          <div style={{ padding: '14px 16px', background: '#FFF7F7', border: '1px solid #FEE2E2', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#7F1D1D', display: 'flex', gap: 8 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
            <span>This will permanently delete your account, all expenses and categories. <strong>This cannot be undone.</strong></span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Confirm with your password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                style={{ ...inputStyle(!!error), paddingRight: 42 }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShow((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                <i className={`ti ${show ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 16 }} />
              </button>
            </div>
            {error && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#DC2626' }}>{error}</p>}
          </div>
          <button type="submit" disabled={busy} style={{
            ...btnPrimary, background: '#DC2626', boxShadow: '0 2px 8px rgba(220,38,38,0.25)', opacity: busy ? 0.7 : 1,
          }}>
            {busy ? <Spinner /> : <i className="ti ti-trash" style={{ fontSize: 15 }} />}
            {busy ? 'Deleting…' : 'Yes, delete my account'}
          </button>
        </form>
      )}
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────
const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>Profile</h1>
        <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: '4px 0 0' }}>Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div style={{ ...sectionCard, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7F6FE8, #4F46E5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
          boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
        }}>{initials}</div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p style={{ fontSize: 13.5, color: '#6B7280', margin: '3px 0 0' }}>{user?.email}</p>
        </div>
      </div>

      <PersonalInfoSection user={user} onUpdate={updateUser} />
      <PasswordSection />
      <DeleteSection logout={logout} />
    </div>
  );
};

export default Profile;