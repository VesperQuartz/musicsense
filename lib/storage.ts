import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'app-storage',
});

export const mmkvStorage = {
  getItem: (name: string): Promise<string | null> => {
    const value = storage.getString(name);
    return value ? Promise.resolve(value) : Promise.resolve(null);
  },
  setItem: (name: string, value: string): Promise<void> => {
    storage.set(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string): Promise<void> => {
    storage.delete(name);
    return Promise.resolve();
  },
};
