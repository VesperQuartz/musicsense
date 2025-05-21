import { generateObject, generateText, Output, tool } from 'ai';
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
      throw new Error(error.message);
    }
    return tracks;
  },
};

export const genSongsAgent = async (mood: string) => {
  const response = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `based on the Mood: ${mood} give me 5 or less songs to listen to`,
    maxSteps: 3,
    experimental_output: Output.object({
      schema: z.array(TrackSelectSchema).describe('five or songs to match the mood'),
    }),
    tools: {
      getSongs: tool(getSongsTool),
    },
    system: `
      You are a music recommendation assistant. A user will give you a mood.
      analyze the song descriptions, and return at most 5 songs that best match the mood.
    `,
  });
  console.log(response.text, 'response');
  //@ts-ignore
  return JSON.parse(response.text === '' ? '[]' : response.text).items;
};
