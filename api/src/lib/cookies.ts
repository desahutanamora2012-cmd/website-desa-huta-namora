import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  // LocalTo/proxy kadang mengubah host header.
  // Gunakan x-forwarded-host jika tersedia.
  const host =
    headers.get("x-forwarded-host") || headers.get("host") || "";
  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}


export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    // Untuk kebutuhan cross-site (LocalTo/proxy), gunakan SameSite=None.
    // Untuk localhost gunakan Lax agar tetap nyaman saat development.
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost,
  };

}
