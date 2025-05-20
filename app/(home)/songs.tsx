import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { ActivityIndicator, View, FlatList, Image } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useGetAssets, useMediaPermissions } from '@/hooks/media';
import { useAudioPlayerStore } from '@/store/audio-player';

const Songs = () => {
  useMediaPermissions();
  const [query, setQuery] = useState('');
  const assets = useGetAssets({ limit: 2000 });

  const filteredAssets =
    query && assets.data
      ? assets.data.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
      : assets.data;

  const mappedAssets = filteredAssets
    ? filteredAssets.map((asset: any) => ({
        id: asset.id,
        url: asset.uri,
        title: asset.title,
        artist: asset.artist,
        artwork: asset.artwork,
        album: '',
        genre: '',
        tags: [],
        memory: '',
        type: 'local',
        userId: '',
      }))
    : [];

  if (assets.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-2 p-1">
      <View className="mb-2 mt-2 flex flex-row items-center rounded-xl bg-white/10 px-3 py-2 shadow-md">
        <Ionicons name="search" size={22} color="#aaa" style={{ marginRight: 8 }} />
        <Input
          className="flex-1 border-0 bg-transparent text-white"
          placeholder="Search local songs..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <View className="mt-6 flex-1">
        <Text className="mb-2 text-2xl font-bold text-white">Local Songs</Text>
        {filteredAssets && filteredAssets.length > 0 ? (
          <FlatList
            data={filteredAssets}
            keyExtractor={(item) => item.id}
            className=""
            contentContainerClassName="gap-3 pb-8"
            renderItem={({ item, index }) => (
              <SongListItem
                asset={item}
                onPress={() => useAudioPlayerStore.getState().setQueue(mappedAssets, index)}
              />
            )}
          />
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-lg text-neutral-400">No local songs found.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SongListItem = ({ asset, onPress }: { asset: any; onPress: () => void }) => (
  <View className="flex flex-row items-center gap-4 rounded-xl bg-neutral-900 p-3">
    <View className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-800">
      {asset.artwork ? (
        <Image
          source={{ uri: asset.artwork }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="musical-notes" size={32} color="#888" style={{ margin: 10 }} />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-white" numberOfLines={1}>
        {asset.title}
      </Text>
      <Text className="text-sm text-neutral-400" numberOfLines={1}>
        {asset.artist}
      </Text>
    </View>
    <Button variant="link" size="icon" onPress={onPress} className="ml-2">
      <Ionicons name="play-circle" size={32} color="#5C13B5" />
    </Button>
  </View>
);

export default Songs;
