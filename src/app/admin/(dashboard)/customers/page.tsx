import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">Customers</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-ink-800">{c.name}</td>
                <td className="px-4 py-3 text-ink-600">
                  {c.email}
                  <br />
                  <span className="text-xs text-ink-400">{c.phone}</span>
                </td>
                <td className="px-4 py-3 text-ink-600">{c._count.orders}</td>
                <td className="px-4 py-3 text-ink-600">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                  No customers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
