import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Image } from 'react-native';
import { useAudioPro, AudioPro } from 'react-native-audio-pro';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAudioPlayerStore } from '@/store/audio-player';

const MiniPlayer = () => {
  const { state, playingTrack } = useAudioPro();
  const { queue, currentIndex, playNextTrack, playPrevTrack, shuffled, toggleShuffle } =
    useAudioPlayerStore();

  if (!playingTrack || state === 'STOPPED' || state === 'IDLE' || state === 'ERROR') return null;

  const isPlaying = state === 'PLAYING';
  const atStart = currentIndex === 0;
  const atEnd = queue.length === 0 || currentIndex === queue.length - 1;

  return (
    <View className="absolute bottom-20 left-4 right-4 z-50 flex-row items-center rounded-xl bg-neutral-900/95 p-3 shadow-lg">
      {playingTrack.artwork ? (
        <Image
          source={
            typeof playingTrack.artwork === 'number'
              ? playingTrack.artwork
              : { uri: playingTrack.artwork }
          }
          style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            marginRight: 12,
            backgroundColor: '#222',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="musical-notes" size={28} color="#888" />
        </View>
      )}
      <View className="flex-1">
        <Text className="font-bold text-white" numberOfLines={1}>
          {playingTrack.title}
        </Text>
        <Text className="text-xs text-neutral-400" numberOfLines={1}>
          {playingTrack.artist}
        </Text>
      </View>
      <Button variant="ghost" size="icon" onPress={toggleShuffle} className="ml-2">
        <Ionicons name="shuffle" size={24} color={shuffled ? '#f43f5e' : '#fff'} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onPress={playPrevTrack}
        className="ml-2"
        disabled={atStart}>
        <Ionicons name="play-skip-back" size={28} color={atStart ? '#555' : '#fff'} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onPress={() => (isPlaying ? AudioPro.pause() : AudioPro.resume())}
        className="ml-2">
        <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={36} color="#fff" />
      </Button>
      <Button variant="ghost" size="icon" onPress={playNextTrack} className="ml-2" disabled={atEnd}>
        <Ionicons name="play-skip-forward" size={28} color={atEnd ? '#555' : '#fff'} />
      </Button>
    </View>
  );
};

export default MiniPlayer;
