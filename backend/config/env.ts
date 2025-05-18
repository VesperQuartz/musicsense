import { z } from 'zod';

const envSchema = z.object({
  apiUrl: z.string().trim(),
  hookSecret: z.string().trim(),
  dbUrl: z.string().trim(),
  dbToken: z.string().trim(),
  blobKey: z.string().trim(),
  spotifyUrl: z.string().trim(),
});

export const env = envSchema.parse({
  apiUrl: process.env.API_URL,
  hookSecret: process.env.WEBHOOK_SECRET,
  dbUrl: process.env.TURSO_DATABASE_URL,
  dbToken: process.env.TURSO_AUTH_TOKEN,
  blobKey: process.env.BLOB_READ_WRITE_TOKEN,
  spotifyUrl: process.env.SPOTIFY_URL,
});
