"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Product, Order } from "@prisma/client";

interface FarmerDashboardProps {
  products?: Product[];
  orders?: Order[];
}

export default function FarmerDashboard({ products = [], orders = [] }: FarmerDashboardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "products" | "orders">("home");

  const handleOrder = async (productId: string, productName: string, price: number, unit: string) => {
    if (!session?.user) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          notes: "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Order placed for ${productName}! Your order ID is ${data.orderId}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {session?.user?.name || "Farmer"}!
        </h1>
        <p className="text-gray-600">
          Access agricultural inputs directly through Fayda-verified channels.
          No brokers, no inflated prices.
        </p>
        {session?.user?.faydaId && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700">
              Verified via Fayda ID: {session.user.faydaId}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "home" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "products" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Products
            {products.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{products.length}</span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "orders" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
            {orders.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{orders.length}</span>
            )}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">How AgroLink Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Products</p>
                    <p className="text-sm text-gray-600">View fertilizers, seeds, and pesticides with transparent pricing</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Place Order</p>
                    <p className="text-sm text-gray-600">Order directly linked to your verified Fayda identity</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pick Up or Delivery</p>
                    <p className="text-sm text-gray-600">Collect from nearest distribution center or arrange delivery</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.026 12.026 0 005 9c0 5.591 3 8.964 7 9.869v4.309c0 .408.195.786.493 1.063d1.763 2.144 1.763 2.144 0 01-1.434 2.106M15 21h2a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11m4-8l3 3 3-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Track Status</p>
                    <p className="text-sm text-gray-600">Monitor your order from placement to collection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            {orders.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                  <Link
                    href="/dashboard/farmer/orders"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "PICKED_UP"
                            ? "bg-green-100 text-green-700"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "DELIVERED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Farmer Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Order early in the planting season for better availability</span>
              </li>
              <li className="flex gap-2">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Use your Fayda ID to verify eligibility for government subsidized inputs</span>
              </li>
              <li className="flex gap-2">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Track your orders to plan your farming schedule efficiently</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Available Agricultural Inputs</h2>
            <p className="text-gray-600 mt-1">Browse and order directly — all prices are transparent and verified.</p>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">Check back later for new agricultural inputs.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                            {product.category}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-green-700">
                            {Number(product.price).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">per {product.unit}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={() => handleOrder(product.id, product.name, Number(product.price), product.unit)}
                      className="flex-shrink-0 ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Your Orders</h2>
            <p className="text-gray-600 mt-1">Track your agricultural input orders from placement to collection.</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Browse products and place your first order.</p>
              <Link
                href="/dashboard/farmer/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "PICKED_UP"
                              ? "bg-green-100 text-green-700"
                              : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "PAID"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "DELIVERED"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-700">{Number(order.totalAmount).toFixed(2)} ETB</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-800 font-medium mb-2">Items:</p>
                    <div className="text-sm text-gray-600">
                      {order.items?.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.id} className="flex justify-between py-1">
                            <span>{item.product?.name || "Product"} x{item.quantity}</span>
                            <span>{Number(item.subtotal).toFixed(2)} ETB</span>
                          </div>
                        ))
                      ) : (
                        <span className="italic">Order details loading...</span>
                      )}
                    </div>
                  </div>

                  {order.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  )}

                  {["PAID", "READY_FOR_PICKUP", "PICKED_UP"].includes(order.status) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {/* Status-specific message */}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
