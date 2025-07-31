import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const shops = pgTable('shops', {
  shop: varchar('shop', { length: 255 }).primaryKey(),
  accessToken: varchar('access_token', { length: 255 }).notNull(),
  connectedAt: timestamp('connected_at', { withTimezone: true }).notNull(),
});
