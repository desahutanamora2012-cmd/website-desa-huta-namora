import * as cookie from "cookie";
import { Session } from "@contracts/constants.ts";
import { getSessionCookieOptions } from "./lib/cookies.ts";
import { createRouter, authedQuery, publicQuery } from "./middleware.ts";
import { findUserByUsername, updateUserPassword } from "./queries/users.ts";
import { env } from "./lib/env.ts";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
  resetPassword: publicQuery.mutation(async ({ input }) => {
    const { username, oldPassword, newPassword } = input as {
      username: string;
      oldPassword: string;
      newPassword: string;
    };

    if (!username || !oldPassword || !newPassword) {
      throw new Error("username, oldPassword, and newPassword are required");
    }

    // Validate old password against admin credentials
    const isValid =
      username === env.adminUsername && oldPassword === env.adminPassword;
    if (!isValid) {
      throw new Error("Invalid username or old password");
    }

    // Update admin password
    if (username === env.adminUsername) {
      await updateUserPassword(username, newPassword);
      return { success: true, message: "Password updated successfully" };
    }

    throw new Error("Only admin password reset is supported");
  }),
});
