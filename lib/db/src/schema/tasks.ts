import { pgTable, serial, text, boolean, date, timestamp, integer } from "drizzle-orm/pg-core";
import { clinicsTable } from "./clinics";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  assignedTo: text("assigned_to"),
  priority: text("priority").notNull().default("normal"),
  isCompleted: boolean("is_completed").notNull().default(false),
  dueDate: date("due_date"),
  branch: text("branch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Task = typeof tasksTable.$inferSelect;
