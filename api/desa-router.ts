import { z } from "zod";
import { eq, desc, asc, sql, like, and } from "drizzle-orm";
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
} from "../db/schema.js";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware.js";

const db = () => getDb();

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
    return db().select().from(dokumen).orderBy(asc(dokumen.urutan));
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
        fileUrl: z.string(),
        deskripsi: z.string().optional(),
        kategori: z.string().optional(),
        urutan: z.number().optional(),
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
        fileUrl: z.string().optional(),
        deskripsi: z.string().optional(),
        kategori: z.string().optional(),
        urutan: z.number().optional(),
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
  list: publicQuery
    .input(z.object({ jenis: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.jenis) {
        return db()
          .select()
          .from(lembaga)
          .where(eq(lembaga.jenis, input.jenis as any))
          .orderBy(asc(lembaga.urutan));
      }
      return db().select().from(lembaga).orderBy(asc(lembaga.urutan));
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
        jenis: z
          .enum([
            "pemerintahan",
            "bpd",
            "pkk",
            "karang_taruna",
            "lpmd",
            "lainnya",
          ])
          .optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        ketua: z.string().optional(),
        anggota: z.number().optional(),
        urutan: z.number().optional(),
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
        jenis: z
          .enum([
            "pemerintahan",
            "bpd",
            "pkk",
            "karang_taruna",
            "lpmd",
            "lainnya",
          ])
          .optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        ketua: z.string().optional(),
        anggota: z.number().optional(),
        urutan: z.number().optional(),
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
  list: publicQuery
    .input(z.object({ kategori: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.kategori) {
        return db()
          .select()
          .from(galeri)
          .where(eq(galeri.kategori, input.kategori as any))
          .orderBy(desc(galeri.tanggal));
      }
      return db().select().from(galeri).orderBy(desc(galeri.tanggal));
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
        kategori: z
          .enum([
            "kegiatan",
            "infraastruktur",
            "pariwisata",
            "umkm",
            "pertanian",
            "infografis",
            "lainnya",
          ])
          .optional(),
        tanggal: z.string().optional(),
        deskripsi: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data: any = { ...input };
      if (input.tanggal) {
        data.tanggal = new Date(input.tanggal);
      }
      const result = await db().insert(galeri).values(data);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...data };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        judul: z.string().optional(),
        gambarUrl: z.string().optional(),
        kategori: z
          .enum([
            "kegiatan",
            "infraastruktur",
            "pariwisata",
            "umkm",
            "pertanian",
            "infografis",
            "lainnya",
          ])
          .optional(),
        tanggal: z.string().optional(),
        deskripsi: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rawData } = input;
      const data: any = { ...rawData };
      if (data.tanggal) {
        data.tanggal = new Date(data.tanggal);
      }
      await db().update(galeri).set(data).where(eq(galeri.id, id));
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
  list: publicQuery
    .input(z.object({ jenis: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.jenis) {
        return db()
          .select()
          .from(komoditas)
          .where(eq(komoditas.jenis, input.jenis as any))
          .orderBy(asc(komoditas.urutan));
      }
      return db().select().from(komoditas).orderBy(asc(komoditas.urutan));
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
        jenis: z
          .enum(["pertanian", "peternakan", "perikanan", "perkebunan"])
          .optional(),
        deskripsi: z.string().optional(),
        luasLahan: z.string().optional(),
        hasilProduksi: z.string().optional(),
        satuan: z.string().optional(),
        fotoUrl: z.string().optional(),
        urutan: z.number().optional(),
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
        jenis: z
          .enum(["pertanian", "peternakan", "perikanan", "perkebunan"])
          .optional(),
        deskripsi: z.string().optional(),
        luasLahan: z.string().optional(),
        hasilProduksi: z.string().optional(),
        satuan: z.string().optional(),
        fotoUrl: z.string().optional(),
        urutan: z.number().optional(),
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
  list: publicQuery
    .input(z.object({ kategori: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.kategori) {
        return db()
          .select()
          .from(umkm)
          .where(eq(umkm.kategori, input.kategori as any))
          .orderBy(desc(umkm.createdAt));
      }
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
        kategori: z
          .enum([
            "makanan",
            "minuman",
            "kerajinan",
            "fashion",
            "pertanian",
            "jasa",
            "lainnya",
          ])
          .optional(),
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
        kategori: z
          .enum([
            "makanan",
            "minuman",
            "kerajinan",
            "fashion",
            "pertanian",
            "jasa",
            "lainnya",
          ])
          .optional(),
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
  list: adminQuery.query(async () => {
    return db().select().from(pengaduan).orderBy(desc(pengaduan.createdAt));
  }),

  listPublic: publicQuery.query(async () => {
    return db()
      .select({
        id: pengaduan.id,
        nama: pengaduan.nama,
        pesan: pengaduan.pesan,
        status: pengaduan.status,
        respon: pengaduan.respon,
        createdAt: pengaduan.createdAt,
      })
      .from(pengaduan)
      .orderBy(desc(pengaduan.createdAt));
  }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(pengaduan)
        .where(eq(pengaduan.id, input.id));
      return rows[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        kontak: z.string().min(1),
        email: z.string().email().optional(),
        pesan: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(pengaduan).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["baru", "diproses", "selesai", "ditolak"]),
        respon: z.string().optional(),
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

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db()
        .select()
        .from(apbdes)
        .where(eq(apbdes.id, input.id));
      return rows[0] || null;
    }),

  getLatest: publicQuery.query(async () => {
    const rows = await db()
      .select()
      .from(apbdes)
      .orderBy(desc(apbdes.tahun))
      .limit(1);
    return rows[0] || null;
  }),

  create: adminQuery
    .input(
      z.object({
        tahun: z.number(),
        pendapatanTotal: z.string().optional(),
        belanjaTotal: z.string().optional(),
        pembiayaanTotal: z.string().optional(),
        rincianPendapatan: z.any().optional(),
        rincianBelanja: z.any().optional(),
        dokumenUrl: z.string().optional(),
        gambarInfografis: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(apbdes).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        tahun: z.number().optional(),
        pendapatanTotal: z.string().optional(),
        belanjaTotal: z.string().optional(),
        pembiayaanTotal: z.string().optional(),
        rincianPendapatan: z.any().optional(),
        rincianBelanja: z.any().optional(),
        dokumenUrl: z.string().optional(),
        gambarInfografis: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(apbdes).set(data).where(eq(apbdes.id, id));
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
const temaRouter = createRouter({
  get: publicQuery.query(async () => {
    const rows = await db().select().from(temaWebsite).limit(1);
    return (
      rows[0] || {
        statusDesa: "desa",
        tema: "light",
        warnaPrimer: "#065f46",
        warnaSkunder: "#f3f4f6",
        warnaAccent: "#dc2626",
        borderRadius: "md",
        runningTextAktif: 1,
      }
    );
  }),

  update: adminQuery
    .input(
      z.object({
        statusDesa: z.enum(["desa", "kelurahan"]).optional(),
        tema: z.enum(["light", "dark", "custom"]).optional(),
        warnaPrimer: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        warnaSkunder: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        warnaAccent: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        backgroundImage1: z.string().optional(),
        backgroundImage2: z.string().optional(),
        backgroundImage3: z.string().optional(),
        backgroundAnimationSpeed: z.number().min(1).max(60).optional(),
        logoUrl: z.string().optional(),
        logoKecilUrl: z.string().optional(),
        faviconUrl: z.string().optional(),
        runningTextAktif: z.number().optional(),
        fontFamily: z.string().optional(),
        borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db().select().from(temaWebsite).limit(1);
      if (existing.length > 0) {
        await db().update(temaWebsite).set(input);
        return { ...existing[0], ...input };
      } else {
        const result = await db().insert(temaWebsite).values(input as any);
        return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
      }
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
        nama: z.string().min(1).max(255),
        deskripsi: z.string().optional(),
        kepala: z.string().optional(),
        kontak: z.string().optional(),
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
        nama: z.string().min(1).max(255).optional(),
        deskripsi: z.string().optional(),
        kepala: z.string().optional(),
        kontak: z.string().optional(),
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
const jabatanRouter = createRouter({
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
        nama: z.string().min(1).max(255),
        pejabat: z.string().min(1).max(255),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
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
        nama: z.string().min(1).max(255).optional(),
        pejabat: z.string().min(1).max(255).optional(),
        fotoUrl: z.string().optional(),
        deskripsi: z.string().optional(),
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
// Running Text Router
// ============================================================
const runningTextRouter = createRouter({
  list: publicQuery.query(async () => {
    return db().select().from(runningText).where(eq(runningText.aktif, 1)).orderBy(asc(runningText.urutan));
  }),

  getAll: adminQuery.query(async () => {
    return db().select().from(runningText).orderBy(asc(runningText.urutan));
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
        teks: z.string().min(1),
        warna: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
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
        warna: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
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
// SOTK (Struktur Organisasi) - Jabatan Router
// ============================================================
const jabatanSotkRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(jabatanSotk)
      .orderBy(asc(jabatanSotk.urutan));
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
        namaJabatan: z.string().min(1),
        pejabatNama: z.string().min(1),
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
// SOTK (Struktur Organisasi) - Dusun Router
// ============================================================
const dusunSotkRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(dusunSotk)
      .orderBy(asc(dusunSotk.urutan));
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
        namaDusun: z.string().min(1),
        kepala: z.string().min(1),
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
});

// ============================================================
// Pariwisata (Tourism) Router
// ============================================================
const pariwisataRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(pariwisata)
      .orderBy(asc(pariwisata.urutan));
  }),

  reviews: createRouter({
    listByPariwisataId: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db()
          .select()
          .from(pariwisataReviews)
          .where(eq(pariwisataReviews.pariwisataId, input.id))
          .orderBy(desc(pariwisataReviews.createdAt));
      }),

    create: authedQuery
      .input(
        z.object({
          id: z.number(),
          rating: z.number().min(1).max(5),
          review: z.string().min(1).max(2000),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        const unionId = user?.unionId;
        if (!unionId) {
          throw new Error("Missing user unionId");
        }

        // prevent spam: allow only one review per user per pariwisata
        const existing = await db()
          .select()
          .from(pariwisataReviews)
          .where(
            and(
              eq(pariwisataReviews.pariwisataId, input.id),
              eq(pariwisataReviews.unionId, unionId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await db()
            .update(pariwisataReviews)
            .set({
              rating: input.rating,
              review: input.review,
            })
            .where(eq(pariwisataReviews.id, existing[0].id));
        } else {
          await db().insert(pariwisataReviews).values({
            pariwisataId: input.id,
            userId: user?.id,
            unionId,
            rating: input.rating,
            review: input.review,
          });
        }

        // recompute pariwisata rating (average)
        const rows = await db()
          .select({ avgRating: sql<string>`AVG(${pariwisataReviews.rating})` })
          .from(pariwisataReviews)
          .where(eq(pariwisataReviews.pariwisataId, input.id));
        const avg = rows[0]?.avgRating ?? null;

        await db()
          .update(pariwisata)
          .set({ rating: avg })
          .where(eq(pariwisata.id, input.id));

        return { success: true };
      }),
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
        namaPenginapan: z.string().min(1),
        alamat: z.string().min(1),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoPenginapan: z.array(z.string()).default([]),
        kontakWhatsapp: z.string().optional(),
        hargaMin: z.string().optional(),
        hargaMax: z.string().optional(),
        satuanHarga: z.string().default("per malam"),
        fasilitas: z.array(z.string()).default([]),
        rating: z.string().optional(),
        urutan: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db()
        .insert(pariwisata)
        .values({
          ...input,
          latitude: input.latitude ? input.latitude : undefined,
          longitude: input.longitude ? input.longitude : undefined,
          hargaMin: input.hargaMin ? input.hargaMin : undefined,
          hargaMax: input.hargaMax ? input.hargaMax : undefined,
          rating: input.rating ? input.rating : undefined,
        });
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaPenginapan: z.string().optional(),
        alamat: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoPenginapan: z.array(z.string()).optional(),
        kontakWhatsapp: z.string().optional(),
        hargaMin: z.string().optional(),
        hargaMax: z.string().optional(),
        satuanHarga: z.string().optional(),
        fasilitas: z.array(z.string()).optional(),
        rating: z.string().optional(),
        urutan: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db().update(pariwisata).set(data).where(eq(pariwisata.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pariwisata).where(eq(pariwisata.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Pendidikan (Education) Router
// ============================================================
const pendidikanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(pendidikan)
      .orderBy(asc(pendidikan.urutan));
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

  getByJenjang: publicQuery
    .input(z.object({ jenjang: z.string() }))
    .query(async ({ input }) => {
      return db()
        .select()
        .from(pendidikan)
        .where(eq(pendidikan.jenjang, input.jenjang as any))
        .orderBy(asc(pendidikan.urutan));
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string().min(1),
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
        alamat: z.string().min(1),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        kepala: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jumlahGuru: z.number().optional(),
        jumlahSiswa: z.number().optional(),
        tahunBerdiri: z.number().optional(),
        statusAkreditasi: z.string().optional(),
        urutan: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(pendidikan).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenjang: z
          .enum([
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
          ])
          .optional(),
        alamat: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
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
      const { id, ...data } = input;
      await db().update(pendidikan).set(data).where(eq(pendidikan.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(pendidikan).where(eq(pendidikan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Kesehatan (Health) Router
// ============================================================
const kesehatanRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(kesehatan)
      .orderBy(asc(kesehatan.urutan));
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

  getByJenis: publicQuery
    .input(z.object({ jenis: z.string() }))
    .query(async ({ input }) => {
      return db()
        .select()
        .from(kesehatan)
        .where(eq(kesehatan.jenis, input.jenis as any))
        .orderBy(asc(kesehatan.urutan));
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string().min(1),
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
        alamat: z.string().min(1),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        layanan: z.array(z.string()).default([]),
        urutan: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(kesehatan).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenis: z
          .enum([
            "puskesmas",
            "poliklinik",
            "rumah_sakit",
            "apotek",
            "klinik",
            "posyandu",
            "praktik_dokter",
            "praktik_bidan",
          ])
          .optional(),
        alamat: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
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
      const { id, ...data } = input;
      await db().update(kesehatan).set(data).where(eq(kesehatan.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(kesehatan).where(eq(kesehatan.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Ekonomi (Economic) Router
// ============================================================
const ekonomiRouter = createRouter({
  list: publicQuery.query(async () => {
    return db()
      .select()
      .from(ekonomi)
      .orderBy(asc(ekonomi.urutan));
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

  getByJenis: publicQuery
    .input(z.object({ jenis: z.string() }))
    .query(async ({ input }) => {
      return db()
        .select()
        .from(ekonomi)
        .where(eq(ekonomi.jenis, input.jenis as any))
        .orderBy(asc(ekonomi.urutan));
    }),

  create: adminQuery
    .input(
      z.object({
        namaSarana: z.string().min(1),
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
        ]),
        alamat: z.string().min(1),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        pimpinan: z.string().optional(),
        kontakNomor: z.string().optional(),
        kontakEmail: z.string().optional(),
        deskripsi: z.string().optional(),
        fotoUrl: z.string().optional(),
        jamBuka: z.string().optional(),
        jamTutup: z.string().optional(),
        produk: z.array(z.string()).default([]),
        urutan: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db().insert(ekonomi).values(input);
      return { id: Number((result as any)[0]?.insertId ?? 0), ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        namaSarana: z.string().optional(),
        jenis: z
          .enum([
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
          ])
          .optional(),
        alamat: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
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
      const { id, ...data } = input;
      await db().update(ekonomi).set(data).where(eq(ekonomi.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db().delete(ekonomi).where(eq(ekonomi.id, input.id));
      return { success: true };
    }),
});

// ============================================================
// Main Router Export
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
  tema: temaRouter,
  dusun: dusunRouter,
  jabatan: jabatanRouter,
  runningText: runningTextRouter,
  jabatanSotk: jabatanSotkRouter,
  dusunSotk: dusunSotkRouter,
  pariwisata: pariwisataRouter,
  pendidikan: pendidikanRouter,
  kesehatan: kesehatanRouter,
  ekonomi: ekonomiRouter,
  dashboard: dashboardRouter,
});
