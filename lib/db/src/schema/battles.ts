import { pgTable, serial, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { users } from "./users";

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id),
  careerField: text("career_field").notNull(),
  status: text("status").notNull().default("waiting"),
  winnerId: integer("winner_id").references(() => users.id),
  pointsAwarded: integer("points_awarded").notNull().default(50),
  questions: json("questions"),
  player1Score: integer("player1_score").notNull().default(0),
  player2Score: integer("player2_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const battleAnswers = pgTable("battle_answers", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => battles.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  questionIndex: integer("question_index").notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeTaken: integer("time_taken"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Battle = typeof battles.$inferSelect;
export type BattleAnswer = typeof battleAnswers.$inferSelect;
