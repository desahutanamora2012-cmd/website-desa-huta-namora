import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env } from "../lib/env.js";
import { getSessionCookieOptions } from "../lib/cookies.js";
import { Session } from "@contracts/constants.js";
import { Errors } from "@contracts/errors.js";
import { signSessionToken, verifySessionToken } from "./session.js";
import { findUserByUnionId, upsertUser } from "../queries/users.js";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }

  return user;
}

export function createLoginHandler() {
  return async (c: Context) => {
    const body = await c.req.json().catch(() => null);
    if (
      !body ||
      typeof body.username !== "string" ||
      typeof body.password !== "string"
    ) {
      return c.json({ error: "username and password are required" }, 400);
    }

    const isValid =
      body.username === env.adminUsername &&
      body.password === env.adminPassword;
    if (!isValid) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    const unionId = `local:${body.username}`;
    await upsertUser({
      unionId,
      name: body.username,
      email: `${body.username}@local`,
      role: "admin",
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({ unionId, clientId: "local" });
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);

    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({ success: true });
  };
}
