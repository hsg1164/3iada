import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  ChevronDown,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@workspace/api-client-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "نظرة عامة", href: "/superadmin", icon: LayoutDashboard },
  { title: "إدارة العيادات", href: "/superadmin/clinics", icon: Building2 },
  { title: "مستخدمي المنصة", href: "/superadmin/users", icon: Users },
  { title: "الاشتراكات والفواتير", href: "/superadmin/subscriptions", icon: CreditCard },
  { title: "رسائل الموقع", href: "/superadmin/messages", icon: MessageSquare },
  { title: "إعدادات المنصة", href: "/superadmin/settings", icon: Settings },
  { title: "سجلات الأمان", href: "/superadmin/logs", icon: ShieldAlert },
];

/* ━━━━━━━━━━━━━━━━━━━ SIDEBAR ━━━━━━━━━━━━━━━━━━━ */

export function SuperAdminSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const [location] = useLocation();

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
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg font-bold text-white text-sm"
          style={{
            background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
            boxShadow: "0 0 12px rgba(10,108,255,0.3)",
          }}
        >
          ع
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-white leading-tight truncate">
              العيادة{" "}
              <span className="text-[10px] text-[#00D8D8] align-top font-medium">مدير</span>
            </p>
            <p className="text-[10px] font-medium" style={{ color: "#8EA2BD" }}>
              لوحة الإدارة العليا
            </p>
          </div>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/superadmin" && location.startsWith(item.href));

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
                      background:
                        "linear-gradient(135deg, rgba(10,108,255,.28), rgba(0,216,216,.10))",
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

      {/* ─── Warning box ─── */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(40,130,220,0.16)" }}>
        <div
          className={cn(
            "rounded-[10px] p-3 flex items-start gap-2.5",
            collapsed && "justify-center p-2"
          )}
          style={{
            background: "rgba(255,200,87,0.06)",
            border: "1px solid rgba(255,200,87,0.12)",
          }}
        >
          <ShieldAlert className="w-4 h-4 text-[#FFC857] shrink-0 mt-0.5" />
          {!collapsed && (
            <p className="text-[10px] leading-[1.5] font-medium" style={{ color: "#FFC857" }}>
              أنت في لوحة الإدارة العليا للمنصة.
              <br />
              التغييرات هنا تؤثر على كافة العيادات.
            </p>
          )}
        </div>
      </div>

      {/* ─── Collapse toggle ─── */}
      <div className="border-t px-2 py-3" style={{ borderColor: "rgba(40,130,220,0.16)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] h-[38px] text-[12px] transition-all duration-200 hover:bg-[rgba(0,116,255,.06)]"
          style={{ color: "#8EA2BD" }}
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed ? "rotate-90" : "-rotate-90"
            )}
          />
          {!collapsed && <span>طي القائمة</span>}
        </button>
      </div>
    </aside>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ HEADER ━━━━━━━━━━━━━━━━━━━ */

export function SuperAdminHeader() {
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

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {
      /* ignore */
    }
    queryClient.clear();
    window.location.href = `${import.meta.env.BASE_URL}login`;
  };

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
      {/* Right side */}
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-bold text-white">
          إدارة المنصة <span className="text-[#8EA2BD] font-normal">(Super Admin)</span>
        </h2>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* System status */}
        <div
          className="hidden md:flex items-center gap-2 h-[34px] px-3 rounded-[10px] text-[11px] font-medium"
          style={{
            background: "rgba(0,217,208,0.06)",
            border: "1px solid rgba(0,217,208,0.15)",
            color: "#00D8D8",
          }}
        >
          <span
            className="h-2 w-2 rounded-full bg-[#00D8D8]"
            style={{ animation: "pulse-dot 2.5s ease-in-out infinite" }}
          />
          الأنظمة تعمل بكفاءة
        </div>

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
              <span
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
              >
                {user?.name?.substring(0, 1) || "م"}
              </span>
              <div className="hidden md:block text-right">
                <p className="text-[11px] font-bold text-[#00D8D8] leading-none mb-0.5">
                  مدير المنصة
                </p>
                <p className="text-[12px] font-semibold text-white leading-none">
                  {user?.name || "مدير المنصة"}
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
            <DropdownMenuLabel className="text-[13px] text-white">حساب المدير</DropdownMenuLabel>
            <DropdownMenuSeparator style={{ borderColor: "rgba(40,130,220,0.16)" }} />
            <DropdownMenuItem className="text-[12px] text-[#8EA2BD] focus:text-white focus:bg-[rgba(0,116,255,.08)] gap-2">
              <Settings className="w-4 h-4" /> إعدادات الحساب
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ borderColor: "rgba(40,130,220,0.16)" }} />
            <DropdownMenuItem
              className="text-[12px] text-[#FF4D60] cursor-pointer focus:text-[#FF4D60] focus:bg-[rgba(255,77,96,.08)] gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ LAYOUT ━━━━━━━━━━━━━━━━━━━ */

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isLoading && user && !user?.isSuperadmin) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const isSuper = user?.isSuperadmin === true;

  if (isLoading || !isSuper) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-[#8EA2BD] text-sm"
        style={{ background: "#020817" }}
      >
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SuperAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main area */}
      <div
        className="flex flex-col min-w-0 transition-all duration-300"
        style={{
          marginRight: isDesktop ? (collapsed ? 78 : 250) : 0,
        }}
      >
        <SuperAdminHeader />
        <main
          className="flex-1 p-5 md:p-6 lg:p-[28px] overflow-auto"
          style={{
            background:
              "radial-gradient(circle at 15% 15%, rgba(10,108,255,.04), transparent 30%), radial-gradient(circle at 80% 20%, rgba(0,216,216,.03), transparent 28%), #020817",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
