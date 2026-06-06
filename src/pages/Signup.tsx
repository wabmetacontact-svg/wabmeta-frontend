import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Building2,
  ArrowRight, ArrowLeft, Check,
  AlertCircle, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { auth } from '../services/api';
import AuthLayout from '../components/auth/AuthLayout';

// ─── Constants ────────────────────────────────────────────────────────────────

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

const STEPS = ['You', 'Organization', 'Security'] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Password Strength (inline - sirf yahan use hota hai) ────────────────────

interface StrengthResult {
  score: number;       // 0-5
  label: string;
  color: string;       // tailwind bg class
  textColor: string;   // tailwind text class
}

const PWD_RULES = [
  { label: 'At least 8 characters',        test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',    test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)',    test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0–9)',              test: (p: string) => /\d/.test(p) },
  { label: 'One special char (@$!%*?&#)',   test: (p: string) => /[@$!%*?&#]/.test(p) },
];

const getStrength = (score: number): StrengthResult => {
  if (score === 0) return { score, label: '',           color: 'bg-gray-200', textColor: 'text-gray-400' };
  if (score === 1) return { score, label: 'Very weak',  color: 'bg-red-500',  textColor: 'text-red-500' };
  if (score === 2) return { score, label: 'Weak',       color: 'bg-orange-500', textColor: 'text-orange-500' };
  if (score === 3) return { score, label: 'Fair',       color: 'bg-yellow-500', textColor: 'text-yellow-600' };
  if (score === 4) return { score, label: 'Good',       color: 'bg-lime-500', textColor: 'text-lime-600' };
  return             { score, label: 'Strong',          color: 'bg-green-500', textColor: 'text-green-600' };
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
      {/* Bar */}
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
          {[1,2,3,4,5].map(n => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300
                ${n <= strength.score ? strength.color : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Rules */}
      <ul className="space-y-1">
        {rules.map(r => (
          <li
            key={r.label}
            className={`flex items-center gap-2 text-xs transition-colors duration-200
              ${r.met ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0
              ${r.met ? 'bg-green-100' : 'bg-gray-100'}`}>
              {r.met
                ? <Check className="w-2.5 h-2.5" />
                : <span className="w-1 h-1 rounded-full bg-gray-400" />
              }
            </div>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Field Component ──────────────────────────────────────────────────────────

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
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
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
            : 'border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-primary-100'
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

// ─── Step Progress ────────────────────────────────────────────────────────────

const StepProgress: React.FC<{ step: number }> = ({ step }) => (
  <div className="mb-8">
    {/* Bars */}
    <div className="flex gap-1.5 mb-3">
      {STEPS.map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: i + 1 <= step ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>

    {/* Labels */}
    <div className="flex justify-between">
      {STEPS.map((label, i) => (
        <span
          key={label}
          className={`text-xs font-medium transition-colors flex items-center gap-1
            ${i + 1 < step  ? 'text-primary-500'
            : i + 1 === step ? 'text-gray-800'
            :                  'text-gray-400'}`}
        >
          {i + 1 < step && (
            <span className="w-3.5 h-3.5 rounded-full bg-primary-500
              flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          )}
          {String(i + 1).padStart(2, '0')} · {label}
        </span>
      ))}
    </div>
  </div>
);

// ─── Signup Page ──────────────────────────────────────────────────────────────

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '',
    phone: '', companyName: '',
    password: '', confirmPassword: '',
    agreeToTerms: false,
  });

  // Generic field updater
  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError(null);
  };

  // ── Validations ──────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    const { firstName, email, phone } = form;

    if (!firstName.trim())               e.firstName = 'First name is required';
    else if (firstName.trim().length < 2) e.firstName = 'At least 2 characters';
    else if (!/^[a-zA-Z\s\-']+$/.test(firstName)) e.firstName = 'Letters only';

    if (!email)                           e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';

    const digits = phone.replace(/\D/g, '');
    if (!phone)                           e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a valid 10-digit Indian mobile';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    const { companyName } = form;

    if (!companyName.trim())                  e.companyName = 'Organization name is required';
    else if (companyName.trim().length < 2)   e.companyName = 'At least 2 characters';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    const { password, confirmPassword, agreeToTerms } = form;

    if (!password)                     e.password = 'Password is required';
    else if (!PWD_REGEX.test(password)) e.password = 'Use 8+ chars with upper, lower, number & symbol';

    if (!confirmPassword)              e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (!agreeToTerms)                 e.agreeToTerms = 'You must agree to continue';

    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

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
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim() || undefined,
        email:            form.email.trim().toLowerCase(),
        phone:            `+91${form.phone.replace(/\D/g, '')}`,
        password:         form.password,
        confirmPassword:  form.confirmPassword,
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
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Registration failed.';

      if (status === 409) { setApiError(message); setStep(1); }
      else if (status === 429) setApiError('Too many attempts. Please wait and try again.');
      else setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  const stepTitles = [
    "Let's get started",
    'Your organization',
    'Almost done',
  ];

  const stepSubtitles = [
    "We'll send a welcome message on WhatsApp",
    'Tell us about your business',
    'Set a strong password to secure your account',
  ];

  return (
    <AuthLayout
      title={stepTitles[step - 1]}
      subtitle={stepSubtitles[step - 1]}
    >
      {/* Step Progress */}
      <StepProgress step={step} />

      {/* API Error */}
      {apiError && (
        <div className="mb-5 p-3.5 rounded-xl flex items-start gap-3
          bg-red-50 border border-red-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ══ STEP 1 - Personal Info ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">

            {/* Name row */}
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

            {/* Email */}
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

            {/* WhatsApp Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                {/* Country prefix */}
                <div className="flex items-center gap-1.5 px-3.5 min-w-[90px]
                  bg-gray-50 border border-r-0 border-gray-200
                  rounded-l-xl text-sm font-semibold text-gray-700">
                  🇮🇳 <span>+91</span>
                </div>
                {/* Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                    update('phone', v);
                  }}
                  maxLength={10}
                  className={`flex-1 h-11 px-4 text-sm rounded-r-xl
                    border bg-white text-gray-900
                    placeholder:text-gray-400
                    focus:outline-none focus:ring-2
                    transition-all duration-200
                    ${errors.phone
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-primary-100'
                    }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.phone}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                  We'll send a welcome message on this number
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={nextStep}
              className="w-full h-11 flex items-center justify-center gap-2
                bg-primary-500 hover:bg-primary-600
                text-white text-sm font-semibold rounded-xl
                shadow-sm hover:shadow-md
                hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}

        {/* ══ STEP 2 - Organization ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
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
                className="flex-1 h-11 flex items-center justify-center gap-2
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 text-sm font-semibold rounded-xl
                  transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 h-11 flex items-center justify-center gap-2
                  bg-primary-500 hover:bg-primary-600
                  text-white text-sm font-semibold rounded-xl
                  shadow-sm hover:shadow-md
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 - Security ═════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">

            {/* Password */}
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
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                }
              />
              {/* Inline strength meter */}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
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
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              }
            />

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeToTerms}
                  onChange={e => update('agreeToTerms', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300
                    text-primary-500 focus:ring-primary-400 cursor-pointer"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank"
                    className="text-primary-600 hover:text-primary-700
                      underline underline-offset-2 font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank"
                    className="text-primary-600 hover:text-primary-700
                      underline underline-offset-2 font-medium">
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 text-sm font-semibold rounded-xl
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2
                  bg-primary-500 hover:bg-primary-600
                  text-white text-sm font-semibold rounded-xl
                  shadow-sm hover:shadow-md
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30
                      border-t-white rounded-full animate-spin" />
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
              <Link to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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