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

// AI-generated template schemas
export const aiTemplateSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure"]),
  templateCode: z.string(),
  estimatedCost: z.number(),
  reasoning: z.string(),
  optimizations: z.array(z.string()),
  securityConsiderations: z.array(z.string()),
  scalabilityFeatures: z.array(z.string()),
});

export const architectureAnalysisSchema = z.object({
  components: z.array(z.object({
    name: z.string(),
    type: z.string(),
    purpose: z.string(),
    connections: z.array(z.object({
      target: z.string(),
      protocol: z.string(),
      port: z.string(),
      security: z.string(),
    })),
    securityControls: z.array(z.string()).optional(),
  })),
  dataFlow: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.string(),
    protocol: z.string(),
    port: z.string(),
    description: z.string(),
    security: z.string(),
  })),
  scalingStrategy: z.string(),
  bottlenecks: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    rationale: z.string(),
    implementation: z.string(),
    impact: z.string(),
  })),
});

export const recommendationsSchema = z.object({
  performance: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact: z.enum(["high", "medium", "low"]),
    effort: z.enum(["high", "medium", "low"]),
    implementation: z.string(),
  })),
  security: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(["critical", "high", "medium", "low"]),
    implementation: z.string(),
    protection: z.string(),
  })),
  cost: z.array(z.object({
    title: z.string(),
    description: z.string(),
    savings: z.string(),
    tradeoffs: z.string(),
    breakdown: z.string(),
  })),
  cloudFeatures: z.object({
    AWS: z.object({
      securityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
      scalabilityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
    }),
    GCP: z.object({
      securityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
      scalabilityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
    }),
    Azure: z.object({
      securityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
      scalabilityFeatures: z.array(z.object({
        name: z.string(),
        what: z.string(),
        how: z.string(),
        why: z.string(),
      })),
    }),
  }),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type Configuration = z.infer<typeof configurationSchema>;
export type AITemplate = z.infer<typeof aiTemplateSchema>;
export type ArchitectureAnalysis = z.infer<typeof architectureAnalysisSchema>;
export type Recommendations = z.infer<typeof recommendationsSchema>;
