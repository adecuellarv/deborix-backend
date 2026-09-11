export const ADMIN_SESSION_COOKIE = "deborix_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  subject: "admin";
  expiresAt: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const encodeBase64Url = (value: Uint8Array) => {
  let binary = "";

  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
};

const decodeBase64Url = (value: string) => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(paddedBase64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const getSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  }

  return secret;
};

const importSigningKey = async () =>
  crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

const isAdminSessionPayload = (value: unknown): value is AdminSessionPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return payload.subject === "admin" && typeof payload.expiresAt === "number";
};

export const createAdminSessionToken = async () => {
  const payload: AdminSessionPayload = {
    subject: "admin",
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = encodeBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importSigningKey(),
    textEncoder.encode(encodedPayload),
  );

  return `${encodedPayload}.${encodeBase64Url(new Uint8Array(signature))}`;
};

export const verifyAdminSessionToken = async (token: string | undefined) => {
  if (!token) {
    return false;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [encodedPayload, encodedSignature] = parts;
    const signatureIsValid = await crypto.subtle.verify(
      "HMAC",
      await importSigningKey(),
      decodeBase64Url(encodedSignature),
      textEncoder.encode(encodedPayload),
    );

    if (!signatureIsValid) {
      return false;
    }

    const payload: unknown = JSON.parse(textDecoder.decode(decodeBase64Url(encodedPayload)));

    return isAdminSessionPayload(payload) && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
};
