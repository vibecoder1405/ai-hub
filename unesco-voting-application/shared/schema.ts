import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Heritage Sites schema
export const heritageSites = pgTable("heritage_sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  inscribedYear: integer("inscribed_year").notNull(),
  category: text("category").notNull(), // CULTURAL, NATURAL, MIXED
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").notNull().default(1500), // ELO rating
  rank: integer("rank"),
});

export const insertHeritageSiteSchema = createInsertSchema(heritageSites).omit({
  id: true,
  rating: true,
  rank: true,
});

export type InsertHeritageSite = z.infer<typeof insertHeritageSiteSchema>;
export type HeritageSite = typeof heritageSites.$inferSelect;

// Voting history schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  winnerId: integer("winner_id").notNull(),
  loserId: integer("loser_id").notNull(),
  winnerPrevRating: integer("winner_prev_rating").notNull(),
  loserPrevRating: integer("loser_prev_rating").notNull(),
  winnerNewRating: integer("winner_new_rating").notNull(),
  loserNewRating: integer("loser_new_rating").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  timestamp: true,
});

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Matchup-specific schema for returning paired heritage sites
// Define a common schema for site to avoid redundancy
const siteSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  state: z.string(),
  inscribedYear: z.number(),
  category: z.string(),
  imageUrl: z.string(),
  rating: z.number(),
  rank: z.number().optional(),
});

export const matchupSchema = z.object({
  leftSite: siteSchema,
  rightSite: siteSchema,
  matchupId: z.number(),
});

export type Matchup = z.infer<typeof matchupSchema>;
