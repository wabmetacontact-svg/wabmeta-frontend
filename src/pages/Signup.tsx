// src/pages/Signup.tsx
import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  RefreshCw,
  Shield,
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import OTPInput from '../components/auth/OTPInput';
import { auth, setAuthToken } from '../services/api';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

interface FormData {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const STEP_LABELS = ['Phone', 'Verify', 'Details', 'Security'];

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    phone: '',
    otp: '',
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // ─── Countdown timer ──────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(
      () => setCountdown((c) => c - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── Field update helper ──────────────────────────
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
    const digits = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(digits)) {
      errs.phone =
        'Enter a valid 10-digit Indian mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.otp || formData.otp.length !== 6) {
      errs.otp = 'Please enter the complete 6-digit OTP';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
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
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errs.email = 'Enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      errs.companyName = 'Company name is required';
    } else if (formData.companyName.trim().length < 2) {
      errs.companyName = 'At least 2 characters required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      errs.password =
        'Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&#)';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errs.agreeToTerms =
        'You must agree to the terms and conditions';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Handlers ─────────────────────────────────────

  const handleSendOTP = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setApiError(null);

    try {
      await auth.sendPhoneOTP({
        phone: `+91${formData.phone}`,
      });
      setCountdown(60);
      setStep(2);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        const waitMatch =
          err?.response?.data?.message?.match(/(\d+)\s*second/);
        const waitSecs = waitMatch
          ? parseInt(waitMatch[1])
          : 60;
        setCountdown(waitSecs);
        setApiError(
          err?.response?.data?.message ||
            'Please wait before requesting another OTP.'
        );
      } else {
        setApiError(
          err?.response?.data?.message ||
            'Failed to send OTP. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setApiError(null);

    try {
      await auth.sendPhoneOTP({
        phone: `+91${formData.phone}`,
      });
      setCountdown(60);
      update('otp', '');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        const waitMatch =
          err?.response?.data?.message?.match(/(\d+)\s*second/);
        const waitSecs = waitMatch
          ? parseInt(waitMatch[1])
          : 60;
        setCountdown(waitSecs);
      }
      setApiError(
        err?.response?.data?.message ||
          'Failed to resend OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2 - Sirf local validation (OTP backend pe
  // final submit pe verify hoga - sahi approach)
  const handleVerifyOTP = () => {
    if (validateStep2()) setStep(3);
  };

  const handleStep3Next = () => {
    if (validateStep3()) setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await auth.verifyPhoneOTPAndRegister({
        phone: `+91${formData.phone}`,
        otp: formData.otp,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        organizationName: formData.companyName.trim(),
      });

      const result = response.data?.data;
      const { accessToken, refreshToken } = result?.tokens || {};
      const user = result?.user;
      const organization = result?.organization;

      if (!accessToken || !user) {
        setApiError(
          'Registration failed. Please try again.'
        );
        return;
      }

      // ✅ api.ts ka setAuthToken use karo
      // (internally sab 3 keys set karta hai)
      setAuthToken(accessToken, refreshToken);

      // User + Org store karo
      localStorage.setItem(
        'wabmeta_user',
        JSON.stringify(user)
      );

      if (organization) {
        localStorage.setItem(
          'wabmeta_org',
          JSON.stringify(organization)
        );
        localStorage.setItem(
          'currentOrganizationId',
          organization.id
        );
      }

      // ✅ Small delay - context ko settle hone do
      await new Promise((r) => setTimeout(r, 100));

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        'Registration failed.';

      if (
        status === 400 &&
        message.toLowerCase().includes('otp')
      ) {
        // OTP invalid - step 2 pe wapas
        setApiError(
          'OTP is invalid or expired. Please request a new one.'
        );
        setStep(2);
        update('otp', '');
        setCountdown(0);
      } else if (status === 409) {
        // Email already exists
        setApiError(
          'This email is already registered. Please login instead.'
        );
        setStep(3);
      } else if (status === 429) {
        setApiError(
          'Too many attempts. Please wait a moment and try again.'
        );
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────

  return (
    <AuthLayout
      title={
        step === 1
          ? 'Create your account'
          : step === 2
          ? 'Verify your WhatsApp'
          : step === 3
          ? 'Your information'
          : 'Secure your account'
      }
      subtitle={
        step === 1
          ? "We'll send an OTP to your WhatsApp number"
          : step === 2
          ? `OTP sent to +91 ${formData.phone}`
          : step === 3
          ? 'Tell us about you and your business'
          : 'Create a strong password to protect your account'
      }
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center
                  justify-center font-semibold text-sm
                  transition-all duration-300
                  ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {s < step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  s
                )}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 mx-1 rounded
                    transition-all duration-300
                    ${
                      s < step
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
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

      {/* API Error Banner */}
      {apiError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-600 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ════════════════════════════════
            STEP 1 — Phone Number
        ════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <MessageCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  WhatsApp Verification
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  You'll receive a 6-digit OTP on WhatsApp
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number{' '}
                <span className="text-red-500">*</span>
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
                    const v = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10);
                    update('phone', v);
                  }}
                  maxLength={10}
                  autoFocus
                  className={`flex-1 px-4 py-3.5 border rounded-r-xl
                    transition-all focus:outline-none focus:ring-2
                    text-lg tracking-widest
                    ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-500/20'
                        : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>

            <Button
              type="button"
              fullWidth
              loading={loading}
              onClick={handleSendOTP}
              icon={
                <MessageCircle className="w-5 h-5" />
              }
              iconPosition="right"
            >
              Send OTP on WhatsApp
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 2 — OTP Verify
        ════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                OTP sent to WhatsApp
              </p>
              <p className="font-bold text-gray-900 text-xl mt-1">
                +91 {formData.phone}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Check your WhatsApp messages
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <OTPInput
                length={6}
                value={formData.otp}
                onChange={(val) => update('otp', val)}
                error={!!errors.otp}
                disabled={loading}
              />
              {errors.otp && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  {errors.otp}
                </p>
              )}
            </div>

            <Button
              type="button"
              fullWidth
              loading={loading}
              disabled={formData.otp.length !== 6}
              onClick={handleVerifyOTP}
              icon={<Shield className="w-5 h-5" />}
              iconPosition="right"
            >
              Verify & Continue
            </Button>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    Resend in{' '}
                    <span className="font-bold text-primary-600">
                      {countdown}s
                    </span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              Wrong number?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  update('otp', '');
                  setApiError(null);
                }}
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                Change
              </button>
            </p>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 3 — Personal Info
        ════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                icon={<User className="w-5 h-5" />}
                value={formData.firstName}
                onChange={(e) =>
                  update('firstName', e.target.value)
                }
                error={errors.firstName}
                autoFocus
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  update('lastName', e.target.value)
                }
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@company.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) =>
                update('email', e.target.value)
              }
              error={errors.email}
            />

            <Input
              label="Company Name"
              placeholder="Acme Inc."
              icon={<Building2 className="w-5 h-5" />}
              value={formData.companyName}
              onChange={(e) =>
                update('companyName', e.target.value)
              }
              error={errors.companyName}
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
                type="button"
                onClick={handleStep3Next}
                icon={
                  <ArrowRight className="w-5 h-5" />
                }
                iconPosition="right"
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 4 — Password
        ════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) =>
                  update('password', e.target.value)
                }
                error={errors.password}
                autoFocus
              />
              <PasswordStrengthMeter
                password={formData.password}
              />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={(e) =>
                update('confirmPassword', e.target.value)
              }
              error={errors.confirmPassword}
            />

            <Checkbox
              id="agree-terms"
              checked={formData.agreeToTerms}
              onChange={(checked) =>
                update('agreeToTerms', checked)
              }
              error={errors.agreeToTerms}
              label={
                <span>
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </span>
              }
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(3)}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={
                  <Sparkles className="w-5 h-5" />
                }
                iconPosition="right"
                className="flex-1"
              >
                Create Account
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
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