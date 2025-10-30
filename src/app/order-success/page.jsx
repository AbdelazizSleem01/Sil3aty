"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  useEffect(() => {
    document.title = "Sil3aty - Order Success Page";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Order placed successfully! We will notify you when your order is shipped."
      );
    }
  }, []);

  useEffect(() => {
    if (orderId) {
      toast.success("Order placed successfully!");
    }
  }, [orderId]);

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center bg-base-200 my-12 rounded-lg shadow-lg ">
      <div className="mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-green-500 mx-auto"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-lg mb-4">Thank you for your purchase</p>
      {orderId && (
        <p className="mb-4">
          Order ID:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {orderId}
          </span>
        </p>
      )}
      <p className="mb-8">
        You'll receive a confirmation email with your order details
      </p>

      <div className="flex justify-center gap-4">
        <Link href="/orders" className="btn btn-primary">
          View Orders
        </Link>
        <Link href="/" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
