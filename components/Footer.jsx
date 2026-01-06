"use client";
import {
  Facebook,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Star,
  Send,
  MapPin,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("enterValidEmail"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to subscribe");
      toast.success(data.message || t("thankYouForSubscribing"));
      setEmail("");
    } catch (error) {
      toast.error(error.message || t("failedToSubscribe"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br w-full from-gray-50 via-emerald-50 to-green-50 text-gray-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/60 to-green-200/60 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full translate-x-48 translate-y-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src="/images/logo2.png"
                      width={70}
                      height={70}
                      className="w-14 h-14"
                      alt="Sil3aty Logo"
                    />
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <span className="badge bg-gradient-to-r from-emerald-500 to-green-600 border-0 text-white animate-pulse">
                  {t("premiumBadge")}
                </span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" />
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("companyDescriptionFooter")}
            </p>

            <div className="flex gap-3">
              {[
                {
                  icon: <Facebook className="w-4 h-4" />,
                  color: "from-blue-600 to-blue-700",
                  bg: "bg-blue-600",
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  icon: <Twitter className="w-4 h-4" />,
                  color: "from-sky-400 to-sky-500",
                  bg: "bg-sky-400",
                  href: "https://twitter.com",
                  label: "Twitter",
                },
                {
                  icon: <Linkedin className="w-4 h-4" />,
                  color: "from-blue-500 to-blue-600",
                  bg: "bg-blue-500",
                  href: "https://www.linkedin.com/in/abdelaziz-sleem-600a1027a/",
                  label: "LinkedIn",
                },
                {
                  icon: <Github className="w-4 h-4" />,
                  color: "from-gray-800 to-gray-900",
                  bg: "bg-gray-800",
                  href: "https://github.com/AbdelazizSleem01",
                  label: "GitHub",
                },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative btn btn-circle btn-sm text-white border-0 hover:scale-110 transition-all duration-300 group overflow-hidden`}
                  title={social.label}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-100`}
                  ></div>
                  <div className="relative z-10 group-hover:animate-bounce">
                    {social.icon}
                  </div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6 animate-fade-in delay-1000 w-full">
            <div className="relative">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent uppercase tracking-wider">
                {t("explore")}
              </h3>
              <div
                className={`absolute -bottom-2 ${
                  i18n.language === "ar" ? "right-0" : ""
                }  left-0 w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full`}
              ></div>
            </div>
            <ul className="space-y-3">
              {[
                [t("home"), "/"],
                [t("products"), "/product"],
                [t("about"), "/about-us"],
                [t("blogs"), "/blogs"],
                [t("contact"), "/contact"],
              ].map(([title, url]) => (
                <li key={title}>
                  <Link
                    href={url}
                    className="group flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:translate-x-2"
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-green-500 transition-colors duration-300" />
                    <span className="font-medium">{title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 animate-fade-in delay-1000 w-full">
            <div className="relative">
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
                {t("support")}
              </h3>
              <div
                className={`absolute -bottom-2 ${
                  i18n.language === "ar" ? "right-0" : ""
                }  left-0 w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full`}
              ></div>
            </div>
            <ul className="space-y-3">
              {[
                [t("faq"), "/faq"],
                [t("shipping"), "/shipping"],
                [t("returns"), "/returns"],
                [t("privacyPolicy"), "/privacy"],
                [t("termsOfService"), "/terms"],
              ].map(([title, url]) => (
                <li key={title}>
                  <Link
                    href={url}
                    className="group flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:translate-x-2"
                  >
                    <ArrowRight className="w-4 h-4 text-green-500 group-hover:text-emerald-500 transition-colors duration-300" />
                    <span className="font-medium">{title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in delay-1000">
            <div className="relative">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent uppercase tracking-wider">
                {t("contactUs")}
              </h3>
              <div
                className={`absolute -bottom-2 ${
                  i18n.language === "ar" ? "right-0" : ""
                }  left-0 w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full`}
              ></div>
            </div>
            <div className="space-y-4 ">
              <div className="group flex w-72  items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <Link
                  href="mailto:abdelazizsleem957@gmail.com"
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  abdelazizsleem957@gmail.com
                </Link>
              </div>
              <div className="group flex w-72 items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <Link
                  href="tel:+201012105407"
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  +20 1012105407
                </Link>
              </div>
              <div className="group flex w-72 items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">
                  {t("ourLocation")}
                </span>
              </div>
              <div className="group flex w-72 items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">
                  {t("support247")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-16 animate-fade-in delay-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {t("stayUpdatedFooter")}
                  </h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p
                  className={`text-gray-600 text-lg ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t("subscribeToNewsletter")}
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="w-full md:w-auto">
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <div className="absolute left-4 z-20 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                      <Mail className="w-3 h-3 text-white" />
                    </div>
                    <input
                      type="email"
                      placeholder={t("enterEmailAddress")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input input-primary w-full pl-14 pr-4 py-4 bg-white/90  rounded-xl text-gray-800 placeholder-gray-500 shadow-lg focus:shadow-xl transition-all duration-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn bg-gradient-to-r from-emerald-500 to-green-600 border-0 px-8 py-4 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        <span className="font-semibold">{t("subscribe")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in delay-1000">
          <div className="absolute inset-0 rounded-2xl"></div>
          <div className="relative rounded-2xl p-6 border border-gray-700/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-bold ">
                    {t("madeWithLoveBy")}{" "}
                    <Link
                      className="text-emerald-500 hover:underline mx-2"
                      href={"https://abdelaziz-sleem.vercel.app/"}
                    >
                      Abdelaziz Sleem
                    </Link>{" "}
                  </p>
                  <p className="text-sm ">
                    © {new Date().getFullYear()} Sil3aty.{" "}
                    {t("allRightsReserved")}
                  </p>
                </div>
              </div>
              <div className="flex gap-8">
                <Link
                  href="/privacy"
                  className=" hover:text-primary hover:scale-110 transition-all duration-300 group"
                >
                  <span className="font-medium">{t("privacyPolicy")}</span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
                <Link
                  href="/terms"
                  className=" hover:text-primary hover:scale-110 transition-all duration-300 group"
                >
                  <span className="font-medium">{t("termsOfService")}</span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
