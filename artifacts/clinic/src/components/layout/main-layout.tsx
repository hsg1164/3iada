import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  DollarSign,
  Stethoscope,
  Package,
  FileText,
  Shield,
  Settings,
  Menu,
  Bell,
  ChevronDown,
  ChevronLeft,
  UserCog,
  ClipboardList,
  MessageSquare,
  RefreshCw,
  Clock,
  UserRound,
  UsersRound,
  History,
  BarChart3,
  Search,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ━━━━━━━━━━━━━━━━━━━ NAV DATA ━━━━━━━━━━━━━━━━━━━ */

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  subItems?: { title: string; href: string; permission?: string }[];
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { title: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "المرضى",
    href: "/patients",
    icon: Users,
    permission: "patients.view",
    subItems: [
      { title: "قائمة المرضى", href: "/patients", permission: "patients.view" },
      { title: "مريض جديد", href: "/patients/new", permission: "patients.edit" },
      { title: "الأرشيف", href: "/patients/archived", permission: "patients.view" },
    ],
  },
  { title: "المواعيد", href: "/appointments", icon: CalendarDays, permission: "appointments.view" },
  {
    title: "المالية",
    href: "/financial",
    icon: DollarSign,
    permission: "financial.view",
    subItems: [
      { title: "الملخص", href: "/financial", permission: "financial.view" },
      { title: "الخزن", href: "/financial/vaults", permission: "financial.view" },
      { title: "المصروفات", href: "/financial/expenses", permission: "financial.view" },
      { title: "المستحقات", href: "/financial/receivables", permission: "financial.view" },
    ],
  },
  { title: "الخدمات", href: "/services", icon: Stethoscope, permission: "services.view" },
  { title: "المخزون", href: "/inventory", icon: Package, permission: "inventory.view" },
  { title: "التحليلات", href: "/analytics", icon: BarChart3, permission: "dashboard.view" },
  { title: "القوالب الطبية", href: "/templates", icon: FileText, permission: "settings.view" },
  { title: "الصلاحيات", href: "/roles", icon: Shield, permission: "roles.manage" },
  { title: "الأطباء", href: "/staff", icon: UserRound, permission: "staff.manage" },
  { title: "شؤون الموظفين", href: "/staff", icon: UsersRound, permission: "staff.manage" },
  { title: "الحضور والانصراف", href: "/attendance", icon: Clock, permission: "staff.manage" },
  { title: "سجل الأنشطة", href: "/activity-log", icon: History, permission: "dashboard.view" },
  { title: "التواصل والتسويق", href: "/communication", icon: MessageSquare, permission: "dashboard.view" },
  { title: "الملاحظات والمهام", href: "/tasks", icon: ClipboardList, permission: "dashboard.view" },
  { title: "المزامنة والنسخ", href: "/backup", icon: RefreshCw, permission: "settings.view" },
  { title: "الإعدادات", href: "/settings", icon: Settings, permission: "settings.view" },
];

/* ━━━━━━━━━━━━━━━━━━━ SIDEBAR ━━━━━━━━━━━━━━━━━━━ */

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [location] = useLocation();
  const { user } = useAuth();

  const checkPermission = useCallback(
    (perm?: string) => {
      if (!perm) return true;
      const perms = (user?.permissions as Record<string, boolean>) || {};
      if (perms["all"]) return true;
      if (perms[perm]) return true;
      if (perms[perm.split(".")[0]]) return true;
      return false;
    },
    [user]
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen z-40 transition-all duration-300",
        collapsed ? "w-[78px]" : "w-[250px]"
      )}
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        background: "#061329",
        borderLeft: "1px solid rgba(40,130,220,0.16)",
      }}
      dir="rtl"
    >
      {/* ─── Logo ─── */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b",
          collapsed ? "justify-center px-2" : "px-5"
        )}
        style={{ borderColor: "rgba(40,130,220,0.16)" }}
      >
        <div className="relative shrink-0">
          <img
            src="/assets/logo.png"
            alt="العيادة"
            className="relative h-[38px] w-[38px] object-contain"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,216,216,0.18))" }}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-white leading-tight truncate">
              العيادة
            </p>
            <p className="text-[10px] font-medium" style={{ color: "#8EA2BD" }}>
              نظام إدارة العيادات
            </p>
          </div>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          if (!checkPermission(item.permission)) return null;

          const isActive =
            location === item.href ||
            (item.href !== "/dashboard" && location.startsWith(item.href));

          if (item.subItems && !collapsed) {
            const visible = item.subItems.filter((s) => checkPermission(s.permission));
            if (visible.length === 0) return null;

            return (
              <Collapsible key={item.href} defaultOpen={isActive}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-[10px] px-3 h-[42px] text-[13px] font-medium transition-all duration-200",
                      isActive ? "" : "hover:bg-[rgba(0,116,255,.06)]"
                    )}
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, rgba(10,108,255,.28), rgba(0,216,216,.10))",
                            border: "1px solid rgba(10,108,255,.22)",
                            color: "#fff",
                          }
                        : { color: "#8EA2BD" }
                    }
                  >
                    <item.icon
                      className={cn(
                        "h-[20px] w-[20px] shrink-0 transition-colors duration-200",
                        isActive ? "text-[#00D8D8]" : "group-hover:text-[#00D8D8]"
                      )}
                      strokeWidth={1.8}
                    />
                    <span className="flex-1 text-right">{item.title}</span>
                    <ChevronDown className="h-3.5 w-3.5" style={{ color: "#8EA2BD" }} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mr-4 border-r py-0.5 pr-3 space-y-0.5" style={{ borderColor: "rgba(40,130,220,0.16)" }}>
                  {visible.map((sub) => {
                    const subActive = location === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-[12px] transition-all duration-150",
                          subActive
                            ? "bg-[rgba(10,108,255,.18)] text-white font-semibold"
                            : "hover:bg-[rgba(0,116,255,.06)]"
                        )}
                        style={{ color: subActive ? "#fff" : "#8EA2BD" }}
                      >
                        {sub.title}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[10px] px-3 h-[42px] text-[13px] font-medium transition-all duration-200",
                collapsed && "justify-center",
                isActive ? "" : "hover:bg-[rgba(0,116,255,.06)] hover:text-white"
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(10,108,255,.28), rgba(0,216,216,.10))",
                      border: "1px solid rgba(10,108,255,.22)",
                      color: "#fff",
                    }
                  : { color: "#8EA2BD" }
              }
            >
              <item.icon
                className={cn(
                  "h-[20px] w-[20px] shrink-0 transition-colors duration-200",
                  isActive ? "text-[#00D8D8]" : "group-hover:text-[#00D8D8]"
                )}
                strokeWidth={1.8}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ─── Collapse toggle ─── */}
      <div className="border-t px-2 py-3" style={{ borderColor: "rgba(40,130,220,0.16)" }}>
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] h-[38px] text-[12px] transition-all duration-200 hover:bg-[rgba(0,116,255,.06)]"
          style={{ color: "#8EA2BD" }}
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", collapsed ? "rotate-90" : "-rotate-90")}
          />
          {!collapsed && <span>طي القائمة</span>}
        </button>
      </div>
    </aside>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ TOPBAR ━━━━━━━━━━━━━━━━━━━ */

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { mutateAsync: logoutAsync } = useLogout({
    mutation: {
      onSettled: () => {
        queryClient.clear();
        setLocation("/login");
      },
    },
  });

  const isDoctor = user?.roleName === "doctor";
  const isReceptionist = user?.roleName === "receptionist";
  const roleAbbr = isDoctor ? "د" : isReceptionist ? "س" : "م";
  const roleName = user?.roleName === "admin" ? "مدير العيادة" : isDoctor ? "طبيب" : isReceptionist ? "سكرتير" : user?.roleName || "مستخدم";

  const handleLogout = async () => {
    try { await logoutAsync(); } catch { /* empty */ }
    queryClient.clear();
    window.location.href = `${import.meta.env.BASE_URL}login`;
  };

  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className="h-[64px] flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: "rgba(2,8,23,.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(40,130,220,0.16)",
      }}
      dir="rtl"
    >
      {/* Right — date + mobile menu */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-[10px] hover:bg-[rgba(0,116,255,.06)] transition-colors"
          style={{ color: "#8EA2BD" }}
          onClick={onMenuToggle}
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[12px] font-medium" style={{ color: "#8EA2BD" }}>
          <CalendarDays className="h-3.5 w-3.5" style={{ color: "#00D8D8" }} />
          <span>{today}</span>
        </div>
      </div>

      {/* Left — actions + profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute right-3 h-4 w-4 text-[#8EA2BD]" />
          <input
            type="text"
            placeholder="ابحث عن قسم، مريض، أو موعد..."
            className="h-[38px] w-[260px] rounded-[10px] pr-9 pl-4 text-[12px] text-white outline-none transition-all duration-300 focus:w-[320px]"
            style={{
              background: "rgba(6,19,41,.6)",
              border: "1px solid rgba(40,130,220,0.16)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
            onFocus={(e) => {
              e.target.style.background = "rgba(0,116,255,.05)";
              e.target.style.borderColor = "#0A6CFF";
            }}
            onBlur={(e) => {
              e.target.style.background = "rgba(6,19,41,.6)";
              e.target.style.borderColor = "rgba(40,130,220,0.16)";
            }}
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] hover:bg-[rgba(0,116,255,.06)] transition-colors"
              style={{
                background: "rgba(6,19,41,.6)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
              aria-label="الإشعارات"
            >
              <Bell className="h-4 w-4" style={{ color: "#8EA2BD" }} />
              <span
                className="absolute top-[8px] left-[8px] h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: "#FF4D60", animation: "pulse-dot 2.5s ease-in-out infinite" }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[320px] p-2"
            style={{
              background: "rgba(6,19,41,.96)",
              border: "1px solid rgba(40,130,220,0.16)",
              backdropFilter: "blur(16px)",
            }}
            dir="rtl"
          >
            <DropdownMenuLabel className="text-[13px] text-white font-bold mb-1">آخر الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator style={{ borderColor: "rgba(40,130,220,0.16)" }} />
            
            {/* Notification 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[rgba(0,116,255,.06)] cursor-pointer transition-colors mt-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,217,208,0.12)] text-[#00D8D8]">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white">موعد جديد</p>
                <p className="text-[11px] text-[#8EA2BD] mt-0.5 leading-relaxed">تم حجز موعد جديد للمريضة مريم خالد (استشارة عامة)</p>
                <p className="text-[10px] text-[#8EA2BD] mt-1.5 opacity-60">قبل 10 دقائق</p>
              </div>
            </div>

            {/* Notification 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[rgba(0,116,255,.06)] cursor-pointer transition-colors mt-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(10,108,255,0.12)] text-[#0A6CFF]">
                <UserPlus className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white">مريض جديد</p>
                <p className="text-[11px] text-[#8EA2BD] mt-0.5 leading-relaxed">تم إضافة ملف جديد للمريض أحمد سعيد بنجاح</p>
                <p className="text-[10px] text-[#8EA2BD] mt-1.5 opacity-60">قبل 45 دقيقة</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 h-[38px] px-2.5 rounded-[10px] transition-all duration-200 hover:bg-[rgba(0,116,255,.06)]"
              style={{
                background: "rgba(6,19,41,.6)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
            >
              {/* Avatar on Right (first in RTL) */}
              <span
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                }}
              >
                {roleAbbr}
              </span>

              {/* Text on Left (second in RTL) */}
              <div className="hidden md:block text-right">
                <p className="text-[11px] font-bold text-[#00D8D8] leading-none mb-1">
                  {roleName}
                </p>
                <p className="text-[12px] font-semibold text-white leading-none">
                  {user?.name || "الطبيب"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" style={{ color: "#8EA2BD" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            style={{
              background: "rgba(6,19,41,.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
            }}
          >
            <DropdownMenuLabel className="text-[13px] text-white">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator style={{ borderColor: "rgba(40,130,220,0.16)" }} />
            <DropdownMenuItem className="text-[12px] text-[#8EA2BD] focus:text-white focus:bg-[rgba(0,116,255,.08)]">
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ borderColor: "rgba(40,130,220,0.16)" }} />
            <DropdownMenuItem
              className="text-[12px] text-[#FF4D60] cursor-pointer focus:text-[#FF4D60] focus:bg-[rgba(255,77,96,.08)] gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ MAIN LAYOUT ━━━━━━━━━━━━━━━━━━━ */

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // التطبيق داكن دائماً داخل لوحة التحكم — لا تترك html بلا dark
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full"
            style={{ transition: "transform 300ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div
        className="flex flex-col min-w-0 transition-all duration-300"
        style={{
          marginRight: isDesktop ? (collapsed ? 78 : 250) : 0,
        }}
      >
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main
          className="flex-1 p-5 md:p-6 lg:p-[28px] overflow-auto"
          style={{
            background: "radial-gradient(circle at 15% 15%, rgba(10,108,255,.04), transparent 30%), radial-gradient(circle at 80% 20%, rgba(0,216,216,.03), transparent 28%), #020817",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
