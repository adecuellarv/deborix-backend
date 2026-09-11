import "server-only";

const digest = async (value: string) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));

const secureCompare = async (received: string, expected: string) => {
  const [receivedDigest, expectedDigest] = await Promise.all([digest(received), digest(expected)]);
  let difference = 0;

  receivedDigest.forEach((byte, index) => {
    difference |= byte ^ expectedDigest[index];
  });

  return difference === 0;
};

export const validateAdminCredentials = async (username: string, password: string) => {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new Error("Admin credentials are not configured");
  }

  const [usernameMatches, passwordMatches] = await Promise.all([
    secureCompare(username, expectedUsername),
    secureCompare(password, expectedPassword),
  ]);

  return usernameMatches && passwordMatches;
};
