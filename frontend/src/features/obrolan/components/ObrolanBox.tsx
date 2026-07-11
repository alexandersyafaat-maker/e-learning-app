"use client";

import { useTransition, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { sendPesanAction } from "../actions/send-pesan.action";
import type { PesanObrolan } from "../types/obrolan.types";
import { cn } from "@/lib/utils";

function formatChatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function PesanBubble({ pesan, isOwn }: { pesan: PesanObrolan; isOwn: boolean }) {
  const initial = pesan.userNama.charAt(0).toUpperCase();
  const avatarClass = pesan.userRole === "GURU"
    ? "bg-indigo-100 text-indigo-700"
    : "bg-emerald-100 text-emerald-700";
  const roleBadgeClass = pesan.userRole === "GURU"
    ? "bg-indigo-50 text-indigo-500"
    : "bg-emerald-50 text-emerald-600";

  return (
    <div className={cn("flex gap-2 mb-4", isOwn ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
        avatarClass
      )}>
        {initial}
      </div>
      <div className={cn("max-w-[75%] flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        <div className={cn("flex items-center gap-1.5 text-xs text-slate-400", isOwn && "flex-row-reverse")}>
          <span className="font-medium text-slate-600">{pesan.userNama}</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", roleBadgeClass)}>
            {pesan.userRole === "GURU" ? "Guru" : "Siswa"}
          </span>
          <span>{formatChatTime(pesan.createdAt)}</span>
        </div>
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm break-words leading-relaxed",
          isOwn
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-slate-100 text-slate-800 rounded-tl-sm"
        )}>
          {pesan.teks}
        </div>
      </div>
    </div>
  );
}

export function ObrolanBox({
  materiId,
  messages,
  currentUserId,
}: {
  materiId: string;
  messages: PesanObrolan[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await sendPesanAction(materiId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <MessageSquare size={14} className="text-indigo-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">Obrolan Materi</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {messages.length} pesan
        </span>
      </div>

      <div className="h-80 overflow-y-auto px-5 py-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <MessageSquare size={32} className="opacity-20" />
            <p className="text-sm">Belum ada pesan. Mulai obrolan!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <PesanBubble key={msg.id} pesan={msg} isOwn={msg.userId === currentUserId} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <form ref={formRef} action={handleSubmit} className="flex gap-2">
          <input
            name="teks"
            type="text"
            required
            disabled={isPending}
            placeholder="Tulis pesan..."
            maxLength={1000}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send size={14} />
            {isPending ? "..." : "Kirim"}
          </button>
        </form>
      </div>
    </div>
  );
}
