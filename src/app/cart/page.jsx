"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCurrency } from "../../../components/CurrencyContext";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { formatPrice, getProductPrice } = useCurrency();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = ` Sil3aty | Shop Cart`;
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        "Shopping cart with your favorite products.Add, remove, or update items in your cart."
      );
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get("/api/cart");

        if (data && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setError("Invalid cart data format");
          setCartItems([]);
        }
      } catch (error) {
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchCart();
  }, [session]);

  const updateCartItem = async (itemId, updates) => {
    try {
      await axios.put(`/api/cart/${itemId}`, updates);
      setCartItems((items) =>
        items.map((item) =>
          item._id === itemId ? { ...item, ...updates } : item
        )
      );
    } catch (error) {
      toast.error(t("failedToUpdateCart"));
    }
  };

  const removeItem = async (itemId) => {
    const result = await Swal.fire({
      title: t("areYouSure"),
      text: t("youWontBeAbleToRevertThis"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesRemoveIt"),
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/cart/${itemId}`);
        setCartItems((items) => items.filter((item) => item._id !== itemId));
        toast.success(t("itemRemoved"));
      } catch (error) {
        toast.error(t("failedToRemoveItem"));
      }
    }
  };

  const validateCartItems = () => {
    const invalidItems = cartItems.filter(
      (item) => !item.size?.trim() || !item.color?.trim() || item.quantity < 1
    );

    return {
      isValid: invalidItems.length === 0,
      invalidCount: invalidItems.length,
    };
  };

  const handleCheckout = () => {
    const validation = validateCartItems();
    if (!validation.isValid) {
      toast.error(
        `${t("pleaseSelectSizeColorAndQuantityFor")} ${
          validation.invalidCount
        } ${t("items")}`
      );
      return;
    }
    router.push("/checkout");
  };

  const total = cartItems.reduce((acc, item) => {
    if (item.product) {
      return acc + getProductPrice(item.product, true) * item.quantity;
    }
    return acc;
  }, 0);

  const increaseQuantity = (itemId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    updateCartItem(itemId, { quantity: newQuantity });
  };

  const decreaseQuantity = (itemId, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    updateCartItem(itemId, { quantity: newQuantity });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-gray-700">
        <h1 className="text-3xl font-bold mb-8">{t("shoppingCart")}</h1>
        <div className="text-center py-12 flex items-center justify-center">
          <span className="loading loading-infinity text-primary mx-2"></span>
          <p className="text-xl">{t("loadingYourCart")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("shoppingCart")}</h1>
        <div className="text-center py-12">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">
          {t("shoppingCart")}
        </h1>
        <div className="text-center py-12">
          <p className="text-xl mb-4 text-gray-700">{t("yourCartIsEmpty")}</p>
          <Link href="/" className="btn btn-primary">
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">
        {t("shoppingCart")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="card card-side bg-base-100 shadow-lg px-5"
            >
              <figure className="w-32 h-32 mt-5">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name || "Product image"}
                    width={150}
                    height={150}
                    className="object-contain bg-white p-2 rounded-2xl"
                  />
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center h-full rounded-lg">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </figure>

              <div className="card-body">
                <Link
                  href={`/product/${item.product?._id}`}
                  className="card-title hover:underline"
                >
                  {item.product?.name || "Unnamed Product"}
                </Link>
                <p className="text-gray-600">
                  {item.size} / {item.color}
                </p>
                <p className="text-lg font-semibold">
                  {formatPrice(item.product?.price || 0, item.product, "discount")}
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("size")}</label>
                  <div className="flex flex-wrap gap-2">
                    {item.product?.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateCartItem(item._id, { size })}
                        className={`btn btn-sm ${
                          (item.size || "XL") === size
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!item.size && (
                    <p className="text-xs text-error">
                      {t("pleaseSelectASize")}
                    </p>
                  )}
                </div>

                {/* Color  */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("color")}</label>
                  <div className="flex flex-wrap gap-2">
                    {item.product?.colors?.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateCartItem(item._id, { color })}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                          item.color === color
                            ? "border-primary"
                            : "border-base-300"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  {!item.color && (
                    <p className="text-xs text-error">
                      {t("pleaseSelectAColor")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center ">
                    <button
                      onClick={() => decreaseQuantity(item._id, item.quantity)}
                      className={`btn btn-sm btn-primary ${
                        i18n.language === "ar"
                          ? "rounded-tl-none rounded-bl-none"
                          : "rounded-tr-none rounded-br-none"
                      } `}
                      disabled={item.quantity === 1}
                      title="Decrease Quantity"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium border-t border-b w-[100px] border-gray-300 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item._id, item.quantity)}
                      title="Increase Quantity"
                      className={`btn btn-sm btn-primary ${
                        i18n.language === "ar"
                          ? "rounded-tr-none rounded-br-none"
                          : "rounded-tl-none rounded-bl-none"
                      } `}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="btn btn-error btn-sm w-[30%] text-white"
                  >
                    <Trash2 size={18} /> {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card bg-base-200 p-6 rounded-lg h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-6">{t("orderSummary")}</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(total, null, "price", true)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("shipping")}</span>
              <span>{t("calculatedAtCheckout")}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>{t("total")}</span>
                <span>{formatPrice(total, null, "price", true)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="btn btn-primary w-full mt-6"
          >
            {t("proceedToCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
}
