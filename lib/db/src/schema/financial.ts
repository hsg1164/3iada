import { pgTable, serial, text, numeric, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";

export const vaultsTable = pgTable("vaults", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vaultTransactionsTable = pgTable("vault_transactions", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  vaultId: integer("vault_id").notNull().references(() => vaultsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  targetVaultId: integer("target_vault_id"),
  note: text("note"),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expenseCategoriesTable = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => expenseCategoriesTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  vaultId: integer("vault_id").notNull().references(() => vaultsTable.id, { onDelete: "cascade" }),
  performedBy: text("performed_by"),
  note: text("note"),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routineExpensesTable = pgTable("routine_expenses", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().default(1).references(() => clinicsTable.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => expenseCategoriesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default("monthly"), // daily, weekly, monthly
  branch: text("branch"),
  note: text("note"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Vault = typeof vaultsTable.$inferSelect;
export type VaultTransaction = typeof vaultTransactionsTable.$inferSelect;
export type Expense = typeof expensesTable.$inferSelect;
export type ExpenseCategory = typeof expenseCategoriesTable.$inferSelect;
export type RoutineExpense = typeof routineExpensesTable.$inferSelect;
