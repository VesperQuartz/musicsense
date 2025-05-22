import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { env } from '../config/env';
import { Webhook } from 'svix';
import { HookEvent, MomoryInsertSchema, TrackInsertSchema, UserCreatedEventSchema } from '../types';
import to from 'await-to-ts';
import { UserRepo } from './repo/user';
import { MusicRepo } from './repo/music';
import { serveStatic } from 'hono/bun';
import { genSongsAgent } from './agents';

const app = new Hono()
  .use('*', logger())
  .use('*', poweredBy())
  .get('/static/*', serveStatic({ root: './' }))
  .basePath('/api');

app.get(
  '/categories/:userId',
  zValidator(
    'param',
    z.object({
      userId: z.string(),
    })
  ),
  async (c) => {
    const { userId } = c.req.valid('param');
    const music = new MusicRepo();
    const [error, result] = await to(music.getUserCategories(userId));
    if (error) {
      console.error(error, 'categories|userId');
      return c.json({ message: error.message }, 500);
    }
    const set = new Set(result);
    return c.json(Array.from(set));
  }
);

app.post(
  '/ai/mood',
  zValidator(
    'json',
    z.object({
      mood: z.string(),
    })
  ),
  async (c) => {
    const { mood } = c.req.valid('json');
    const [error, result] = await to(genSongsAgent(mood));
    if (error) {
      console.error(error, 'ai|mood');
      return c.json({ message: error.message }, 500);
    }
    return c.json(result);
  }
);

app.post('/memories', zValidator('json', MomoryInsertSchema), async (c) => {
  const data = c.req.valid('json');
  const memory = new MusicRepo();
  const [error, memories] = await to(memory.save(data));
  if (error) {
    console.error(error, 'memories');
    return c.json({ message: error.message }, 500);
  }
  return c.json(memories, 201);
});

app.get(
  '/memories/:userId',
  zValidator(
    'param',
    z.object({
      userId: z.string(),
    })
  ),
  async (c) => {
    const { userId } = c.req.valid('param');
    const memory = new MusicRepo();
    const [error, memories] = await to(memory.getUserMemories(userId));
    if (error) {
      console.error(error, 'memories|userId');
      return c.json({ message: error.message }, 500);
    }
    return c.json(memories);
  }
);

app.post('/memories/track', zValidator('json', TrackInsertSchema), async (c) => {
  const data = c.req.valid('json');
  const memory = new MusicRepo();
  const [error, memories] = await to(
    //@ts-ignore
    memory.uploadTrack({ ...data, type: data.type, tags: data.tags })
  );
  if (error) {
    console.error(error, 'memories|track');
    return c.json({ message: error.message }, 500);
  }
  return c.json(memories);
});

app.get(
  '/tracks/:memory/:userId',
  zValidator(
    'param',
    z.object({
      memory: z.string(),
      userId: z.string(),
    })
  ),
  async (c) => {
    const { userId, memory } = c.req.valid('param');
    const tracks = new MusicRepo();
    const [error, uTracks] = await to(tracks.getUserTracks(userId, memory));
    if (error) {
      console.error(error, 'tracks|memory|userId');
      return c.json({ message: error.message }, 500);
    }
    return c.json(uTracks);
  }
);

app.post('/upload', async (c) => {
  const form = await c.req.raw.formData();
  const fileName = form.get('name');
  const file = form.get('file') as File;
  const title = form.get('title') as string;
  const artist = form.get('artist') as string;
  const album = form.get('album') as string;
  const genre = form.get('genre') as string;
  const userId = form.get('userId') as string;
  const duration = form.get('duration') as string;
  const albumArt = form.get('albumArt') as string;
  const tags = form.get('tags') as string;
  const memory = form.get('memory') as string;
  const track = new MusicRepo();
  const payload = {
    title,
    artist,
    album,
    genre,
    duration,
    albumArt,
    tags,
    memory,
    userId,
  };
  const path = `./static/${fileName}`;
  Bun.write(path, await file.arrayBuffer());
  const [error] = await to(
    track.uploadTrack({
      artist: payload.artist,
      memory: payload.memory,
      title: payload.title,
      url: `${env.apiUrl}/${path}`,
      userId: payload.userId,
      artwork: payload.albumArt,
      duration: payload.duration,
      tags: payload.tags.split(',').map((x) => x.trim()),
    })
  );
  if (error) {
    console.error(error, 'upload');
    throw new Error(error.message);
  }
  return c.json({ message: 'music uploaded successfully', path: `${env.apiUrl}/${path}` }, 201);
});

app.post(
  '/webhook/listen',
  zValidator(
    'header',
    z.object({
      'svix-id': z.string().trim(),
      'svix-timestamp': z.string().trim(),
      'svix-signature': z.string().trim(),
    })
  ),
  zValidator('json', UserCreatedEventSchema),
  async (c) => {
    const secret = env.hookSecret;
    const payload = await c.req.text();
    const header = c.req.valid('header');
    const wh = new Webhook(secret);
    const headerPayload = {
      'svix-id': header['svix-id'],
      'svix-timestamp': header['svix-timestamp'],
      'svix-signature': header['svix-signature'],
    };
    let event = null;
    try {
      event = wh.verify(payload, headerPayload) as HookEvent;
      if (event.type === 'user.created') {
        const user = new UserRepo();
        const { username, first_name, last_name, email_addresses, id } = event.data;
        const [userExistError, userExist] = await to(user.findById(id));
        if (userExistError) throw new Error(userExistError.message);
        if (userExist) {
          return c.json({ message: 'User already exist' }, 200);
        }
        await user.save({
          username,
          firstName: first_name,
          email: email_addresses[0].email_address,
          id,
          lastName: last_name,
        });
        return c.json({ message: 'user created' }, 201);
      }
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ message: error.message }, 500);
      }
    }
  }
);

export default {
  fetch: app.fetch,
  idleTimeout: 120,
};
