import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Image } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAudioPlayerStore } from '@/store/audio-player';

export const TrackListItem = ({ track, onPress }: { track: any; onPress: () => void }) => (
  <View className="flex flex-row items-center gap-4 rounded-xl bg-neutral-900 p-3">
    <View className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-800">
      {track.artwork ? (
        <Image
          source={{ uri: track.artwork }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="musical-notes" size={32} color="#888" style={{ margin: 10 }} />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-white" numberOfLines={1}>
        {track.title}
      </Text>
      <Text className="text-sm text-neutral-400" numberOfLines={1}>
        {track.artist}
      </Text>
      <Text className="text-xs text-neutral-500" numberOfLines={1}>
        {track.album}
      </Text>
      {track.tags && (
        <View className="mt-1 flex flex-row flex-wrap gap-1">
          {(Array.isArray(track.tags)
            ? track.tags
            : typeof track.tags === 'string'
              ? track.tags.split(',')
              : []
          ).map((tag: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              <Text>{tag.trim()}</Text>
            </Badge>
          ))}
        </View>
      )}
    </View>
    <Button variant="link" size="icon" onPress={onPress} className="ml-2">
      <Ionicons name="play-circle" size={32} color="#5C13B5" />
    </Button>
  </View>
);
