"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type LoginErrorResponse = {
  success: false;
  message: string;
};

export const AdminLoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const result = (await response.json()) as LoginErrorResponse;
        setErrorMessage(result.message || "No pudimos iniciar sesión.");
        return;
      }

      router.replace("/admin/leads");
      router.refresh();
    } catch {
      setErrorMessage("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClasses =
    "mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-zinc-950 shadow-sm transition placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950";

  return (
    <form
      className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="text-sm font-medium text-zinc-900" htmlFor="username">
          Usuario
        </label>
        <input
          autoComplete="username"
          className={fieldClasses}
          disabled={isSubmitting}
          id="username"
          maxLength={100}
          name="username"
          required
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-zinc-900" htmlFor="password">
          Contraseña
        </label>
        <input
          autoComplete="current-password"
          className={fieldClasses}
          disabled={isSubmitting}
          id="password"
          maxLength={200}
          name="password"
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-red-700">
        {errorMessage}
      </p>

      <button
        className="mt-5 w-full rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Iniciando…" : "Iniciar sesión"}
      </button>
    </form>
  );
};
