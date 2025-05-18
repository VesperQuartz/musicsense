import { useQuery } from '@tanstack/react-query';
import to from 'await-to-ts';
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info-2';
import * as MusicLibrary from 'expo-music-library';

export const useGetAudioPermision = () => {
  return useQuery({
    queryKey: ['audio-permision'],
    queryFn: async () => {
      const [error, permision] = await to(MediaLibrary.getPermissionsAsync());
      if (error) throw new Error(error.message);
      if (!permision.granted) {
        await MediaLibrary.getPermissionsAsync();
        return null;
      }
      return permision;
    },
  });
};

export const useGetAssets = ({ limit = 20 }: { limit: number }) => {
  return useQuery({
    queryKey: ['assets', limit],
    queryFn: async () => {
      const [error, assets] = await to(
        MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: limit,
        })
      );
      if (error) throw new Error(error.message);
      return assets;
    },
  });
};

export const useGetAlbums = () => {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const [error, album] = await to(MusicLibrary.getAlbumsAsync());
      if (error) throw new Error(error.message);
      return album;
    },
  });
};

export const useGetAlbumAssets = ({ name }: { name: string }) => {
  return useQuery({
    queryKey: ['album', name],
    queryFn: async () => {
      const [error, album] = await to(MusicLibrary.getAlbumAssetsAsync(name));
      if (error) throw new Error(error.message);
      return album;
    },
  });
};

export const useGetFolderAssets = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ['folder', id],
    queryFn: async () => {
      const [error, album] = await to(MusicLibrary.getAlbumAssetsAsync(id));
      if (error) throw new Error(error.message);
      return album;
    },
  });
};

export const useGetGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const [error, genres] = await to(MusicLibrary.getGenresAsync());
      if (error) throw new Error(error.message);
      return genres;
    },
  });
};

export const useGetGenresAssets = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ['genres', id],
    queryFn: async () => {
      const [error, genres] = await to(MusicLibrary.getGenreAssetsAsync(id));
      if (error) throw new Error(error.message);
      return genres;
    },
  });
};
export const useGetAllArtist = () => {
  return useQuery({
    queryKey: ['artist'],
    queryFn: async () => {
      const [error, genres] = await to(MusicLibrary.getArtistsAsync());
      if (error) throw new Error(error.message);
      return genres;
    },
  });
};

export const useGetAudioInfo = (fileUrl: string | undefined) => {
  console.log(fileUrl, 'fileurl');
  return useQuery({
    queryKey: ['audio-info', fileUrl],
    enabled: !!fileUrl,
    queryFn: async () => {
      //@ts-ignore
      const info = await MusicInfo.getMusicInfoAsync(fileUrl, {
        title: true,
        artist: true,
        album: true,
        genre: true,
        picture: true,
      });
      return info;
    },
  });
};
