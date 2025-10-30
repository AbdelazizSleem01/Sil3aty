// app/checkout/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../../components/CheckoutForm';
import OrderSummary from '../../../components/OrderSummary';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCartAndCreatePaymentIntent = async () => {
      try {
        const { data: cartData } = await axios.get('/api/cart');
        setCartItems(cartData.items);

        const { data: paymentIntentData } = await axios.post('/api/payment/intent');
        setClientSecret(paymentIntentData.clientSecret);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to initialize payment');
        toast.error(error.response?.data?.error || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchCartAndCreatePaymentIntent();
  }, [session]);

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="alert alert-warning max-w-md">
        Please sign in to checkout
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-lg text-gray-500">Loading checkout...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="alert alert-error max-w-md">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="text-center mb-8 lg:mb-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-700">Complete Your Purchase</h1>
        <p className="text-gray-500">Secure checkout powered by Stripe </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-base-100 p-6 lg:p-8 rounded-xl shadow-lg border border-base-200">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm cartItems={cartItems} />
            </Elements>
          )}
        </div>

        <div className="lg:sticky lg:top-8 self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}