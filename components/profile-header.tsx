import React from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

const ProfileHeader = () => {
  return (
    <View className="mb-4 mt-2 flex-row items-center justify-between px-4">
      <View>
        <Text className="text-lg font-semibold text-white">Hello,</Text>
        <Text className="text-2xl font-bold text-white">Samantha 👋</Text>
      </View>
      <Avatar alt="User Profile Picture">
        <AvatarImage source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} />
      </Avatar>
    </View>
  );
};

export default ProfileHeader;
