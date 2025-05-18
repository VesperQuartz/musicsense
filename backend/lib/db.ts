import { drizzle } from 'drizzle-orm/libsql/node';
import { env } from '../config/env';
import { createClient } from '@libsql/client';

const client = createClient({
  url: env.dbUrl,
  authToken: env.dbToken,
});

export const db = drizzle({
  client,
  logger: true,
});
