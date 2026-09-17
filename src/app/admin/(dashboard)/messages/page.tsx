import type { Metadata } from "next";
import { Mail, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { markMessageReadAction, deleteMessageAction } from "@/lib/actions/messages";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Contact Messages</h1>
      <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between", !msg.isRead && "bg-brand-50/40")}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{msg.name}</span>
                {!msg.isRead ? <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">New</span> : null}
              </div>
              <p className="text-xs text-slate-400">
                {msg.email} {msg.phone ? `· ${msg.phone}` : ""} · {formatDate(msg.createdAt)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{msg.message}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!msg.isRead ? (
                <form action={markMessageReadAction}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button type="submit" className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Mark as read">
                    <Mail className="h-4 w-4" />
                  </button>
                </form>
              ) : null}
              <form action={deleteMessageAction}>
                <input type="hidden" name="id" value={msg.id} />
                <ConfirmSubmitButton message="Delete this message?" className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {messages.length === 0 ? <p className="px-4 py-10 text-center text-slate-400">No messages yet.</p> : null}
      </div>
    </div>
  );
}
