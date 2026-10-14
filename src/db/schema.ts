// Skema database (Postgres/Supabase). Nama kolom ditulis camelCase di sini, disimpan snake_case (casing: "snake_case").
// Semua tabel memakai RLS tanpa policy: tidak bisa dibaca lewat Data API Supabase (anon/publishable key);
// aplikasi mengakses lewat koneksi Postgres langsung (role pemilik tabel).
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", ["owner", "staff"]);
export const menuCategoryType = pgEnum("menu_category_type", ["kopi", "non_kopi", "makanan"]);
export const galleryCategory = pgEnum("gallery_category", ["interior", "kopi", "makanan", "event", "customer"]);
export const newsCategory = pgEnum("news_category", ["promo", "event", "menu_baru"]);

const id = () => integer().primaryKey().generatedAlwaysAsIdentity();
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const sortOrder = () => integer().notNull().default(0);

/* ── Admin & sesi ─────────────────────────────────────────────────────────── */

export const admins = pgTable("admins", {
  id: id(),
  name: varchar({ length: 100 }).notNull(),
  /** Selalu disimpan huruf kecil */
  email: varchar({ length: 254 }).notNull().unique(),
  passwordHash: text().notNull(),
  role: adminRole().notNull().default("staff"),
  createdAt: createdAt(),
}).enableRLS();

/** `id` = SHA-256 dari token cookie; token mentah tidak pernah disimpan. */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: varchar({ length: 64 }).primaryKey(),
    adminId: integer()
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.adminId)],
).enableRLS();

/** Penghitung gagal login per IP / per email (rate limiting). */
export const loginAttempts = pgTable("login_attempts", {
  key: varchar({ length: 300 }).primaryKey(),
  count: integer().notNull().default(0),
  resetAt: timestamp({ withTimezone: true }).notNull(),
}).enableRLS();

/* ── Menu ─────────────────────────────────────────────────────────────────── */

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: id(),
    name: varchar({ length: 60 }).notNull(),
    slug: varchar({ length: 60 }).notNull().unique(),
    type: menuCategoryType().notNull(),
    sortOrder: sortOrder(),
    isActive: boolean().notNull().default(true),
  },
  (t) => [index().on(t.type, t.sortOrder)],
).enableRLS();

export const tags = pgTable("tags", {
  id: id(),
  name: varchar({ length: 40 }).notNull(),
  slug: varchar({ length: 40 }).notNull().unique(),
  colorHex: varchar({ length: 7 }).notNull().default("#3A1F14"),
}).enableRLS();

export const menuItems = pgTable(
  "menu_items",
  {
    id: id(),
    categoryId: integer()
      .notNull()
      .references(() => menuCategories.id, { onDelete: "restrict" }),
    name: varchar({ length: 80 }).notNull(),
    slug: varchar({ length: 100 }).notNull().unique(),
    description: varchar({ length: 300 }).notNull().default(""),
    /** Rupiah, tanpa desimal */
    basePrice: integer().notNull(),
    imageUrl: text().notNull().default(""),
    /** true = foto produk transparan (tampil tanpa bingkai) */
    imageIsCutout: boolean().notNull().default(false),
    isSignature: boolean().notNull().default(false),
    isBestSeller: boolean().notNull().default(false),
    isNew: boolean().notNull().default(false),
    isAvailable: boolean().notNull().default(true),
    sortOrder: sortOrder(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.categoryId, t.isAvailable, t.sortOrder),
    check("menu_items_price_check", sql`${t.basePrice} >= 0`),
  ],
).enableRLS();

export const menuItemTags = pgTable(
  "menu_item_tags",
  {
    menuItemId: integer()
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    tagId: integer()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.menuItemId, t.tagId] }), index().on(t.tagId)],
).enableRLS();

/** Halaman buku menu cetak (flipbook di /menu). */
export const menuBookPages = pgTable("menu_book_pages", {
  id: id(),
  imageUrl: text().notNull(),
  alt: varchar({ length: 160 }).notNull(),
  sortOrder: sortOrder(),
  createdAt: createdAt(),
}).enableRLS();

/* ── Galeri, berita, status tempat ────────────────────────────────────────── */

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: id(),
    caption: varchar({ length: 140 }).notNull(),
    mediaUrl: text().notNull(),
    category: galleryCategory().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    /** Dihitung otomatis: potret tampil di baris atas galeri, landscape di baris bawah */
    isPortrait: boolean().generatedAlwaysAs(sql`height > width`),
    isFeatured: boolean().notNull().default(false),
    sortOrder: sortOrder(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.isPortrait, t.sortOrder)],
).enableRLS();

export const news = pgTable(
  "news",
  {
    id: id(),
    slug: varchar({ length: 120 }).notNull().unique(),
    category: newsCategory().notNull(),
    title: varchar({ length: 140 }).notNull(),
    excerpt: varchar({ length: 300 }).notNull(),
    /** Paragraf dipisah baris kosong */
    body: text().notNull(),
    imageUrl: text().notNull().default(""),
    imageIsCutout: boolean().notNull().default(false),
    publishedAt: date({ mode: "string" }).notNull(),
    isActive: boolean().notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index().on(t.isActive, t.publishedAt)],
).enableRLS();

/**
 * Status "tempat penuh" per outlet. Data outlet (alamat, jam, kontak) tetap di src/data/outlets.ts;
 * tabel ini hanya menyimpan status yang diubah admin. `fullUntil` lewat = otomatis tersedia lagi.
 */
export const outletStatus = pgTable("outlet_status", {
  outletSlug: varchar({ length: 60 }).primaryKey(),
  fullUntil: timestamp({ withTimezone: true }),
  updatedAt: updatedAt(),
  updatedBy: integer().references(() => admins.id, { onDelete: "set null" }),
}).enableRLS();

/* ── Relasi (untuk query relasional) ──────────────────────────────────────── */

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
  tags: many(menuItemTags),
}));

export const menuItemTagsRelations = relations(menuItemTags, ({ one }) => ({
  menuItem: one(menuItems, { fields: [menuItemTags.menuItemId], references: [menuItems.id] }),
  tag: one(tags, { fields: [menuItemTags.tagId], references: [tags.id] }),
}));
