import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processed: boolean("processed").default(false),
  extractedData: jsonb("extracted_data"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // Remote, On-site, Hybrid
  level: text("level").notNull(), // Entry, Mid, Senior
  salary: text("salary").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  experienceYears: integer("experience_years").notNull(),
  postedDate: timestamp("posted_date").defaultNow(),
});

export const jobRecommendations = pgTable("job_recommendations", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull(),
  jobId: integer("job_id").notNull(),
  matchScore: integer("match_score").notNull(), // 0-100
  matchingSkills: text("matching_skills").array().notNull(),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  uploadedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedDate: true,
});

export const insertJobRecommendationSchema = createInsertSchema(jobRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJobRecommendation = z.infer<typeof insertJobRecommendationSchema>;
export type JobRecommendation = typeof jobRecommendations.$inferSelect;

// Extended types for API responses
export const extractedResumeDataSchema = z.object({
  skills: z.array(z.string()),
  experience: z.string(),
  education: z.string(),
  recentRole: z.string(),
  experienceYears: z.number(),
  summary: z.string(),
});

export type ExtractedResumeData = z.infer<typeof extractedResumeDataSchema>;

export const jobWithRecommendationSchema = z.object({
  id: z.number(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  type: z.string(),
  level: z.string(),
  salary: z.string(),
  description: z.string(),
  requiredSkills: z.array(z.string()),
  experienceYears: z.number(),
  postedDate: z.string(),
  matchScore: z.number(),
  matchingSkills: z.array(z.string()),
  reasoning: z.string().optional(),
});

export type JobWithRecommendation = z.infer<typeof jobWithRecommendationSchema>;
