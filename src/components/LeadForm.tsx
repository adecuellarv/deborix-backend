"use client";

import axios from "axios";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

export type LeadFormData = {
  projectType: string;
  estimatedBudget: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

type LeadSuccessResponse = {
  success: true;
  message: string;
  leadId: string;
  duplicate: boolean;
};

type LeadErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

type FieldErrors = Partial<Record<keyof LeadFormData, string[]>>;

const initialFormData: LeadFormData = {
  projectType: "",
  estimatedBudget: "",
  contactName: "",
  email: "",
  phone: "",
  message: "",
};

export const LeadForm = () => {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const idempotencyKeyRef = useRef<string | null>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof LeadFormData;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    const payload = {
      ...formData,
      idempotencyKey: idempotencyKeyRef.current,
    };

    try {
      const response = await axios.post<LeadSuccessResponse>("/api/leads", payload);

      if (![200, 201].includes(response.status) || !response.data.success) {
        setErrorMessage("No pudimos enviar la información. Intenta nuevamente.");
        return;
      }

      setSuccessMessage(response.data.message);
      setFormData(initialFormData);
      setFieldErrors({});
      idempotencyKeyRef.current = null;
    } catch (error: unknown) {
      if (axios.isAxiosError<LeadErrorResponse>(error)) {
        if (!error.response) {
          setErrorMessage("No pudimos conectar con el servidor. Intenta nuevamente.");
          return;
        }

        if (error.response.status === 400) {
          const responseErrors = error.response.data?.errors;

          if (responseErrors) {
            setFieldErrors({
              projectType: responseErrors.projectType,
              estimatedBudget: responseErrors.estimatedBudget,
              contactName: responseErrors.contactName,
              email: responseErrors.email,
              phone: responseErrors.phone,
              message: responseErrors.message,
            });
          }

          setErrorMessage(
            error.response.data?.message ?? "Los datos enviados no son válidos",
          );
          return;
        }
      }

      setErrorMessage("No pudimos enviar la información. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClasses =
    "mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-base text-zinc-950 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-400 focus-visible:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950";

  return (
    <form
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="projectType">
            Tipo de proyecto <span aria-hidden="true">*</span>
          </label>
          <select
            aria-describedby={fieldErrors.projectType ? "projectType-error" : undefined}
            aria-invalid={Boolean(fieldErrors.projectType)}
            className={fieldClasses}
            id="projectType"
            name="projectType"
            required
            value={formData.projectType}
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="Sitio web">Sitio web</option>
            <option value="Aplicación web">Aplicación web</option>
            <option value="Aplicación móvil">Aplicación móvil</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Automatización">Automatización</option>
            <option value="Otro">Otro</option>
          </select>
          {fieldErrors.projectType?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="projectType-error">
              {fieldErrors.projectType[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="estimatedBudget">
            Presupuesto aproximado <span aria-hidden="true">*</span>
          </label>
          <select
            aria-describedby={fieldErrors.estimatedBudget ? "estimatedBudget-error" : undefined}
            aria-invalid={Boolean(fieldErrors.estimatedBudget)}
            className={fieldClasses}
            id="estimatedBudget"
            name="estimatedBudget"
            required
            value={formData.estimatedBudget}
            onChange={handleChange}
          >
            <option value="">Selecciona un rango</option>
            <option value="Menos de $20,000 MXN">Menos de $20,000 MXN</option>
            <option value="$20,000–$50,000 MXN">$20,000–$50,000 MXN</option>
            <option value="$50,000–$100,000 MXN">$50,000–$100,000 MXN</option>
            <option value="Más de $100,000 MXN">Más de $100,000 MXN</option>
            <option value="Por definir">Por definir</option>
          </select>
          {fieldErrors.estimatedBudget?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="estimatedBudget-error">
              {fieldErrors.estimatedBudget[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="contactName">
            Nombre de contacto <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby={fieldErrors.contactName ? "contactName-error" : undefined}
            aria-invalid={Boolean(fieldErrors.contactName)}
            autoComplete="name"
            className={fieldClasses}
            id="contactName"
            maxLength={120}
            name="contactName"
            placeholder="Tu nombre"
            required
            type="text"
            value={formData.contactName}
            onChange={handleChange}
          />
          {fieldErrors.contactName?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="contactName-error">
              {fieldErrors.contactName[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="email">
            Correo electrónico <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            className={fieldClasses}
            id="email"
            maxLength={254}
            name="email"
            placeholder="nombre@empresa.com"
            required
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {fieldErrors.email?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="email-error">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="phone">
            Teléfono <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            aria-invalid={Boolean(fieldErrors.phone)}
            autoComplete="tel"
            className={fieldClasses}
            id="phone"
            maxLength={30}
            name="phone"
            placeholder="+52 55 0000 0000"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          {fieldErrors.phone?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="phone-error">
              {fieldErrors.phone[0]}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="message">
            Mensaje o descripción del proyecto{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
            aria-invalid={Boolean(fieldErrors.message)}
            className={`${fieldClasses} min-h-32 resize-y`}
            id="message"
            maxLength={2000}
            name="message"
            placeholder="Cuéntanos brevemente qué necesitas"
            value={formData.message}
            onChange={handleChange}
          />
          {fieldErrors.message?.[0] && (
            <p className="mt-2 text-sm text-red-700" id="message-error">
              {fieldErrors.message[0]}
            </p>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-500">Los campos marcados con * son obligatorios.</p>

      <div aria-live="polite" className="mt-4 min-h-6 text-sm">
        {successMessage && <p className="text-green-700">{successMessage}</p>}
        {errorMessage && <p className="text-red-700">{errorMessage}</p>}
      </div>

      <button
        className="mt-6 w-full rounded-lg bg-zinc-950 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Enviando…" : "Enviar proyecto"}
      </button>
    </form>
  );
};
