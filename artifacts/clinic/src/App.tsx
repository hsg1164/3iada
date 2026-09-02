import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SuspensionProvider } from "@/components/auth/suspension-provider";

// ===== تحميل كسول: كل صفحة تُجلب فقط عند الحاجة =====
const MainLayout = lazy(() =>
  import("@/components/layout/main-layout").then((m) => ({ default: m.MainLayout }))
);
const SuperAdminLayout = lazy(() =>
  import("@/components/layout/superadmin-layout").then((m) => ({ default: m.SuperAdminLayout }))
);

const Login = lazy(() => import("@/pages/login"));
const LandingPage = lazy(() => import("@/pages/landing"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/privacy"));
const TermsOfService = lazy(() => import("@/pages/legal/terms"));
const SecurityPage = lazy(() => import("@/pages/legal/security"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/index"));
const ClinicsManagement = lazy(() => import("@/pages/superadmin/clinics"));
const UsersManagement = lazy(() => import("@/pages/superadmin/users"));
const SubscriptionsManagement = lazy(() => import("@/pages/superadmin/subscriptions"));
const PlatformSettings = lazy(() => import("@/pages/superadmin/settings"));
const SecurityLogs = lazy(() => import("@/pages/superadmin/logs"));

// Clinic pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Patients = lazy(() => import("@/pages/patients/index"));
const NewPatient = lazy(() => import("@/pages/patients/new"));
const ArchivedPatients = lazy(() => import("@/pages/patients/archived"));
const PatientDetail = lazy(() => import("@/pages/patients/detail"));
const Appointments = lazy(() => import("@/pages/appointments"));
const FinancialSummary = lazy(() => import("@/pages/financial/index"));
const Vaults = lazy(() => import("@/pages/financial/vaults"));
const Expenses = lazy(() => import("@/pages/financial/expenses"));
const Receivables = lazy(() => import("@/pages/financial/receivables"));
const Services = lazy(() => import("@/pages/services"));
const Inventory = lazy(() => import("@/pages/inventory"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Templates = lazy(() => import("@/pages/templates"));
const Roles = lazy(() => import("@/pages/roles"));
const Settings = lazy(() => import("@/pages/settings"));
const Staff = lazy(() => import("@/pages/staff"));
const Attendance = lazy(() => import("@/pages/attendance"));
const ActivityLog = lazy(() => import("@/pages/activity-log"));
const Tasks = lazy(() => import("@/pages/tasks"));
const SiteMessages = lazy(() => import("@/pages/site-messages"));
const SuperAdminSiteMessages = lazy(() => import("@/pages/site-messages"));
const Communication = lazy(() => import("@/pages/communication"));
const Backup = lazy(() => import("@/pages/backup"));
const Reception = lazy(() => import("@/pages/reception"));
const Doctor = lazy(() => import("@/pages/doctor"));
const PatientPhoto = lazy(() => import("@/pages/patient-photo"));
const SharedPhoto = lazy(() => import("@/pages/shared-photo"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-5" dir="rtl">
      <img
        src="/assets/logo.png"
        alt=""
        className="h-20 w-20 object-contain animate-pulse"
        style={{ filter: "drop-shadow(0 0 22px rgba(52,211,153,.55))" }}
      />
      <p className="text-sm font-bold text-slate-500">جاري التحميل...</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/login" component={Login} />
      <Route path="/patient-photo" component={PatientPhoto} />
      <Route path="/shared-photo" component={SharedPhoto} />

      {/* Super Admin Routes */}
      <Route path="/superadmin">
        <ProtectedRoute><SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/clinics">
        <ProtectedRoute><SuperAdminLayout><ClinicsManagement /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/users">
        <ProtectedRoute><SuperAdminLayout><UsersManagement /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/subscriptions">
        <ProtectedRoute><SuperAdminLayout><SubscriptionsManagement /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/settings">
        <ProtectedRoute><SuperAdminLayout><PlatformSettings /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/logs">
        <ProtectedRoute><SuperAdminLayout><SecurityLogs /></SuperAdminLayout></ProtectedRoute>
      </Route>
      <Route path="/superadmin/messages">
        <ProtectedRoute><SuperAdminLayout><SuperAdminSiteMessages /></SuperAdminLayout></ProtectedRoute>
      </Route>

      {/* Normal Clinic Routes */}
      <Route>
        <ProtectedRoute>
          <MainLayout>
            <Switch>
            <Route path="/dashboard" component={Dashboard} />

            <Route path="/patients" component={Patients} />
            <Route path="/patients/new" component={NewPatient} />
            <Route path="/patients/archived" component={ArchivedPatients} />
            <Route path="/patients/:id" component={PatientDetail} />

            <Route path="/appointments" component={Appointments} />

            <Route path="/financial" component={FinancialSummary} />
            <Route path="/financial/vaults" component={Vaults} />
            <Route path="/financial/expenses" component={Expenses} />
            <Route path="/financial/receivables" component={Receivables} />

            <Route path="/services" component={Services} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/templates" component={Templates} />
            <Route path="/roles">
              <ProtectedRoute requiredPermission="roles.manage">
                <Roles />
              </ProtectedRoute>
            </Route>
            <Route path="/settings" component={Settings} />
            <Route path="/staff" component={Staff} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/activity-log" component={ActivityLog} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/communication" component={Communication} />
            <Route path="/backup" component={Backup} />

            <Route path="/reception" component={Reception} />
            <Route path="/doctor" component={Doctor} />

            <Route component={NotFound} />
          </Switch>
        </MainLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <SuspensionProvider>
              <Suspense fallback={<PageLoader />}>
                <Router />
              </Suspense>
            </SuspensionProvider>
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
