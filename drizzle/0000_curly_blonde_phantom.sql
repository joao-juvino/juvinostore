CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop" text NOT NULL,
	"order_id" text NOT NULL,
	"email" text,
	"total_price" text,
	"customer" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"shop" varchar(255) PRIMARY KEY NOT NULL,
	"access_token" varchar(255) NOT NULL,
	"connected_at" timestamp with time zone NOT NULL
);
