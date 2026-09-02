import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ServicesSection } from "@/components/landing/services-section";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { SecuritySection } from "@/components/landing/security-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ContactSection } from "@/components/landing/contact-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  LandingThemeProvider,
  useLandingTheme,
} from "@/components/landing/landing-theme";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { useEffect } from "react";

function LandingShell() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { theme } = useLandingTheme();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#02D9D9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`${
        theme === "dark" ? "dark" : ""
      } min-h-screen bg-[#f7fafc] dark:bg-[#020817] text-slate-800 dark:text-slate-100 font-sans-thmanyah antialiased selection:bg-[#0068E2]/25 selection:text-slate-900 dark:selection:text-white transition-colors duration-500`}
    >
      <LandingNavbar />

      <main>
        <HeroSection />
        <TrustMarquee />
        <StatsSection />
        <FeaturesSection />
        <ServicesSection />
        <HowItWorksSection />
        <SecuritySection />
        <PricingSection />
        <ContactSection />
      </main>

      <LandingFooter />
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingShell />
    </LandingThemeProvider>
  );
}
