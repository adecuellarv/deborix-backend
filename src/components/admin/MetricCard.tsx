type MetricCardProps = {
  label: string;
  value: number;
  description: string;
};

export const MetricCard = ({ label, value, description }: MetricCardProps) => (
  <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-zinc-600">{label}</p>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
      {value.toLocaleString("es-MX")}
    </p>
    <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
  </article>
);
