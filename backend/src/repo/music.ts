import to from 'await-to-ts';
import { MemorySelect, MomoryInsert, TrackInsert, TrackSelect } from '../../types';
import { db } from '../../lib/db';
import { memoriesTable, trackTable } from './database/schema';
import { and, eq } from 'drizzle-orm';

interface IMusicRepo {
  save(data: MomoryInsert): Promise<MemorySelect>;
  uploadTrack(data: TrackInsert): Promise<TrackSelect>;
  getUserMemories(userId: string): Promise<MemorySelect[] | null>;
  getUserTracks(userId: string, memory: string): Promise<TrackInsert[] | null>;
}

export class MusicRepo implements IMusicRepo {
  async save(data: MomoryInsert): Promise<MemorySelect> {
    const [error, memory] = await to(db.insert(memoriesTable).values(data).returning());
    if (error) throw new Error(error.message);
    return memory[0];
  }
  async getUserMemories(userId: string): Promise<MemorySelect[] | null> {
    const [error, memories] = await to(
      db.select().from(memoriesTable).where(eq(memoriesTable.userId, userId))
    );
    if (error) throw new Error(error.message);
    return memories;
  }
  async uploadTrack(data: TrackInsert): Promise<TrackSelect> {
    const [error, track] = await to(db.insert(trackTable).values(data).returning());
    if (error) throw new Error(error.message);
    return track[0];
  }
  async getUserTracks(userId: string, memory: string): Promise<TrackSelect[] | null> {
    const [error, track] = await to(
      db
        .select()
        .from(trackTable)
        .where(and(eq(trackTable.userId, userId), eq(trackTable.memory, memory)))
    );
    if (error) throw new Error(error.message);
    return track;
  }
}
