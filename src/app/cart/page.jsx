"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = ` Sil3aty | Shop Cart`;
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        "Shopping cart with your favorite products.Add, remove, or update items in your cart."
      );
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get("/api/cart");

        if (data && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setError("Invalid cart data format");
          setCartItems([]);
        }
      } catch (error) {
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchCart();
  }, [session]);

  const updateCartItem = async (itemId, updates) => {
    try {
      await axios.put(`/api/cart/${itemId}`, updates);
      setCartItems((items) =>
        items.map((item) =>
          item._id === itemId ? { ...item, ...updates } : item
        )
      );
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (itemId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/cart/${itemId}`);
        setCartItems((items) => items.filter((item) => item._id !== itemId));
        toast.success("Item removed");
      } catch (error) {
        toast.error("Failed to remove item");
      }
    }
  };

  const validateCartItems = () => {
    const invalidItems = cartItems.filter(
      (item) => !item.size?.trim() || !item.color?.trim() || item.quantity < 1
    );

    return {
      isValid: invalidItems.length === 0,
      invalidCount: invalidItems.length,
    };
  };

  const handleCheckout = () => {
    const validation = validateCartItems();
    if (!validation.isValid) {
      toast.error(
        `Please select size, color, and quantity for ${validation.invalidCount} item(s)`
      );
      return;
    }
    router.push("/checkout");
  };

  const total = cartItems.reduce((acc, item) => {
    if (item.product && item.product.price) {
      return acc + item.product.price * item.quantity;
    }
    return acc;
  }, 0);

  const increaseQuantity = (itemId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    updateCartItem(itemId, { quantity: newQuantity });
  };

  const decreaseQuantity = (itemId, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    updateCartItem(itemId, { quantity: newQuantity });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-gray-700">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-12 flex items-center justify-center">
          <span className="loading loading-infinity text-primary mx-2"></span>
          <p className="text-xl">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-xl mb-4 text-gray-700">Your cart is empty</p>
          <Link href="/" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="card card-side bg-base-100 shadow-lg px-5"
            >
              {/* Product Image */}
              <figure className="w-32 h-32 mt-5">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name || "Product image"}
                    width={150}
                    height={150}
                    className="object-contain bg-white p-2 rounded-2xl"
                  />
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center h-full rounded-lg">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </figure>

              {/* Product Details */}
              <div className="card-body">
                <Link
                  href={`/product/${item.product?._id}`}
                  className="card-title hover:underline"
                >
                  {item.product?.name || "Unnamed Product"}
                </Link>
                <p className="text-gray-600">
                  {item.size} / {item.color}
                </p>
                <p className="text-lg font-semibold">
                  ${item.product?.price?.toFixed(2) || "0.00"}
                </p>

                {/* Size Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size:</label>
                  <div className="flex flex-wrap gap-2">
                    {item.product?.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateCartItem(item._id, { size })}
                        className={`btn btn-sm ${
                          (item.size || "XL") === size
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!item.size && (
                    <p className="text-xs text-error">Please select a size</p>
                  )}
                </div>

                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {item.product?.colors?.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateCartItem(item._id, { color })}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                          item.color === color
                            ? "border-primary"
                            : "border-base-300"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  {!item.color && (
                    <p className="text-xs text-error">Please select a color</p>
                  )}
                </div>

                {/* Quantity and Remove Button */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center ">
                    <button
                      onClick={() => decreaseQuantity(item._id, item.quantity)}
                      className="btn btn-sm btn-primary rounded-tr-none rounded-br-none"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium border-t border-b w-[100px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item._id, item.quantity)}
                      className="btn btn-sm btn-primary rounded-tl-none rounded-bl-none"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="btn btn-error btn-sm w-[30%]"
                  >
                    <Trash2 size={18} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card bg-base-200 p-6 rounded-lg h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="btn btn-primary w-full mt-6"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
