import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { auth } from '../services/api';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

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

const STEP_LABELS = ['You', 'Organization', 'Security'];

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const update = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError(null);
  };

  // ─── Validations ──────────────────────────────────

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2) errs.firstName = 'At least 2 characters required';
    else if (!/^[a-zA-Z\s\-']+$/.test(formData.firstName)) errs.firstName = 'Only letters allowed';

    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phoneDigits)) errs.phone = 'Enter a valid 10-digit Indian mobile';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) errs.companyName = 'Organization name is required';
    else if (formData.companyName.trim().length < 2) errs.companyName = 'At least 2 characters required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.password) errs.password = 'Password is required';
    else if (!PASSWORD_REGEX.test(formData.password)) {
      errs.password = 'Min 8 chars with uppercase, lowercase, number & special char';
    }

    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!formData.agreeToTerms) errs.agreeToTerms = 'You must agree to continue';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => { if (validateStep1()) setStep(2); };
  const handleStep2Next = () => { if (validateStep2()) setStep(3); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await auth.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        phone: `+91${formData.phone.replace(/\D/g, '')}`,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        organizationName: formData.companyName.trim(),
      });

      const result = response.data?.data;

      if (result?.requiresVerification) {
        navigate('/verify-otp', {
          state: { email: formData.email.trim().toLowerCase(), fromSignup: true },
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
      } else if (status === 400) {
        setApiError(message);
      } else if (status === 429) {
        setApiError('Too many attempts. Please wait and try again.');
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1 ? "Let's get you started"
        : step === 2 ? 'Your organization'
        : 'Almost done'
      }
      subtitle={
        step === 1 ? "We'll send a welcome message on WhatsApp"
        : step === 2 ? 'Tell us about your business'
        : "Just a strong password and you're in"
      }
    >
      <div className="mb-7">
        <div className="flex items-center gap-1.5 mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className="h-1 rounded-full overflow-hidden bg-secondary-100">
                <div
                  className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-primary-500 to-primary-600"
                  style={{ width: s <= step ? '100%' : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`transition-colors duration-300 font-medium
                ${i + 1 < step ? 'text-primary-600'
                  : i + 1 === step ? 'text-secondary-900'
                  : 'text-secondary-400'}`}>
                {i + 1 < step && <Check className="inline w-3 h-3 mr-1" />}
                {String(i + 1).padStart(2, '0')} · {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {apiError && (
        <div className="mb-5 p-4 rounded-xl flex items-start gap-3
          bg-error/5 border border-error/20 text-error animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ════ STEP 1 ════ */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                icon={<User className="w-4 h-4" />}
                value={formData.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                error={errors.firstName}
                autoFocus
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              required
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                WhatsApp Number <span className="text-error">*</span>
              </label>
              <div className="flex">
                <div className="flex items-center px-4 min-w-[90px] justify-center
                  bg-secondary-50 border border-r-0 border-secondary-200 rounded-l-xl">
                  <span className="text-secondary-700 font-semibold text-sm flex items-center gap-1.5">
                    🇮🇳 <span>+91</span>
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                    update('phone', v);
                  }}
                  maxLength={10}
                  className={`flex-1 h-11 px-4 bg-white text-secondary-900 placeholder:text-secondary-400
                    border rounded-r-xl outline-none transition-colors duration-150
                    ${errors.phone
                      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                      : 'border-secondary-200 hover:border-secondary-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15'
                    }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-error" />
                  {errors.phone}
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-secondary-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary-600" />
                  You'll get a welcome message on this WhatsApp number
                </p>
              )}
            </div>

            <Button
              type="button"
              fullWidth
              onClick={handleStep1Next}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue
            </Button>

            <p className="text-center text-sm text-secondary-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        )}

        {/* ════ STEP 2 ════ */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <Input
              label="Organization Name"
              placeholder="Acme Inc."
              icon={<Building2 className="w-4 h-4" />}
              value={formData.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              error={errors.companyName}
              autoFocus
              required
              helperText="This will be your workspace name in WabMeta"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleStep2Next}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ════ STEP 3 ════ */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
                autoFocus
                required
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              icon={<Lock className="w-4 h-4" />}
              value={formData.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <Checkbox
              id="agree-terms"
              checked={formData.agreeToTerms}
              onChange={(checked) => update('agreeToTerms', checked)}
              error={errors.agreeToTerms}
              label={
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 underline underline-offset-2" target="_blank">
                    Terms
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 underline underline-offset-2" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={<Sparkles className="w-4 h-4" />}
                iconPosition="right"
                className="flex-1"
              >
                Create account
              </Button>
            </div>

            <p className="text-center text-sm text-secondary-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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