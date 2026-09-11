"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LeadDashboardStats, NotificationStatus } from "@/lib/admin/types";

type LeadChartsProps = {
  stats: LeadDashboardStats | null;
  isLoading: boolean;
  errorMessage: string;
};

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const formatUtcDate = (date: string, formatter: Intl.DateTimeFormat) =>
  formatter.format(new Date(`${date}T00:00:00Z`));

const notificationLabels: Record<NotificationStatus, string> = {
  sent: "Enviados",
  pending: "Pendientes",
  failed: "Fallidos",
};

const notificationColors: Record<NotificationStatus, string> = {
  sent: "#15803d",
  pending: "#a16207",
  failed: "#b91c1c",
};

const ChartCard = ({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`min-w-0 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>
    <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
    <p className="mt-1 text-sm text-zinc-500">{description}</p>
    <div className="mt-6">{children}</div>
  </section>
);

export const LeadCharts = ({ stats, isLoading, errorMessage }: LeadChartsProps) => {
  if (isLoading) {
    return (
      <div aria-live="polite" className="grid gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-zinc-200 motion-safe:animate-pulse lg:col-span-2" />
        <div className="h-80 rounded-xl bg-zinc-200 motion-safe:animate-pulse" />
        <div className="h-80 rounded-xl bg-zinc-200 motion-safe:animate-pulse" />
        <span className="sr-only">Cargando gráficas</span>
      </div>
    );
  }

  if (errorMessage || !stats) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert">
        {errorMessage || "No pudimos cargar las gráficas."}
      </div>
    );
  }

  const notificationTotal = stats.leadsByNotificationStatus.reduce(
    (total, item) => total + item.count,
    0,
  );
  const dailyLeadTotal = stats.dailyLeads.reduce((total, item) => total + item.count, 0);
  const notificationData = stats.leadsByNotificationStatus.map((item) => ({
    ...item,
    label: notificationLabels[item.status],
  }));
  const projectChartHeight = Math.max(300, stats.leadsByProjectType.length * 48);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCard
        className="lg:col-span-2"
        description="Cantidad diaria con límites de fecha UTC e inclusión de días sin registros."
        title="Leads recibidos por día"
      >
        {dailyLeadTotal === 0 ? (
          <p className="py-24 text-center text-sm text-zinc-500">No hay leads en este periodo.</p>
        ) : (
          <div aria-label="Gráfica de leads recibidos durante los últimos 30 días" className="h-80 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart accessibilityLayer data={stats.dailyLeads} margin={{ left: -15, right: 12 }}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  minTickGap={28}
                  tickFormatter={(date: string) => formatUtcDate(date, shortDateFormatter)}
                />
                <YAxis allowDecimals={false} width={38} />
                <Tooltip
                  labelFormatter={(date) => formatUtcDate(String(date), longDateFormatter)}
                  formatter={(value) => [Number(value).toLocaleString("es-MX"), "Leads"]}
                />
                <Line
                  dataKey="count"
                  dot={false}
                  isAnimationActive={false}
                  name="Leads"
                  stroke="#18181b"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        description="Distribución por categoría durante los últimos 30 días."
        title="Leads por tipo de proyecto"
      >
        {stats.leadsByProjectType.length === 0 ? (
          <p className="py-24 text-center text-sm text-zinc-500">No hay datos en este periodo.</p>
        ) : (
          <div
            aria-label="Gráfica de leads agrupados por tipo de proyecto"
            className="w-full"
            style={{ height: projectChartHeight }}
          >
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                accessibilityLayer
                data={stats.leadsByProjectType}
                layout="vertical"
                margin={{ left: 12, right: 16 }}
              >
                <CartesianGrid horizontal={false} stroke="#e4e4e7" strokeDasharray="3 3" />
                <XAxis allowDecimals={false} type="number" />
                <YAxis dataKey="projectType" interval={0} type="category" width={145} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString("es-MX"), "Leads"]} />
                <Bar dataKey="count" fill="#3f3f46" isAnimationActive={false} name="Leads" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        description="Resultado de las notificaciones de los últimos 30 días."
        title="Estado de notificaciones"
      >
        {notificationTotal === 0 ? (
          <p className="py-24 text-center text-sm text-zinc-500">No hay notificaciones en este periodo.</p>
        ) : (
          <div aria-label="Gráfica del estado de las notificaciones" className="h-80 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={notificationData}
                  dataKey="count"
                  innerRadius="52%"
                  isAnimationActive={false}
                  nameKey="label"
                  outerRadius="78%"
                >
                  {notificationData.map((item) => (
                    <Cell fill={notificationColors[item.status]} key={item.status} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => Number(value).toLocaleString("es-MX")} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
};
