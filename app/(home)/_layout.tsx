import { Tabs } from 'expo-router';
import { Home, Search, Library, User } from 'lucide-react-native';
import '@/services/audio-setup';

import MiniPlayer from '@/components/mini-player';

const HomeLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#f43f5e', // red-500
          tabBarInactiveTintColor: '#6b7280', // gray-500
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="songs"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="[name]/index"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
};

export default HomeLayout;
