import { z } from "zod";

const optionalText = (maximumLength: number) =>
  z
    .preprocess(
      (value) => (value === null || (typeof value === "string" && value.trim() === "") ? undefined : value),
      z.string().trim().max(maximumLength).optional(),
    )
    .transform((value) => value ?? null);

export const leadSchema = z
  .object({
    projectType: z
      .string({ error: "Selecciona un tipo de proyecto" })
      .trim()
      .min(1, "Selecciona un tipo de proyecto")
      .max(100, "El tipo de proyecto no puede exceder 100 caracteres"),
    estimatedBudget: z
      .string({ error: "Selecciona un presupuesto aproximado" })
      .trim()
      .min(1, "Selecciona un presupuesto aproximado")
      .max(100, "El presupuesto no puede exceder 100 caracteres"),
    contactName: z
      .string({ error: "Ingresa un nombre de contacto" })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "El nombre no puede exceder 120 caracteres"),
    email: z
      .string({ error: "Ingresa un correo electrónico válido" })
      .trim()
      .toLowerCase()
      .email("Ingresa un correo electrónico válido")
      .max(254, "El correo no puede exceder 254 caracteres"),
    phone: optionalText(30),
    message: optionalText(2000),
    idempotencyKey: z
      .string({ error: "La clave de idempotencia es obligatoria" })
      .uuid("La clave de idempotencia debe ser un UUID válido"),
  })
  .strict();

export type LeadInput = z.infer<typeof leadSchema>;
