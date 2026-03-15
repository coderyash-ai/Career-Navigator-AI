import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const roadmapProgress = sqliteTable("roadmap_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  careerTitle: text("career_title").notNull(),
  milestoneIndex: integer("milestone_index").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const quizResults = sqliteTable("quiz_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  careerField: text("career_field").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  type: text("type").notNull().default("solo"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type RoadmapProgress = typeof roadmapProgress.$inferSelect;
export type QuizResult = typeof quizResults.$inferSelect;
