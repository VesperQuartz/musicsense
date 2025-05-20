import { ActivityIndicator, View } from 'react-native';

import { useGetAssets, useMediaPermissions } from '@/hooks/media';

const Songs = () => {
  useMediaPermissions();
  /*
   * shape 
    {
      url: string,
      title: string,
      artist: string,
    }
   * */
  const assets = useGetAssets({ limit: 100 });
  if (assets.isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  return <View />;
};

export default Songs;
