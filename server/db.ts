import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertFolder, folders,
  InsertFile, files,
  InsertComment, comments,
  InsertAuditLog, auditLogs,
  InsertNotification, notifications
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Gestão de Pastas
export async function createFolder(folder: InsertFolder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(folders).values(folder);
  return folder;
}

export async function getFoldersByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(folders).where(eq(folders.type, type as any));
}

export async function getFolderById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(folders).where(eq(folders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getSubFolders(parentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(folders).where(eq(folders.parentId, parentId));
}

export async function getAllFolders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(folders);
}

// Gestão de Ficheiros
export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(files).values(file);
  return file;
}

export async function getFilesByFolder(folderId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(files).where(eq(files.folderId, folderId));
}

export async function deleteFile(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(files).where(eq(files.id, id));
}

// Gestão de Comentários
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(comments).values(comment);
  return comment;
}

export async function getCommentsByFile(fileId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments).where(eq(comments.fileId, fileId));
}

export async function getCommentsByFolder(folderId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments).where(eq(comments.folderId, folderId));
}

// Logs de Auditoria
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).limit(limit);
}

// Notificações
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notifications).values(notification);
  return notification;
}

export async function getUserNotifications(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function markNotificationAsRead(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ read: "yes" }).where(eq(notifications.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}
