import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight,
  AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validate = (form: FormState): FieldErrors => {
  const errs: FieldErrors = {};
  if (!form.email)
    errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Enter a valid email address';
  if (!form.password)
    errs.password = 'Password is required';
  return errs;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  label, id, type = 'text', placeholder,
  value, onChange, error, autoFocus,
  autoComplete, disabled, icon, rightElement,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`
          w-full h-11 pl-10 pr-4 text-sm rounded-xl
          border bg-white text-gray-900
          placeholder:text-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${rightElement ? 'pr-11' : ''}
          ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-primary-100'
          }
        `}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { login, isLoading, clearError } = useAuth();

  const [form, setForm]         = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const update = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setApiError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setApiError(null);

    try {
      const result = await login(
        form.email.trim().toLowerCase(),
        form.password,
      );

      if (result.success) {
        rememberMe
          ? localStorage.setItem('remember_me', 'true')
          : localStorage.removeItem('remember_me');

        toast.success('Welcome back!');
        const from = (location.state as any)?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setApiError(result.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || err?.message;

      if (status === 401)      setApiError('Invalid email or password.');
      else if (status === 403) setApiError(message?.toLowerCase().includes('verify')
        ? 'Please verify your email before signing in.'
        : message?.toLowerCase().includes('suspend')
          ? 'Account suspended. Contact support.'
          : message || 'Access denied.');
      else if (status === 429) setApiError('Too many attempts. Try again later.');
      else                     setApiError(message || 'Login failed. Check credentials.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your WabMeta account"
    >
      {/* API Error Banner */}
      {apiError && (
        <div className="mb-5 p-3.5 rounded-xl flex items-start gap-3
          bg-red-50 border border-red-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Email */}
        <Field
          label="Email address"
          id="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={v => update('email', v)}
          error={errors.email}
          autoFocus
          autoComplete="email"
          disabled={isLoading}
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Password */}
        <Field
          label="Password"
          id="password"
          type={showPass ? 'text' : 'password'}
          placeholder="Enter your password"
          value={form.password}
          onChange={v => update('password', v)}
          error={errors.password}
          autoComplete="current-password"
          disabled={isLoading}
          icon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          }
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-500
                focus:ring-primary-400 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Keep me signed in</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600
              hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 flex items-center justify-center gap-2
            bg-primary-500 hover:bg-primary-600
            text-white text-sm font-semibold
            rounded-xl shadow-sm
            hover:-translate-y-0.5 hover:shadow-md
            active:translate-y-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30
                border-t-white rounded-full animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign in to dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>
        </div>

        {/* Google SSO */}
        <GoogleButton disabled={isLoading} />

        {/* Signup link */}
        <p className="text-center text-sm text-gray-500 pt-1">
          New to WabMeta?{' '}
          <Link
            to="/signup"
            className="font-semibold text-primary-600
              hover:text-primary-700 transition-colors"
          >
            Create free account →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// ─── Google Button ────────────────────────────────────────────────────────────
// SocialLoginButtons.tsx ki jagah yahan inline
// Kyunki sirf Login page use karta hai

const GoogleButton: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <button
    type="button"
    disabled={disabled}
    className="w-full h-11 flex items-center justify-center gap-3
      bg-white border border-gray-200
      hover:bg-gray-50 hover:border-gray-300
      text-gray-700 text-sm font-medium
      rounded-xl transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={() => {
      // Google OAuth handler
      toast.error('Google login coming soon!');
    }}
  >
    {/* Google SVG Icon */}
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
    Continue with Google
  </button>
);

export default Login;