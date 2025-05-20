import { AudioPro } from 'react-native-audio-pro';
import { create } from 'zustand';

interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  artwork: string | number;
  tags: any;
  memory: string;
  type: string;
  userId: string;
}

interface AudioPlayerState {
  queue: Track[];
  currentIndex: number | null;
  shuffled: boolean;
  originalQueue: Track[] | null;
  originalIndex: number | null;
  shuffleQueue: () => void;
  toggleShuffle: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
}

const toAudioProTrack = (track: Track) => ({
  id: track.id,
  url: track.url,
  title: track.title,
  artwork: track.artwork,
  album: track.album,
  artist: track.artist,
});

function simpleShuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  queue: [],
  currentIndex: null,
  shuffled: false,
  originalQueue: null,
  originalIndex: null,
  shuffleQueue: () => {
    const { queue, currentIndex } = get();
    if (!queue.length || currentIndex == null) return;
    const currentTrack = queue[currentIndex];
    const rest = queue.filter((_, i) => i !== currentIndex);
    const shuffledRest = simpleShuffle(rest);
    set({
      originalQueue: queue,
      originalIndex: currentIndex,
      queue: [currentTrack, ...shuffledRest],
      currentIndex: 0,
      shuffled: true,
    });
  },
  toggleShuffle: () => {
    const { shuffled, originalQueue, queue, currentIndex } = get();
    if (!shuffled) {
      get().shuffleQueue();
    } else if (originalQueue) {
      // Restore original queue and current index
      const currentTrack = queue[currentIndex ?? 0];
      const restoredIndex = originalQueue.findIndex((t) => t.id === currentTrack.id);
      set({
        queue: originalQueue,
        currentIndex: restoredIndex === -1 ? 0 : restoredIndex,
        shuffled: false,
        originalQueue: null,
        originalIndex: null,
      });
    }
  },
  setQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: startIndex,
      originalQueue: null,
      originalIndex: null,
      shuffled: false,
    });
    if (tracks[startIndex]) {
      AudioPro.play(toAudioProTrack(tracks[startIndex]));
    }
  },
  playNextTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0 || currentIndex == null) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      set({ currentIndex: nextIndex });
      AudioPro.play(toAudioProTrack(queue[nextIndex]));
    }
  },
  playPrevTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0 || currentIndex == null) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      set({ currentIndex: prevIndex });
      AudioPro.play(toAudioProTrack(queue[prevIndex]));
    }
  },
}));
