import { useAuth, useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts, Inter_900Black, Inter_400Regular } from '@expo-google-fonts/inter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Redirect } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { ActivityIndicator, FlatList, ScrollView, ToastAndroid, View } from 'react-native';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCreateMemory, useGetMemories } from '@/hooks/api';
import { useGetAudioPermision } from '@/hooks/media';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name should be more that 3 letters' }),
  description: z.string().optional(),
});

const Home = () => {
  useGetAudioPermision();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [fontsLoaded] = useFonts({ Inter_900Black, Inter_400Regular });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const memories = useGetMemories();
  const newMemory = useCreateMemory();
  const queryClient = useQueryClient();
  if (!fontsLoaded) return null;
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  const onSubmit = handleSubmit((data) => {
    newMemory.mutate(
      { ...data, userId: user?.id },
      {
        onSuccess: () => {
          ToastAndroid.showWithGravity(
            'Memory has been created',
            ToastAndroid.SHORT,
            ToastAndroid.TOP
          );
          queryClient.invalidateQueries({
            queryKey: ['memories', user?.id],
          });
        },
      }
    );
  });

  return (
    <ScrollView className="flex-1 bg-black p-2">
      <View className="flex flex-col gap-6">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-4xl" style={{ fontFamily: 'Inter_900Black' }}>
            Hello,{'\n'}
            {user?.firstName} 👋🏾
          </Text>
          <Avatar alt="profile" className="h-14 w-14">
            <AvatarImage source={{ uri: user?.imageUrl ?? 'https://github.com/shadcn.png' }} />
            <AvatarFallback>
              <Text>{user?.firstName?.at(0)}</Text>
            </AvatarFallback>
          </Avatar>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-3xl" style={{ fontFamily: 'Inter_400Regular' }}>
            Memories
          </Text>
          <View>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="icon">
                  <Ionicons name="add-circle-outline" color="white" size={35} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add memory folder</DialogTitle>
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
                          placeholder="Enter a name for this memory collection"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          className="focus:border-[#5C13B5]"
                        />
                      )}
                      name="name"
                    />
                    {errors.name && <Text className="text-sm text-red-500">Name is required</Text>}
                  </View>
                  <View>
                    <Controller
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="Enter a description"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          multiline
                          numberOfLines={4}
                          className="focus:border-[#5C13B5]"
                        />
                      )}
                      name="description"
                    />
                    {errors.name && <Text className="text-sm text-red-500">Name is required</Text>}
                  </View>
                  <Button className="bg-[#5C13B5]" onPress={onSubmit}>
                    {newMemory.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-xl text-white">Create</Text>
                    )}
                  </Button>
                </View>
              </DialogContent>
            </Dialog>
          </View>
        </View>
        <View className="flex h-48 flex-1">
          {memories.isLoading && (
            <View className="flex flex-row gap-2">
              <Skeleton className="h-44 w-36 rounded-xl" />
              <Skeleton className="h-44 w-36 rounded-xl" />
              <Skeleton className="h-44 w-36 rounded-xl" />
            </View>
          )}
          <View className="flex flex-1 flex-col gap-2">
            <FlatList
              contentContainerClassName="gap-2"
              data={memories.data ?? []}
              horizontal
              renderItem={({ item }) => {
                return (
                  <Link href={`/(home)/${item.name}`}>
                    <Card className="h-48 w-36 rounded-xl bg-[#f43f5e]">
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
