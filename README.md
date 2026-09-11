# DEBORIX Lead Management

Aplicación Next.js para recibir leads, guardarlos en Supabase, notificar al equipo mediante Resend y consultarlos desde un dashboard administrativo protegido.

## Ejecución local

Instala dependencias, configura `.env.local` a partir de `.env.example` y ejecuta:

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. El panel se encuentra en `/admin/login`.

## Base de datos

Aplica las migraciones versionadas después de enlazar el proyecto de Supabase:

```bash
supabase db push
```

La migración `20260911190000_create_lead_dashboard_stats.sql` agrega una función SQL protegida que calcula métricas y agrupaciones en PostgreSQL. Usa límites diarios UTC para que los resultados no dependan de la zona horaria del servidor y evita transferir colecciones ilimitadas de leads.

## Autenticación administrativa

La autenticación `admin` / `admin` es exclusivamente para la demostración y se configura mediante `ADMIN_USERNAME` y `ADMIN_PASSWORD`; esas credenciales no están escritas en el código ni se almacenan en Supabase. En producción debe reemplazarse por un proveedor de identidad, usuarios con contraseñas hash y controles adicionales.

La sesión dura ocho horas y se firma con HMAC-SHA-256 usando `ADMIN_SESSION_SECRET`. Se almacena en una cookie `httpOnly`, `sameSite=lax` y `secure` en producción. Genera un secreto con:

```bash
openssl rand -base64 48
```

Nunca publiques `.env.local`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD` ni `ADMIN_SESSION_SECRET`.

## Verificación

```bash
npm run lint
npx tsc --noEmit
npm run build
```
