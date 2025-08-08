CREATE TABLE "customer_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"name" text,
	"phone" text,
	"company" text,
	"address1" text,
	"address2" text,
	"city" text,
	"province" text,
	"country" text,
	"country_code" text,
	"province_code" text,
	"zip" text,
	"default" text
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"state" text,
	"currency" text,
	"first_name" text,
	"last_name" text,
	"verified_email" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"tax_exempt" text,
	"admin_graphql_api_id" text
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "customer";