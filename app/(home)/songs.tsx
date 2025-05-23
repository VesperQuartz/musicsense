import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ActivityIndicator, View, FlatList, Image, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAddToMemory, useGetUserMemoryCategories } from '@/hooks/api';
import { useGetAssets, useMediaPermissions } from '@/hooks/media';
import { useAudioPlayerStore } from '@/store/audio-player';

const formSchema = z.object({
  memory: z.string().min(1, { message: 'Please select a memory' }),
  tags: z.string().optional(),
});

const Songs = () => {
  useMediaPermissions();
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const assets = useGetAssets({ limit: 2000 });
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ['40%', '55'], []);
  const queryClient = useQueryClient();

  const categories = useGetUserMemoryCategories();
  const addToMemory = useAddToMemory();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleSheetChanges = React.useCallback(
    (index: number) => {
      if (index === -1) {
        setSelectedTrack(null);
        reset();
      }
    },
    [reset]
  );

  const renderBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedTrack) return;

    const { id, createdAt, updatedAt, ...rest } = selectedTrack;
    const trackData = {
      ...rest,
      memory: data.memory,
      userId: user?.id ?? '',
      type: 'local',
      tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
    };

    addToMemory.mutate(trackData, {
      onSuccess: () => {
        Toast.show({
          text1: 'Song has been added to memory',
          type: 'success',
        });
        queryClient.invalidateQueries({
          queryKey: ['tracks', user?.id, data.memory],
        });
        bottomSheetRef.current?.close();
        setSelectedTrack(null);
        reset();
      },
      onError: () => {
        Toast.show({
          text1: 'Error adding song to memory',
          type: 'error',
        });
      },
    });
  });

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                <Pressable
                  onLongPress={() => {
                    setSelectedTrack(mappedAssets[index]);
                    bottomSheetRef.current?.snapToIndex(0);
                  }}>
                  <SongListItem
                    asset={item}
                    onPress={() => useAudioPlayerStore.getState().setQueue(mappedAssets, index)}
                  />
                </Pressable>
              )}
            />
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-lg text-neutral-400">No local songs found.</Text>
            </View>
          )}
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: '#1A1A1A' }}
          handleIndicatorStyle={{ backgroundColor: '#5C13B5' }}>
          <BottomSheetView className="flex flex-1 gap-4 p-4">
            <Text className="mb-2 text-xl font-bold text-white">Add to Memory</Text>
            <View className="mb-4">
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="mb-2 text-sm text-white">Select Memory</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {categories.data?.map((category) => (
                        <Button
                          key={category}
                          variant={value === category ? 'default' : 'secondary'}
                          onPress={() => onChange(category)}
                          className={value === category ? 'bg-[#5C13B5]' : ''}>
                          <Text className={value === category ? 'text-white' : 'text-neutral-400'}>
                            {category}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  </View>
                )}
                name="memory"
              />
              {errors.memory && (
                <Text className="mt-1 text-sm text-red-500">{errors.memory.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Controller
                control={control}
                rules={{ required: false }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Text className="mb-2 text-sm text-white">Tags (optional)</Text>
                    <Input
                      placeholder="comma, separated, tags"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="focus:border-[#5C13B5]"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                )}
                name="tags"
              />
            </View>

            <Button
              className="flex flex-row items-center justify-center rounded-lg bg-[#5C13B5] py-3"
              onPress={onSubmit}>
              {addToMemory.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-lg font-semibold text-white">Add to Memory</Text>
              )}
            </Button>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
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
