'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Truck, BadgeCheck, Loader2, ShoppingCart, XCircle, Tag, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderSummary({
  cart,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  couponLoading,
  applyCoupon,
  removeCoupon,
  calculateFinalTotal
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 items-center"
        >
          <div className="w-16 h-16 bg-base-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-base-200 rounded w-3/4" />
            <div className="h-3 bg-base-200 rounded w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-200">
      <div className="flex items-center gap-3 mb-6">
        <BadgeCheck className="text-primary w-8 h-8" />
        <h2 className="text-2xl font-bold">{t("orderSummary")}</h2>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <>
          {cart.items.length > 0 ? (
            <>
              <div className="space-y-6 mb-8">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 items-center"
                  >
                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-contain p-1 bg-white"
                        />
                      ) : (
                        <div className="bg-base-200 w-full h-full flex items-center justify-center">
                          <ShoppingCart className="text-gray-400 w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{item.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="badge badge-ghost">
                          {item.size || t('oneSize')}
                        </span>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.color || '#cccccc' }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500">{t("qty")} {item.quantity}</span>
                        <span className="font-medium">
                        EGP {(item.product?.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Coupon Section */}
              {!appliedCoupon && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Tag className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-700">{t("haveCoupon")}</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("enterCouponCode")}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input input-bordered flex-1 text-center font-mono"
                      disabled={couponLoading}
                      onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {t("apply")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Applied Coupon */}
              {appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Tag className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">{t("couponApplied")}</p>
                        <p className="text-sm text-green-600">{appliedCoupon.code}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="btn btn-ghost btn-sm text-green-600 hover:bg-green-100"
                      title={t("removeCoupon")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 text-sm text-green-700">
                    <p className="font-medium">{appliedCoupon.message}</p>
                    {appliedCoupon.discountAmount > 0 && (
                      <p className="text-xs mt-1">
                        {t("discountAmount")}: EGP {appliedCoupon.discountAmount.toFixed(2)}
                        {appliedCoupon.freeShipping && ` (${t("freeShippingApplied")})`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold">
                  EGP {cart.total?.toFixed(2)}
                  </span>
                </div>

                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>{t("discount")}</span>
                    <span className="font-semibold">
                      -EGP {appliedCoupon.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg">
                  {t("shipping")}
                  <span className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-success" />
                    <span className="text-success font-semibold">
                      {appliedCoupon?.freeShipping ? t("free") : t("calculatedAtCheckout")}
                    </span>
                  </span>
                </div>

                <div className="divider" />

                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{t("total")}</span>
                  <span className={`text-primary ${appliedCoupon ? 'line-through text-gray-500' : ''}`}>
                    EGP {cart.total?.toFixed(2)}
                  </span>
                  {appliedCoupon && (
                    <span className="text-green-600 text-lg font-bold">
                      EGP {calculateFinalTotal().toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{t("yourCartIsEmpty")}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
