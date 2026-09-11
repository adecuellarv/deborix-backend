import { NextResponse } from "next/server";
import { z } from "zod";
import { validateAdminCredentials } from "@/lib/auth/admin-credentials";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/auth/admin-session";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const POST = async (request: Request) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Solicitud no válida" },
      { status: 400 },
    );
  }

  const parsedCredentials = credentialsSchema.safeParse(body);

  if (!parsedCredentials.success) {
    return NextResponse.json(
      { success: false, message: "Ingresa usuario y contraseña" },
      { status: 400 },
    );
  }

  try {
    const credentialsAreValid = await validateAdminCredentials(
      parsedCredentials.data.username,
      parsedCredentials.data.password,
    );

    if (!credentialsAreValid) {
      return NextResponse.json(
        { success: false, message: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: await createAdminSessionToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      expires: new Date(Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000),
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "No pudimos iniciar sesión. Intenta nuevamente." },
      { status: 500 },
    );
  }
};
