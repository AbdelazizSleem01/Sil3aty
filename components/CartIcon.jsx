'use client';

import { ShoppingCart } from "lucide-react";

export default function CartIcon({ cartItemsCount }) {
  return (
    <div className="relative">
      <ShoppingCart />
      {cartItemsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {cartItemsCount}
        </span>
      )}
    </div>
  );
}