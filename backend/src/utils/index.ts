import to from 'await-to-ts';
import ky from 'ky';
import { env } from '../../config/env';

export const getSpotifyArt = async ({ albumName }: { albumName: string }) => {
  const [error, response] = await to(
    ky
      .get(`${env.spotifyUrl}/search?q=${albumName}&type=album`, {
        headers: {
          Authorization: `Bearer 123456`,
        },
      })
      .json()
  );
};
