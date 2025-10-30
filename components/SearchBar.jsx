"use client";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for products, brands, categories..."
          className="w-full h-12 px-6 pr-14 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-green-300"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl flex items-center justify-center hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!query.trim()}
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        {/* Glow effect on focus */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-sm -z-10 animate-pulse"></div>
        )}
      </div>
    </form>
  );
}
