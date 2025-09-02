DROP INDEX "user_tenant_role_idx";--> statement-breakpoint
ALTER TABLE "user_tenant_roles" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "user_tenant_role_idx" ON "user_tenant_roles" USING btree ("user_id","tenant_id");