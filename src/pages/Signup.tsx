// src/pages/Signup.tsx
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Check, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { auth } from '../services/api';
import AuthLayout from '../components/auth/AuthLayout';
import SocialLoginButtons, { hasSocialLogin } from '../components/auth/SocialLoginButtons';

const STEPS = ['You', 'Organization', 'Security'] as const;

const COUNTRIES = [
  { code: '+91', name: 'India', flag: '🇮🇳', digits: 10 },
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸', digits: 10 },
  { code: '+44', name: 'UK', flag: '🇬🇧', digits: 10 },
  { code: '+971', name: 'UAE', flag: '🇦🇪', digits: 9 },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', digits: 9 },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', digits: 8 },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', digits: 10 },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', digits: 10 },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', digits: 9 },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', digits: 10 },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', digits: 10 },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', digits: 10 },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', digits: 10 },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', digits: 9 },
  { code: '+61', name: 'Australia', flag: '🇦🇺', digits: 9 },
  { code: '+49', name: 'Germany', flag: '🇩🇪', digits: 11 },
  { code: '+33', name: 'France', flag: '🇫🇷', digits: 9 },
  { code: '+81', name: 'Japan', flag: '🇯🇵', digits: 10 },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', digits: 10 },
];

const validatePasswordStrength = (pwd: string): string | null => {
  if (!pwd) return 'Password is required';
  if (pwd.length < 8) return 'At least 8 characters';
  if (pwd.length > 128) return 'Too long (max 128 characters)';

  let score = 0;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score < 3) {
    return 'Use at least 3 of: uppercase, lowercase, numbers, special characters';
  }

  const common = ['password', 'password123', '12345678', 'qwerty123', 'admin123'];
  if (common.includes(pwd.toLowerCase())) {
    return 'This password is too common';
  }

  return null;
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
}

const PWD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special char (@$!%*?&#)', test: (p: string) => /[@$!%*?&#]/.test(p) },
];

const getStrength = (score: number): StrengthResult => {
  if (score === 0) return { score, label: '', color: 'bg-gray-200', textColor: 'text-gray-400' };
  if (score === 1) return { score, label: 'Very weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
  if (score === 4) return { score, label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-600' };
  return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
};

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const rules = useMemo(() =>
    PWD_RULES.map(r => ({ ...r, met: r.test(password) })),
    [password],
  );
  const strength = getStrength(rules.filter(r => r.met).length);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-500">Strength</span>
          {strength.label && (
            <span className={`text-xs font-semibold ${strength.textColor}`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300
                ${n <= strength.score ? strength.color : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <ul className="space-y-1">
        {rules.map(r => (
          <li
            key={r.label}
            className={`flex items-center gap-2 text-xs transition-colors duration-200
              ${r.met ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0
              ${r.met ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              {r.met ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <span className="w-1 h-1 rounded-full bg-gray-400" />}
            </div>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: React.ReactNode;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  rightEl?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

const Field: React.FC<FieldProps> = ({
  label, id, type = 'text', placeholder,
  value, onChange, error, helper,
  autoFocus, required, disabled,
  maxLength, icon, rightEl, inputMode,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`
          w-full h-11 text-sm rounded-xl
          border bg-white text-gray-900
          placeholder:text-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : 'pl-4'}
          ${rightEl ? 'pr-11' : 'pr-4'}
          ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-100'
          }
        `}
      />
      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightEl}
        </div>
      )}
    </div>

    {error ? (
      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {error}
      </p>
    ) : helper ? (
      <div className="mt-1.5 text-xs text-gray-400">{helper}</div>
    ) : null}
  </div>
);

const StepProgress: React.FC<{ step: number }> = ({ step }) => (
  <div className="mb-8">
    <div className="flex gap-1.5 mb-3">
      {STEPS.map((_, i) => (
        <div key={i} className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: i + 1 <= step ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>

    <div className="flex justify-between">
      {STEPS.map((label, i) => (
        <span
          key={label}
          className={`text-xs font-semibold transition-colors flex items-center gap-1
            ${i + 1 < step ? 'text-emerald-600'
              : i + 1 === step ? 'text-gray-800'
                : 'text-gray-400'}`}
        >
          {i + 1 < step && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </span>
          )}
          {String(i + 1).padStart(2, '0')} · {label}
        </span>
      ))}
    </div>
  </div>
);

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '',
    phone: '', companyName: '',
    password: '', confirmPassword: '',
    agreeToTerms: false,
  });

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError(null);
  };

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    const { firstName, email, phone } = form;

    if (!firstName.trim()) e.firstName = 'First name is required';
    else if (firstName.trim().length < 2) e.firstName = 'At least 2 characters';
    else if (!/^[a-zA-Z\s\-']+$/.test(firstName)) e.firstName = 'Letters only';

    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';

    const digits = phone.replace(/\D/g, '');
    const country = COUNTRIES.find(c => c.code === countryCode);

    if (!phone) {
      e.phone = 'Phone number is required';
    } else if (!country) {
      e.phone = 'Invalid country';
    } else if (digits.length < 7 || digits.length > 15) {
      // Flexibilized validation bounds of international standard bounds
      e.phone = `${country.name} phone bounds must be within 7 to 15 digits`;
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    const { companyName } = form;

    if (!companyName.trim()) e.companyName = 'Organization name is required';
    else if (companyName.trim().length < 2) e.companyName = 'At least 2 characters';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    const { password, confirmPassword, agreeToTerms } = form;

    const pwdError = validatePasswordStrength(password);
    if (pwdError) e.password = pwdError;

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (!agreeToTerms) e.agreeToTerms = 'You must agree to continue';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setApiError(null);

    try {
      const res = await auth.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        phone: `${countryCode}${form.phone.replace(/\D/g, '')}`,
        password: form.password,
        confirmPassword: form.confirmPassword,
        organizationName: form.companyName.trim(),
      });

      if (res.data?.data?.requiresVerification) {
        navigate('/verify-otp', {
          state: { email: form.email.trim().toLowerCase(), fromSignup: true },
          replace: true,
        });
      } else {
        setApiError('Unexpected response. Please try again.');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Registration failed.';

      if (status === 409) {
        setApiError(message);
        setStep(1);
      } else if (status === 429) {
        setApiError('Too many attempts. Please wait and try again.');
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ["Let's get started", 'Your organization', 'Almost done'];
  const stepSubtitles = ["We'll send a welcome message on WhatsApp", 'Tell us about your business', 'Set a strong password to secure your account'];

  return (
    <AuthLayout title={stepTitles[step - 1]} subtitle={stepSubtitles[step - 1]}>
      <StepProgress step={step} />

      {apiError && (
        <div className="mb-5 p-3.5 rounded-xl flex items-start gap-3 bg-red-50 border border-red-200 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {hasSocialLogin && (
              <div>
                <SocialLoginButtons mode="signup" />
                <div className="relative py-4 mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      or sign up with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="firstName"
                label="First name"
                placeholder="John"
                value={form.firstName}
                onChange={v => update('firstName', v)}
                error={errors.firstName}
                icon={<User className="w-4 h-4" />}
                autoFocus
                required
              />
              <Field
                id="lastName"
                label="Last name"
                placeholder="Doe"
                value={form.lastName}
                onChange={v => update('lastName', v)}
                error={errors.lastName}
              />
            </div>

            <Field
              id="email"
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={v => update('email', v)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="h-11 px-3 text-sm bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 min-w-[130px]"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={`${COUNTRIES.find(c => c.code === countryCode)?.digits || 10} digits`}
                  value={form.phone}
                  onChange={e => {
                    const country = COUNTRIES.find(c => c.code === countryCode);
                    const maxLen = country?.digits || 15;
                    const v = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                    update('phone', v);
                  }}
                  maxLength={15}
                  className={`flex-1 h-11 px-4 text-sm rounded-r-xl border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all
                              ${errors.phone
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-100'
                    }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.phone}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  We'll send a welcome message on this number
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Field
              id="companyName"
              label="Organization name"
              placeholder="Acme Inc."
              value={form.companyName}
              onChange={v => update('companyName', v)}
              error={errors.companyName}
              icon={<Building2 className="w-4 h-4" />}
              helper="This will be your workspace name in WabMeta"
              autoFocus
              required
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all duration-150"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Field
                id="password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={v => update('password', v)}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
                autoFocus
                required
                rightEl={
                  <button type="button" onClick={() => setShowPass(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            <Field
              id="confirmPassword"
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={v => update('confirmPassword', v)}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              required
              rightEl={
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeToTerms}
                  onChange={e => update('agreeToTerms', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 leading-relaxed font-medium">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-bold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-bold">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-7">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create account
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default Signup;