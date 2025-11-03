"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../../components/CheckoutForm";
import OrderSummary from "../../../components/OrderSummary";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const response = await axios.post('/api/coupon/apply', {
        code: couponCode.trim().toUpperCase(),
        orderTotal: cart.total,
        productIds: cart.items.map(item => item.product._id)
      });

      const couponData = response.data.coupon;
      setAppliedCoupon(couponData);
      toast.success(couponData.message);
      setCouponCode('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || t('failedToApplyCoupon');
      toast.error(errorMessage);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateFinalTotal = () => {
    return appliedCoupon ? appliedCoupon.discountedTotal : cart.total;
  };

  useEffect(() => {
    document.title = "Sil3aty - Checkout Page";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Complete your purchase securely on our checkout page."
      );
    }
  }, []);

  useEffect(() => {
    const fetchCartAndCreatePaymentIntent = async () => {
      try {
        const { data: cartData } = await axios.get("/api/cart");
        setCartItems(cartData.items);
        setCart({
          items: cartData.items || [],
          total: cartData.total || 0,
        });

        const { data: paymentIntentData } = await axios.post(
          "/api/payment/intent"
        );
        setClientSecret(paymentIntentData.clientSecret);
      } catch (error) {
        setError(error.response?.data?.error || t("failedToInitializePayment"));
        toast.error(
          error.response?.data?.error || t("failedToInitializePayment")
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchCartAndCreatePaymentIntent();
  }, [session, t]);

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          {t("pleaseSignInToCheckout")}
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-lg text-gray-500">{t("loadingCheckout")}</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="text-center mb-8 lg:mb-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-700">
          {t("completeYourPurchase")}
        </h1>
        <p className="text-gray-500">{t("secureCheckoutPoweredByStripe")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-base-100 p-6 lg:p-8 rounded-xl shadow-lg border border-base-200">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                cartItems={cartItems}
                appliedCoupon={appliedCoupon}
                calculateFinalTotal={calculateFinalTotal}
              />
            </Elements>
          )}
        </div>

        <div className="lg:sticky lg:top-8 self-start">
          <OrderSummary
            cart={cart}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            couponLoading={couponLoading}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
            calculateFinalTotal={calculateFinalTotal}
          />
        </div>
      </div>
    </div>
  );
}
