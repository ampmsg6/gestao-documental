import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Pastas principais do sistema
export const folders = mysqlTable("folders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["tribunais", "pareceres", "outros_assuntos", "honorarios"]).notNull(),
  parentId: varchar("parentId", { length: 64 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  // Metadados específicos para processos judiciais
  tribunal: text("tribunal"),
  local: text("local"),
  numeroProcesso: varchar("numeroProcesso", { length: 255 }),
  juizo: text("juizo"),
  tipoAcao: text("tipoAcao"),
  // Metadados para pareceres
  dataParecer: timestamp("dataParecer"),
  nomeParecer: text("nomeParecer"),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

// Ficheiros e links partilhados
export const files = mysqlTable("files", {
  id: varchar("id", { length: 64 }).primaryKey(),
  folderId: varchar("folderId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["upload", "link"]).notNull(),
  // Para uploads diretos
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: varchar("fileSize", { length: 50 }),
  // Para links externos
  externalUrl: text("externalUrl"),
  linkPlatform: mysqlEnum("linkPlatform", ["onedrive", "googledrive", "other"]),
  description: text("description"),
  uploadedBy: varchar("uploadedBy", { length: 64 }).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// Comentários em ficheiros
export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fileId: varchar("fileId", { length: 64 }),
  folderId: varchar("folderId", { length: 64 }),
  content: text("content").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// Logs de auditoria
export const auditLogs = mysqlTable("auditLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: varchar("entityId", { length: 64 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Notificações
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["upload", "comment", "folder_created", "link_shared"]).notNull(),
  entityId: varchar("entityId", { length: 64 }),
  read: mysqlEnum("read", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
