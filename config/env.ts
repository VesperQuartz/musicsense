import z from 'zod';
const envSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export const env = envSchema.parse({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});
