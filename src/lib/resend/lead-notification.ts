import "server-only";

import { Resend } from "resend";
import type { LeadInput } from "@/lib/validations/lead";

type ResendEnvironmentVariable =
  | "RESEND_API_KEY"
  | "LEAD_NOTIFICATION_EMAIL"
  | "RESEND_FROM_EMAIL";

type LeadNotificationData = LeadInput & {
  id: string;
};

export type LeadNotificationResult =
  | { success: true }
  | {
      success: false;
      code: "CONFIGURATION_ERROR" | "PROVIDER_ERROR" | "REQUEST_FAILED" | "TIMEOUT";
    };

const NOTIFICATION_TIMEOUT_MS = 8_000;

const getRequiredEnvironmentVariable = (name: ResendEnvironmentVariable) => {
  const value = process.env[name];

  if (!value) {
    throw new Error("Missing Resend server configuration");
  }

  return value;
};

const withTimeout = async <Result>(operation: Promise<Result>) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("RESEND_TIMEOUT")), NOTIFICATION_TIMEOUT_MS);
    timeoutId.unref?.();
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const sendLeadNotification = async (
  lead: LeadNotificationData,
): Promise<LeadNotificationResult> => {
  let resend: Resend;
  let recipient: string;
  let sender: string;

  try {
    resend = new Resend(getRequiredEnvironmentVariable("RESEND_API_KEY"));
    recipient = getRequiredEnvironmentVariable("LEAD_NOTIFICATION_EMAIL");
    sender = getRequiredEnvironmentVariable("RESEND_FROM_EMAIL");
  } catch {
    return { success: false, code: "CONFIGURATION_ERROR" };
  }

  try {
    const { error } = await withTimeout(
      resend.emails.send(
        {
          from: sender,
          to: recipient,
          replyTo: lead.email,
          subject: "Nuevo lead recibido",
          text: [
            "Se recibió un nuevo proyecto desde el formulario web.",
            "",
            `Tipo de proyecto: ${lead.projectType}`,
            `Presupuesto aproximado: ${lead.estimatedBudget}`,
            `Nombre de contacto: ${lead.contactName}`,
            `Correo electrónico: ${lead.email}`,
            `Teléfono: ${lead.phone ?? "No proporcionado"}`,
            `Mensaje: ${lead.message ?? "No proporcionado"}`,
          ].join("\n"),
        },
        { idempotencyKey: `lead-notification/${lead.id}` },
      ),
    );

    if (error) {
      return { success: false, code: "PROVIDER_ERROR" };
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "RESEND_TIMEOUT") {
      return { success: false, code: "TIMEOUT" };
    }

    return { success: false, code: "REQUEST_FAILED" };
  }
};
