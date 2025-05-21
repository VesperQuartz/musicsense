import z from 'zod';
const envSchema = z.object({
  baseUrl: z.string(),
  clientSecret: z.string(),
  clientId: z.string(),
  spotifyUrl: z.string(),
  publishKey: z.string(),
});

export const env = envSchema.parse({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  clientSecret: process.env.EXPO_PUBLIC_CLIENT_SECRET,
  clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  spotifyUrl: process.env.EXPO_PUBLIC_SPOTIFY_URL,
  publishKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
