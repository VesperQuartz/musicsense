import { useUser, useAuth } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(session)/sign-in');
  };

  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <View className="mb-8 items-center">
        <Avatar alt="profile" className="mb-4 h-28 w-28 border-4 border-pink-500 shadow-lg">
          <AvatarImage source={{ uri: user?.imageUrl ?? undefined }} />
          <AvatarFallback>
            <Text className="text-3xl text-white">{user?.firstName?.[0]}</Text>
          </AvatarFallback>
        </Avatar>
        <Text className="mt-2 text-2xl font-bold text-white">{user?.fullName}</Text>
        <Text className="mt-1 text-base text-neutral-400">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>
      <Button
        variant="destructive"
        size="lg"
        className="mt-4 flex flex-row items-center gap-2 px-8 py-3"
        onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text className="text-lg text-white">Log out</Text>
      </Button>
    </View>
  );
};

export default Profile;
