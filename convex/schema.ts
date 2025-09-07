import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
  }).index("by_user_id", ["userId"])
   .index("by_email", ["email"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"])
   .index("by_created_at", ["createdAt"]),

  photos: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    filename: v.string(),
    originalUrl: v.string(),
    stagedUrl: v.optional(v.string()),
    s3Key: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    uploadedAt: v.number(),
    processedAt: v.optional(v.number()),
    status: v.union(v.literal("uploaded"), v.literal("processing"), v.literal("completed"), v.literal("error")),
  }).index("by_project_id", ["projectId"])
   .index("by_user_id", ["userId"])
   .index("by_status", ["status"]),

  stagingEdits: defineTable({
    photoId: v.id("photos"),
    userId: v.string(),
    editData: v.string(), // JSON string of edit parameters
    resultUrl: v.optional(v.string()),
    createdAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("error")),
  }).index("by_photo_id", ["photoId"])
   .index("by_user_id", ["userId"])
   .index("by_created_at", ["createdAt"]),
});