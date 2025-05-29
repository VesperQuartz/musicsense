import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import to from 'await-to-ts';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, View, FlatList } from 'react-native';
import { AudioPro, AudioProContentType } from 'react-native-audio-pro';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { TrackListItem } from '@/components/track-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { env } from '@/config/env';
import { useGetUserTracks, useSearchAlbum } from '@/hooks/api';
import { useGetAudioInfo } from '@/hooks/media';
import { useAudioPlayerStore } from '@/store/audio-player';

const formSchema = z.object({
  tags: z.string(),
});

AudioPro.configure({ contentType: AudioProContentType.MUSIC });

const MemoryIndex = () => {
  const { name } = useLocalSearchParams();
  const [picked, setPicked] = React.useState(false);
  const [audio, setAudio] = React.useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [progress, setProgress] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [tags, setTags] = React.useState('');
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { tags: '' },
  });
  const user = useUser();

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ['45%'], []);

  const handleSheetChanges = React.useCallback(
    (index: number) => {
      if (index === -1) {
        reset();
        setAudio(null);
        setProgress(undefined);
        setLoading(false);
        setTags('');
      }
    },
    [reset]
  );

  const renderBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const audioInfo = useGetAudioInfo(audio?.assets?.[0].uri);
  const albumArt = useSearchAlbum({ albumName: audioInfo?.data?.album });
  const track = useGetUserTracks(name as string);

  let upload: FileSystem.UploadTask | undefined;

  React.useEffect(() => {
    if (audio && audio.assets) {
      upload = FileSystem.createUploadTask(
        `${env.baseUrl}/upload`,
        audio.assets[0].uri,
        {
          fieldName: 'file',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          parameters: {
            name: audio.assets[0].name,
            tags,
            userId: user.user?.id ?? '',
            title: audioInfo.data?.title,
            artist: audioInfo.data?.artist,
            album: audioInfo.data?.album,
            memory: name as string,
            duration: albumArt.data?.duration?.toString() ?? '0',
            albumArt:
              albumArt.data?.image_url ??
              'https://i.scdn.co/image/ab67616d0000b273ec449471d321ade6ee416230',
          },
        },
        (data) => {
          const progressData = data.totalBytesSent / data.totalBytesExpectedToSend;
          setProgress((progressData * 100).toFixed(2));
        }
      );
    }
  }, [audio, audioInfo.data, albumArt.data, tags]);

  const onSubmit = handleSubmit(async () => {
    if (!audio) {
      Toast.show({
        type: 'info',
        text1: 'Please select an audio file',
      });
      return;
    }
    if (!audio.assets || !upload) return;
    if (albumArt.isSuccess && audioInfo.isSuccess) {
      setLoading(true);
      const [error] = await to(upload.uploadAsync());
      if (error) {
        setLoading(false);
        setProgress(undefined);
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: error.message,
        });
        return;
      }
      setProgress(undefined);
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Audio has been uploaded',
      });
      reset();
      setAudio(null);
      setTags('');
      queryClient.invalidateQueries({
        queryKey: ['tracks', user.user?.id, name],
      });
      bottomSheetRef.current?.close();
    }
  });

  const pickDocument = async () => {
    setPicked(true);
    const some = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
    });
    if (!some.canceled) {
      setAudio(some);
    }
    setPicked(false);
  };

  const filteredTracks =
    query && track.data
      ? track.data.filter((t) => {
          const titleMatch = t.title.toLowerCase().includes(query.toLowerCase());
          let tagsMatch = false;
          if (t.tags) {
            if (Array.isArray(t.tags)) {
              tagsMatch = t.tags.some((tag: string) =>
                tag.toLowerCase().includes(query.toLowerCase())
              );
            } else if (typeof t.tags === 'string') {
              tagsMatch = t.tags.toLowerCase().includes(query.toLowerCase());
            }
          }
          return titleMatch || tagsMatch;
        })
      : track.data;

  return (
    <>
      <View className="flex-1 gap-2 p-1">
        <View className="flex gap-5">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row gap-2">
              <Ionicons name="musical-notes" size={30} color="white" />
              <Text className="text-3xl">{name}</Text>
            </View>
            <View>
              <Button
                variant="link"
                size="icon"
                onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
                <Ionicons name="add-circle-outline" color="white" size={35} />
              </Button>
            </View>
          </View>
        </View>
        <View className="mb-2 mt-2 flex flex-row items-center rounded-xl bg-white/10 px-3 py-2 shadow-md">
          <Ionicons name="search" size={22} color="#aaa" style={{ marginRight: 8 }} />
          <Input
            className="flex-1 border-0 bg-transparent text-white"
            placeholder="Search tracks..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <View className="mt-6 flex-1">
          <Text className="mb-2 text-2xl font-bold text-white">Tracks</Text>
          {track.isLoading ? (
            <View className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  className="flex flex-row items-center gap-4 rounded-xl bg-neutral-900 p-4">
                  <View className="h-14 w-14 rounded-lg bg-neutral-800" />
                  <View className="flex-1 gap-2">
                    <View className="h-4 w-24 rounded bg-neutral-800" />
                    <View className="h-3 w-16 rounded bg-neutral-800" />
                  </View>
                  <View className="h-8 w-8 rounded-full bg-neutral-800" />
                </View>
              ))}
            </View>
          ) : filteredTracks && filteredTracks.length > 0 ? (
            <FlatList
              data={filteredTracks}
              keyExtractor={(item) => item.id}
              className=""
              contentContainerClassName="gap-3 pb-8"
              renderItem={({ item, index }) => (
                <TrackListItem
                  track={item}
                  onPress={() => useAudioPlayerStore.getState().setQueue(filteredTracks, index)}
                />
              )}
            />
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-lg text-neutral-400">No tracks found in this memory.</Text>
            </View>
          )}
        </View>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#1A1A1A' }}
        handleIndicatorStyle={{ backgroundColor: '#5C13B5' }}
        style={{ zIndex: 100 }}
        bottomInset={80}
        animateOnMount>
        <BottomSheetView className="flex flex-1 gap-4 p-4">
          <Text className="mb-2 text-xl font-bold text-white">Add music to memories</Text>
          <View className="flex w-full flex-col gap-4">
            <View>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="e.g. upbeat, driving, chill"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      setTags(text);
                    }}
                    value={value}
                    className="focus:border-[#5C13B5]"
                    placeholderTextColor="#aaa"
                  />
                )}
                name="tags"
              />
              {errors.tags && <Text className="text-sm text-red-500">Name is required</Text>}
            </View>
            <View className="flex items-center justify-center rounded-lg border border-dashed border-neutral-600 p-6">
              {audio ? (
                <Text className="text-center text-white">
                  Selected file: {audio.assets?.[0].name}
                </Text>
              ) : (
                <Button
                  variant="link"
                  size="default"
                  onPress={pickDocument}
                  className="flex-col gap-2">
                  <Ionicons name="cloud-upload-outline" color="white" size={34} />
                  <Text className="text-center text-sm text-white">
                    Tap to select an audio file to upload
                  </Text>
                </Button>
              )}
            </View>
            <Button
              disabled={picked || !audio || loading}
              className="flex flex-row items-center justify-center gap-2 bg-[#5C13B5]"
              onPress={onSubmit}>
              {loading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="text-white">{progress?.toString() ?? ''} %</Text>
                </>
              ) : (
                <Text className="text-xl text-white">Upload</Text>
              )}
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default MemoryIndex;
