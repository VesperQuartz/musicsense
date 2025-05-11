import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useGetAssets, useGetAudioPermision } from '@/hooks/media';
import { removeExtension } from '@/lib/utils';

const Songs = () => {
  useGetAudioPermision();
  const assets = useGetAssets({ limit: 10000 });
  if (assets.isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  console.log(assets.data, 'DATA');
  return (
    <LinearGradient
      start={{ x: 1.2, y: 0 }}
      locations={[0, 0.2]}
      className="flex flex-1 flex-col"
      colors={['#D66D27', '#000']}>
      <FlashList
        data={assets.data?.assets}
        estimatedItemSize={1000}
        renderItem={({ item }) => {
          return (
            <View>
              <Text className="text-2xl">{removeExtension(item.filename)}</Text>
            </View>
          );
        }}
      />
    </LinearGradient>
  );
};

export default Songs;
