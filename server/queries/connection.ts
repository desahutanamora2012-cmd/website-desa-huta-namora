import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

import mysql from "mysql2/promise";

export function getDb() {
  if (!instance) {
    const poolConnection = mysql.createPool({
      uri: env.databaseUrl,
      connectTimeout: 5000,
      connectionLimit: 1,
      maxIdle: 1,
    });
    instance = drizzle(poolConnection, {
      mode: "default",
      schema: fullSchema,
    });
  }
  return instance;
}
