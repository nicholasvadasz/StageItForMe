import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    photoId: v.id("photos"),
    userId: v.string(),
    editData: v.string(), // JSON string of staging options
    resultUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stagingEdits", {
      photoId: args.photoId,
      userId: args.userId,
      editData: args.editData,
      resultUrl: args.resultUrl,
      createdAt: Date.now(),
      status: "pending",
    });
  },
});

export const getByPhotoId = query({
  args: { photoId: v.id("photos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stagingEdits")
      .withIndex("by_photo_id", (q) => q.eq("photoId", args.photoId))
      .order("desc")
      .collect();
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stagingEdits")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("stagingEdits"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("error")),
    resultUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("stagingEdits") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});