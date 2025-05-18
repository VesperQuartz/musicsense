import { router } from 'expo-router';
import { ChevronLeft, MoreVertical, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';

import { Text } from '@/components/ui/text';
import { useGetAlbums, useGetAudioPermision } from '@/hooks/media';

// Define album type
type Album = {
  id: string;
  title?: string;
  artist?: string;
  artwork?: { uri?: string };
};

// Categories for filtering
const categories = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'horror', label: 'Horror' },
  { id: 'family', label: 'Family' },
];

const Library = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Get permissions and album data
  const { data: permission } = useGetAudioPermision();
  const { data: albums } = useGetAlbums();

  // Safely access album data with type assertion
  const albumsList = (Array.isArray(albums) ? albums : []) as Album[];

  // Mock data for demonstration purposes - would use real data in production
  const mockPlaylists = [
    {
      id: '1',
      title: 'Bass Drops & Starbursts',
      artist: 'Budiarti Reo',
      artwork: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1',
    },
    {
      id: '2',
      title: 'Euphoria 808',
      artist: 'Samantha Will',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    },
    {
      id: '3',
      title: 'Neon Skyline',
      artist: 'Alexandra Oel',
      artwork: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3',
    },
    {
      id: '4',
      title: 'Electric Love Affair',
      artist: 'Mikasa Jeanete',
      artwork: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    },
    {
      id: '5',
      title: 'Synthwave Dreams',
      artist: 'Norman Perez',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    },
    {
      id: '6',
      title: 'Amplified Chaos',
      artist: 'Mikage Reo',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    },
  ];

  // Combined playlists - would use real filtered data in production
  const displayPlaylists =
    activeCategory === 'all'
      ? [...mockPlaylists]
      : mockPlaylists.filter((_, index) => index % 2 === 0);

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white">My Music</Text>
        <MoreVertical size={24} color="#fff" />
      </View>

      {/* Filter Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="mb-4">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setActiveCategory(category.id)}
            className={`mr-2 rounded-full px-4 py-2 ${
              activeCategory === category.id ? 'bg-white' : 'bg-gray-800'
            }`}>
            <Text
              className={`${
                activeCategory === category.id ? 'font-semibold text-black' : 'text-white'
              }`}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Playlist/Song List */}
      <FlatList
        data={displayPlaylists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-4 flex-row items-center"
            onPress={() => router.push('/now-playing')}>
            <Image source={{ uri: item.artwork }} className="mr-4 h-12 w-12 rounded-full" />
            <View className="flex-1 justify-center">
              <Text className="font-semibold text-white" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-sm text-gray-400" numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
            <TouchableOpacity>
              <MoreVertical size={20} color="#aaa" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-red-500"
        onPress={() => console.log('Add new')}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Library;
