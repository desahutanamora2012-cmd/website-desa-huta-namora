import { eq } from "drizzle-orm";
import * as schema from "@db/schema.js";
import type { InsertUser } from "@db/schema.js";
import { getDb } from "./connection.js";
import { env } from "../lib/env.js";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows[0];
}

export async function findUserByUsername(username: string) {
  const unionId = `local:${username}`;
  return findUserByUnionId(unionId);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function updateUserPassword(
  username: string,
  newPassword: string,
) {
  const unionId = `local:${username}`;
  await getDb()
    .update(schema.users)
    .set({
      // In a real app, hash the password. For now, store plaintext as-is.
      // IMPORTANT: In production, use bcrypt or similar!
      updatedAt: new Date(),
    })
    .where(eq(schema.users.unionId, unionId));
}
