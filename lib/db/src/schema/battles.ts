import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const battles = sqliteTable("battles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id),
  careerField: text("career_field").notNull(),
  status: text("status").notNull().default("waiting"),
  winnerId: integer("winner_id").references(() => users.id),
  pointsAwarded: integer("points_awarded").notNull().default(50),
  questions: text("questions", { mode: "json" }),
  player1Score: integer("player1_score").notNull().default(0),
  player2Score: integer("player2_score").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
});

export const battleAnswers = sqliteTable("battle_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  battleId: integer("battle_id").notNull().references(() => battles.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  questionIndex: integer("question_index").notNull(),
  answer: text("answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  timeTaken: integer("time_taken"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Battle = typeof battles.$inferSelect;
export type BattleAnswer = typeof battleAnswers.$inferSelect;
