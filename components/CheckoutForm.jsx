"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Mail,
  User,
  MapPin,
  Phone,
  ShoppingCart,
  Loader2,
  MapPinHouseIcon,
  MapPinIcon,
  CodeSquareIcon,
} from "lucide-react";

import { useCurrency } from "./CurrencyContext";

export default function CheckoutForm({ cartItems, appliedCoupon, calculateFinalTotal }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    addressLine2: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    postalCode: "",
    country: "EG",
  });

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/orders", {
        shippingAddress,
        cartItems,
        appliedCoupon,
        finalTotal: parseFloat(cartTotal),
      });

      toast.success(t("orderPlacedSuccessfully"));
      router.push("/order-success");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          t("failedToPlaceOrder")
      );
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = (calculateFinalTotal() || (cartItems || [])
    .reduce((total, item) => total + item.product.price * item.quantity, 0)).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipping Address */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">{t("shippingInformation")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <User className="w-4 h-4" /> {t("firstName")}
              </span>
            </label>
            <input
              type="text"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <User className="w-4 h-4" /> {t("lastName")}
              </span>
            </label>
            <input
              type="text"
              name="lastName"
              value={shippingAddress.lastName}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <MapPinHouseIcon className="w-4 h-4" /> {t("streetAddress")}
              </span>
            </label>
            <input
              type="text"
              name="address"
              value={shippingAddress.address}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                {t("addressLine2Optional")}
              </span>
            </label>
            <input
              type="text"
              name="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {t("city")}
              </span>
            </label>
            <input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <CodeSquareIcon className="w-4 h-4" /> {t("postalCode")}
              </span>
            </label>
            <input
              type="text"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1">{t("state")}</span>
            </label>
            <input
              type="text"
              name="state"
              value={shippingAddress.state}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <Phone className="w-4 h-4" /> {t("phone")}
              </span>
            </label>
            <input
              type="tel"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1">
                <Mail className="w-4 h-4" /> {t("email")}
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={shippingAddress.email}
              onChange={handleShippingAddressChange}
              className="input input-primary w-full"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block btn-lg"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {t("placeOrder")} - {formatPrice(parseFloat(cartTotal))}
          </>
        )}
      </button>
    </form>
  );
}
