import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare, Search, RefreshCw, Trash2, MailOpen, Archive,
  ArchiveRestore, Reply, Phone, AtSign, Clock, Inbox, FileText,
  CheckCheck, Copy, CheckCircle2,
} from "lucide-react";

/* ------------------------------- Types ---------------------------------- */

type MsgStatus = "new" | "read" | "replied" | "archived";

type ContactMessage = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message: string;
  status: MsgStatus;
  reply_note?: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<MsgStatus, { label: string; badge: string; dot: string }> = {
  new:      { label: "جديدة",   badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/30",        dot: "bg-blue-500" },
  read:     { label: "مقروءة",  badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/10",    dot: "bg-slate-400" },
  replied:  { label: "تم الرد", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30", dot: "bg-emerald-500" },
  archived: { label: "مؤرشفة",  badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30", dot: "bg-amber-500" },
};

const FILTERS: { key: MsgStatus | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديدة" },
  { key: "read", label: "مقروءة" },
  { key: "replied", label: "تم الرد" },
  { key: "archived", label: "مؤرشفة" },
];

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("فشل تحميل البيانات");
  return res.json();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

/* ------------------------------ Page ------------------------------------- */

export default function SiteMessages() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<MsgStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data: messages = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => fetchJson<ContactMessage[]>("/api/contact-messages"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: number; status?: MsgStatus; replyNote?: string }) =>
      fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => { invalidate(); setSelected(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/contact-messages/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { invalidate(); setSelected(null); },
  });

  const openMessage = (m: ContactMessage) => {
    setSelected(m);
    if (m.status === "new") {
      updateMutation.mutate({ id: m.id, status: "read" });
    }
  };

  const filtered = useMemo(() => {
    let list = messages;
    if (filter !== "all") list = list.filter((m) => m.status === filter);
    const q = search.trim().toLowerCase();
    if (q.length >= 2) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          (m.email ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [messages, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: messages.length, new: 0, read: 0, replied: 0, archived: 0 };
    for (const m of messages) c[m.status] += 1;
    return c;
  }, [messages]);

  const unreadToday = messages.filter(
    (m) => m.status === "new" && Date.now() - new Date(m.created_at).getTime() < 86400000
  ).length;

  /* ------------------------------ Render ---------------------------------- */

  return (
    <div className="space-y-6" dir="rtl">
      {/* الترويسة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0068E2] to-[#02D9D9] text-white shadow-lg shadow-[#0068E2]/25">
            <MessageSquare className="h-6 w-6" />
            {counts.new > 0 && (
              <span className="absolute -top-1.5 -left-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow ring-2 ring-background">
                {counts.new}
              </span>
            )}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">رسائل الموقع</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              رسائل زوار الموقع من قسم «تواصل معنا»
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "جديدة اليوم", value: unreadToday, Icon: Inbox, cls: "text-blue-600 bg-blue-50 dark:bg-blue-400/10 dark:text-blue-300" },
          { label: "إجمالي الرسائل", value: counts.all, Icon: MessageSquare, cls: "text-violet-600 bg-violet-50 dark:bg-violet-400/10 dark:text-violet-300" },
          { label: "تم الرد عليها", value: counts.replied, Icon: Reply, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10 dark:text-emerald-300" },
          { label: "قيد الانتظار", value: (counts.new ?? 0) + (counts.read ?? 0), Icon: Clock, cls: "text-amber-600 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300" },
        ].map(({ label, value, Icon, cls }) => (
          <Card key={label} className="border-slate-200/80 dark:border-white/[0.06] shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cls}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الفلاتر والبحث */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`relative rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {filter === f.key && (
                <motion.span
                  layoutId="msg-filter-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#0068E2] to-[#02D9D9] shadow-md shadow-[#0068E2]/25"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {f.label}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                  filter === f.key ? "bg-white/20" : "bg-slate-100 dark:bg-white/10"
                }`}>
                  {counts[f.key] ?? 0}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-56 flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الجوال أو البريد…"
            className="h-10 border-slate-200 bg-white pr-9 dark:border-white/[0.08] dark:bg-white/[0.04]"
          />
        </div>
      </div>

      {/* القائمة */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-red-200 dark:border-red-500/30">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="font-semibold text-red-600 dark:text-red-300">تعذر تحميل الرسائل</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-white/10">
          <CardContent className="flex flex-col items-center gap-3 p-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.05]">
              <Inbox className="h-8 w-8 text-slate-400" />
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">لا توجد رسائل هنا</p>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {search || filter !== "all"
                ? "جرّب تغيير الفلتر أو كلمة البحث."
                : "عندما يراسلك أحد زوار الموقع ستظهر رسالته هنا فوراً."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => openMessage(m)}
              className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0068E2]/10 ${
                m.status === "new"
                  ? "border-blue-200 bg-blue-50/40 dark:border-blue-400/20 dark:bg-blue-400/[0.04]"
                  : "border-slate-200/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]"
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0068E2] to-[#02D9D9] text-base font-bold text-white shadow-md shadow-[#0068E2]/20">
                {m.name.trim().charAt(0)}
              </span>

              <span className="min-w-0 flex-1 space-y-1.5">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className={`font-bold ${m.status === "new" ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>
                    {m.name}
                  </span>
                  <Badge variant="outline" className={`${STATUS_META[m.status].badge} gap-1.5 rounded-full px-2 py-0 text-[11px] font-semibold`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[m.status].dot}`} />
                    {STATUS_META[m.status].label}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px] font-medium">
                    {m.subject}
                  </Badge>
                </span>
                <span className="block truncate text-sm text-slate-500 dark:text-slate-400">{m.message}</span>
                <span className="block text-xs text-slate-400 dark:text-slate-500">
                  {timeAgo(m.created_at)} · <span dir="ltr">{m.phone}</span>{m.email ? ` · ${m.email}` : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* نافذة التفاصيل */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl p-0" dir="rtl">
          {selected && (
            <>
              <DialogHeader className="space-y-0 border-b border-slate-100 bg-gradient-to-l from-[#0068E2]/[0.06] to-[#02D9D9]/[0.08] p-5 dark:border-white/[0.06] dark:from-[#0068E2]/10 dark:to-cyan-400/10">
                <DialogTitle className="flex items-center gap-3 font-display">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0068E2] to-[#02D9D9] text-white shadow-md">
                    {selected.name.trim().charAt(0)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-slate-900 dark:text-white">{selected.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" /> {timeAgo(selected.created_at)}
                      <Badge variant="outline" className={`${STATUS_META[selected.status].badge} ms-1 rounded-full px-2 py-0 text-[10px] font-semibold`}>
                        {STATUS_META[selected.status].label}
                      </Badge>
                    </span>
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="max-h-[55vh] space-y-4 overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {[
                    { Icon: Phone, label: "الجوال", value: selected.phone, ltr: true, href: `tel:${selected.phone}` },
                    ...(selected.email ? [{ Icon: AtSign, label: "البريد", value: selected.email, ltr: true, href: `mailto:${selected.email}` }] : []),
                    { Icon: FileText, label: "الموضوع", value: selected.subject, ltr: false, href: undefined },
                  ].map(({ Icon, label, value, ltr, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition-colors hover:border-[#0068E2]/40 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-cyan-400/30"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#0068E2] dark:text-cyan-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500">{label}</span>
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-200" dir={ltr ? "ltr" : undefined}>
                          {value}
                        </span>
                      </span>
                      <Copy className="h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
                    </a>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <MessageSquare className="h-3 w-3" /> نص الرسالة
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selected.message}
                  </p>
                </div>

                {selected.reply_note && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
                    <p className="mb-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">ملاحظة الرد</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                      {selected.reply_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                {selected.status === "new" || selected.status === "read" ? (
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: selected.id, status: "replied" })}
                    disabled={updateMutation.isPending}
                    className="gap-1.5 bg-gradient-to-r from-[#0068E2] to-[#02D9D9] text-white hover:opacity-90"
                  >
                    <CheckCheck className="h-4 w-4" /> تم الرد
                  </Button>
                ) : selected.status === "replied" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: selected.id, status: "read" })}
                    disabled={updateMutation.isPending}
                    className="gap-1.5"
                  >
                    <MailOpen className="h-4 w-4" /> إرجاع كمقروءة
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: selected.id, status: "new" })}
                    disabled={updateMutation.isPending}
                    className="gap-1.5"
                  >
                    <ArchiveRestore className="h-4 w-4" /> استعادة من الأرشيف
                  </Button>
                )}

                {selected.status !== "archived" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: selected.id, status: "archived" })}
                    disabled={updateMutation.isPending}
                    className="gap-1.5"
                  >
                    <Archive className="h-4 w-4" /> أرشفة
                  </Button>
                ) : null}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                  className="mr-auto gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" /> حذف
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
