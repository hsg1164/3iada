import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[10px] px-3 py-2"
      style={{
        background: "rgba(6,19,41,0.96)",
        border: "1px solid rgba(0,216,216,0.25)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="text-[10px] font-bold" style={{ color: "#8EA2BD" }}>
        {label}
      </span>
      <span className="text-sm font-extrabold" style={{ color: "#00D8D8" }}>
        {payload[0].value.toLocaleString("ar-SA")} ر.س
      </span>
    </div>
  );
};

export function RevenueChart({ data }: { data: { day: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const withData = data.filter((d) => d.value > 0);
  const avg = withData.length > 0 ? Math.round(total / withData.length) : 0;
  const nonzero = data.filter((d) => d.value > 0);
  const growth =
    nonzero.length >= 2
      ? Math.round(((nonzero[nonzero.length - 1].value - nonzero[0].value) / Math.max(nonzero[0].value, 1)) * 100)
      : 0;

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: 290 }} dir="rtl">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(0,216,216,0.08)" }}>
          <DollarSign className="w-6 h-6" style={{ color: "#8EA2BD" }} />
        </div>
        <p className="text-[13px] font-bold text-white">لا توجد إيرادات هذا الأسبوع</p>
        <p className="text-[11px] mt-1" style={{ color: "#8EA2BD" }}>لم يتم تسجيل أي مدفوعات خلال آخر 7 أيام</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D8D8" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#0A6CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#0A6CFF" />
                <stop offset="100%" stopColor="#00D8D8" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#8EA2BD", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              reversed
            />
            <YAxis
              tick={{ fill: "#8EA2BD", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#revGradient)"
              dot={{ r: 0, fill: "#00D8D8", stroke: "#061329", strokeWidth: 2 }}
              activeDot={{
                r: 5,
                fill: "#00D8D8",
                stroke: "#061329",
                strokeWidth: 2,
                style: { filter: "drop-shadow(0 0 6px rgba(0,217,208,0.4))" },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div
        className="grid grid-cols-3 gap-4 pt-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-center">
          <p className="text-[10px] mb-1" style={{ color: "#8EA2BD" }}>
            إجمالي هذا الأسبوع
          </p>
          <p className="text-sm font-bold text-white">
            {total.toLocaleString("ar-SA")} ر.س
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] mb-1" style={{ color: "#8EA2BD" }}>
            متوسط يومي
          </p>
          <p className="text-sm font-bold text-white">
            {avg.toLocaleString("ar-SA")} ر.س
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] mb-1" style={{ color: "#8EA2BD" }}>
            نمو هذا الأسبوع
          </p>
          {growth > 0 ? (
            <p className="text-sm font-bold inline-flex items-center gap-1" style={{ color: "#00D8D8" }}>
              <TrendingUp className="w-3.5 h-3.5" />+{growth}%
            </p>
          ) : (
            <p className="text-sm font-medium" style={{ color: "#8EA2BD" }}>
              {growth === 0 ? "—" : `${growth}%`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}