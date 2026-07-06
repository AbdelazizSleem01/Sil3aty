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
  const [segments, setSegments] = useState([]);
  const canvasRef = useRef(null);

  // Fetch coupons from backend and construct segments dynamically
  useEffect(() => {
    const fetchWheelCoupons = async () => {
      try {
        // Ensure default spin coupons are seeded first
        await axios.post("/api/coupon/wheel");
        
        const { data } = await axios.get("/api/coupon/wheel");
        const dbCoupons = data.coupons || [];

        // Build list of segments using brand colors
        const brandColors = [
          { bg: "#10B981", text: "#FFFFFF" }, // Emerald
          { bg: "#047857", text: "#FFFFFF" }, // Dark Emerald
          { bg: "#34D399", text: "#064E3B" }, // Mint
          { bg: "#059669", text: "#FFFFFF" }, // Medium Emerald
          { bg: "#A7F3D0", text: "#064E3B" }, // Light Mint
        ];

        let loadedSegments = dbCoupons.map((c, index) => {
          let label = "";
          if (c.discountType === "percent") {
            label = isRTL ? `خصم ${c.amount}%` : `${c.amount}% OFF`;
          } else if (c.discountType === "free-shipping" || c.discountType === "shipping") {
            label = isRTL ? "شحن مجاني" : "Free Ship";
          } else {
            label = isRTL ? `خصم $${c.amount}` : `$${c.amount} OFF`;
          }

          const colorScheme = brandColors[index % brandColors.length];

          return {
            code: c.code,
            label,
            color: colorScheme.bg,
            textColor: colorScheme.text,
          };
        });

        // Add a "Try Again" slice if we have room, or ensure we have exactly 6 segments
        if (loadedSegments.length < 6) {
          loadedSegments.push({
            code: "TRYAGAIN",
            label: isRTL ? "حظ أوفر" : "Try Again",
            color: "#1E293B",
            textColor: "#FFFFFF",
          });
        }

        // Fill up to exactly 6 segments with defaults if needed
        const defaultFillers = [
          { code: "SPIN10", label: isRTL ? "خصم 10%" : "10% OFF" },
          { code: "SPIN15", label: isRTL ? "خصم 15%" : "15% OFF" },
          { code: "SPIN20", label: isRTL ? "خصم 20%" : "20% OFF" },
        ];

        let fillerIndex = 0;
        while (loadedSegments.length < 6) {
          const filler = defaultFillers[fillerIndex % defaultFillers.length];
          const colorScheme = brandColors[loadedSegments.length % brandColors.length];
          loadedSegments.push({
            code: filler.code,
            label: filler.label,
            color: colorScheme.bg,
            textColor: colorScheme.text,
          });
          fillerIndex++;
        }

        setSegments(loadedSegments.slice(0, 6));
      } catch (error) {
        console.error("Error loading wheel coupons:", error);
      }
    };

    if (isOpen) {
      fetchWheelCoupons();
    }
  }, [isOpen, isRTL]);

  // Draw the wheel on canvas
  useEffect(() => {
    if (!isOpen || segments.length === 0 || !canvasRef.current) return;
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
      ctx.arc(radius, radius, radius - 8, angle, angle + arc, false);
      ctx.lineTo(radius, radius);
      ctx.fill();

      // Draw border lines
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.fillStyle = seg.textColor || "#FFFFFF";
      ctx.font = "bold 12px Outfit, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(radius, radius);
      ctx.rotate(angle + arc / 2);
      ctx.fillText(seg.label, radius / 1.6, 0);
      ctx.restore();
    });

    // Draw central peg circle
    ctx.beginPath();
    ctx.arc(radius, radius, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#1E293B";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw inner peg circle dot
    ctx.beginPath();
    ctx.arc(radius, radius, 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#10B981";
    ctx.fill();
  }, [isOpen, segments]);

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
    if (isSpinning || segments.length === 0) return;
    if (!email || !email.includes("@")) {
      alert(isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return;
    }

    setIsSpinning(true);

    try {
      // Filter out TRYAGAIN indexes so user almost always wins
      const winningIndexes = segments
        .map((seg, idx) => (seg.code !== "TRYAGAIN" ? idx : null))
        .filter((idx) => idx !== null);

      if (winningIndexes.length === 0) winningIndexes.push(0);

      const randomIndex = winningIndexes[Math.floor(Math.random() * winningIndexes.length)];
      const targetSegment = segments[randomIndex];

      // Rotation math
      const segmentArcDegrees = 360 / segments.length;
      const targetAngle = 270 - (randomIndex * segmentArcDegrees + segmentArcDegrees / 2);
      const extraRotations = 360 * 6; // 6 spins
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
        } z-40 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4.5 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse`}
      >
        <FiGift size={16} className="animate-bounce" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold">
          {isRTL ? "عجلة الهدايا" : "Gift Wheel"}
        </span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl max-w-[390px] w-full p-5 relative overflow-hidden flex flex-col items-center animate-scaleUp"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors`}
              disabled={isSpinning}
            >
              <FiX size={18} />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1.5 mb-4">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                {isRTL ? "🎰 جرب حظك!" : "🎰 SPIN TO WIN!"}
              </span>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                {isRTL ? "عجلة الخصومات والمفاجآت" : "Lucky Discount Wheel"}
              </h2>
              <p className="text-gray-500 text-xs max-w-[280px] mx-auto">
                {isRTL 
                  ? "أدخل بريدك الإلكتروني وقم بتدوير العجلة للفوز بخصومات كوبونات حقيقية فورية!" 
                  : "Enter your email and spin the lucky wheel to claim your real discount coupon!"}
              </p>
            </div>

            {/* Wheel section */}
            {!wonCoupon ? (
              <div className="relative flex flex-col items-center gap-5 my-2 w-full">
                {/* Pointer indicator */}
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-600 filter drop-shadow-md" />

                {/* Canvas container with shadows */}
                <div className="bg-white p-3 rounded-full border border-gray-100 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={220}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? "transform 5s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none",
                    }}
                    className="rounded-full shadow-2xl max-w-full"
                  />
                </div>

                {/* Spin action form */}
                <form onSubmit={handleSpin} className="w-full max-w-[300px] space-y-2 mt-1">
                  <input
                    type="email"
                    required
                    placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSpinning}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-gray-900 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isSpinning}
                    className="btn btn-primary w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/10 text-xs"
                  >
                    {isSpinning ? (isRTL ? "جاري التدوير..." : "Spinning...") : (isRTL ? "در العجلة الآن!" : "SPIN THE WHEEL!")}
                  </button>
                </form>
              </div>
            ) : (
              /* Winner reveal card */
              <div className="w-full max-w-[300px] p-5 bg-gradient-to-br from-emerald-50 to-green-50/50 border border-emerald-100 rounded-2xl text-center space-y-5 animate-scaleUp">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce text-lg">
                  🎉
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900">
                    {isRTL ? "مبروك! لقد فزت" : "Congratulations! You Won"}
                  </h3>
                  <p className="text-lg font-extrabold text-emerald-700">
                    {wonCoupon.label}
                  </p>
                </div>

                {/* Coupon display card */}
                <div className="bg-white border-2 border-dashed border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3">
                  <code className="text-base font-black text-slate-800 tracking-wider">
                    {wonCoupon.code}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`btn btn-sm ${
                      copied ? "btn-success" : "btn-primary bg-emerald-600 hover:bg-emerald-700"
                    } rounded-lg px-3 flex items-center gap-1 text-xs`}
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ" : "Copy")}
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {isRTL 
                    ? "* يتم تطبيق هذا الكوبون عند إدخاله بصفحة الدفع." 
                    : "* Enter this coupon code at checkout to claim your reward."}
                </p>

                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-outline border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl w-full py-2.5 text-xs font-bold"
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
