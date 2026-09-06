"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Order, Product, DistributionCenter, AuditLog } from "@prisma/client";

interface GovernmentDashboardProps {
  orders?: Order[];
  products?: Product[];
  distributionCenters?: DistributionCenter[];
  auditLogs?: AuditLog[];
}

export default function GovernmentDashboard({
  orders = [],
  products = [],
  distributionCenters = [],
  auditLogs = [],
}: GovernmentDashboardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "orders" | "inventory" | "analytics" | "audit">("home");
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "ready" | "picked">("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "PAID":
        return "bg-blue-100 text-blue-700";
      case "READY_FOR_PICKUP":
        return "bg-green-100 text-green-700";
      case "PICKED_UP":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "pending") return order.status === "PENDING";
    if (filter === "paid") return order.status === "PAID";
    if (filter === "ready") return order.status === "READY_FOR_PICKUP";
    if (filter === "picked") return order.status === "PICKED_UP";
    return true;
  });

  // Compute analytics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP").length;
  const pickedOrders = orders.filter((o) => o.status === "PICKED_UP").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const statusDistribution = [
    { label: "Pending", value: pendingOrders, color: "bg-yellow-500" },
    { label: "Paid/Ready", value: paidOrders, color: "bg-blue-500" },
    { label: "Picked Up", value: pickedOrders, color: "bg-green-500" },
  ];

  const maxStatusValue = Math.max(...statusDistribution.map((s) => s.value), 1);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Government Dashboard</h1>
        <p className="text-gray-600">
          Monitor agricultural input distribution, track orders, and manage inventory.
          Ensure transparency and direct access for farmers.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "home" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "orders" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Orders
          {orders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{orders.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "inventory" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "analytics" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "audit" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Audit Log
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat Cards */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Total Orders</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">All time orders</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.026 12.026 0 005 9c0 5.591 3 8.964 7 9.869v4.309c0 .408.195.786.493 1.063d1.763 2.144 1.763 2.144 0 01-1.434 2.106M15 21h2a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11m4-8l3 3 3-3" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Picked Up</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pickedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully collected</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting action</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.553-1M12 8V7m0 1v8m0 1c-1.11 0-2.08.402-2.553 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">ETB</p>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-600">
                        {order.user?.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{Number(order.totalAmount).toFixed(2)} ETB</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribution Centers */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Distribution Centers</h3>
              <button
                onClick={() => setActiveTab("inventory")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Manage
              </button>
            </div>
            {distributionCenters.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500">No centers configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {distributionCenters.map((center) => (
                  <div key={center.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{center.name}</p>
                      <p className="text-sm text-gray-600">{center.location}</p>
                      {center.contactPhone && (
                        <p className="text-sm text-gray-500">{center.contactPhone}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${center.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {center.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">All Orders</h2>
              <p className="text-gray-600 mt-1">{orders.length} total orders</p>
            </div>

            {/* Filters */}
            <div className="flex gap-1">
              {(["all", "pending", "paid", "ready", "picked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Orders will appear here once farmers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.user?.fullName || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.items?.length > 0 ? (
                            <>
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <span className="text-gray-800">{item.product?.name}</span>
                                  <span className="text-gray-500">x{item.quantity}</span>
                                </div>
                              ))}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{Number(order.totalAmount).toFixed(2)} ETB</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
            <p className="text-gray-600 mt-1">Track stock levels across distribution centers.</p>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products configured</h3>
              <p className="text-gray-600">Add products to start tracking inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.image && (
                            <div className="mt-2 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-700">{Number(product.price).toFixed(2)} ETB</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                product.category === "FERTILIZER"
                                  ? "bg-green-500"
                                  : product.category === "SEED"
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.random() * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.floor(Math.random() * 500 + 50)} {product.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Math.random() > 0.3
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {Math.random() > 0.3 ? "In Stock" : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(item.value / maxStatusValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">{paidOrders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pickup Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders > 0 ? Math.round((pickedOrders / totalOrders) * 100) : 0}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"} ETB
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Distribution Insights</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2 items-start">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Monitor pending orders to ensure timely processing</span>
              </li>
              <li className="flex gap-2 items-start">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track pickup rates to measure distribution effectiveness</span>
              </li>
              <li className="flex gap-2 items-start">
                <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Use real-time data to identify shortages and bottlenecks</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Audit Log</h2>
            <p className="text-gray-600 mt-1">Complete record of platform activity for compliance and transparency.</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit records</h3>
              <p className="text-gray-600">Activity will be logged here for transparency.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          User: {log.user?.fullName || "System"} • {new Date(log.createdAt).toLocaleString()}
                        </p>
                        {log.details && (
                          <p className="text-sm text-gray-500 mt-1 font-mono">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
