// src/components/auth/AddPhoneModal.tsx - FIXED
import React, { useState } from 'react';
import {
  X, MessageCircle, Phone, Sparkles,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import Button from '../common/Button';
import { users } from '../../services/api';
import toast from 'react-hot-toast';

interface AddPhoneModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSuccess?: (phone: string) => void;
  userName?: string;
  required?: boolean;
}

// ✅ Global country support
const COUNTRIES = [
  { code: '+91',  name: 'India',       flag: '🇮🇳', digits: 10 },
  { code: '+1',   name: 'USA/Canada',  flag: '🇺🇸', digits: 10 },
  { code: '+44',  name: 'UK',          flag: '🇬🇧', digits: 10 },
  { code: '+971', name: 'UAE',         flag: '🇦🇪', digits: 9  },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', digits: 9  },
  { code: '+65',  name: 'Singapore',   flag: '🇸🇬', digits: 8  },
  { code: '+92',  name: 'Pakistan',    flag: '🇵🇰', digits: 10 },
  { code: '+880', name: 'Bangladesh',  flag: '🇧🇩', digits: 10 },
  { code: '+94',  name: 'Sri Lanka',   flag: '🇱🇰', digits: 9  },
  { code: '+60',  name: 'Malaysia',    flag: '🇲🇾', digits: 10 },
  { code: '+62',  name: 'Indonesia',   flag: '🇮🇩', digits: 10 },
  { code: '+63',  name: 'Philippines', flag: '🇵🇭', digits: 10 },
];

const AddPhoneModal: React.FC<AddPhoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userName = 'there',
  required = false,
}) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone,       setPhone]        = useState('');
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]          = useState<string | null>(null);
  const [success,     setSuccess]        = useState(false);

  if (!isOpen) return null;

  const currentCountry = COUNTRIES.find(c => c.code === countryCode);

  const validatePhone = (): boolean => {
    const digits = phone.replace(/\D/g, '');

    if (!phone) {
      setError('Phone number is required');
      return false;
    }
    if (!currentCountry) {
      setError('Invalid country');
      return false;
    }
    if (digits.length !== currentCountry.digits) {
      setError(
        `${currentCountry.name} numbers must be ${currentCountry.digits} digits`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    setError(null);

    try {
      const fullPhone = `${countryCode}${phone}`;
      const response  = await users.addPhone({ phone: fullPhone });
      const result    = response.data?.data;

      setSuccess(true);

      // Update localStorage user
      const userStr = localStorage.getItem('wabmeta_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.phone = result?.phone || fullPhone;
          localStorage.setItem('wabmeta_user', JSON.stringify(user));
        } catch { /* silent */ }
      }

      if (result?.whatsappSent) {
        toast.success('Welcome message sent on WhatsApp! 🎉');
      } else {
        toast.success('Phone number added successfully!');
      }

      // ✅ FIX: Longer delay for user to see success
      setTimeout(() => {
        onSuccess?.(fullPhone);
        onClose();
      }, 2500);

    } catch (err: any) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to add phone number';

      if (status === 409) {
        setError('This number is already registered with another account');
      } else if (status === 429) {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (required) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4
                    bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                      max-w-md w-full overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-500 to-green-600
                        px-6 py-8 text-white">
          {!required && !success && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1.5 rounded-full
                         hover:bg-white/20 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center
                          justify-center mx-auto mb-3">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-center">
            Welcome, {userName}! 👋
          </h2>
          <p className="text-center text-green-50 text-sm mt-1">
            Just one more step to get started
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Phone Added Successfully! 🎉
              </h3>
              <p className="text-sm text-gray-600">
                Check your WhatsApp for a welcome message
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-gray-700 text-center mb-1">
                  Add your <strong>WhatsApp number</strong> to receive
                </p>
                <p className="text-sm text-gray-500 text-center">
                  notifications, updates & welcome message
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg
                                flex items-start space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Phone Input with Country Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setError(null);
                    }}
                    className="px-3 bg-gray-100 border border-r-0 border-gray-200
                               rounded-l-xl focus:outline-none min-w-[130px]
                               text-sm font-medium text-gray-700"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    placeholder={`${currentCountry?.digits || 10} digits`}
                    value={phone}
                    onChange={(e) => {
                      const maxLen = currentCountry?.digits || 15;
                      const v = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                      setPhone(v);
                      setError(null);
                    }}
                    maxLength={15}
                    autoFocus
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        phone.length === (currentCountry?.digits || 10)
                      ) {
                        handleSubmit();
                      }
                    }}
                    className={`flex-1 px-4 py-3.5 border rounded-r-xl
                                transition-all focus:outline-none focus:ring-2
                                bg-white text-gray-900 text-lg tracking-widest
                                disabled:opacity-50
                                ${error
                                  ? 'border-red-300 focus:ring-red-500/20'
                                  : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500'
                                }`}
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50
                              border border-green-200 rounded-xl">
                <Sparkles className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">
                  We'll send you a welcome message on WhatsApp.
                  Your number is kept private and secure.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                {!required && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSkip}
                    disabled={loading}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                )}
                <Button
                  type="button"
                  loading={loading}
                  disabled={phone.length !== (currentCountry?.digits || 10)}
                  onClick={handleSubmit}
                  icon={<Phone className="w-5 h-5" />}
                  iconPosition="right"
                  className={required ? 'w-full' : 'flex-1'}
                >
                  Add & Continue
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPhoneModal;
