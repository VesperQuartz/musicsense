import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import to from 'await-to-ts';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, View, FlatList, Image } from 'react-native';
import { AudioPro, AudioProContentType } from 'react-native-audio-pro';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { env } from '@/config/env';
import { useGetUserTracks, useSearchAlbum } from '@/hooks/api';
import { useGetAudioInfo } from '@/hooks/media';

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
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const user = useUser();

  const audioInfo = useGetAudioInfo(audio?.assets?.[0].uri);
  const albumArt = useSearchAlbum({ albumName: audioInfo?.data?.album });
  const track = useGetUserTracks(name as string);
  console.log(track.data, 'Tracks');

  let upload: FileSystem.UploadTask;
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
            genre: audioInfo.data?.genre,
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

  const onSubmit = handleSubmit(async (data) => {
    if (!audio) {
      Toast.show({
        type: 'info',
        text1: 'Please select an audio file',
      });
      return;
    }
    setTags(data.tags);
    if (!audio.assets) return;
    if (albumArt.isSuccess && audioInfo.isSuccess) {
      setLoading(true);
      const [error] = await to(upload.uploadAsync());
      if (error) {
        setLoading(false);
        setProgress(undefined);
        throw new Error(error.message);
      }
      setProgress(undefined);
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Audio has been uploaded',
      });
      reset();
    }
  });

  const pickDocument = async () => {
    setPicked(true);
    const some = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
    });
    setAudio(some);
    setPicked(false);
  };

  const filteredTracks =
    query && track.data
      ? track.data.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
      : track.data;

  return (
    <View className="flex-1 gap-2 p-1">
      <View className="flex gap-5">
        <View className="flex flex-row gap-2">
          <Ionicons name="musical-notes" size={30} color="white" />
          <Text className="text-3xl">{name}</Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <View className="flex w-16 items-center justify-center rounded-3xl border border-white p-1">
            <Button
              variant="link"
              size="icon"
              onPress={() => track?.data?.[0] && AudioPro.play(track.data[0])}>
              <Ionicons name="play-sharp" size={30} color="white" />
            </Button>
          </View>
          <View>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="icon">
                  <Ionicons name="add-circle-outline" color="white" size={35} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add music to memories</DialogTitle>
                </DialogHeader>
                <View className="flex w-[350px] flex-col gap-4">
                  <View>
                    <Controller
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="upbeat, driving"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          className="focus:border-[#5C13B5]"
                        />
                      )}
                      name="tags"
                    />
                    {errors.tags && <Text className="text-sm text-red-500">Name is required</Text>}
                  </View>
                  <View className="flex items-center justify-center">
                    <Button variant="link" size="default" onPress={pickDocument}>
                      <Ionicons name="cloud-upload-sharp" color="white" size={34} />
                      <Text className="text-sm text-white">Click to select audio</Text>
                    </Button>
                  </View>
                  <Button
                    disabled={picked}
                    className="flex flex-row items-center justify-center gap-2  bg-[#5C13B5]"
                    onPress={onSubmit}>
                    {loading ? (
                      <>
                        <ActivityIndicator />
                        <Text className="text-white">{progress?.toString() ?? ''} %</Text>
                      </>
                    ) : (
                      <Text className="text-xl text-white">Upload</Text>
                    )}
                  </Button>
                </View>
              </DialogContent>
            </Dialog>
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
            {[1, 2, 3].map((i) => (
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
            renderItem={({ item }) => <TrackListItem track={item} />}
          />
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-lg text-neutral-400">No tracks found in this memory.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const TrackListItem = ({ track }: { track: any }) => (
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
    </View>
    <Button variant="link" size="icon" onPress={() => AudioPro.play(track)} className="ml-2">
      <Ionicons name="play-circle" size={32} color="#5C13B5" />
    </Button>
  </View>
);

export default MemoryIndex;
