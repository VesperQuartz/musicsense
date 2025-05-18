import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from '@tanstack/react-query';
import to from 'await-to-ts';
import ky, { HTTPError } from 'ky';

import { env } from '@/config/env';
import { getToken } from '@/services';
import { useTokenStore } from '@/store/store';

type Memory = {
  userId: string | undefined;
  name: string;
  description?: string | undefined;
};

type Tracks = {
  url: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  artwork: string;
  tags: any;
  memory: string;
  type: string;
  userId: string;
};

export const useCreateMemory = () => {
  return useMutation({
    mutationKey: ['memories'],
    mutationFn: async ({ userId, name, description }: Memory) => {
      const [error, response] = await to(
        ky.post(`${env.baseUrl}/memories`, {
          json: { userId, name, description },
        })
      );
      if (error instanceof HTTPError) {
        const err = await error.response.json();
        throw new Error(err.message);
      }
      return response.json<Memory>();
    },
  });
};

export const useGetMemories = () => {
  const user = useUser();
  return useQuery({
    queryKey: ['memories', user.user?.id],
    queryFn: async () => {
      const [error, response] = await to(ky(`${env.baseUrl}/memories/${user.user?.id}`));
      if (error instanceof HTTPError) {
        const err = await error.response.json();
        throw new Error(err.message);
      }
      return response.json<Memory[]>();
    },
  });
};

export const useSearchAlbum = ({ albumName }: { albumName: string | undefined }) => {
  const { access_token, setToken } = useTokenStore();
  console.log(access_token, 'TOK');
  return useQuery({
    queryKey: ['album-art', access_token, albumName],
    enabled: !!albumName,
    queryFn: async () => {
      const [error, response] = await to(
        ky
          .get(`${env.spotifyUrl}/search?q=${albumName}&type=album,track&limit=2`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .json()
      );
      if (error instanceof HTTPError) {
        const err = await error.response.json();
        console.log(error, 'E', error.response.status === 400);
        if (error.response.status === 401 || error.response.status === 400) {
          const [tError, token] = await to(getToken());
          if (tError) {
            console.log(tError, 'TERROR');
          }
          setToken(token.access_token);
        } else {
          throw new Error(err.message);
        }
      }
      return {
        //@ts-ignore
        duration: response?.tracks?.items?.[0]?.duration_ms,
        //@ts-ignore
        image_url: response?.tracks?.items?.[0]?.album?.images?.[0]?.url,
      } as { duration: number; image_url: string };
    },
  });
};

export const useGetUserTracks = (memory: string | undefined) => {
  const user = useUser();
  return useQuery({
    queryKey: ['tracks', user.user?.id],
    enabled: !!memory,
    queryFn: async () => {
      const [error, response] = await to(ky(`${env.baseUrl}/tracks/${memory}/${user.user?.id}`));
      if (error instanceof HTTPError) {
        const err = await error.response.json();
        throw new Error(err.message);
      }
      return response.json<Tracks[]>();
    },
  });
};
