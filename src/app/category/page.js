"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  FaBox,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowRight,
  FaFolderOpen,
  FaSearch,
  FaLayerGroup,
} from "react-icons/fa";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaLayerGroup className="text-4xl text-primary" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Explore Collections
            </h1>
          </div>
          <p className="text-lg text-base-content/60 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <FaSearch className="text-primary" />
            Discover our curated selection of premium products organized by
            category
          </p>
          <div className="divider w-24 mx-auto mt-6 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex gap-8 pb-4 animate-scroll-left">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 group flex-shrink-0 w-64"
              >
                <div className="skeleton h-60 w-full rounded-t-2xl"></div>
                <div className="card-body">
                  <div className="skeleton h-6 w-3/4 mb-3"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="relative">
            <div className="relative overflow-hidden py-8 w-full">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

              <div className="flex animate-scroll-left gap-6 items-center">
                {categories.map((category) => (
                  <Link
                    key={`first-${category._id}`}
                    href={`/product?category=${category.slug}`}
                    className="group flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-emerald-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-40 h-40 mb-4 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                        {category.image ? (
                          <Image
                            loading="lazy"
                            src={category.image}
                            alt={category.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <FaBox className="w-full h-full text-gray-400 object-contain group-hover:text-emerald-500 transition-colors duration-500" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-500">
                        {category.name}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {category.slug}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        View Collection
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}

                {categories.map((category) => (
                  <Link
                    key={`second-${category._id}`}
                    href={`/product?category=${category.slug}`}
                    className="group flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-emerald-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-40 h-40 mb-4 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                        {category.image ? (
                          <Image
                            loading="lazy"
                            src={category.image}
                            alt={category.name}
                            width={100}
                            height={100}
                            className="w-full h-full rounded-md object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <FaBox className="w-full h-full text-gray-400 object-contain group-hover:text-emerald-500 transition-colors duration-500" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-500">
                        {category.name}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {category.slug}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        View Collection
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="alert alert-info shadow-lg">
              <FaExclamationTriangle className="text-xl" />
              <span>No categories found. Please check back later.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
