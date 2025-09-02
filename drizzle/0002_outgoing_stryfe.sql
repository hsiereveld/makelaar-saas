CREATE TABLE "client_extended_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"client_subtype" text,
	"investment_profile" text,
	"budget_flexibility" text,
	"timeframe" text,
	"preferred_regions" jsonb DEFAULT '[]'::jsonb,
	"preferred_property_types" jsonb DEFAULT '[]'::jsonb,
	"must_have_amenities" jsonb DEFAULT '[]'::jsonb,
	"preferred_amenities" jsonb DEFAULT '[]'::jsonb,
	"budget_min" integer,
	"budget_max" integer,
	"budget_currency" text DEFAULT 'EUR',
	"financing_required" boolean DEFAULT false,
	"cash_buyer" boolean DEFAULT false,
	"communication_style" text,
	"marketing_consent" jsonb DEFAULT '{}'::jsonb,
	"referral_source" text,
	"utm" jsonb DEFAULT '{}'::jsonb,
	"engagement_level" integer DEFAULT 0,
	"response_speed" text,
	"meeting_willingness" text,
	"decision_making_speed" text,
	"visit_frequency" integer DEFAULT 0,
	"spanish_property_experience" text,
	"legal_knowledge" text,
	"language_barrier" boolean DEFAULT false,
	"local_agent_required" boolean DEFAULT true,
	"last_contact_date" timestamp,
	"total_interactions" integer DEFAULT 0,
	"properties_viewed" integer DEFAULT 0,
	"brochures_downloaded" integer DEFAULT 0,
	"virtual_tours_viewed" integer DEFAULT 0,
	"showings_attended" integer DEFAULT 0,
	"offers_submitted" integer DEFAULT 0,
	"lead_stage" text DEFAULT 'cold',
	"conversion_probability" integer DEFAULT 0,
	"expected_closing_date" timestamp,
	"lost_reason" text,
	"lost_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_extended_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"region" text,
	"province" text,
	"municipality" text,
	"postal_code" text,
	"coordinates" jsonb,
	"property_subtype" text,
	"plot_size" integer,
	"terrace_area" integer,
	"pool_area" integer,
	"built_year" integer,
	"last_renovation" integer,
	"orientation" text,
	"floors" integer DEFAULT 1,
	"condition" text,
	"amenities" jsonb DEFAULT '{}'::jsonb,
	"utilities" jsonb DEFAULT '[]'::jsonb,
	"climate" jsonb DEFAULT '{}'::jsonb,
	"habitation_certificate" boolean DEFAULT false,
	"energy_rating" text,
	"ibi" integer,
	"community_fees" integer,
	"basura" integer,
	"transfer_tax" numeric(5, 2),
	"investment_type" text,
	"rental_potential" jsonb,
	"target_audience" text,
	"key_features" jsonb DEFAULT '[]'::jsonb,
	"lifestyle_keywords" jsonb DEFAULT '[]'::jsonb,
	"distances" jsonb DEFAULT '{}'::jsonb,
	"virtual_tour_url" text,
	"floor_plan_url" text,
	"aerial_photos" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"featured" boolean DEFAULT false,
	"featured_until" timestamp,
	"seo_keywords" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stamdata_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"icon" text,
	"is_system_category" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "stamdata_categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tenant_filter_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"entity_type" text NOT NULL,
	"filter_data" jsonb NOT NULL,
	"is_public" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_master_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"label_en" text,
	"icon" text,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"is_popular" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "client_extended_data" ADD CONSTRAINT "client_extended_data_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_extended_data" ADD CONSTRAINT "property_extended_data_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_filter_presets" ADD CONSTRAINT "tenant_filter_presets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_filter_presets" ADD CONSTRAINT "tenant_filter_presets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_master_data" ADD CONSTRAINT "tenant_master_data_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_master_data" ADD CONSTRAINT "tenant_master_data_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "client_extended_data_contact_idx" ON "client_extended_data" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "client_extended_data_lead_stage_idx" ON "client_extended_data" USING btree ("lead_stage");--> statement-breakpoint
CREATE INDEX "client_extended_data_engagement_idx" ON "client_extended_data" USING btree ("engagement_level");--> statement-breakpoint
CREATE UNIQUE INDEX "property_extended_data_property_idx" ON "property_extended_data" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stamdata_categories_key_idx" ON "stamdata_categories" USING btree ("key");--> statement-breakpoint
CREATE INDEX "tenant_filter_presets_tenant_entity_idx" ON "tenant_filter_presets" USING btree ("tenant_id","entity_type");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_master_data_category_key_idx" ON "tenant_master_data" USING btree ("tenant_id","category","key");--> statement-breakpoint
CREATE INDEX "tenant_master_data_category_sort_idx" ON "tenant_master_data" USING btree ("tenant_id","category","sort_order");