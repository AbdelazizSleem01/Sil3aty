"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError(
          "Invalid verification link. Please check your email for the correct link."
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to verify email. Please try again."
          );
        }

        setMessage(
          "Your email has been successfully verified! Welcome to our community!"
        );
        setIsLoading(false);

        // Redirect to the homepage after 3 seconds
        // setTimeout(() => {
        //   router.push('/');
        // }, 3000);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center transform transition-all hover:scale-105">
        {/* Icon */}
        <svg
          className="w-16 h-16 mx-auto my-5 text-green-500 border rounded-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Email Verification
        </h1>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-all"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-500 text-lg font-semibold mb-4">
              {message}
            </p>

            <button
              onClick={() => router.push("/")}
              className=" btn mt-4 bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-all"
            >
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
