import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError } = useAuth();

  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    clearError();

    if (!validateForm()) return;

    try {
      const result = await login(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }

        toast.success("Welcome back!");

        const from = (location.state as any)?.from || "/dashboard";
        navigate(from, { replace: true });
      } else {
        const errorMessage = result.error || "Login failed";
        setApiError(errorMessage);

        if (!errorMessage.includes("password") && !errorMessage.includes("email")) {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error);

      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 401) {
        setApiError("Invalid email or password. Please try again.");
      } else if (status === 403) {
        if (message?.toLowerCase().includes("verify")) {
          setApiError("Please verify your email before logging in.");
        } else if (message?.toLowerCase().includes("suspend")) {
          setApiError("Your account has been suspended. Please contact support.");
        } else {
          setApiError(message || "Access denied.");
        }
      } else if (status === 429) {
        setApiError("Too many login attempts. Please try again later.");
      } else {
        setApiError(message || "Login failed. Please check your credentials.");
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (apiError) {
      setApiError(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your WabMeta dashboard"
    >
      {/* ✅ API Error - glass styled */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3
          bg-red-500/10 backdrop-blur-xl
          border border-red-400/30
          text-red-300 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="w-4 h-4" />}
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
          autoFocus
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="w-4 h-4" />}
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Keep me signed in"
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          disabled={isLoading}
        >
          Sign in to dashboard
        </Button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0a0e27]/50 backdrop-blur-sm text-gray-500 font-mono uppercase tracking-wider">
              Or
            </span>
          </div>
        </div>

        <SocialLoginButtons loading={isLoading} />

        <p className="text-center text-sm text-gray-400 pt-2">
          New to WabMeta?{" "}
          <Link
            to="/signup"
            className="font-semibold text-green-400 hover:text-green-300 transition-colors"
          >
            Create free account →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;