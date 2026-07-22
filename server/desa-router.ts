import { z } from "zod";
import { eq, desc, asc, sql, like, and } from "drizzle-orm";
import { createHash } from "crypto";
import { getDb } from "./queries/connection.js";
import {
  profilDesa,
  statistikDesa,
  berita,
  panduan,
  dokumen,
  lembaga,
  galeri,
  komoditas,
  umkm,
  pengaduan,
  apbdes,
  temaWebsite,
  dusun,
  jabatanDesa,
  runningText,
  jabatanSotk,
  dusunSotk,
  pariwisata,
  pariwisataReviews,
  pendidikan,
  kesehatan,
  ekonomi,
  websiteVisits,
} from "../db/schema.js";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware.js";

const db = () => getDb();

const normalizeBorderRadius = (value: unknown) => {
  const allowed = ["none", "sm", "md", "lg", "full"] as const;
  if (value === undefined || value === null || value === "") return undefined;

  const normalized = String(value).trim().toLowerCase();
  if (allowed.includes(normalized as (typeof allowed)[number])) {
    return normalized as (typeof allowed)[number];
  }

  const mapped: Record<string, (typeof allowed)[number]> = {
    "rounded-none": "none",
    "rounded-sm": "sm",
    "rounded-md": "md",
    "rounded-lg": "lg",
    "rounded-full": "full",
  };

  return mapped[normalized] ?? "md";
};

const normalizeDate = (value?: string) => {
  if (value === undefined || value === null || value === "") return undefined;
  return new Date(value);
};

const normalizeDecimal = (value?: string | number) => {
  if (value === undefined || value === null) return undefined;
  return typeof value === "number" ? value.toString() : value;
};

// ============================================================
// Profil Desa Router
// ============================================================
const profilRouter = createRouter({
  list: publicQuery.query(async () => {
    const rows = await db().select().from(profilDesa);
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.kunci] = row.nilai || "";
    }
    return result;
  }),

  getByKey: publicQuery
    .input(z.object({ kunci: z.string() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(profilDesa)
        .where(eq(profilDesa.kunci, input.kunci));
      return rows[0]?.nilai || null;
    }),

  set: adminQuery
    .input(
      z.object({
        kunci: z.string().max(100),
        nilai: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db()
        .select()
        .from(profilDesa)
        .where(eq(profilDesa.kunci, input.kunci));

      if (existing.length > 0) {
        await db()
          .update(profilDesa)
          .set({ nilai: input.nilai })
          .where(eq(profilDesa.kunci, input.kunci));
        return { ...existing[0], nilai: input.nilai };
      } else {
        const result = await db().insert(profilDesa).values(input);
        return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
      }
    }),

  setMany: adminQuery
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input }) => {
      for (const [kunci, nilai] of Object.entries(input)) {
        const existing = await db()
          .select()
          .from(profilDesa)
          .where(eq(profilDesa.kunci, kunci));

        if (existing.length > 0) {
          await db()
            .update(profilDesa)
            .set({ nilai })
            .where(eq(profilDesa.kunci, kunci));
        } else {
          await db().insert(profilDesa).values({ kunci, nilai });
        }
      }
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ kunci: z.string() }))
    .mutation(async ({ input }) => {
      await db()
        .delete(profilDesa)
        .where(eq(profilDesa.kunci, input.kunci));
      return { success: true };
    }),
});

// ============================================================
// Statistik Desa Router
// ============================================================
const statistikRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(statistikDesa).orderBy(desc(statistikDesa.tahun));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(statistikDesa)
        .where(eq(statistikDesa.id, input.id));
      return rows[0] || null;
    }),

  getLatest: publicQuery.query(async () => {
    const rows = await db()
      .select()
      .from(statistikDesa)
      .orderBy(desc(statistikDesa.tahun))
      .limit(1);
    return rows[0] || null;
  }),

  create: adminQuery
    .input(
      z.object({
        tahun: z.number(),
        totalPenduduk: z.number().optional(),
        totalKK: z.number().optional(),
        totalLakiLaki: z.number().optional(),
        totalPerempuan: z.number().optional(),
        luasWilayah: z.string().optional(),
        jumlahDusun: z.number().optional(),
        jumlahRT: z.number().optional(),
        jumlahRW: z.number().optional(),
        dataPendidikan: z.any().optional(),
        dataAngkatanKerja: z.any().optional(),
        dataUsia: z.any().optional(),
        infrastrukturPendidikan: z.any().optional(),
        infrastrukturKesehatan: z.any().optional(),
        infrastrukturEkonomi: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(statistikDesa).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        tahun: z.number().optional(),
        totalPenduduk: z.number().optional(),
        totalKK: z.number().optional(),
        totalLakiLaki: z.number().optional(),
        totalPerempuan: z.number().optional(),
        luasWilayah: z.string().optional(),
        jumlahDusun: z.number().optional(),
        jumlahRT: z.number().optional(),
        jumlahRW: z.number().optional(),
        dataPendidikan: z.any().optional(),
        dataAngkatanKerja: z.any().optional(),
        dataUsia: z.any().optional(),
        infrastrukturPendidikan: z.any().optional(),
        infrastrukturKesehatan: z.any().optional(),
        infrastrukturEkonomi: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(statistikDesa).set(data).where(eq(statistikDesa.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db()
        .delete(statistikDesa)
        .where(eq(statistikDesa.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Berita Router
// ============================================================
const beritaRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          kategori: z.string().optional(),
          status: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let query = db()
        .select()
        .from(berita)
        .orderBy(desc(berita.tanggalPublish));

      const conditions = [];
      if (input?.kategori) {
        conditions.push(eq(berita.kategori, input.kategori as any));
      }
      if (input?.status) {
        conditions.push(eq(berita.status, input.status as any));
      }
      if (input?.search) {
        conditions.push(like(berita.judul, `%${input.search}%`));
      }

      if (conditions.length > 0) {
        query = db()
          .select()
          .from(berita)
          .where(and(...conditions))
          .orderBy(desc(berita.tanggalPublish)) as any;
      }

      const rows = await query;
      return input?.limit ? rows.slice(0, input.limit) : rows;
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(berita)
        .where(eq(berita.slug, input.slug));
      return rows[0] || null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(berita)
        .where(eq(berita.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        judul: z.string(),
        slug: z.string(),
        isi: z.string(),
        gambarSampul: z.string().optional(),
        kategori: z.enum(["kabar_desa", "pengumuman", "berita"]).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        tanggalPublish: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data: any = { ...input };
      if (input.tanggalPublish) {
        data.tanggalPublish = new Date(input.tanggalPublish);
      }
      const result = await db().insert(berita).values(data);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        slug: z.string().optional(),
        isi: z.string().optional(),
        gambarSampul: z.string().optional(),
        kategori: z.enum(["kabar_desa", "pengumuman", "berita"]).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        tanggalPublish: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rawData } = input;
      const data: any = { ...rawData };
      if (data.tanggalPublish) {
        data.tanggalPublish = new Date(data.tanggalPublish);
      }
      await db().update(berita).set(data).where(eq(berita.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(berita).where(eq(berita.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Panduan Router
// ============================================================
const panduanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(panduan).orderBy(asc(panduan.urutan));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(panduan)
        .where(eq(panduan.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        judul: z.string(),
        konten: z.string(),
        filePdf: z.string().optional(),
        kategori: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(panduan).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        konten: z.string().optional(),
        filePdf: z.string().optional(),
        kategori: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(panduan).set(data).where(eq(panduan.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(panduan).where(eq(panduan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Dokumen Router
// ============================================================
const dokumenRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(dokumen).orderBy(desc(dokumen.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(dokumen)
        .where(eq(dokumen.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        judul: z.string(),
        deskripsi: z.string(),
        fileUrl: z.string(),
        kategori: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(dokumen).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        deskripsi: z.string().optional(),
        fileUrl: z.string().optional(),
        kategori: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(dokumen).set(data).where(eq(dokumen.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(dokumen).where(eq(dokumen.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Lembaga Router
// ============================================================
const lembagaRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(lembaga).orderBy(desc(lembaga.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(lembaga)
        .where(eq(lembaga.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        nama: z.string(),
        deskripsi: z.string(),
        gambar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(lembaga).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().optional(),
        deskripsi: z.string().optional(),
        gambar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(lembaga).set(data).where(eq(lembaga.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(lembaga).where(eq(lembaga.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Galeri Router
// ============================================================
const galeriRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(galeri).orderBy(desc(galeri.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(galeri)
        .where(eq(galeri.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        judul: z.string(),
        gambarUrl: z.string(),
        fotoUrls: z.array(z.string()).optional(),
        kategori: z.enum([
          "kegiatan",
          "infraastruktur",
          "pariwisata",
          "umkm",
          "pertanian",
          "infografis",
          "lainnya",
        ]).optional(),
        tanggal: z.string().optional(),
        deskripsi: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        tanggal: normalizeDate(input.tanggal),
      };
      const result = await db().insert(galeri).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        gambarUrl: z.string().optional(),
        fotoUrls: z.array(z.string()).optional(),
        kategori: z.enum([
          "kegiatan",
          "infraastruktur",
          "pariwisata",
          "umkm",
          "pertanian",
          "infografis",
          "lainnya",
        ]).optional(),
        tanggal: z.string().optional(),
        deskripsi: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        tanggal: normalizeDate(rest.tanggal),
      };
      await db().update(galeri).set(data as any).where(eq(galeri.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(galeri).where(eq(galeri.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Komoditas Router
// ============================================================
const komoditasRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(komoditas).orderBy(desc(komoditas.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(komoditas)
        .where(eq(komoditas.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        nama: z.string(),
        deskripsi: z.string(),
        gambar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(komoditas).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().optional(),
        deskripsi: z.string().optional(),
        gambar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(komoditas).set(data).where(eq(komoditas.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(komoditas).where(eq(komoditas.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// UMKM Router
// ============================================================
const umkmRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(umkm).orderBy(desc(umkm.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(umkm)
        .where(eq(umkm.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaProduk: z.string(),
        namaUsaha: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        link: z.string().optional(),
        kategori: z.enum([
          "makanan",
          "minuman",
          "kerajinan",
          "fashion",
          "pertanian",
          "jasa",
          "lainnya",
        ]).optional(),
        pemilik: z.string().optional(),
        kontak: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(umkm).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaProduk: z.string().optional(),
        namaUsaha: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        link: z.string().optional(),
        kategori: z.enum([
          "makanan",
          "minuman",
          "kerajinan",
          "fashion",
          "pertanian",
          "jasa",
          "lainnya",
        ]).optional(),
        pemilik: z.string().optional(),
        kontak: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(umkm).set(data).where(eq(umkm.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(umkm).where(eq(umkm.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Pengaduan Router
// ============================================================
const pengaduanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(pengaduan).orderBy(desc(pengaduan.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(pengaduan)
        .where(eq(pengaduan.id, input.id));
      return rows[0] || null;
    }),

  create: authedQuery
    .input(
      z.object({
        judul: z.string(),
        deskripsi: z.string(),
        gambar: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db().insert(pengaduan).values({
        ...input,
        nama: input.judul,
        kontak: "", // You might need to adjust this based on your user context
        pesan: input.deskripsi,
        status: "baru",
        email: "", // You might need to adjust this based on your user context
        // userId: ctx.user.id, // userId is not in the schema for pengaduan
      });
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input, status: "pending" };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        deskripsi: z.string().optional(),
        gambar: z.string().optional(),
        status: z.enum(["baru", "diproses", "selesai", "ditolak"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(pengaduan).set(data).where(eq(pengaduan.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pengaduan).where(eq(pengaduan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// APBDes Router
// ============================================================
const apbdesRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(apbdes).orderBy(desc(apbdes.tahun));
  }),

  getLatest: publicQuery.query(async () => {
    const rows = await db()
      .select()
      .from(apbdes)
      .orderBy(desc(apbdes.tahun))
      .limit(1);
    return rows[0] || null;
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(apbdes)
        .where(eq(apbdes.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        tahun: z.number(),
        judul: z.string().optional(),
        pendapatanTotal: z.union([z.string(), z.number()]).optional(),
        belanjaTotal: z.union([z.string(), z.number()]).optional(),
        pembiayaanTotal: z.union([z.string(), z.number()]).optional(),
        rincianPendapatan: z.any().optional(),
        rincianBelanja: z.any().optional(),
        dokumenUrl: z.string().optional(),
        gambarInfografis: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        pendapatanTotal: normalizeDecimal(input.pendapatanTotal),
        belanjaTotal: normalizeDecimal(input.belanjaTotal),
        pembiayaanTotal: normalizeDecimal(input.pembiayaanTotal),
      };
      const result = await db().insert(apbdes).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        tahun: z.number().optional(),
        judul: z.string().optional(),
        pendapatanTotal: z.union([z.string(), z.number()]).optional(),
        belanjaTotal: z.union([z.string(), z.number()]).optional(),
        pembiayaanTotal: z.union([z.string(), z.number()]).optional(),
        rincianPendapatan: z.any().optional(),
        rincianBelanja: z.any().optional(),
        dokumenUrl: z.string().optional(),
        gambarInfografis: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        pendapatanTotal: normalizeDecimal(rest.pendapatanTotal),
        belanjaTotal: normalizeDecimal(rest.belanjaTotal),
        pembiayaanTotal: normalizeDecimal(rest.pembiayaanTotal),
      };
      await db().update(apbdes).set(data as any).where(eq(apbdes.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(apbdes).where(eq(apbdes.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Tema Website Router
// ============================================================
const temaWebsiteRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(temaWebsite).limit(1);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(temaWebsite)
        .where(eq(temaWebsite.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        statusDesa: z.enum(["desa", "kelurahan"]).optional(),
        tema: z.enum(["light", "dark", "custom"]).optional(),
        warnaPrimer: z.string().optional(),
        warnaSkunder: z.string().optional(),
        warnaSekunder: z.string().optional(),
        warnaAccent: z.string().optional(),
        warnaAksen: z.string().optional(),
        backgroundImage1: z.string().optional(),
        backgroundImage2: z.string().optional(),
        backgroundImage3: z.string().optional(),
        backgroundAnimationSpeed: z.number().optional(),
        logoUrl: z.string().optional(),
        logoKecilUrl: z.string().optional(),
        faviconUrl: z.string().optional(),
        runningTextAktif: z.number().optional(),
        fontFamily: z.string().optional(),
        borderRadius: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        borderRadius: normalizeBorderRadius(input.borderRadius),
        warnaSkunder: input.warnaSkunder ?? input.warnaSekunder,
        warnaAccent: input.warnaAccent ?? input.warnaAksen,
      };
      delete (data as any).warnaSekunder;
      delete (data as any).warnaAksen;
      const result = await db().insert(temaWebsite).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        statusDesa: z.enum(["desa", "kelurahan"]).optional(),
        tema: z.enum(["light", "dark", "custom"]).optional(),
        warnaPrimer: z.string().optional(),
        warnaSkunder: z.string().optional(),
        warnaSekunder: z.string().optional(),
        warnaAccent: z.string().optional(),
        warnaAksen: z.string().optional(),
        backgroundImage1: z.string().optional(),
        backgroundImage2: z.string().optional(),
        backgroundImage3: z.string().optional(),
        backgroundAnimationSpeed: z.number().optional(),
        logoUrl: z.string().optional(),
        logoKecilUrl: z.string().optional(),
        faviconUrl: z.string().optional(),
        runningTextAktif: z.number().optional(),
        fontFamily: z.string().optional(),
        borderRadius: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const normalizedData = {
        ...data,
        borderRadius: normalizeBorderRadius(data.borderRadius),
        warnaSkunder: input.warnaSkunder ?? input.warnaSekunder,
        warnaAccent: input.warnaAccent ?? input.warnaAksen,
      };
      delete (normalizedData as any).warnaSekunder;
      delete (normalizedData as any).warnaAksen;
      await db().update(temaWebsite).set(normalizedData as any).where(eq(temaWebsite.id, id));
      return { id, ...normalizedData };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(temaWebsite).where(eq(temaWebsite.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Dusun Router
// ============================================================
const dusunRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(dusun).orderBy(asc(dusun.urutan));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(dusun)
        .where(eq(dusun.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        nama: z.string(),
        pejabat: z.string(),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(dusun).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().optional(),
        pejabat: z.string().optional(),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(dusun).set(data).where(eq(dusun.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(dusun).where(eq(dusun.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Jabatan Desa Router
// ============================================================
const jabatanDesaRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(jabatanDesa).orderBy(asc(jabatanDesa.urutan));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(jabatanDesa)
        .where(eq(jabatanDesa.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        nama: z.string(),
        pejabat: z.string(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(jabatanDesa).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(jabatanDesa).set(data).where(eq(jabatanDesa.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(jabatanDesa).where(eq(jabatanDesa.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Jabatan SOTK Router
// ============================================================
const jabatanSotkRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(jabatanSotk).orderBy(asc(jabatanSotk.urutan));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(jabatanSotk)
        .where(eq(jabatanSotk.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaJabatan: z.string(),
        pejabatNama: z.string(),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
        parentId: z.number().nullable().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(jabatanSotk).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaJabatan: z.string().optional(),
        pejabatNama: z.string().optional(),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
        parentId: z.number().nullable().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(jabatanSotk).set(data).where(eq(jabatanSotk.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(jabatanSotk).where(eq(jabatanSotk.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Dusun SOTK Router
// ============================================================
const dusunSotkRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(dusunSotk).orderBy(asc(dusunSotk.urutan));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(dusunSotk)
        .where(eq(dusunSotk.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaDusun: z.string(),
        kepala: z.string(),
        fotoKepala: z.string().optional(),
        deskripsi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(dusunSotk).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaDusun: z.string().optional(),
        kepala: z.string().optional(),
        fotoKepala: z.string().optional(),
        deskripsi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(dusunSotk).set(data).where(eq(dusunSotk.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(dusunSotk).where(eq(dusunSotk.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Running Text Router
// ============================================================
const runningTextRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(runningText).orderBy(desc(runningText.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(runningText)
        .where(eq(runningText.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        teks: z.string(),
        warna: z.string().optional(),
        backgroundColor: z.string().optional(),
        kecepatan: z.number().optional(),
        aktif: z.number().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(runningText).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        teks: z.string().optional(),
        warna: z.string().optional(),
        backgroundColor: z.string().optional(),
        kecepatan: z.number().optional(),
        aktif: z.number().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(runningText).set(data).where(eq(runningText.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(runningText).where(eq(runningText.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Pariwisata Router
// ============================================================
const pariwisataRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(pariwisata).orderBy(desc(pariwisata.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(pariwisata)
        .where(eq(pariwisata.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        kategori: z.enum(["penginapan", "objek_wisata"]).optional(),
        namaPenginapan: z.string(),
        alamat: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        deskripsi: z.string().optional(),
        fotoPenginapan: z.array(z.string()).optional(),
        kontakWhatsapp: z.string().optional(),
        hargaMin: z.number().optional(),
        hargaMax: z.number().optional(),
        satuanHarga: z.string().optional(),
        fasilitas: z.array(z.string()).optional(),
        rating: z.number().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        latitude: normalizeDecimal(input.latitude),
        longitude: normalizeDecimal(input.longitude),
        hargaMin: normalizeDecimal(input.hargaMin),
        hargaMax: normalizeDecimal(input.hargaMax),
        rating: normalizeDecimal(input.rating),
      };
      const result = await db().insert(pariwisata).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        kategori: z.enum(["penginapan", "objek_wisata"]).optional(),
        namaPenginapan: z.string().optional(),
        alamat: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        deskripsi: z.string().optional(),
        fotoPenginapan: z.array(z.string()).optional(),
        kontakWhatsapp: z.string().optional(),
        hargaMin: z.number().optional(),
        hargaMax: z.number().optional(),
        satuanHarga: z.string().optional(),
        fasilitas: z.array(z.string()).optional(),
        rating: z.number().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        latitude: normalizeDecimal(rest.latitude),
        longitude: normalizeDecimal(rest.longitude),
        hargaMin: normalizeDecimal(rest.hargaMin),
        hargaMax: normalizeDecimal(rest.hargaMax),
        rating: normalizeDecimal(rest.rating),
      };
      await db().update(pariwisata).set(data as any).where(eq(pariwisata.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pariwisata).where(eq(pariwisata.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Pariwisata Reviews Router
// ============================================================
const pariwisataReviewsRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(pariwisataReviews)
      .orderBy(desc(pariwisataReviews.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(pariwisataReviews)
        .where(eq(pariwisataReviews.id, input.id));
      return rows[0] || null;
    }),

  create: authedQuery
    .input(
      z.object({
        nama: z.string(),
        ulasan: z.string(),
        rating: z.number().min(1).max(5),
        pariwisataId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data = {
        pariwisataId: input.pariwisataId,
        unionId: ctx.user.unionId,
        rating: normalizeDecimal(input.rating),
        review: input.ulasan,
        userId: ctx.user.id,
      };
      const result = await db().insert(pariwisataReviews).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        ulasan: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        pariwisataId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ulasan, ...rest } = input;
      const data: Record<string, unknown> = {
        ...rest,
        rating: input.rating !== undefined ? normalizeDecimal(input.rating) : undefined,
      };
      if (ulasan !== undefined) data.review = ulasan;
      await db()
        .update(pariwisataReviews)
        .set(data)
        .where(eq(pariwisataReviews.id, id));
      return { id, ...rest, review: ulasan };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pariwisataReviews).where(eq(pariwisataReviews.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Pendidikan Router
// ============================================================
const pendidikanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(pendidikan).orderBy(desc(pendidikan.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(pendidikan)
        .where(eq(pendidikan.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string(),
        jenjang: z.enum([
          "paud",
          "tk",
          "sd",
          "smp",
          "sma",
          "smk",
          "d1",
          "d2",
          "d3",
          "d4",
          "s1",
          "s2",
          "s3",
        ]),
        alamat: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        kepala: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jumlahGuru: z.number().optional(),
        jumlahSiswa: z.number().optional(),
        tahunBerdiri: z.number().optional(),
        statusAkreditasi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        latitude: normalizeDecimal(input.latitude),
        longitude: normalizeDecimal(input.longitude),
      };
      const result = await db().insert(pendidikan).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenjang: z.enum([
          "paud",
          "tk",
          "sd",
          "smp",
          "sma",
          "smk",
          "d1",
          "d2",
          "d3",
          "d4",
          "s1",
          "s2",
          "s3",
        ]).optional(),
        alamat: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        kepala: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jumlahGuru: z.number().optional(),
        jumlahSiswa: z.number().optional(),
        tahunBerdiri: z.number().optional(),
        statusAkreditasi: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        latitude: normalizeDecimal(rest.latitude),
        longitude: normalizeDecimal(rest.longitude),
      };
      await db().update(pendidikan).set(data as any).where(eq(pendidikan.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pendidikan).where(eq(pendidikan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Kesehatan Router
// ============================================================
const kesehatanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(kesehatan).orderBy(desc(kesehatan.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(kesehatan)
        .where(eq(kesehatan.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string(),
        jenis: z.enum([
          "puskesmas",
          "poliklinik",
          "rumah_sakit",
          "apotek",
          "klinik",
          "posyandu",
          "praktik_dokter",
          "praktik_bidan",
        ]),
        alamat: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        layanan: z.array(z.string()).optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        latitude: normalizeDecimal(input.latitude),
        longitude: normalizeDecimal(input.longitude),
      };
      const result = await db().insert(kesehatan).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenis: z.enum([
          "puskesmas",
          "poliklinik",
          "rumah_sakit",
          "apotek",
          "klinik",
          "posyandu",
          "praktik_dokter",
          "praktik_bidan",
        ]).optional(),
        alamat: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        layanan: z.array(z.string()).optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        latitude: normalizeDecimal(rest.latitude),
        longitude: normalizeDecimal(rest.longitude),
      };
      await db().update(kesehatan).set(data as any).where(eq(kesehatan.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(kesehatan).where(eq(kesehatan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Ekonomi Router
// ============================================================
const ekonomiRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(ekonomi).orderBy(desc(ekonomi.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(ekonomi)
        .where(eq(ekonomi.id, input.id));
      return rows[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string(),
        jenis: z.enum([
          "pasar",
          "toko",
          "koperasi",
          "bank",
          "bpr",
          "lkm",
          "bmt",
          "unit_desa",
          "industri_kecil",
          "pertanian",
          "perternakan",
          "perikanan",
          "rumah_makan",
          "warung_makan",
          "restoran",
        ]),
        alamat: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        produk: z.array(z.string()).optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ...input,
        latitude: normalizeDecimal(input.latitude),
        longitude: normalizeDecimal(input.longitude),
      };
      const result = await db().insert(ekonomi).values(data as any);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenis: z.enum([
          "pasar",
          "toko",
          "koperasi",
          "bank",
          "bpr",
          "lkm",
          "bmt",
          "unit_desa",
          "industri_kecil",
          "pertanian",
          "perternakan",
          "perikanan",
          "rumah_makan",
          "warung_makan",
          "restoran",
        ]).optional(),
        alamat: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        produk: z.array(z.string()).optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const data = {
        ...rest,
        latitude: normalizeDecimal(rest.latitude),
        longitude: normalizeDecimal(rest.longitude),
      };
      await db().update(ekonomi).set(data as any).where(eq(ekonomi.id, id));
      return { id, ...data };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(ekonomi).where(eq(ekonomi.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Dashboard Router (for admin statistics)
// ============================================================
const dashboardRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db_instance = db();

    const [beritaCount] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(berita);
    const [pengaduanCount] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(pengaduan);
    const [umkmCount] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(umkm);
    const [galeriCount] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(galeri);
    const [lembagaCount] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(lembaga);
    const [pengaduanBaru] = await db_instance
      .select({ count: sql<number>`count(*)` })
      .from(pengaduan)
      .where(eq(pengaduan.status, "baru"));

    return {
      totalBerita: beritaCount.count,
      totalPengaduan: pengaduanCount.count,
      totalUmkm: umkmCount.count,
      totalGaleri: galeriCount.count,
      totalLembaga: lembagaCount.count,
      pengaduanBaru: pengaduanBaru.count,
    };
  }),

  visitsTotal: publicQuery.query(async () => {
    try {
      const visitDate = new Date().toISOString().slice(0, 10);
      const rows = await db()
        .select({ fingerprint: websiteVisits.fingerprint })
        .from(websiteVisits)
        .where(eq(websiteVisits.visitDate, visitDate));

      const unique = new Set(rows.map((r) => r.fingerprint));
      return { total: unique.size };
    } catch (err: any) {
      throw new Error(
        `[visitsTotal] website_visits query failed: ${err?.message ?? String(err)}`,
      );
    }
  }),

  visitsTrack: publicQuery.mutation(async ({ ctx }) => {
    const req = ctx.req;
    const resHeaders = ctx.resHeaders;

    const visitDate = new Date().toISOString().slice(0, 10);
    const cookieHeader = req.headers.get("cookie") || "";
    const userAgent = req.headers.get("user-agent") || "";

    const VISITOR_COOKIE = "anon_visitor_id";
    const anonMatch = cookieHeader.match(new RegExp(`${VISITOR_COOKIE}=([^;]+)`));
    let anonId = anonMatch?.[1];

    if (!anonId) {
      const seed = `${Date.now()}_${userAgent}_${Math.random()}`;
      anonId = createHash("sha256").update(seed).digest("hex").slice(0, 24);

      resHeaders.append(
        "set-cookie",
        `${VISITOR_COOKIE}=${anonId}; Path=/; HttpOnly=false; SameSite=Lax; Max-Age=31536000`,
      );
    }

    const fingerprint = createHash("sha256")
      .update(`${anonId}:${userAgent}`)
      .digest("hex")
      .slice(0, 64);

    await db()
      .insert(websiteVisits)
      .values({ visitDate, fingerprint })
      .onDuplicateKeyUpdate({
        set: { fingerprint: websiteVisits.fingerprint },
      } as any);

    return { success: true };
  }),
});

// ============================================================
// Website Visits Router
// ============================================================
const websiteVisitsRouter = createRouter({
  list: authedQuery.query(async () => {
    return db().select().from(websiteVisits).orderBy(desc(websiteVisits.createdAt));
  }),

  create: publicQuery
    .input(z.object({ ip: z.string().optional() }))
    .mutation(async ({ input }) => {
      const result = await db().insert(websiteVisits).values({
        visitDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        fingerprint: createHash("sha256").update(input.ip || "").digest("hex"),
      });
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),
});

// ============================================================
// Main Router
// ============================================================
export const desaRouter = createRouter({
  profil: profilRouter,
  statistik: statistikRouter,
  berita: beritaRouter,
  panduan: panduanRouter,
  dokumen: dokumenRouter,
  lembaga: lembagaRouter,
  galeri: galeriRouter,
  komoditas: komoditasRouter,
  umkm: umkmRouter,
  pengaduan: pengaduanRouter,
  apbdes: apbdesRouter,
  tema: { temaWebsite: temaWebsiteRouter },
  dusun: dusunRouter,
  jabatanDesa: jabatanDesaRouter,
  runningText: runningTextRouter,
  jabatanSotk: jabatanSotkRouter,
  dusunSotk: dusunSotkRouter,
  pariwisata: pariwisataRouter,
  pariwisataReviews: pariwisataReviewsRouter,
  pendidikan: pendidikanRouter,
  kesehatan: kesehatanRouter,
  ekonomi: ekonomiRouter,
  dashboard: dashboardRouter,
  websiteVisits: websiteVisitsRouter,
});
