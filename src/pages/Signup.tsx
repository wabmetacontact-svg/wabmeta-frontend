// src/pages/Signup.tsx
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

const STEP_LABELS = ['Details', 'Organization', 'Security'];

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

  const update = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError(null);
  };

  // ─── Validations ──────────────────────────────────

  const validateStep1 = () => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = 'At least 2 characters required';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.firstName)) {
      errs.firstName = 'Only letters allowed';
    }

    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errs.companyName = 'Organization name is required';
    } else if (formData.companyName.trim().length < 2) {
      errs.companyName = 'At least 2 characters required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      errs.password =
        'Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&#)';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errs.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Handlers ─────────────────────────────────────

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2);
  };

  const handleStep2Next = () => {
    if (validateStep2()) setStep(3);
  };

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
        // ✅ Navigate to OTP verification page with email
        navigate('/verify-otp', {
          state: { 
            email: formData.email.trim().toLowerCase(),
            fromSignup: true,
          },
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
        step === 1
          ? 'Create your account'
          : step === 2
          ? 'Your organization'
          : 'Secure your account'
      }
      subtitle={
        step === 1
          ? 'Tell us about yourself'
          : step === 2
          ? 'Tell us about your business'
          : 'Create a strong password'
      }
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all duration-300
                    ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 px-1">
          {STEP_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ════ STEP 1 — User Details ════ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                icon={<User className="w-5 h-5" />}
                value={formData.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                error={errors.firstName}
                autoFocus
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
              placeholder="john@company.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
            />

            {/* Phone with +91 prefix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl min-w-[80px] justify-center">
                  <span className="text-gray-600 font-semibold text-sm">
                    🇮🇳 +91
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
                  className={`flex-1 px-4 py-3.5 border rounded-r-xl
                    transition-all focus:outline-none focus:ring-2
                    ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-500/20'
                        : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                You'll receive a welcome message on this WhatsApp number
              </p>
            </div>

            <Button
              type="button"
              fullWidth
              onClick={handleStep1Next}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Continue
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ════ STEP 2 — Organization ════ */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <Input
              label="Organization / Company Name"
              placeholder="Acme Inc."
              icon={<Building2 className="w-5 h-5" />}
              value={formData.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              error={errors.companyName}
              autoFocus
            />

            <p className="text-sm text-gray-500 -mt-3">
              This will be your workspace name in WabMeta
            </p>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleStep2Next}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ════ STEP 3 — Password ════ */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
                autoFocus
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />

            <Checkbox
              id="agree-terms"
              checked={formData.agreeToTerms}
              onChange={(checked) => update('agreeToTerms', checked)}
              error={errors.agreeToTerms}
              label={
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline" target="_blank">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={<Sparkles className="w-5 h-5" />}
                iconPosition="right"
                className="flex-1"
              >
                Create Account
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default Signup;