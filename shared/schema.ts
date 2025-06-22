import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  techStack: text("tech_stack"),
  expectedUsers: text("expected_users").notNull(),
  uploadedFiles: jsonb("uploaded_files").$type<string[]>().default([]),
  configuration: jsonb("configuration").$type<Record<string, any>>(),
  selectedProvider: text("selected_provider"),
  deploymentStatus: text("deployment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  techStack: true,
  expectedUsers: true,
  uploadedFiles: true,
  configuration: true,
  selectedProvider: true,
});

export const configurationSchema = z.object({
  concurrentUsers: z.string(),
  responseTime: z.string(),
  databaseType: z.string(),
  dataVolume: z.string(),
  autoBackups: z.boolean(),
  sslCertificate: z.string(),
  region: z.string(),
  ddosProtection: z.boolean(),
  gdprCompliance: z.boolean(),
  monitoring: z.boolean(),
  autoScaling: z.string(),
  environmentStrategy: z.string(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type Configuration = z.infer<typeof configurationSchema>;
