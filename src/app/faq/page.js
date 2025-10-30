"use client";
import { useState, useMemo, useEffect } from "react";
import {
  HelpCircle,
  Truck,
  CreditCard,
  Shield,
  RefreshCw,
  Package,
  MessageSquare,
  Clock,
  Globe,
  Gift,
  Search,
  X,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";

const faqCategories = [
  {
    name: "Orders & Shipping",
    icon: <Truck className="w-5 h-5" />,
    items: [
      {
        question: "How do I track my order?",
        answer:
          "You'll receive a tracking number via email once your order ships. You can enter this number in our Track Order page or directly on the carrier's website.",
        icon: <Package className="w-4 h-4 mr-2" />,
      },
      {
        question: "What shipping options are available?",
        answer:
          "We offer standard (3-5 business days), express (1-2 business days), and international shipping (7-14 business days). Free shipping is available for orders over $50.",
        icon: <Clock className="w-4 h-4 mr-2" />,
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes! We ship to over 50 countries worldwide. International orders may be subject to customs fees upon delivery.",
        icon: <Globe className="w-4 h-4 mr-2" />,
      },
    ],
  },
  {
    name: "Payments & Pricing",
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are securely processed with 256-bit encryption.",
        icon: <CreditCard className="w-4 h-4 mr-2" />,
      },
      {
        question: "Do you offer discounts or promotions?",
        answer:
          "Yes! Subscribe to our newsletter for 10% off your first order. We also run seasonal promotions and offer student/military discounts.",
        icon: <Gift className="w-4 h-4 mr-2" />,
      },
    ],
  },
  {
    name: "Returns & Warranty",
    icon: <RefreshCw className="w-5 h-5" />,
    items: [
      {
        question: "What's your return policy?",
        answer:
          "We offer a 30-day hassle-free return policy. Items must be unused with original packaging. Start your return in the Orders section of your account.",
        icon: <RefreshCw className="w-4 h-4 mr-2" />,
      },
      {
        question: "Do your products come with a warranty?",
        answer:
          "Most products come with a 1-year manufacturer warranty. Extended warranties are available for purchase at checkout for eligible items.",
        icon: <Shield className="w-4 h-4 mr-2" />,
      },
    ],
  },
  {
    name: "Customer Support",
    icon: <MessageSquare className="w-5 h-5" />,
    items: [
      {
        question: "How can I contact customer service?",
        answer:
          "Our support team is available 24/7 via live chat, email (support@Sil3aty.com), or phone (1-800-Sil3aty-NOW). Average response time is under 15 minutes.",
        icon: <MessageSquare className="w-4 h-4 mr-2" />,
      },
      {
        question: "Do you have a physical store?",
        answer:
          "We're currently online-only, but you can find select Sil3aty products at our partner retailers nationwide. Check our Store Locator for details.",
        icon: <HelpCircle className="w-4 h-4 mr-2" />,
      },
    ],
  },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    document.title = "Sil3aty - Frequently Asked Questions";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Get answers to your most frequently asked questions about Sil3aty, our online store. View our FAQ page for a comprehensive list of frequently asked questions and their answers."
      );
    }
  }, []);

  const allQuestions = useMemo(() => {
    return faqCategories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: category.name,
        categoryIcon: category.icon,
      }))
    );
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeCategory) {
        return allQuestions.filter((q) => q.categoryName === activeCategory);
      }
      return allQuestions;
    }

    const query = searchQuery.toLowerCase();
    return allQuestions.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, allQuestions, activeCategory]);

  const groupedQuestions = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach((q) => {
      if (!groups[q.categoryName]) {
        groups[q.categoryName] = {
          icon: q.categoryIcon,
          items: [],
        };
      }
      groups[q.categoryName].items.push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setActiveCategory(null);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
    setSearchQuery("");
  };

  return (
    <>
      <Head>
        <meta name="title" content="Sil3aty - Frequently Asked Questions" />
        <meta
          name="description"
          content="Find answers to common questions about ordering, shipping, returns, and more at Sil3aty."
        />
      </Head>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            How can we help?
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto text-gray-700">
            Quick answers to your questions about orders, shipping, returns and
            more.
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="🔍Search FAQs..."
              className="input input-primary w-full pl-2 pr-4 py-3 "
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                <X size={17} className="text-gray-400 cursor-pointer" />
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {faqCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className={`card bg-base-100 shadow-md hover:shadow-xl transition-all ${
                activeCategory === category.name ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body items-center text-center p-4">
                <div
                  className={`p-3 rounded-full mb-2 ${
                    activeCategory === category.name
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {category.icon}
                </div>
                <h2 className="card-title text-lg">{category.name}</h2>
                <span className="text-sm opacity-70">
                  {category.items.length} questions
                </span>
              </div>
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Search results for "{searchQuery}" ({filteredQuestions.length})
            </h2>
            {filteredQuestions.length === 0 ? (
              <div className="alert alert-info">
                <div>
                  <span>
                    No results found. Try different keywords or browse our
                    categories.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((item, index) => (
                  <div
                    key={index}
                    className="collapse collapse-plus bg-base-100 border border-base-200"
                  >
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title text-lg font-medium flex items-center">
                      {item.icon}
                      {item.question}
                    </div>
                    <div className="collapse-content">
                      <div className="prose">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Results */}
        {!searchQuery && (
          <div className="space-y-12">
            {Object.entries(groupedQuestions).map(
              ([categoryName, categoryData]) => (
                <div key={categoryName} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                    {categoryData.icon}
                    {categoryName}
                  </h2>
                  <div className="space-y-4">
                    {categoryData.items.map((item, index) => (
                      <div
                        key={index}
                        className="collapse collapse-plus bg-base-100 border border-base-200"
                      >
                        <input type="checkbox" className="peer" />
                        <div className="collapse-title text-lg font-medium flex items-center">
                          {item.icon}
                          {item.question}
                        </div>
                        <div className="collapse-content">
                          <div className="prose">
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mt-16">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl">
              Still have questions?
            </h2>
            <p>Our customer support team is ready to help you 24/7</p>
            <div className="card-actions justify-center mt-4">
              <Link href={"/contact"} className="btn btn-outline btn-accent">
                Contact Support
              </Link>
              <button className="btn btn-accent">Live Chat</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
