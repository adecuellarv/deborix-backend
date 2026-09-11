import type { AdminLead, NotificationStatus } from "@/lib/admin/types";

type LeadsTableProps = {
  leads: AdminLead[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  errorMessage: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const statusLabels: Record<NotificationStatus, string> = {
  sent: "Enviado",
  pending: "Pendiente",
  failed: "Fallido",
};

const statusClasses: Record<NotificationStatus, string> = {
  sent: "bg-green-50 text-green-800 ring-green-600/20",
  pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  failed: "bg-red-50 text-red-800 ring-red-600/20",
};

const StatusBadge = ({ status }: { status: NotificationStatus }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses[status]}`}
  >
    {statusLabels[status]}
  </span>
);

export const LeadsTable = ({
  leads,
  page,
  totalPages,
  isLoading,
  errorMessage,
  onPreviousPage,
  onNextPage,
}: LeadsTableProps) => (
  <section className="rounded-xl border border-zinc-200 bg-white shadow-sm" aria-labelledby="lead-table-title">
    <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
      <h2 className="font-semibold text-zinc-950" id="lead-table-title">
        Registro de leads
      </h2>
      <p className="mt-1 text-sm text-zinc-500">Fechas mostradas en UTC.</p>
    </div>

    <div aria-live="polite">
      {isLoading && <p className="px-6 py-16 text-center text-sm text-zinc-500">Cargando leads…</p>}

      {!isLoading && errorMessage && (
        <p className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && leads.length === 0 && (
        <p className="px-6 py-16 text-center text-sm text-zinc-500">Todavía no hay leads registrados.</p>
      )}

      {!isLoading && !errorMessage && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium" scope="col">Fecha</th>
                <th className="px-5 py-3 font-medium" scope="col">Contacto</th>
                <th className="px-5 py-3 font-medium" scope="col">Tipo de proyecto</th>
                <th className="px-5 py-3 font-medium" scope="col">Presupuesto</th>
                <th className="px-5 py-3 font-medium" scope="col">Correo</th>
                <th className="px-5 py-3 font-medium" scope="col">Teléfono</th>
                <th className="px-5 py-3 font-medium" scope="col">Notificación</th>
                <th className="px-5 py-3 font-medium" scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map((lead) => (
                <tr className="align-top text-zinc-700" key={lead.id}>
                  <td className="whitespace-nowrap px-5 py-4">{dateFormatter.format(new Date(lead.created_at))}</td>
                  <td className="px-5 py-4 font-medium text-zinc-950">{lead.contact_name}</td>
                  <td className="px-5 py-4">{lead.project_type}</td>
                  <td className="whitespace-nowrap px-5 py-4">{lead.estimated_budget}</td>
                  <td className="px-5 py-4">
                    <a className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">{lead.phone || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={lead.notification_status} />
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    {lead.message ? (
                      <details>
                        <summary className="cursor-pointer rounded font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950">
                          Ver mensaje
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap leading-6 text-zinc-600">{lead.message}</p>
                      </details>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600">
        Página {totalPages === 0 ? 0 : page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || page <= 1}
          type="button"
          onClick={onPreviousPage}
        >
          Anterior
        </button>
        <button
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || totalPages === 0 || page >= totalPages}
          type="button"
          onClick={onNextPage}
        >
          Siguiente
        </button>
      </div>
    </div>
  </section>
);
