import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: 'Weak',   color: 'bg-red-400',    text: 'text-red-500'    },
    { label: 'Fair',   color: 'bg-orange-400',  text: 'text-orange-500' },
    { label: 'Good',   color: 'bg-yellow-400',  text: 'text-yellow-600' },
    { label: 'Strong', color: 'bg-green-500',   text: 'text-green-600'  },
  ];
  return { score, ...map[score - 1] };
};

const EyeIcon = () => (
  <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Reusable field component
const Field = ({ label, id, name, type = 'text', value, onChange, placeholder, error, autoComplete, showToggle, showPw, onTogglePw }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showToggle ? (showPw ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-10 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition
          focus:ring-2 focus:ring-violet-500 focus:border-violet-500
          ${showToggle ? 'pl-3 pr-10' : 'px-3'}
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onTogglePw}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {showPw ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <ErrorIcon /> {error}
      </p>
    )}
  </div>
);

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2)
      newErrors.firstName = 'At least 2 characters';

    if (!formData.lastName.trim())
      newErrors.lastName = 'Last name is required';
    else if (formData.lastName.trim().length < 2)
      newErrors.lastName = 'At least 2 characters';

    if (!formData.email)
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email address';

    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'At least 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Needs uppercase, lowercase and a number';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      } else {
        setServerError(
          err.response?.data?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-sm font-semibold tracking-wide">ExpT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Start tracking your expenses today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Server Error */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                error={errors.firstName}
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <Field
              label="Email address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <Field
                label="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase & number"
                error={errors.password}
                autoComplete="new-password"
                showToggle
                showPw={showPassword}
                onTogglePw={() => setShowPassword((v) => !v)}
              />
            </div>

            {/* Confirm password */}
            <Field
              label="Confirm password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
              showToggle
              showPw={showConfirmPassword}
              onTogglePw={() => setShowConfirmPassword((v) => !v)}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;