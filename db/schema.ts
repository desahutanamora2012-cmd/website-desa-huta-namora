import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

// ============================================================
// Users table (for admin authentication - managed by auth system)
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// 1. profil_desa - Key-value store for village settings
// ============================================================
export const profilDesa = mysqlTable("profil_desa", {
  id: serial("id").primaryKey(),
  kunci: varchar("kunci", { length: 100 }).notNull().unique(),
  nilai: text("nilai"),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ProfilDesa = typeof profilDesa.$inferSelect;
export type InsertProfilDesa = typeof profilDesa.$inferInsert;

// ============================================================
// 2. statistik_desa - Village statistics & demographics
// ============================================================
export const statistikDesa = mysqlTable("statistik_desa", {
  id: serial("id").primaryKey(),
  tahun: int("tahun").notNull(),
  totalPenduduk: int("total_penduduk").default(0),
  totalKK: int("total_kk").default(0),
  totalLakiLaki: int("total_laki_laki").default(0),
  totalPerempuan: int("total_perempuan").default(0),
  luasWilayah: decimal("luas_wilayah", { precision: 10, scale: 2 }).default("0"),
  jumlahDusun: int("jumlah_dusun").default(0),
  jumlahRT: int("jumlah_rt").default(0),
  jumlahRW: int("jumlah_rw").default(0),
  // Demografi detail sebagai JSON
  dataPendidikan: json("data_pendidikan").$type<{
    tidakSekolah: number;
    sd: number;
    smp: number;
    sma: number;
    diploma: number;
    sarjana: number;
  }>(),
  dataAngkatanKerja: json("data_angkatan_kerja").$type<{
    bekerja: number;
    pengangguran: number;
    tidakBekerja: number;
  }>(),
  dataUsia: json("data_usia").$type<{
    range0_4: number;
    range5_9: number;
    range10_14: number;
    range15_19: number;
    range20_24: number;
    range25_29: number;
    range30_34: number;
    range35_39: number;
    range40_44: number;
    range45_49: number;
    range50_54: number;
    range55_59: number;
    range60_64: number;
    range65_plus: number;
  }>(),
  infrastrukturPendidikan: json("infrastruktur_pendidikan").$type<{
    tahun?: number;
    tk: number;
    ra_ba: number;
    sd: number;
    mi: number;
    smp: number;
    mts: number;
    sma: number;
    ma: number;
    smk: number;
    perguruanTinggi: number;
  }>(),
  infrastrukturKesehatan: json("infrastruktur_kesehatan").$type<{
    tahun?: number;
    rumahSakit: number;
    klinikUtama: number;
    balaiKesehatan: number;
    puskesmasInap: number;
    puskesmasNonInap: number;
    puskesmasPembantu: number;
    klinikPratama: number;
    praktikDokter: number;
    praktikBidan: number;
    poskesdes: number;
    polindes: number;
    apotek: number;
    tokoObat: number;
    posyandu: number;
  }>(),
  infrastrukturEkonomi: json("infrastruktur_ekonomi").$type<{
    tahun?: number;
    pertokoan: number;
    pasarPermanen: number;
    pasarSemiPermanen: number;
    pasarTanpaBangunan: number;
    minimarket: number;
    restoran: number;
    warungMakanan: number;
    hotel: number;
    penginapan: number;
    tokoKelontong: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StatistikDesa = typeof statistikDesa.$inferSelect;
export type InsertStatistikDesa = typeof statistikDesa.$inferInsert;

// ============================================================
// 3. berita - News & announcements
// ============================================================
export const berita = mysqlTable("berita", {
  id: serial("id").primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isi: text("isi").notNull(),
  gambarSampul: text("gambar_sampul"),
  kategori: mysqlEnum("kategori", ["kabar_desa", "pengumuman", "berita"])
    .default("kabar_desa")
    .notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  tanggalPublish: timestamp("tanggal_publish").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Berita = typeof berita.$inferSelect;
export type InsertBerita = typeof berita.$inferInsert;

// ============================================================
// 4. panduan - Service guides
// ============================================================
export const panduan = mysqlTable("panduan", {
  id: serial("id").primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  konten: text("konten").notNull(),
  filePdf: text("file_pdf"),
  kategori: varchar("kategori", { length: 100 }),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Panduan = typeof panduan.$inferSelect;
export type InsertPanduan = typeof panduan.$inferInsert;

// ============================================================
// 5. dokumen - Downloadable documents
// ============================================================
export const dokumen = mysqlTable("dokumen", {
  id: serial("id").primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  deskripsi: text("deskripsi"),
  kategori: varchar("kategori", { length: 100 }),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Dokumen = typeof dokumen.$inferSelect;
export type InsertDokumen = typeof dokumen.$inferInsert;

// ============================================================
// 6. lembaga - Community institutions
// ============================================================
export const lembaga = mysqlTable("lembaga", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jenis: mysqlEnum("jenis", [
    "pemerintahan",
    "bpd",
    "pkk",
    "karang_taruna",
    "lpmd",
    "lainnya",
  ])
    .default("lainnya")
    .notNull(),
  deskripsi: text("deskripsi"),
  fotoUrl: text("foto_url"),
  ketua: varchar("ketua", { length: 255 }),
  anggota: int("anggota").default(0),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Lembaga = typeof lembaga.$inferSelect;
export type InsertLembaga = typeof lembaga.$inferInsert;

// ============================================================
// 7. galeri - Photo gallery
// ============================================================
export const galeri = mysqlTable("galeri", {
  id: serial("id").primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  gambarUrl: text("gambar_url").notNull(),
  fotoUrls: json("foto_urls").$type<string[]>().default([]), // Multiple photos
  kategori: mysqlEnum("kategori", [
    "kegiatan",
    "infraastruktur",
    "pariwisata",
    "umkm",
    "pertanian",
    "infografis",
    "lainnya",
  ])
    .default("lainnya")
    .notNull(),
  tanggal: timestamp("tanggal").defaultNow(),
  deskripsi: text("deskripsi"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Galeri = typeof galeri.$inferSelect;
export type InsertGaleri = typeof galeri.$inferInsert;

// ============================================================
// 8. komoditas - Agricultural commodities
// ============================================================
export const komoditas = mysqlTable("komoditas", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jenis: mysqlEnum("jenis", ["pertanian", "peternakan", "perikanan", "perkebunan"])
    .default("pertanian")
    .notNull(),
  deskripsi: text("deskripsi"),
  luasLahan: decimal("luas_lahan", { precision: 10, scale: 2 }),
  hasilProduksi: decimal("hasil_produksi", { precision: 12, scale: 2 }),
  satuan: varchar("satuan", { length: 50 }).default("kg"),
  fotoUrl: text("foto_url"),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Komoditas = typeof komoditas.$inferSelect;
export type InsertKomoditas = typeof komoditas.$inferInsert;

// ============================================================
// 9. umkm - Local businesses
// ============================================================
export const umkm = mysqlTable("umkm", {
  id: serial("id").primaryKey(),
  namaProduk: varchar("nama_produk", { length: 255 }).notNull(),
  namaUsaha: varchar("nama_usaha", { length: 255 }),
  deskripsi: text("deskripsi"),
  fotoUrl: text("foto_url"),
  link: text("link"),
  kategori: mysqlEnum("kategori", [
    "makanan",
    "minuman",
    "kerajinan",
    "fashion",
    "pertanian",
    "jasa",
    "lainnya",
  ])
    .default("lainnya")
    .notNull(),
  pemilik: varchar("pemilik", { length: 255 }),
  kontak: varchar("kontak", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Umkm = typeof umkm.$inferSelect;
export type InsertUmkm = typeof umkm.$inferInsert;

// ============================================================
// 10. pengaduan - Complaints & contact messages
// ============================================================
export const pengaduan = mysqlTable("pengaduan", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kontak: varchar("kontak", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  pesan: text("pesan").notNull(),
  status: mysqlEnum("status", ["baru", "diproses", "selesai", "ditolak"])
    .default("baru")
    .notNull(),
  respon: text("respon"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Pengaduan = typeof pengaduan.$inferSelect;
export type InsertPengaduan = typeof pengaduan.$inferInsert;

// ============================================================
// 11. apbdes - Village budget transparency
// ============================================================
export const apbdes = mysqlTable("apbdes", {
  id: serial("id").primaryKey(),
  tahun: int("tahun").notNull(),
  judul: varchar("judul", { length: 255 }),
  pendapatanTotal: decimal("pendapatan_total", { precision: 15, scale: 2 }).default("0"),
  belanjaTotal: decimal("belanja_total", { precision: 15, scale: 2 }).default("0"),
  pembiayaanTotal: decimal("pembiayaan_total", { precision: 15, scale: 2 }).default("0"),
  // Detail sebagai JSON
  rincianPendapatan: json("rincian_pendapatan").$type<
    { sumber: string; jumlah: number }[]
  >(),
  rincianBelanja: json("rincian_belanja").$type<
    { bidang: string; jumlah: number }[]
  >(),
  dokumenUrl: text("dokumen_url"),
  gambarInfografis: text("gambar_infografis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Apbdes = typeof apbdes.$inferSelect;
export type InsertApbdes = typeof apbdes.$inferInsert;

// ============================================================
// 12. tema_website - Website theme & appearance configuration
// ============================================================
export const temaWebsite = mysqlTable("tema_website", {
  id: serial("id").primaryKey(),
  // Status desa/kelurahan
  statusDesa: mysqlEnum("status_desa", ["desa", "kelurahan"])
    .default("desa")
    .notNull(),
  // Tema visual
  tema: mysqlEnum("tema", ["light", "dark", "custom"])
    .default("light")
    .notNull(),
  warnaPrimer: varchar("warna_primer", { length: 7 }).default("#065f46"), // Emerald-700
  warnaSkunder: varchar("warna_skunder", { length: 7 }).default("#f3f4f6"), // Gray-100
  warnaAccent: varchar("warna_accent", { length: 7 }).default("#dc2626"), // Red-600
  // Background images
  backgroundImage1: text("background_image_1"),
  backgroundImage2: text("background_image_2"),
  backgroundImage3: text("background_image_3"),
  backgroundAnimationSpeed: int("background_animation_speed").default(5), // Detik
  // Logo
  logoUrl: text("logo_url"),
  logoKecilUrl: text("logo_kecil_url"),
  // Favicon
  faviconUrl: text("favicon_url"),
  // Running text
  runningTextAktif: int("running_text_aktif").default(1), // 1 untuk aktif, 0 untuk tidak
  // Font
  fontFamily: varchar("font_family", { length: 100 }).default("system-ui"),
  // Border radius bentuk
  borderRadius: mysqlEnum("border_radius", ["none", "sm", "md", "lg", "full"])
    .default("md")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type TemaWebsite = typeof temaWebsite.$inferSelect;
export type InsertTemaWebsite = typeof temaWebsite.$inferInsert;

// ============================================================
// 13. dusun - Sub-villages (Dusun/Lingkungan)
// ============================================================
export const dusun = mysqlTable("dusun", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  deskripsi: text("deskripsi"),
  kepala: varchar("kepala", { length: 255 }),
  kontak: varchar("kontak", { length: 50 }),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Dusun = typeof dusun.$inferSelect;
export type InsertDusun = typeof dusun.$inferInsert;

// ============================================================
// 14. jabatan_desa - Village official positions
// ============================================================
export const jabatanDesa = mysqlTable("jabatan_desa", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(), // e.g., "Kepala Desa", "Sekretaris Desa"
  pejabat: varchar("pejabat", { length: 255 }).notNull(), // Nama pejabat
  fotoUrl: text("foto_url"),
  deskripsi: text("deskripsi"),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type JabatanDesa = typeof jabatanDesa.$inferSelect;
export type InsertJabatanDesa = typeof jabatanDesa.$inferInsert;

// ============================================================
// 15. running_text - Scrolling text banner
// ============================================================
export const runningText = mysqlTable("running_text", {
  id: serial("id").primaryKey(),
  teks: text("teks").notNull(),
  warna: varchar("warna", { length: 7 }).default("#ffffff"),
  backgroundColor: varchar("background_color", { length: 7 }).default("#dc2626"),
  kecepatan: int("kecepatan").default(50), // pixels per second
  aktif: int("aktif").default(1), // 1 = aktif, 0 = nonaktif
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type RunningText = typeof runningText.$inferSelect;
export type InsertRunningText = typeof runningText.$inferInsert;

// ============================================================
// SOTK (Struktur Organisasi dan Tata Kerja) Tables
// ============================================================

// Jabatan dengan parent-child hierarchy untuk membentuk org chart
export const jabatanSotk = mysqlTable("jabatan_sotk", {
  id: serial("id").primaryKey(),
  namaJabatan: varchar("nama_jabatan", { length: 255 }).notNull(),
  pejabatNama: varchar("pejabat_nama", { length: 255 }).notNull(),
  fotoUrl: text("foto_url"), // URL foto pejabat
  deskripsi: text("deskripsi"), // Keterangan/tugas jabatan
  parentId: int("parent_id"), // Self-reference untuk hierarki (null untuk kepala desa)
  urutan: int("urutan").default(0), // Sort order dalam level yang sama
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type JabatanSotk = typeof jabatanSotk.$inferSelect;
export type InsertJabatanSotk = typeof jabatanSotk.$inferInsert;

// Dusun/Lingkungan dengan kepala dusun
export const dusunSotk = mysqlTable("dusun_sotk", {
  id: serial("id").primaryKey(),
  namaDusun: varchar("nama_dusun", { length: 255 }).notNull(),
  kepala: varchar("kepala", { length: 255 }).notNull(),
  fotoKepala: text("foto_kepala"), // URL foto kepala dusun
  deskripsi: text("deskripsi"), // Deskripsi dusun
  urutan: int("urutan").default(0), // Sort order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type DusunSotk = typeof dusunSotk.$inferSelect;
export type InsertDusunSotk = typeof dusunSotk.$inferInsert;

// ============================================================
// 16. pariwisata - Tourism accommodations (penginapan)
// ============================================================
export const pariwisata = mysqlTable("pariwisata", {
  id: serial("id").primaryKey(),
  kategori: mysqlEnum("kategori", ["penginapan", "objek_wisata"]).default("penginapan").notNull(),
  namaPenginapan: varchar("nama_penginapan", { length: 255 }).notNull(),
  alamat: text("alamat").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  deskripsi: text("deskripsi"),
  // Multiple photos stored as JSON array of URLs
  fotoPenginapan: json("foto_penginapan").$type<string[]>().default([]),
  kontakWhatsapp: varchar("kontak_whatsapp", { length: 20 }),
  hargaMin: decimal("harga_min", { precision: 12, scale: 2 }),
  hargaMax: decimal("harga_max", { precision: 12, scale: 2 }),
  satuanHarga: varchar("satuan_harga", { length: 50 }).default("per malam"),
  fasilitas: json("fasilitas").$type<string[]>().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ============================================================
// Pariwisata Reviews (rating & ulasan user)
// ============================================================
export const pariwisataReviews = mysqlTable("pariwisata_reviews", {
  id: serial("id").primaryKey(),
  pariwisataId: int("pariwisata_id").notNull(),
  userId: int("user_id"),
  unionId: varchar("union_id", { length: 255 }).notNull(),

  rating: decimal("rating", { precision: 3, scale: 2 }).notNull(),
  review: text("review").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PariwisataReviews = typeof pariwisataReviews.$inferSelect;
export type InsertPariwisataReviews = typeof pariwisataReviews.$inferInsert;

// ============================================================
// 99. website_visits - track unique daily visits (anonymized)
// ============================================================
export const websiteVisits = mysqlTable("website_visits", {
  id: serial("id").primaryKey(),
  visitDate: varchar("visit_date", { length: 10 }).notNull(), // YYYY-MM-DD
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebsiteVisit = typeof websiteVisits.$inferSelect;
export type InsertWebsiteVisit = typeof websiteVisits.$inferInsert;

export type Pariwisata = typeof pariwisata.$inferSelect;
export type InsertPariwisata = typeof pariwisata.$inferInsert;

// ============================================================
// 17. pendidikan - Educational facilities (schools, colleges, etc)
// ============================================================
export const pendidikan = mysqlTable("pendidikan", {
  id: serial("id").primaryKey(),
  namaSarana: varchar("nama_sarana", { length: 255 }).notNull(),
  jenjang: mysqlEnum("jenjang", [
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
    .notNull(),
  alamat: text("alamat").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  kepala: varchar("kepala", { length: 255 }),
  kontakNomor: varchar("kontak_nomor", { length: 20 }),
  kontakEmail: varchar("kontak_email", { length: 255 }),
  deskripsi: text("deskripsi"),
  fotoUrl: text("foto_url"),
  jumlahGuru: int("jumlah_guru"),
  jumlahSiswa: int("jumlah_siswa"),
  tahunBerdiri: int("tahun_berdiri"),
  statusAkreditasi: varchar("status_akreditasi", { length: 10 }),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Pendidikan = typeof pendidikan.$inferSelect;
export type InsertPendidikan = typeof pendidikan.$inferInsert;

// ============================================================
// 18. kesehatan - Health facilities (hospitals, clinics, etc)
// ============================================================
export const kesehatan = mysqlTable("kesehatan", {
  id: serial("id").primaryKey(),
  namaSarana: varchar("nama_sarana", { length: 255 }).notNull(),
  jenis: mysqlEnum("jenis", [
    "puskesmas",
    "poliklinik",
    "rumah_sakit",
    "apotek",
    "klinik",
    "posyandu",
    "praktik_dokter",
    "praktik_bidan",
  ])
    .notNull(),
  alamat: text("alamat").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  pimpinan: varchar("pimpinan", { length: 255 }),
  kontakNomor: varchar("kontak_nomor", { length: 20 }),
  kontakEmail: varchar("kontak_email", { length: 255 }),
  deskripsi: text("deskripsi"),
  fotoUrl: text("foto_url"),
  jamBuka: varchar("jam_buka", { length: 50 }),
  jamTutup: varchar("jam_tutup", { length: 50 }),
  layanan: json("layanan").$type<string[]>().default([]),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Kesehatan = typeof kesehatan.$inferSelect;
export type InsertKesehatan = typeof kesehatan.$inferInsert;

// ============================================================
// 19. ekonomi - Economic facilities (markets, cooperatives, banks, etc)
// ============================================================
export const ekonomi = mysqlTable("ekonomi", {
  id: serial("id").primaryKey(),
  namaSarana: varchar("nama_sarana", { length: 255 }).notNull(),
  jenis: mysqlEnum("jenis", [
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
  ])
    .notNull(),
  alamat: text("alamat").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  pimpinan: varchar("pimpinan", { length: 255 }),
  kontakNomor: varchar("kontak_nomor", { length: 20 }),
  kontakEmail: varchar("kontak_email", { length: 255 }),
  deskripsi: text("deskripsi"),
  fotoUrl: text("foto_url"),
  jamBuka: varchar("jam_buka", { length: 50 }),
  jamTutup: varchar("jam_tutup", { length: 50 }),
  produk: json("produk").$type<string[]>().default([]),
  urutan: int("urutan").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Ekonomi = typeof ekonomi.$inferSelect;
export type InsertEkonomi = typeof ekonomi.$inferInsert;
