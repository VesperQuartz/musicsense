import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text().primaryKey(),
  firstName: text(),
  lastName: text(),
  username: text(),
  email: text().notNull().unique(),
  updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const memoriesTable = sqliteTable('memories', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  description: text(),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const trackTable = sqliteTable('tracks', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text().notNull(),
  title: text().notNull(),
  artist: text().notNull(),
  album: text().default('unknown'),
  genre: text().default('unknown'),
  date: text().notNull(),
  artwork: text(),
  duration: numeric(),
  tags: text({ mode: 'json' }).$type<string[]>(),
  memory: text().notNull(),
  type: text().$type<'local' | 'remote'>().default('remote'),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});
