import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from './config/env';

export default defineConfig({
  out: './drizzle',
  schema: './src/repo/database/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: env.dbUrl,
    authToken: env.dbToken,
  },
});
