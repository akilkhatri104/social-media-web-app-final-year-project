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
  type: p.text('type', { enum: ['image', 'video'] }),
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
