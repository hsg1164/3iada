import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clinicsTable = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  description: text("description"),
  subscriptionPlan: text("subscription_plan").default("basic"),
  isActive: boolean("is_active").notNull().default(true),
  maxUsers: integer("max_users").default(3),
  maxBranches: integer("max_branches").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClinicSchema = createInsertSchema(clinicsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinicsTable.$inferSelect;
