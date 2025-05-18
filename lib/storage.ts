import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const storage = new MMKV({
  id: 'app-storage',
});

export const mmkvStorage: StateStorage = {
  getItem: (name: string): Promise<string | null> => {
    console.log(name, 'GET');
    const value = storage.getString(name);
    return value ? Promise.resolve(value) : Promise.resolve(null);
  },
  setItem: (name: string, value: string): Promise<void> => {
    console.log(name, value, 'SET');
    storage.set(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string): Promise<void> => {
    storage.delete(name);
    return Promise.resolve();
  },
};
