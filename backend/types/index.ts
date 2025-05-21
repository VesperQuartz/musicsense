import { z } from 'zod';
import { CreateSelectSchema, createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { memoriesTable, trackTable, usersTable } from '../src/repo/database/schema';

export const UserCreatedEventSchema = z.object({
  data: z.object({
    birthday: z.string().nullish(),
    created_at: z.number(),
    email_addresses: z.array(
      z.object({
        email_address: z.string().email(),
        id: z.string(),
        linked_to: z.array(z.any()),
        object: z.string(),
        verification: z.object({
          status: z.union([z.literal('verified'), z.literal('unverified'), z.string()]),
          strategy: z.string(),
        }),
      })
    ),
    external_accounts: z.array(z.any()),
    external_id: z.string().nullish(),
    first_name: z.string(),
    gender: z.string().nullish(),
    id: z.string(),
    image_url: z.string().url(),
    last_name: z.string(),
    last_sign_in_at: z.number().nullish(),
    object: z.any(),
    password_enabled: z.boolean(),
    phone_numbers: z.array(z.any()),
    primary_email_address_id: z.string(),
    primary_phone_number_id: z.string().nullable(),
    primary_web3_wallet_id: z.string().nullable(),
    private_metadata: z.record(z.unknown()),
    profile_image_url: z.string().url(),
    public_metadata: z.any(),
    two_factor_enabled: z.boolean(),
    unsafe_metadata: z.record(z.unknown()),
    updated_at: z.number(),
    username: z.string().nullable(),
    web3_wallets: z.array(z.any()),
  }),
  event_attributes: z.object({
    http_request: z.object({
      client_ip: z.string(),
      user_agent: z.string(),
    }),
  }),
  object: z.string(),
  timestamp: z.number(),
  type: z.string(),
});

export type HookEvent = z.infer<typeof UserCreatedEventSchema>;
export type UserSelect = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

export type MemorySelect = typeof memoriesTable.$inferSelect;
export type MomoryInsert = typeof memoriesTable.$inferInsert;
export const MomoryInsertSchema = createInsertSchema(memoriesTable);

export type TrackSelect = typeof trackTable.$inferSelect;
export type TrackInsert = typeof trackTable.$inferInsert;
export const TrackInsertSchema = createInsertSchema(trackTable);
export const TrackSelectSchema = createSelectSchema(trackTable);
