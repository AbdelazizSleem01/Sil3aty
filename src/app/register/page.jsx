"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Camera,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.title = isRTL ? "Sil3aty - صفحة التسجيل" : "Sil3aty - Register Page";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        isRTL
          ? "قم بالتسجيل في Sil3aty وابدأ رحلتك. تعرف على مزيدٍ حول مهمتنا وسبب اعتقادنا بخلق مجتمع من المبدعين."
          : "Register for Sil3aty and start selling your unique and valuable products.Learn more about our mission and why we believe in creating a community of creators."
      );
    }
  }, [isRTL, i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError(t("allFieldsRequired") || "All fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch") || "Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength") || "Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password.trim());
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (t("registrationFailed") || "Registration failed"));
      }

      toast.success(t("registrationSuccess") || "Registration doing successfully");

      router.push("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-50 flex items-center justify-center p-12 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-primary rounded-full shadow-lg mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-primary bg-clip-text text-transparent mb-2">
            {t("joinSil3aty")}
          </h1>
          <p className="text-gray-600">
            {t("createAccountAndStart")}
          </p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="name">
                  <span className={`label-text font-semibold text-gray-700 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <User className="w-4 h-4 text-green-500" />
                    {t("fullName")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`input input-bordered w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white`}
                    placeholder={t("enterYourFullName")}
                    required
                  />
                  <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300`} />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="email">
                  <span className={`label-text font-semibold text-gray-700 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-4 h-4 text-green-500" />
                    {t("emailAddress")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input input-bordered w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white`}
                    placeholder={t("enterYourEmail")}
                    required
                  />
                  <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300`} />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="password">
                  <span className={`label-text font-semibold text-gray-700 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Lock className="w-4 h-4 text-green-500" />
                    {t("password")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input input-bordered w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white`}
                    placeholder={t("createPassword")}
                    required
                    minLength={6}
                  />
                  <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-0 h-auto hover:bg-transparent`}
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors duration-300" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors duration-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-control group">
                <label className="label mb-2" htmlFor="confirmPassword">
                  <span className={`label-text font-semibold text-gray-700 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Lock className="w-4 h-4 text-green-500" />
                    {t("confirmPassword")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`input input-bordered w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl bg-gray-50 focus:bg-white`}
                    placeholder={t("confirmYourPassword")}
                    required
                    minLength={6}
                  />
                  <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300`} />
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="form-control">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Camera className="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors duration-300" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePicture(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {profilePicture && (
                      <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                        <img
                          loading="lazy"
                          src={URL.createObjectURL(profilePicture)}
                          alt="Profile Preview"
                          className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-green-200"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {t("profilePicture")}
                    </p>
                    <p className="text-xs text-gray-500">{t("optional")}</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  className="btn btn-primary w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-primary border-0 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner mr-2"></span>
                      {t("creatingAccount")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                      {t("createAccount")}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="divider my-6 text-gray-400">
              {t("alreadyHaveAccount")}
            </div>

            {/* Login Link */}
            <div className={`text-center flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-600">{t("alreadyHaveAnAccount")} </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-semibold text-green-600 hover:text-primary transition-colors duration-300 group"
              >
                {t("signInHere")}
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-8 animate-fade-in delay-1000">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200/50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700">Sil3aty</p>
              <p className="text-xs text-gray-500">
                © 2025 {t("allRightsReserved")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
