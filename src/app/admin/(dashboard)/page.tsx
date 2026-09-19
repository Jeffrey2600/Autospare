import Link from "next/link";
import type { Metadata } from "next";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  IndianRupee,
  MessageSquare,
  Star,
  Plus,
  FolderTree,
  Image as ImageIcon,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [
    productCount,
    lowStockCount,
    orderCount,
    pendingOrderCount,
    revenueAgg,
    recentOrders,
    unreadMessages,
    pendingReviews,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  const stats = [
    { label: "Total Products", value: productCount, icon: Package, href: "/admin/products" },
    { label: "Total Orders", value: orderCount, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Pending Orders", value: pendingOrderCount, icon: ShoppingBag, href: "/admin/orders?status=PENDING" },
    { label: "Low Stock Items", value: lowStockCount, icon: AlertTriangle, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your stock, photos, prices and orders from here.
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-lg bg-brand-600 px-4 py-3 text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <ShoppingBag className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="text-sm font-semibold">View Orders</span>
          </Link>
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <FolderTree className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="text-sm font-semibold">Add Category</span>
          </Link>
          <Link
            href="/admin/banners"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <ImageIcon className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="text-sm font-semibold">Homepage Banners</span>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatPrice(revenueAgg._sum.total ?? 0)}</p>
            <p className="text-xs text-slate-500">Total Revenue (excl. cancelled)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/admin/messages"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <MessageSquare className="h-5 w-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{unreadMessages}</p>
              <p className="text-xs text-slate-500">Unread Messages</p>
            </div>
          </Link>
          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <Star className="h-5 w-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingReviews}</p>
              <p className="text-xs text-slate-500">Pending Reviews</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 font-medium text-slate-600">No orders yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      New orders will appear here and be sent to your WhatsApp automatically.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
