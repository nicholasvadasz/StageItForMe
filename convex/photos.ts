import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    filename: v.string(),
    originalUrl: v.string(),
    s3Key: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("photos", {
      projectId: args.projectId,
      userId: args.userId,
      filename: args.filename,
      originalUrl: args.originalUrl,
      s3Key: args.s3Key,
      width: args.width,
      height: args.height,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
      status: "uploaded",
    });
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("photos"),
    status: v.union(v.literal("uploaded"), v.literal("processing"), v.literal("completed"), v.literal("error")),
    stagedUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      processedAt: args.status === "completed" ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});