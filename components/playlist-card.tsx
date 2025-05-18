import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface PlaylistCardProps {
  image: string;
  title: string;
  artist: string;
  onPress?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, title, artist, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="mr-4 w-32">
      <Image source={{ uri: image }} className="mb-2 h-32 w-32 rounded-xl" />
      <Text className="text-base font-semibold text-white" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-xs text-gray-400" numberOfLines={1}>
        {artist}
      </Text>
    </TouchableOpacity>
  );
};

export default PlaylistCard;
