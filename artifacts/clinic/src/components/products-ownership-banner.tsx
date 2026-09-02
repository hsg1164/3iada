import { motion } from "framer-motion";
import { Building2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

/**
 * Elegant ownership banner for product/service/inventory pages.
 * Makes it visually clear that every clinic sees and manages ONLY
 * its own catalog, isolated from all other clinics.
 */
export function ProductsOwnershipBanner({ what = "المنتجات والخدمات" }: { what?: string }) {
  const { user } = useAuth();
  const clinicName = (user as any)?.clinicName || "عيادتك";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 via-indigo-50/60 to-white p-4 shadow-sm"
      dir="rtl"
    >
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-l from-transparent via-blue-200/30 to-transparent"
        animate={{ right: ["-33%", "133%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative flex items-center gap-3 flex-wrap">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-200">
          <Building2 className="h-5.5 w-5.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {what} خاصة بـ«{clinicName}»
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            تدير عيادتك كتالوجها الخاص بالكامل — منفصل تماماً عن باقي العيادات والشركات
          </p>
        </div>
        <div className="mr-auto flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">معزول 100%</span>
        </div>
      </div>
    </motion.div>
  );
}
