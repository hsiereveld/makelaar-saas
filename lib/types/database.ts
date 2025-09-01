import { InferSelectModel } from 'drizzle-orm'
import { properties, tenants } from '@/lib/db/schema'

export type Property = InferSelectModel<typeof properties>
export type Tenant = InferSelectModel<typeof tenants>

export type PropertyStatus = 'draft' | 'active' | 'under_offer' | 'sold' | 'withdrawn'
export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'penthouse' | 'townhouse' | 'land'
export type ContactType = 'buyer' | 'seller' | 'landlord' | 'tenant'
export type UserRole = 'platform_admin' | 'tenant_owner' | 'tenant_admin' | 'agent' | 'assistant' | 'viewer'