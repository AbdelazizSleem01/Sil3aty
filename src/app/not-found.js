"use client";
import { AlertOctagon, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen  flex items-center bg-white">
      <div className="container mx-auto px-4">
        <div className="card lg:card-side  max-w-4xl mx-auto">
          <div className="card-body flex flex-col items-center text-center lg:text-left lg:items-start">
            <div className="mb-8">
              <span className="text-6xl font-bold text-primary">404</span>
              <h1 className="text-4xl font-bold mt-4 text-gray-700">
                Page Not Found
              </h1>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-lg text-gray-600">
                Oops! The page you're looking for seems to have vanished into
                the digital void.
              </p>
              <div className="flex flex-col lg:flex-row gap-4 justify-start">
                <Link href="/" className="btn btn-primary gap-2">
                  <Home />
                  Return Home
                </Link>

                <Link href={"/Contact"} className="btn btn-neutral gap-2">
                  <AlertOctagon />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          <figure className="px-10 pt-10 lg:pt-0 lg:w-1/2">
            <img
              loading="lazy"
              src="/images/not-found.jpg"
              alt="404 illustration"
              className="rounded-xl w-full h-64 lg:h-96 object-contain"
            />
          </figure>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Need help?{" "}
            <a
              href="mailto:abdelazizsleem957@gmail.com"
              className="link link-primary"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
