import { pgTable, varchar, timestamp, serial, text, jsonb } from 'drizzle-orm/pg-core';

export const shops = pgTable('shops', {
  shop: varchar('shop', { length: 255 }).primaryKey(),
  accessToken: varchar('access_token', { length: 255 }).notNull(),
  connectedAt: timestamp('connected_at', { withTimezone: true }).notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  shop: text('shop').notNull(),
  orderId: text('order_id').notNull(),
  email: text('email'),
  totalPrice: text('total_price'),
  customerId: text('customer_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  email: text('email'),
  phone: text('phone'),
  state: text('state'),
  currency: text('currency'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  verifiedEmail: text('verified_email'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  taxExempt: text('tax_exempt'),
  adminGraphqlApiId: text('admin_graphql_api_id'),
});

export const customerAddresses = pgTable('customer_addresses', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  name: text('name'),
  phone: text('phone'),
  company: text('company'),
  address1: text('address1'),
  address2: text('address2'),
  city: text('city'),
  province: text('province'),
  country: text('country'),
  countryCode: text('country_code'),
  provinceCode: text('province_code'),
  zip: text('zip'),
  isDefault: text('default'),
});


