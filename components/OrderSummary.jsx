// components/OrderSummary.js
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Truck, BadgeCheck, Loader2, ShoppingCart, XCircle } from 'lucide-react';

export default function OrderSummary() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get('/api/cart');
        setCart({
          items: data?.items || [],
          total: data?.total || 0,
        });
      } catch (err) {
        setError('Failed to load cart details');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

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
        <h2 className="text-2xl font-bold">Order Summary</h2>
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
                          {item.size || 'One Size'}
                        </span>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.color || '#cccccc' }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                        <span className="font-medium">
                        EGP {(item.product?.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                  EGP {cart.total?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-lg">
                  Shipping
                  <span className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-success" />
                    <span className="text-success font-semibold">Free</span>
                  </span>
                </div>

                <div className="divider" />

                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    EGP {cart.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}