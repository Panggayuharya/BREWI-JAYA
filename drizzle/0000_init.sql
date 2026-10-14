CREATE TYPE "public"."admin_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TYPE "public"."gallery_category" AS ENUM('interior', 'kopi', 'makanan', 'event', 'customer');--> statement-breakpoint
CREATE TYPE "public"."menu_category_type" AS ENUM('kopi', 'non_kopi', 'makanan');--> statement-breakpoint
CREATE TYPE "public"."news_category" AS ENUM('promo', 'event', 'menu_baru');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"caption" varchar(140) NOT NULL,
	"media_url" text NOT NULL,
	"category" "gallery_category" NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"is_portrait" boolean GENERATED ALWAYS AS (height > width) STORED,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"key" varchar(300) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "menu_book_pages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_book_pages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"image_url" text NOT NULL,
	"alt" varchar(160) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_book_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(60) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"type" "menu_category_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "menu_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "menu_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "menu_item_tags" (
	"menu_item_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "menu_item_tags_menu_item_id_tag_id_pk" PRIMARY KEY("menu_item_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "menu_item_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" varchar(300) DEFAULT '' NOT NULL,
	"base_price" integer NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"image_is_cutout" boolean DEFAULT false NOT NULL,
	"is_signature" boolean DEFAULT false NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_slug_unique" UNIQUE("slug"),
	CONSTRAINT "menu_items_price_check" CHECK ("menu_items"."base_price" >= 0)
);
--> statement-breakpoint
ALTER TABLE "menu_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "news" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "news_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(120) NOT NULL,
	"category" "news_category" NOT NULL,
	"title" varchar(140) NOT NULL,
	"excerpt" varchar(300) NOT NULL,
	"body" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"image_is_cutout" boolean DEFAULT false NOT NULL,
	"published_at" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "news" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "outlet_status" (
	"outlet_slug" varchar(60) PRIMARY KEY NOT NULL,
	"full_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "outlet_status" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(40) NOT NULL,
	"slug" varchar(40) NOT NULL,
	"color_hex" varchar(7) DEFAULT '#3A1F14' NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_tags" ADD CONSTRAINT "menu_item_tags_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_tags" ADD CONSTRAINT "menu_item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outlet_status" ADD CONSTRAINT "outlet_status_updated_by_admins_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_id_index" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "gallery_items_is_portrait_sort_order_index" ON "gallery_items" USING btree ("is_portrait","sort_order");--> statement-breakpoint
CREATE INDEX "menu_categories_type_sort_order_index" ON "menu_categories" USING btree ("type","sort_order");--> statement-breakpoint
CREATE INDEX "menu_item_tags_tag_id_index" ON "menu_item_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "menu_items_category_id_is_available_sort_order_index" ON "menu_items" USING btree ("category_id","is_available","sort_order");--> statement-breakpoint
CREATE INDEX "news_is_active_published_at_index" ON "news" USING btree ("is_active","published_at");