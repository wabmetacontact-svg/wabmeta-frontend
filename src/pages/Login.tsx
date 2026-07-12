import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight,
  AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import toast from 'react-hot-toast';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';

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
        <SocialLoginButtons loading={isLoading} mode="login" />

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

export default Login;