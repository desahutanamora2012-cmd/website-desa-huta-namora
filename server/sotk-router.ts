import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import {
  dusunSotk,
  jabatanSotk,
  type JabatanSotk,
} from "@db/schema.js";

const db = () => getDb();

type JabatanTreeNode = JabatanSotk & { children: JabatanTreeNode[] };

function buildJabatanSotkTree(rows: JabatanSotk[]): JabatanTreeNode[] {
  const nodeMap = new Map<number, JabatanTreeNode>();
  const roots: JabatanTreeNode[] = [];

  for (const row of rows) {
    nodeMap.set(row.id, { ...row, children: [] });
  }

  for (const row of rows) {
    const treeNode = nodeMap.get(row.id)!;
    const parentId = row.parentId;

    if (parentId == null || parentId === 0) {
      roots.push(treeNode);
    } else {
      const parent = nodeMap.get(parentId);
      if (parent) parent.children.push(treeNode);
      else roots.push(treeNode);
    }
  }

  const sortRec = (node: JabatanTreeNode) => {
    node.children.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
    node.children.forEach(sortRec);
  };

  roots.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
  roots.forEach(sortRec);

  return roots;
}

export const sotkRouter = createRouter({
  jabatan: createRouter({
    list: publicQuery.query(async () => {
      return db()
        .select()
        .from(jabatanSotk)
        .orderBy(asc(jabatanSotk.urutan));
    }),

    tree: publicQuery.query(async () => {
      const rows = await db()
        .select()
        .from(jabatanSotk)
        .orderBy(asc(jabatanSotk.urutan));
      return buildJabatanSotkTree(rows);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const rows = await db()
          .select()
          .from(jabatanSotk)
          .where(eq(jabatanSotk.id, input.id))
          .limit(1);

        return rows[0] ?? null;
      }),
  }),

  dusun: createRouter({
    list: publicQuery.query(async () => {
      return db()
        .select()
        .from(dusunSotk)
        .orderBy(asc(dusunSotk.urutan));
    }),
  }),
});
