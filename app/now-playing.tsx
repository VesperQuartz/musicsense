import { router } from 'expo-router';
import {
  ChevronLeft,
  Heart,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  ArrowUpRight,
} from 'lucide-react-native';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/text';

const NowPlaying = () => {
  // Mock data for now - in real app would come from a music context/store
  const currentSong = {
    title: 'Whispers in the Rain',
    artist: 'Mikasa Jeanete',
    artwork: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166',
    duration: 181, // 3:01 in seconds
    currentTime: 92, // 1:32 in seconds
    lyrics: [
      "And when I wake, I'll close my eyes,",
      'To find my way back through the skies,',
      'Where the stardust waits for me,',
      'Our endless flight awaits.',
    ],
  };

  // Calculate progress percentage
  const progress = (currentSong.currentTime / currentSong.duration) * 100;

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <View className="flex-1 bg-black px-4 py-6">
      {/* Header */}
      <View className="mb-8 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">Now Playing</Text>
        <TouchableOpacity>
          <Heart size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View className="mb-8 items-center">
        <Image source={{ uri: currentSong.artwork }} className="h-64 w-64 rounded-full" />
      </View>

      {/* Song Info */}
      <View className="mb-8 items-center">
        <Text className="mb-1 text-2xl font-bold text-white">{currentSong.title}</Text>
        <Text className="text-gray-400">{currentSong.artist}</Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View className="h-1 w-full rounded-full bg-gray-800">
          <View className="h-1 rounded-full bg-red-500" style={{ width: `${progress}%` }} />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-xs text-gray-400">{formatTime(currentSong.currentTime)}</Text>
          <Text className="text-xs text-gray-400">{formatTime(currentSong.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="my-6 flex-row items-center justify-around">
        <Repeat size={22} color="#fff" />
        <SkipBack size={24} color="#fff" />
        <TouchableOpacity className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500">
          <Play size={24} color="#fff" />
        </TouchableOpacity>
        <SkipForward size={24} color="#fff" />
        <TouchableOpacity>
          <View style={styles.shuffleButton}>
            <Text style={styles.shuffleButtonText}>⟳</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Lyrics Preview */}
      <View className="mt-6 border-t border-gray-800 bg-black p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-gray-400">Lyrics preview</Text>
          <TouchableOpacity>
            <ArrowUpRight size={18} color="#gray" />
          </TouchableOpacity>
        </View>

        {currentSong.lyrics.map((line, idx) => (
          <Text key={idx} className={idx === 0 ? 'mb-1 text-red-500' : 'mb-1 text-gray-500'}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Some styles that are easier to define outside of the className approach
const styles = StyleSheet.create({
  shuffleButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleButtonText: {
    color: 'white',
    fontSize: 22,
  },
});

export default NowPlaying;
