import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  folders: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["tribunais", "pareceres", "outros_assuntos", "honorarios"]),
        parentId: z.string().optional(),
        tribunal: z.string().optional(),
        local: z.string().optional(),
        numeroProcesso: z.string().optional(),
        juizo: z.string().optional(),
        tipoAcao: z.string().optional(),
        dataParecer: z.date().optional(),
        nomeParecer: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const folderId = nanoid();
        const folder = await db.createFolder({
          id: folderId,
          ...input,
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          id: nanoid(),
          userId: ctx.user.id,
          action: "create_folder",
          entityType: "folder",
          entityId: folderId,
          details: JSON.stringify({ name: input.name, type: input.type }),
        });
        
        return folder;
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getAllFolders();
    }),
    
    getByType: protectedProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ input }) => {
        return await db.getFoldersByType(input.type);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getFolderById(input.id);
      }),
    
    getSubFolders: protectedProcedure
      .input(z.object({ parentId: z.string() }))
      .query(async ({ input }) => {
        return await db.getSubFolders(input.parentId);
      }),
  }),

  files: router({
    upload: protectedProcedure
      .input(z.object({
        folderId: z.string(),
        name: z.string(),
        fileData: z.string(),
        fileType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fileId = nanoid();
        const buffer = Buffer.from(input.fileData, 'base64');
        const key = `files/${fileId}-${input.name}`;
        
        const { url } = await storagePut(key, buffer, input.fileType);
        
        const file = await db.createFile({
          id: fileId,
          folderId: input.folderId,
          name: input.name,
          type: "upload",
          fileUrl: url,
          fileType: input.fileType,
          fileSize: buffer.length.toString(),
          description: input.description,
          uploadedBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          id: nanoid(),
          userId: ctx.user.id,
          action: "upload_file",
          entityType: "file",
          entityId: fileId,
          details: JSON.stringify({ name: input.name, folderId: input.folderId }),
        });
        
        const users = await db.getAllUsers();
        for (const user of users) {
          if (user.id !== ctx.user.id) {
            await db.createNotification({
              id: nanoid(),
              userId: user.id,
              title: "Novo ficheiro carregado",
              message: `${ctx.user.name} carregou o ficheiro "${input.name}"`,
              type: "upload",
              entityId: fileId,
            });
          }
        }
        
        return file;
      }),
    
    shareLink: protectedProcedure
      .input(z.object({
        folderId: z.string(),
        name: z.string(),
        externalUrl: z.string(),
        linkPlatform: z.enum(["onedrive", "googledrive", "other"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fileId = nanoid();
        
        const file = await db.createFile({
          id: fileId,
          folderId: input.folderId,
          name: input.name,
          type: "link",
          externalUrl: input.externalUrl,
          linkPlatform: input.linkPlatform,
          description: input.description,
          uploadedBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          id: nanoid(),
          userId: ctx.user.id,
          action: "share_link",
          entityType: "file",
          entityId: fileId,
          details: JSON.stringify({ name: input.name, url: input.externalUrl }),
        });
        
        const users = await db.getAllUsers();
        for (const user of users) {
          if (user.id !== ctx.user.id) {
            await db.createNotification({
              id: nanoid(),
              userId: user.id,
              title: "Novo link partilhado",
              message: `${ctx.user.name} partilhou o link "${input.name}"`,
              type: "link_shared",
              entityId: fileId,
            });
          }
        }
        
        return file;
      }),
    
    listByFolder: protectedProcedure
      .input(z.object({ folderId: z.string() }))
      .query(async ({ input }) => {
        return await db.getFilesByFolder(input.folderId);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFile(input.id);
        
        await db.createAuditLog({
          id: nanoid(),
          userId: ctx.user.id,
          action: "delete_file",
          entityType: "file",
          entityId: input.id,
          details: JSON.stringify({ fileId: input.id }),
        });
        
        return { success: true };
      }),
  }),

  comments: router({
    create: protectedProcedure
      .input(z.object({
        fileId: z.string().optional(),
        folderId: z.string().optional(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = nanoid();
        
        const comment = await db.createComment({
          id: commentId,
          fileId: input.fileId,
          folderId: input.folderId,
          content: input.content,
          createdBy: ctx.user.id,
        });
        
        await db.createAuditLog({
          id: nanoid(),
          userId: ctx.user.id,
          action: "create_comment",
          entityType: "comment",
          entityId: commentId,
          details: JSON.stringify({ content: input.content }),
        });
        
        const users = await db.getAllUsers();
        for (const user of users) {
          if (user.id !== ctx.user.id) {
            await db.createNotification({
              id: nanoid(),
              userId: user.id,
              title: "Novo comentário",
              message: `${ctx.user.name} adicionou um comentário`,
              type: "comment",
              entityId: commentId,
            });
          }
        }
        
        return comment;
      }),
    
    listByFile: protectedProcedure
      .input(z.object({ fileId: z.string() }))
      .query(async ({ input }) => {
        return await db.getCommentsByFile(input.fileId);
      }),
    
    listByFolder: protectedProcedure
      .input(z.object({ folderId: z.string() }))
      .query(async ({ input }) => {
        return await db.getCommentsByFolder(input.folderId);
      }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotifications(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),

  audit: router({
    list: protectedProcedure.query(async () => {
      return await db.getAuditLogs(100);
    }),
  }),
});

export type AppRouter = typeof appRouter;
