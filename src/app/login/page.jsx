"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    document.title = "Sil3aty | Login";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Login to your Sil3aty account. Enter your email and password to access your dashboard."
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        callbackUrl: "/",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setLoading(false);
      toast.success("Login Successfully");
      router.push("/");
    } catch (error) {
      setError(error.message);
      toast.error("Email not exist or password not true");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-50 flex items-center justify-center p-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-lg mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your Sil3aty account</p>
        </div>

        {/* Main Card */}
        <div className="card bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl animate-fade-in delay-1000">
          <div className="card-body p-8">
            {error && (
              <div className="alert alert-error mb-6 animate-shake">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="email">
                  <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="pass">
                  <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full pl-12 pr-12 py-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-0 h-auto hover:bg-transparent"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-emerald-500 transition-colors duration-300" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-emerald-500 transition-colors duration-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 border-0 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  )}
                  {loading ? <p className="text-gray-100"> Signing In...</p> : "Sign In"}
                </button>
              </div>
            </form>

            <div className="divider my-6 text-gray-400">New to Sil3aty?</div>

            <div className="text-center flex items-center justify-center gap-2">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-green-600 transition-colors duration-300 group"
              >
                <UserPlus className="w-4 h-4 group-hover:animate-pulse" />
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 animate-fade-in delay-1000">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200/50">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700">Sil3aty</p>
              <p className="text-xs text-gray-500">
                © 2025 All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
