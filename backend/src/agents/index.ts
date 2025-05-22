import { generateText, Output, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { TrackSelectSchema } from '../../types';
import to from 'await-to-ts';
import { MusicRepo } from '../repo/music';

const getSongsTool = {
  name: 'getSongs',
  description: 'Get a list of all available remote songs from the database.',
  parameters: z.object({}),
  execute: async () => {
    const music = new MusicRepo();
    const [error, tracks] = await to(music.getRemoteTracks());
    if (error) {
      console.error(error, 'ERR');
      throw new Error(error.message);
    }
    console.log(tracks, 'TRACKS');
    return tracks;
  },
};

export const genSongsAgent = async (mood: string) => {
  const response = await generateText({
    model: openai('gpt-4.1'),
    prompt: `based on the Mood: '${mood}' give me 5 or less songs to listen to`,
    maxSteps: 3,
    experimental_output: Output.object({
      schema: z.array(TrackSelectSchema).describe('resulting array of tracks'),
    }),
    tools: {
      getSongs: tool(getSongsTool),
    },
    system: `
      You are a music recommendation assistant. A user will give you a mood or a description of their mood.
      analyze the songs provided to you in tools, and return at most 5 songs that best match the mood.
    `,
  });
  console.log(response.experimental_output, 'ExTOOLx');
  console.log(response.text, 'TOOLx');
  const obj = JSON.parse(response.text);
  const keys = Object.keys(JSON.parse(response.text));
  //@ts-ignore
  return obj[keys[0]];
};
