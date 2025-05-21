export type Track = {
  url: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  artwork: string | null;
  duration: number | null;
  tags: string[] | null;
  memory: string;
  type: 'local' | 'remote';
  userId: string;
};
