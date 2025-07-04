import to from 'await-to-ts';
import ky, { HTTPError } from 'ky';

import { env } from '@/config/env';

export const getToken = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_secret', env.clientSecret);
  params.append('client_id', env.clientId);
  const [error, response] = await to(
    ky.post(
      `https://accounts.spotify.com/api/token?grant_type=client_credentials&client_secret=${env.clientSecret}&client_id=${env.clientId}`,
      {
        body: params,
      }
    )
  );
  if (error instanceof HTTPError) {
    const err = await error.response.json();
    throw new Error(err);
  }
  const data = response.json<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>();
  return data;
};
