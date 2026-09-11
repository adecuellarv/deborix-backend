"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

export type LeadFormData = {
  projectType: string;
  estimatedBudget: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Temporal: el envío al endpoint se incorporará en el siguiente paso.
    console.log("Proyecto enviado:", formData);
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
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="estimatedBudget">
            Presupuesto aproximado <span aria-hidden="true">*</span>
          </label>
          <select
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
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="contactName">
            Nombre de contacto <span aria-hidden="true">*</span>
          </label>
          <input
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
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="email">
            Correo electrónico <span aria-hidden="true">*</span>
          </label>
          <input
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
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="phone">
            Teléfono <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
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
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="message">
            Mensaje o descripción del proyecto{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            className={`${fieldClasses} min-h-32 resize-y`}
            id="message"
            maxLength={2000}
            name="message"
            placeholder="Cuéntanos brevemente qué necesitas"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-500">Los campos marcados con * son obligatorios.</p>

      <button
        className="mt-6 w-full rounded-lg bg-zinc-950 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:bg-black"
        type="submit"
      >
        Enviar proyecto
      </button>
    </form>
  );
};
