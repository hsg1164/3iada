import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { suspensionBus } from "@/lib/suspension-bus";
import { SuspendedScreen, type SuspensionKind } from "./suspended-screen";

/**
 * Watches every API response + polls /auth/status; the moment a clinic's
 * subscription OR an individual account is reported suspended it throws the
 * animated full-screen suspension UI over the entire app and blocks all
 * interaction. If the platform re-activates while the screen is up, it resumes.
 */

const PUBLIC_PATHS = ["/", "/login", "/privacy", "/terms", "/security", "/patient-photo", "/shared-photo"];

interface SuspensionInfo {
  kind: SuspensionKind;
  clinicName?: string | null;
  accountName?: string | null;
  username?: string | null;
}

let fetchPatched = false;
function patchFetch(onSuspended: (info: SuspensionInfo) => void) {
  if (fetchPatched || typeof window === "undefined") return;
  fetchPatched = true;

  const original = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await original(...args);
    if (res.status === 423) {
      const info: SuspensionInfo = { kind: "clinic" };
      try {
        const clone = res.clone();
        const ct = clone.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const body = await clone.json();
          info.kind = body?.error === "ACCOUNT_SUSPENDED" ? "account" : "clinic";
          info.clinicName = body?.clinicName ?? null;
          info.accountName = body?.accountName ?? null;
          info.username = body?.username ?? null;
        }
      } catch { /* keep defaults */ }
      onSuspended(info);
    }
    return res;
  };
}

export function SuspensionProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [suspended, setSuspended] = useState(false);
  const [info, setInfo] = useState<SuspensionInfo>({ kind: "clinic" });
  const loggingOutRef = useRef(false);
  const suspendedRef = useRef(false);
  suspendedRef.current = suspended;

  const reportSuspended = useCallback((next: SuspensionInfo) => {
    if (loggingOutRef.current) return;
    setInfo(next);
    setSuspended(true);
  }, []);

  useEffect(() => {
    patchFetch(reportSuspended);
    return suspensionBus.subscribe(() => reportSuspended({ kind: "clinic" }));
  }, [reportSuspended]);

  // Poll status so idle users get locked out instantly too,
  // and automatically resume if the platform re-activates.
  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (loggingOutRef.current) return;
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        if (!alive) return;
        if (res.status === 423) {
          let next: SuspensionInfo = { kind: "clinic" };
          try {
            const j = await res.json();
            next = {
              kind: j?.error === "ACCOUNT_SUSPENDED" ? "account" : "clinic",
              clinicName: j?.clinicName ?? null,
              accountName: j?.accountName ?? null,
              username: j?.username ?? null,
            };
          } catch { /* ignore */ }
          reportSuspended(next);
        } else if (res.ok && !location.startsWith("/login")) {
          const j = await res.json().catch(() => null);
          if (j?.active === true && suspendedRef.current) {
            setSuspended(false);
          }
        }
      } catch { /* network hiccup – ignore */ }
    };
    const t = setInterval(check, 6000);
    check();
    return () => { alive = false; clearInterval(t); };
  }, [reportSuspended, location]);

  const isPublic = PUBLIC_PATHS.some((p) => location === p || (p !== "/" && location.startsWith(p)));

  const handleLogoutStart = () => {
    loggingOutRef.current = true;
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {suspended && !isPublic && (
          <SuspendedScreenBridge info={info} onLogoutStart={handleLogoutStart} />
        )}
      </AnimatePresence>
    </>
  );
}

function SuspendedScreenBridge({ info, onLogoutStart }: { info: SuspensionInfo; onLogoutStart: () => void }) {
  useEffect(() => {
    const handler = () => onLogoutStart();
    window.addEventListener("suspension:logout", handler);
    return () => window.removeEventListener("suspension:logout", handler);
  }, [onLogoutStart]);
  return (
    <SuspendedScreen
      kind={info.kind}
      clinicName={info.clinicName}
      accountName={info.accountName}
      username={info.username}
    />
  );
}
