import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import {
  User,
  Lock,
  KeyRound,
  UserX,
  AlertTriangle,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  X,
} from 'lucide-react';

const Spinner = ({ size = 15, color = '#fff' }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${color}30`,
      borderTopColor: color,
      animation: 'spin 0.6s linear infinite',
    }}
  >
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Alert = ({ type, msg, onClose }) => {
  if (!msg) return null;

  useEffect(() => {
    if (msg && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg, onClose]);

  const variants = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertTriangle,
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${variant.bg} ${variant.border} ${variant.text} mb-4 text-sm`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="flex-shrink-0" />
        <span>{msg}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Delete Confirmation Modal using createPortal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    setLocalError('');
    onConfirm(password);
  };

  const handleClose = () => {
    setPassword('');
    setLocalError('');
    setShowPassword(false);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning message */}
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <p className="font-medium mb-1">This action cannot be undone!</p>
          <p>This will permanently delete your account, all expenses, and all categories.</p>
        </div>

        {/* Error display */}
        {(error || localError) && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error || localError}
          </div>
        )}

        {/* Password input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm with your password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-red-400 focus:bg-white transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-70"
          >
            {isDeleting ? <Spinner size={14} /> : <Trash2 size={16} />}
            {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ─── Section: Personal Info ───────────────────────────────────────────
const PersonalInfoSection = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const handleSubmit = async () => {
    setSuccess('');
    setServerError('');

    const errs = {};
    if (!form.firstName.trim() || form.firstName.length < 2) {
      errs.firstName = 'At least 2 characters';
    }
    if (!form.lastName.trim() || form.lastName.length < 2) {
      errs.lastName = 'At least 2 characters';
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await userAPI.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      
      // Response guard - check for valid response
      const updatedUser = res?.data?.data?.user;
      if (updatedUser && typeof updatedUser === 'object') {
        onUpdate(updatedUser);
        setSuccess('Profile updated successfully.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
          <User size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Personal information</h2>
          <p className="text-xs text-gray-400">Update your name</p>
        </div>
      </div>

      <Alert type="success" msg={success} onClose={() => setSuccess('')} />
      <Alert type="error" msg={serverError} onClose={() => setServerError('')} />

      <div className="space-y-4">
        {/* Read-only email */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Email
          </label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm">
            <Mail size={14} className="text-gray-400" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              First name
            </label>
            <input
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors ${
                errors.firstName
                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white'
              }`}
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Last name
            </label>
            <input
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors ${
                errors.lastName
                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white'
              }`}
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-10 px-5 bg-violet-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-violet-700 transition-colors disabled:opacity-70"
        >
          {saving ? <Spinner size={13} /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

// ─── Section: Change Password ─────────────────────────────────────────
const PasswordSection = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

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

  const handleSubmit = async () => {
    setSuccess('');
    setServerError('');

    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password required';
    if (!form.newPassword || form.newPassword.length < 8) {
      errs.newPassword = 'At least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
      errs.newPassword = 'Needs uppercase, lowercase and number';
    }
    if (form.confirmPassword !== form.newPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await userAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      
      // Response guard
      if (res?.data?.success !== false) {
        setSuccess('Password changed successfully.');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
      } else {
        throw new Error('Password change failed');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const PwField = ({ label, fieldKey, showKey, placeholder = '••••••••' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm outline-none transition-colors ${
            errors[fieldKey]
              ? 'border-red-300 bg-red-50 focus:border-red-400'
              : 'border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white'
          }`}
          value={form[fieldKey]}
          onChange={(e) => setField(fieldKey, e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {errors[fieldKey] && (
        <p className="mt-1 text-xs text-red-600">{errors[fieldKey]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Change password</h2>
          <p className="text-xs text-gray-400">Use a strong password</p>
        </div>
      </div>

      <Alert type="success" msg={success} onClose={() => setSuccess('')} />
      <Alert type="error" msg={serverError} onClose={() => setServerError('')} />

      <div className="space-y-4">
        <PwField label="Current password" fieldKey="currentPassword" showKey="current" />
        <PwField label="New password" fieldKey="newPassword" showKey="new" />

        {/* Strength bar */}
        {form.newPassword && (
          <div className="mt-[-8px]">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-colors"
                  style={{
                    background:
                      i <= pwStrength
                        ? strengthColors[pwStrength]
                        : '#F3F4F6',
                  }}
                />
              ))}
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: strengthColors[pwStrength] }}
            >
              {strengthLabels[pwStrength]}
            </span>
          </div>
        )}

        <PwField label="Confirm new password" fieldKey="confirmPassword" showKey="confirm" />

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-10 px-5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {saving ? <Spinner size={13} /> : <KeyRound size={14} />}
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
};

// ─── Section: Delete Account ──────────────────────────────────────────
const DeleteSection = ({ logout }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (password) => {
    setIsDeleting(true);
    setError('');
    
    try {
      const res = await userAPI.deleteAccount({ password });
      
      // Response guard - check if deletion was successful
      if (res?.data?.success !== false) {
        logout();
        navigate('/login');
      } else {
        throw new Error(res?.data?.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password or delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <UserX size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Delete account</h2>
              <p className="text-xs text-gray-400">Permanently remove your account</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-4 rounded-lg text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal using createPortal */}
      <DeleteConfirmModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setError('');
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={error}
      />
    </>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────
const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-5">
        <PersonalInfoSection user={user} onUpdate={updateUser} />
        <PasswordSection />
        <DeleteSection logout={logout} />
      </div>
    </>
  );
};

export default Profile;