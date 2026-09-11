"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLeadListResponse, LeadDashboardStats } from "@/lib/admin/types";
import { LeadCharts } from "@/components/admin/LeadCharts";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { MetricCard } from "@/components/admin/MetricCard";

const PAGE_SIZE = 10;

const emptyLeadResponse: AdminLeadListResponse = {
  leads: [],
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

export const LeadDashboard = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [leadResponse, setLeadResponse] = useState<AdminLeadListResponse>(emptyLeadResponse);
  const [stats, setStats] = useState<LeadDashboardStats | null>(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    const loadStats = async () => {
      try {
        const response = await fetch("/api/admin/leads/stats", {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          setStatsError("No pudimos cargar las métricas y gráficas.");
          return;
        }

        setStats((await response.json()) as LeadDashboardStats);
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setStatsError("No pudimos cargar las métricas y gráficas.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingStats(false);
        }
      }
    };

    void loadStats();

    return () => abortController.abort();
  }, [router]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadLeads = async () => {
      setIsLoadingLeads(true);
      setLeadError("");

      try {
        const response = await fetch(`/api/admin/leads?page=${page}&pageSize=${PAGE_SIZE}`, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          setLeadError("No pudimos cargar los leads.");
          return;
        }

        setLeadResponse((await response.json()) as AdminLeadListResponse);
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLeadError("No pudimos cargar los leads.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingLeads(false);
        }
      }
    };

    void loadLeads();

    return () => abortController.abort();
  }, [page, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  const metrics = stats
    ? [
        { label: "Total de leads", value: stats.totalLeads, description: "Todos los registros recibidos." },
        { label: "Recibidos hoy", value: stats.leadsToday, description: "Desde las 00:00 UTC de hoy." },
        { label: "Últimos 7 días", value: stats.leadsLastSevenDays, description: "Incluye hoy y los seis días anteriores." },
        { label: "Notificaciones enviadas", value: stats.notificationsSent, description: "Correos procesados correctamente." },
        { label: "Notificaciones fallidas", value: stats.notificationsFailed, description: "Envíos que requieren revisión." },
      ]
    : [];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Image alt="DEBORIX" className="h-auto w-36" height={122} src="/logo.png" width={358} />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950">Leads recibidos</h1>
            <p className="mt-2 text-sm text-zinc-600">
              {stats ? `${stats.totalLeads.toLocaleString("es-MX")} registros en total` : "Panel administrativo"}
            </p>
          </div>
          <button
            className="self-start rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:opacity-60"
            disabled={isLoggingOut}
            type="button"
            onClick={handleLogout}
          >
            {isLoggingOut ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </header>

        <section aria-label="Métricas de leads" className="mt-7">
          {isLoadingStats ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="h-36 rounded-xl bg-zinc-200 motion-safe:animate-pulse" key={index} />
              ))}
            </div>
          ) : statsError || !stats ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
              {statsError || "No pudimos cargar las métricas."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>
          )}
        </section>

        <section aria-label="Gráficas de leads" className="mt-7">
          <LeadCharts errorMessage={statsError} isLoading={isLoadingStats} stats={stats} />
        </section>

        <div className="mt-7">
          <LeadsTable
            errorMessage={leadError}
            isLoading={isLoadingLeads}
            leads={leadResponse.leads}
            page={page}
            totalPages={leadResponse.totalPages}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onPreviousPage={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          />
        </div>
      </div>
    </main>
  );
};
