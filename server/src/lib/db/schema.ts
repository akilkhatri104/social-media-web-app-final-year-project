import * as p from 'drizzle-orm/pg-core';
import { user } from '../auth-schema.ts';

export const post = p.pgTable(
  'post',
  {
    id: p.serial('id').primaryKey(),
    userId: p
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentPostId: p.integer('parent_post_id'),
    content: p.text('content').notNull(),
    visibility: p
      .text('visibility', { enum: ['public', 'followers'] })
      .default('public'),
    createdAt: p.timestamp('created_at').defaultNow().notNull(),
    updatedAt: p
      .timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    p.foreignKey({
      columns: [table.parentPostId],
      foreignColumns: [table.id],
      name: 'parent_post_fk',
    }),
  ],
);

export const like = p.pgTable('like', {
  id: p.serial('id').notNull().primaryKey(),
  userId: p
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  postId: p
    .integer('post_id')
    .notNull()
    .references(() => post.id, { onDelete: 'cascade' }),
  createdAt: p.timestamp('created_at').notNull().defaultNow(),
  updatedAt: p
    .timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const media = p.pgTable('media', {
  id: p.serial('id').primaryKey(),
  type: p.text('type', { enum: ['auto', 'image', 'video', 'raw'] }),
  url: p.text('url').notNull(),
  thumbnailUrl: p.text('thumbnail_url'),
  postId: p
    .integer('post_id')
    .notNull()
    .references(() => post.id, { onDelete: 'cascade' }),
  createdAt: p.timestamp('created_at').defaultNow().notNull(),
  updatedAt: p
    .timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const follow = p.pgTable('follow', {
  id: p.serial('id').primaryKey(),
  followerId: p
    .text('followerId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  followingId: p
    .text('followingId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: p.timestamp('created_at').defaultNow().notNull(),
  updatedAt: p
    .timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

import { relations, sql } from 'drizzle-orm';

// 1. Post Relations (Connects posts to media, likes, and itself for comments)
export const postRelations = relations(post, ({ one, many }) => ({
  media: many(media),
  likes: many(like),
  // Self-referencing relation for comments
  comments: many(post, { relationName: 'post_comments' }),
  parentPost: one(post, {
    fields: [post.parentPostId],
    references: [post.id],
    relationName: 'post_comments',
  }),
  author: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
}));

// 2. Media Relations
export const mediaRelations = relations(media, ({ one }) => ({
  post: one(post, {
    fields: [media.postId],
    references: [post.id],
  }),
}));

// 3. Like Relations
export const likeRelations = relations(like, ({ one }) => ({
  post: one(post, {
    fields: [like.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [like.userId],
    references: [user.id],
  }),
}));
