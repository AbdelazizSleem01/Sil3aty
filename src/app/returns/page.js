"use client";
import {
  PackageCheck,
  ArrowLeft,
  Box,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import { useEffect } from "react";

export default function Returns() {
  useEffect(() => {
    document.title = "Sil3aty - Returns Page";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Sil3aty accepts returns within 30 days of purchase. Please provide your order number, invoice, and shipping label when requesting a return."
      );
    }
  }, []);

  const returnConditions = [
    {
      item: "Unused items",
      allowed: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      note: "Must be in original condition",
    },
    {
      item: "Original packaging",
      allowed: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      note: "With all tags attached",
    },
    {
      item: "Proof of purchase",
      allowed: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      note: "Order number or receipt required",
    },
    {
      item: "Final sale items",
      allowed: false,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      note: "Marked as non-returnable",
    },
    {
      item: "Worn or damaged items",
      allowed: false,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      note: "Except for manufacturer defects",
    },
  ];

  const returnSteps = [
    {
      step: "Initiate return",
      description: "Start your return through our online portal",
      icon: <Box className="w-5 h-5" />,
      time: "Within 30 days",
    },
    {
      step: "Package items",
      description: "Use original packaging with all accessories",
      icon: <PackageCheck className="w-5 h-5" />,
      time: "1-2 days",
    },
    {
      step: "Ship back",
      description: "Use provided return label or your own carrier",
      icon: <ArrowLeft className="w-5 h-5" />,
      time: "3-5 business days",
    },
    {
      step: "Receive refund",
      description: "Refund processed within 3 business days of receipt",
      icon: <Check className="w-5 h-5" />,
      time: "3-5 business days",
    },
  ];

  return (
    <>
      <Head>
        <title>Sil3aty - Returns & Exchanges</title>
        <meta
          name="description"
          content="Our hassle-free return and exchange policy at Sil3aty"
        />
      </Head>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <PackageCheck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto text-gray-600">
            Our 30-day hassle-free return policy
          </p>
        </div>

        {/* Policy Overview */}
        <div className="card bg-base-200 mb-16">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="p-4 rounded-full bg-primary/10">
                  <Clock className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="card-title text-2xl mb-2 ">
                  30-Day Return Window
                </h2>
                <p className="opacity-90">
                  You have 30 days from the delivery date to return most items
                  for a full refund. Some exclusions apply (see conditions
                  below).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2 text-primary">
            <Box className="w-6 h-6" />
            The Return Process
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map((step, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{step.step}</h3>
                  </div>
                  <p className="opacity-90 mb-3">{step.description}</p>
                  <div className="badge badge-outline">
                    <Clock className="w-4 h-4 mr-1" />
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="grid gap-12 md:grid-cols-2 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
              <CheckCircle className="w-6 h-6 " />
              Return Conditions
            </h2>
            <div className="space-y-4">
              {returnConditions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-base-200 rounded-lg"
                >
                  {item.icon}
                  <div>
                    <p className="font-medium">{item.item}</p>
                    {item.note && (
                      <p className="text-sm opacity-75">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-primary">
              <XCircle className="w-6 h-6 " />
              Non-Returnable Items
            </h2>
            <div className="prose text-gray-700">
              <ul>
                <li>Personalized or custom-made products</li>
                <li>Gift cards and downloadable software</li>
                <li>Intimate apparel and swimwear (for hygiene reasons)</li>
                <li>Products marked as "Final Sale"</li>
                <li>Items not purchased from Sil3aty</li>
              </ul>

              <div className="alert alert-warning mt-6">
                <div>
                  <AlertTriangle className="w-5 h-5" />
                  <span>
                    Opened software, music, movies, or games can only be
                    exchanged for the same title if defective.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Need Help With Your Return?
            </h2>
            <p>
              Our customer service team is happy to assist with any return
              questions
            </p>
            <div className="card-actions mt-4">
              <Link href="/contact" className="btn btn-accent">
                Contact Support
              </Link>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-5 h-5" />
                <span>1-800-Sil3aty-NOW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
