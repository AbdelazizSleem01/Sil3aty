"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiGift, FiCopy, FiCheck } from "react-icons/fi";
import axios from "axios";

export default function SpinWheelModal() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonCoupon, setWonCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const segments = [
    { code: "SPIN10", label: isRTL ? "خصم 10%" : "10% OFF", color: "#10B981" },
    { code: "FREESHIP", label: isRTL ? "شحن مجاني" : "Free Ship", color: "#8B5CF6" },
    { code: "SPIN15", label: isRTL ? "خصم 15%" : "15% OFF", color: "#F59E0B" },
    { code: "TRYAGAIN", label: isRTL ? "حظ أوفر" : "Try Again", color: "#64748B" },
    { code: "SPIN20", label: isRTL ? "خصم 20%" : "20% OFF", color: "#EC4899" },
    { code: "SPIN25", label: isRTL ? "خصم 25%" : "25% OFF", color: "#3B82F6" },
  ];

  // Draw the wheel on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const arc = Math.PI / (segments.length / 2);

    ctx.clearRect(0, 0, width, height);

    segments.forEach((seg, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 10, angle, angle + arc, false);
      ctx.lineTo(radius, radius);
      ctx.fill();

      // Draw border lines
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px Outfit, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(radius, radius);
      ctx.rotate(angle + arc / 2);
      ctx.fillText(seg.label, radius / 1.6, 0);
      ctx.restore();
    });

    // Draw central peg circle
    ctx.beginPath();
    ctx.arc(radius, radius, 25, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#1E293B";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw inner peg circle dot
    ctx.beginPath();
    ctx.arc(radius, radius, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#10B981";
    ctx.fill();
  }, [isOpen]);

  // Show automatically after 3 seconds if never spun
  useEffect(() => {
    const hasSpun = localStorage.getItem("hasSpunWheel");
    if (!hasSpun) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSpin = async (e) => {
    e.preventDefault();
    if (isSpinning) return;
    if (!email || !email.includes("@")) {
      alert(isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return;
    }

    setIsSpinning(true);

    try {
      // Seed coupons in DB dynamically in parallel
      axios.post("/api/coupon/seed-wheel").catch((err) => console.error(err));

      // Choose a winning segment (avoid TRYAGAIN, select SPIN10-25 or FREESHIP with high chance)
      const winningIndexes = [0, 1, 2, 4, 5]; // Indexes excluding TRYAGAIN (3)
      const randomIndex = winningIndexes[Math.floor(Math.random() * winningIndexes.length)];
      const targetSegment = segments[randomIndex];

      // Rotation math
      const segmentArcDegrees = 360 / segments.length;
      // Target angle to land the segment under the center pointer (at 0 rad / right side, we adjust offset)
      // Standard pointer is at the top (270 degrees). Let's calculate accordingly.
      const targetAngle = 270 - (randomIndex * segmentArcDegrees + segmentArcDegrees / 2);
      const extraRotations = 360 * 6; // 6 full spins
      const finalRotation = extraRotations + targetAngle;

      setRotation(finalRotation);

      setTimeout(() => {
        setWonCoupon(targetSegment);
        setIsSpinning(false);
        localStorage.setItem("hasSpunWheel", "true");
      }, 5000);

    } catch (error) {
      setIsSpinning(false);
      console.error(error);
    }
  };

  const handleCopy = () => {
    if (!wonCoupon) return;
    navigator.clipboard.writeText(wonCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating launcher badge */}
      <button
        onClick={() => {
          setWonCoupon(null);
          setIsOpen(true);
        }}
        className={`fixed bottom-6 ${
          isRTL ? "right-24" : "left-24"
        } z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse`}
      >
        <FiGift size={18} className="animate-bounce" />
        <span className="text-xs uppercase tracking-wider font-extrabold">
          {isRTL ? "عجلة الهدايا" : "Gift Wheel"}
        </span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden flex flex-col items-center animate-scaleUp"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className={`absolute top-5 ${isRTL ? "left-5" : "right-5"} p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors`}
              disabled={isSpinning}
            >
              <FiX size={20} />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs bg-purple-50 text-purple-700 font-extrabold uppercase px-3 py-1 rounded-full tracking-wide">
                {isRTL ? "🎰 جرب حظك!" : "🎰 SPIN TO WIN!"}
              </span>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {isRTL ? "عجلة الخصومات والمفاجآت" : "Lucky Discount Wheel"}
              </h2>
              <p className="text-gray-500 text-sm max-w-sm">
                {isRTL 
                  ? "أدخل بريدك الإلكتروني وقم بتدوير العجلة للفوز بخصومات كوبونات حقيقية فورية!" 
                  : "Enter your email and spin the lucky wheel to claim your real discount coupon!"}
              </p>
            </div>

            {/* Wheel section */}
            {!wonCoupon ? (
              <div className="relative flex flex-col items-center gap-6 my-4 w-full">
                {/* Pointer indicator */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600 filter drop-shadow-md" />

                {/* Canvas container with shadows */}
                <div className="bg-white p-4 rounded-full border border-gray-100 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? "transform 5s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none",
                    }}
                    className="rounded-full shadow-2xl max-w-full"
                  />
                </div>

                {/* Spin action form */}
                <form onSubmit={handleSpin} className="w-full max-w-sm space-y-3 mt-2">
                  <input
                    type="email"
                    required
                    placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSpinning}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-center focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isSpinning}
                    className="btn btn-primary w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                  >
                    {isSpinning ? (isRTL ? "جاري التدوير..." : "Spinning...") : (isRTL ? "در العجلة الآن!" : "SPIN THE WHEEL!")}
                  </button>
                </form>
              </div>
            ) : (
              /* Winner reveal card */
              <div className="w-full max-w-sm p-6 bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100 rounded-3xl text-center space-y-6 animate-scaleUp">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  🎉
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">
                    {isRTL ? "مبروك! لقد فزت" : "Congratulations! You Won"}
                  </h3>
                  <p className="text-xl font-extrabold text-purple-700">
                    {wonCoupon.label}
                  </p>
                </div>

                {/* Coupon display card */}
                <div className="bg-white border-2 border-dashed border-purple-300 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <code className="text-lg font-black text-slate-800 tracking-wider">
                    {wonCoupon.code}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`btn btn-sm ${
                      copied ? "btn-success" : "btn-primary bg-purple-600"
                    } rounded-xl px-4 flex items-center gap-1.5`}
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ" : "Copy")}
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  {isRTL 
                    ? "* يتم تطبيق هذا الكوبون عند إدخاله بصفحة الدفع." 
                    : "* Enter this coupon code at checkout to claim your reward."}
                </p>

                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-outline border-purple-300 text-purple-700 hover:bg-purple-50 rounded-2xl w-full"
                >
                  {isRTL ? "تسوق الآن" : "Start Shopping"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
