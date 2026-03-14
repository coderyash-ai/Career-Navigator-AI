import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const roadmapProgress = pgTable("roadmap_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  careerTitle: text("career_title").notNull(),
  milestoneIndex: integer("milestone_index").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  careerField: text("career_field").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  type: text("type").notNull().default("solo"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type RoadmapProgress = typeof roadmapProgress.$inferSelect;
export type QuizResult = typeof quizResults.$inferSelect;
