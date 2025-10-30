"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaIndustry,
  FaSpinner,
  FaExclamationTriangle,
  FaTag,
  FaInfoCircle,
  FaArrowRight,
} from "react-icons/fa";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        if (!response.ok) throw new Error("Failed to fetch brands");
        const data = await response.json();
        setBrands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 bg-base-100">
        <FaExclamationTriangle className="text-6xl mb-4 text-red-400" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Brands</h2>
        <p className="text-lg">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-primary"
        >
          <FaSpinner className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-8 py-12">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaSpinner className="text-6xl text-primary animate-spin mb-4" />
            <p className="text-gray-600 text-xl flex items-center gap-2">
              <FaTag className="text-primary" />
              Loading Brands...
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-16">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <FaIndustry className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Our Premium Brands
                </h2>
              </div>

              <div className="relative overflow-hidden py-8">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

                <div className="flex animate-scroll-left gap-6 items-center hover:pause-scroll">
                  {brands.map((brand) => (
                    <Link
                      key={`first-${brand._id}`}
                      href={`/product?brand=${brand._id}`}
                      className="group flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-emerald-200 hover:scale-105"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 mb-4 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                          {brand.logo ? (
                            <img
                              loading="lazy"
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <FaIndustry className="w-full h-full text-gray-400 object-contain group-hover:text-emerald-500 transition-colors duration-500" />
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-500">
                          {brand.name}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {brand.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                          View Products
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  {brands.map((brand) => (
                    <Link
                      key={`second-${brand._id}`}
                      href={`/product?brand=${brand._id}`}
                      className="group flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-emerald-200 hover:scale-105"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 mb-4 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 group-hover:from-emerald-50 group-hover:to-green-50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                          {brand.logo ? (
                            <img
                              loading="lazy"
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <FaIndustry className="w-full h-full text-gray-400 object-contain group-hover:text-emerald-500 transition-colors duration-500" />
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-500">
                          {brand.name}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {brand.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                          View Products
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/product?brand=${brand._id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-emerald-200"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-3 relative bg-gray-50 rounded-lg p-2 group-hover:bg-emerald-50 transition-colors">
                        {brand.logo ? (
                          <img
                            loading="lazy"
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FaIndustry className="w-full h-full text-gray-400 object-contain" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {brand.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && brands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaIndustry className="text-8xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Brands Found
            </h3>
            <p className="text-gray-500 max-w-md">
              There are currently no brands available. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
