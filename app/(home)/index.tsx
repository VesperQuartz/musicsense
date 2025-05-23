import { useAuth, useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts, Inter_900Black, Inter_400Regular } from '@expo-google-fonts/inter';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Redirect } from 'expo-router';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { TrackListItem } from '@/components/track-list-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  useAiSuggestion,
  useCreateMemory,
  useGetMemories,
  useAddToMemory,
  useGetUserMemoryCategories,
} from '@/hooks/api';
import { useAudioPlayerStore } from '@/store/audio-player';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name should be more that 3 letters' }),
  description: z.string().optional(),
});

const aiSuggestionFormSchema = z.object({
  mood: z.string().min(3, { message: 'Mood is required' }),
});

const addTrackFormSchema = z.object({
  memory: z.string().min(1, { message: 'Please select a memory' }),
  tags: z.string().optional(),
});

const Home = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [fontsLoaded] = useFonts({ Inter_900Black, Inter_400Regular });
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const [selectedSuggestedTrack, setSelectedSuggestedTrack] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const {
    control: aiSuggestionFormControl,
    handleSubmit: handleAiSuggestionSubmitForm,
    formState: { errors: aiSuggestionFormErrors },
    setValue: setAiSuggestionFormValue,
  } = useForm({
    resolver: zodResolver(aiSuggestionFormSchema),
    defaultValues: {
      mood: '',
    },
  });

  const {
    control: addTrackFormControl,
    handleSubmit: handleAddTrackSubmitForm,
    formState: { errors: addTrackFormErrors },
    reset: resetAddTrackForm,
  } = useForm({
    resolver: zodResolver(addTrackFormSchema),
    defaultValues: {
      memory: '',
      tags: '',
    },
  });

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const addTrackBottomSheetRef = React.useRef<BottomSheet>(null);
  const aiSuggestionBottomSheetRef = React.useRef<BottomSheet>(null);

  const handleSheetChanges = React.useCallback(
    (index: number) => {
      if (index === -1) {
        reset();
      }
    },
    [reset]
  );

  const handleAddTrackSheetChanges = React.useCallback(
    (index: number) => {
      if (index === -1) {
        setSelectedSuggestedTrack(null);
        resetAddTrackForm();
      }
    },
    [setValue]
  );

  const handleAiSuggestionSheetChanges = React.useCallback(
    (index: number) => {
      if (index === -1) {
        setAiSuggestionFormValue('mood', '');
      }
    },
    [setAiSuggestionFormValue]
  );

  const snapPoints = React.useMemo(() => ['44%', '55%'], []);
  const addTrackSnapPoints = React.useMemo(() => ['44%', '55%'], []);
  const aiSuggestionSnapPoints = React.useMemo(() => ['44%', '55%'], []);

  const renderBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={1} appearsOnIndex={2} />,
    []
  );

  const renderAddTrackBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const renderAiSuggestionBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const memories = useGetMemories(query);
  const newMemory = useCreateMemory();
  const ai = useAiSuggestion();
  const categories = useGetUserMemoryCategories();
  const addToMemory = useAddToMemory();

  if (!fontsLoaded) return null;
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const onSubmit = handleSubmit((data) => {
    newMemory.mutate(
      { ...data, userId: user?.id },
      {
        onSuccess: () => {
          Toast.show({
            text1: 'Memory has been created',
            type: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['memories', user?.id],
          });
          queryClient.invalidateQueries({
            queryKey: ['categories'],
          });
          bottomSheetRef.current?.close();
        },
      }
    );
  });

  const handleAddTrackSubmit = async (data: z.infer<typeof addTrackFormSchema>) => {
    if (!selectedSuggestedTrack) return;

    const { id, createdAt, updatedAt, ...rest } = selectedSuggestedTrack;
    const trackData = {
      ...rest,
      memory: data.memory,
      userId: user?.id ?? '',
      type: selectedSuggestedTrack.type || 'ai',
      tags: data.tags
        ? data.tags.split(',').map((tag) => tag.trim())
        : selectedSuggestedTrack.tags || [],
    };

    addToMemory.mutate(trackData, {
      onSuccess: () => {
        Toast.show({
          text1: 'Track has been added to memory',
          type: 'success',
        });
        queryClient.invalidateQueries({
          queryKey: ['tracks', user?.id, data.memory],
        });
        addTrackBottomSheetRef.current?.close();
        setSelectedSuggestedTrack(null);
      },
      onError: (error) => {
        Toast.show({
          text1: 'Error adding track to memory',
          type: 'error',
        });
      },
    });
  };

  const handleAiSuggestionSubmit = async (data: z.infer<typeof aiSuggestionFormSchema>) => {
    if (!data.mood) return;
    ai.mutate(
      { mood: data.mood },
      {
        onSuccess: () => {
          aiSuggestionBottomSheetRef.current?.close();
        },
        onError: (error) => {
          Toast.show({
            text1: 'Error fetching suggestions',
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View className="flex-1 bg-black p-2">
          <View className="flex flex-1 flex-col gap-2">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-2xl" style={{ fontFamily: 'Inter_900Black' }}>
                Hello, {user?.firstName} 👋🏾
              </Text>
              <Avatar alt="profile" className="h-12 w-12">
                <AvatarImage source={{ uri: user?.imageUrl ?? 'https://github.com/shadcn.png' }} />
                <AvatarFallback>
                  <Text>{user?.firstName?.at(0)}</Text>
                </AvatarFallback>
              </Avatar>
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text className="text-2xl" style={{ fontFamily: 'Inter_400Regular' }}>
                Memories
              </Text>
              <View className="flex flex-row gap-2">
                <Button
                  variant="link"
                  size="icon"
                  onPress={() => aiSuggestionBottomSheetRef.current?.snapToIndex(0)}>
                  <Ionicons name="logo-reddit" color="white" size={35} />
                </Button>
                <Button
                  variant="link"
                  size="icon"
                  onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
                  <Ionicons name="add-circle-outline" color="white" size={35} />
                </Button>
              </View>
            </View>
            <View className="mb-2 mt-2 flex flex-row items-center rounded-xl bg-white/10 px-3 py-2 shadow-md">
              <Ionicons name="search" size={22} color="#aaa" style={{ marginRight: 8 }} />
              <Input
                className="flex-1 border-0 bg-transparent text-white"
                placeholder="Search memories..."
                placeholderTextColor="#aaa"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>

            <View className="">
              {memories.isLoading ? (
                <View className="flex flex-row gap-2">
                  <Skeleton className="h-44 w-36 rounded-xl" />
                  <Skeleton className="h-44 w-36 rounded-xl" />
                  <Skeleton className="h-44 w-36 rounded-xl" />
                </View>
              ) : memories.data && memories.data.length > 0 ? (
                <FlatList
                  contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 8 }}
                  data={memories.data}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Link href={`/(home)/${item.name}`}>
                      <View>
                        <MemoryCard memory={item} />
                      </View>
                    </Link>
                  )}
                  keyExtractor={(item, index) => String(`${item.userId}+${index}` || item.name)}
                />
              ) : (
                <View className="flex items-center justify-center py-4">
                  <Text className="text-white/70">No memories found</Text>
                </View>
              )}
            </View>

            {memories.data && memories.data.length > 0 && (
              <View className="mt-1 flex flex-1">
                {ai.isSuccess && ai.data && ai.data.length > 0 && (
                  <View className="mt-2 flex-1">
                    <Text className="mb-2 text-xl font-bold text-white">AI Suggested Tracks</Text>
                    <FlatList
                      data={ai.data}
                      keyExtractor={(item) => item.id}
                      className="flex-1"
                      contentContainerClassName="gap-3 pb-2"
                      renderItem={({ item, index }) => (
                        <Pressable
                          onLongPress={() => {
                            setSelectedSuggestedTrack(item);
                            addTrackBottomSheetRef.current?.snapToIndex(0);
                          }}>
                          <TrackListItem
                            track={item}
                            onPress={() => {
                              const trackWithRequiredFields = {
                                ...item,
                                memory: item.memory || 'AI Suggestions',
                                type: item.type || 'remote',
                                userId: user?.id || '',
                                tags: item.tags || [],
                                album: item.album || 'Unknown Album',
                                genre: item.genre || 'Unknown Genre',
                                artwork: item.artwork || 'https://github.com/shadcn.png',
                              };
                              useAudioPlayerStore.getState().setQueue(
                                ai.data!.map((t) => ({
                                  ...t,
                                  memory: t.memory || 'AI Suggestions',
                                  type: t.type || 'remote',
                                  userId: user?.id || '',
                                  tags: t.tags || [],
                                  album: t.album || 'Unknown Album',
                                  genre: t.genre || 'Unknown Genre',
                                  artwork: t.artwork || 'https://github.com/shadcn.png',
                                })),
                                index
                              );
                            }}
                          />
                        </Pressable>
                      )}
                    />
                  </View>
                )}

                {ai.isSuccess && (!ai.data || ai.data.length === 0) && (
                  <View className="items-center justify-center py-4">
                    <Text className="text-lg text-neutral-400">
                      No suggestions found for this mood.
                    </Text>
                  </View>
                )}

                {ai.isError && (
                  <View className="items-center justify-center py-4">
                    <Text className="text-lg text-red-500">Error fetching suggestions.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <BottomSheet
            snapPoints={snapPoints}
            ref={bottomSheetRef}
            animateOnMount
            index={-1}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#1A1A1A' }}
            handleIndicatorStyle={{ backgroundColor: '#5C13B5' }}>
            <BottomSheetView className="flex flex-1 gap-4 p-4">
              <Text className="mb-2 text-xl font-bold text-white">Create Memory Collection</Text>
              <BottomSheetView className="mb-2">
                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BottomSheetTextInput
                      placeholder="Collection name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="rounded-lg border-0 bg-gray-800 px-4 py-3 text-white focus:border-[#5C13B5] focus:ring-2 focus:ring-[#5C13B5]"
                      placeholderTextColor="#999999"
                    />
                  )}
                  name="name"
                />
                {errors.name && (
                  <Text className="ml-1 mt-1 text-sm text-red-500">
                    {errors.name.message || 'Name is required'}
                  </Text>
                )}
              </BottomSheetView>

              <BottomSheetView className="mb-4">
                <Controller
                  control={control}
                  rules={{
                    required: false,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BottomSheetTextInput
                      placeholder="Description (optional)"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      numberOfLines={4}
                      className="min-h-24 rounded-lg border-0 bg-gray-800 px-4 py-3 text-white focus:border-[#5C13B5] focus:ring-2 focus:ring-[#5C13B5]"
                      placeholderTextColor="#999999"
                      textAlignVertical="top"
                    />
                  )}
                  name="description"
                />
                {errors.description && (
                  <Text className="ml-1 mt-1 text-sm text-red-500">
                    {errors.description.message}
                  </Text>
                )}
              </BottomSheetView>
              <Button
                className="flex flex-row items-center justify-center rounded-lg bg-[#5C13B5] py-3"
                onPress={onSubmit}>
                {newMemory.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-lg font-semibold text-white">Create Collection</Text>
                )}
              </Button>
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={addTrackBottomSheetRef}
            index={-1}
            snapPoints={addTrackSnapPoints}
            onChange={handleAddTrackSheetChanges}
            backdropComponent={renderAddTrackBackdrop}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#1A1A1A' }}
            handleIndicatorStyle={{ backgroundColor: '#5C13B5' }}
            style={{ zIndex: 100 }}
            bottomInset={80}
            keyboardBehavior="interactive">
            <BottomSheetView className="flex flex-1 gap-4 p-4">
              <Text className="mb-2 text-xl font-bold text-white">
                Add Suggested Track to Memory
              </Text>
              <View className="mb-4">
                <Controller
                  control={addTrackFormControl}
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
                            <Text
                              className={value === category ? 'text-white' : 'text-neutral-400'}>
                              {category}
                            </Text>
                          </Button>
                        ))}
                      </View>
                      {categories.isLoading && <ActivityIndicator size="small" color="#FFFFFF" />}
                      {categories.isError && (
                        <Text className="text-sm text-red-500">Error loading memories.</Text>
                      )}
                      {categories.isSuccess &&
                        (!categories.data || categories.data.length === 0) && (
                          <Text className="text-sm text-neutral-400">
                            No memories found. Create one first!
                          </Text>
                        )}
                    </View>
                  )}
                  name="memory"
                />
                {addTrackFormErrors.memory && (
                  <Text className="mt-1 text-sm text-red-500">
                    {addTrackFormErrors.memory.message}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Controller
                  control={addTrackFormControl}
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
                onPress={handleAddTrackSubmitForm(handleAddTrackSubmit)}
                disabled={addToMemory.isPending}>
                {addToMemory.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-lg font-semibold text-white">Add to Memory</Text>
                )}
              </Button>
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={aiSuggestionBottomSheetRef}
            index={-1}
            snapPoints={aiSuggestionSnapPoints}
            onChange={handleAiSuggestionSheetChanges}
            backdropComponent={renderAiSuggestionBackdrop}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#1A1A1A' }}
            handleIndicatorStyle={{ backgroundColor: '#5C13B5' }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            style={{ zIndex: 100 }}>
            <BottomSheetView className="flex flex-1 gap-4 p-4">
              <Text className="mb-2 text-xl font-bold text-white">Get AI Track Suggestions</Text>
              <View className="flex flex-col gap-4">
                <Controller
                  control={aiSuggestionFormControl}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <Text className="mb-2 text-sm text-white">
                        Enter your mood or a description
                      </Text>
                      <BottomSheetTextInput
                        placeholder="e.g. feeling happy, need something chill"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="rounded-lg border-0 bg-gray-800 px-4 py-3 text-white focus:border-[#5C13B5] focus:ring-2 focus:ring-[#5C13B5]"
                        placeholderTextColor="#999999"
                      />
                    </View>
                  )}
                  name="mood"
                />
                {aiSuggestionFormErrors.mood && (
                  <Text className="mt-1 text-sm text-red-500">
                    {aiSuggestionFormErrors.mood.message}
                  </Text>
                )}
                <Button
                  className="flex flex-row items-center justify-center rounded-lg bg-[#5C13B5] py-3"
                  onPress={handleAiSuggestionSubmitForm(handleAiSuggestionSubmit)}
                  disabled={ai.isPending}>
                  {ai.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-lg font-semibold text-white">Get Suggestions</Text>
                  )}
                </Button>
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const MemoryCard = ({ memory }: { memory: any }) => (
  <Card className="mr-2 min-h-36 w-36 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-lg">
    <LinearGradient
      colors={['#d946ef', '#ec4899', '#f43f5e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
      <View className="h-full flex-1 justify-end">
        <View className="flex-1 justify-end rounded-b-2xl bg-black/40 p-4">
          <Badge className="mb-2 self-start bg-white/10" variant="secondary">
            <Text className="text-xs text-white">Memory</Text>
          </Badge>
          <CardTitle className="mb-1 text-xl font-bold text-white" numberOfLines={2}>
            <Text className="text-xl font-bold text-white" numberOfLines={2}>
              {memory.name}
            </Text>
          </CardTitle>
          {memory.description ? (
            <CardDescription className="text-xs text-white/80" numberOfLines={2}>
              <Text className="text-xs text-white/80" numberOfLines={2}>
                {memory.description}
              </Text>
            </CardDescription>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  </Card>
);

export default Home;
