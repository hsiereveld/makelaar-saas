import { pgTable, text, timestamp, uuid, integer, decimal, boolean, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['platform_admin', 'tenant_owner', 'tenant_admin', 'agent', 'assistant', 'viewer']);
export const propertyStatusEnum = pgEnum('property_status', ['draft', 'active', 'under_offer', 'sold', 'withdrawn']);
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'villa', 'studio', 'penthouse', 'townhouse', 'land']);
export const contactTypeEnum = pgEnum('contact_type', ['buyer', 'seller', 'landlord', 'tenant']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  price: integer('price').notNull(),
  bedrooms: integer('bedrooms').default(0),
  bathrooms: integer('bathrooms').default(0),
  livingArea: integer('living_area'),
  status: propertyStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
});
