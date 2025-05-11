import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const removeExtension = (file: string) => {
  const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'];
  const regex = new RegExp(`(${audioExtensions.join('|')})$`, 'i');
  return file.replace(regex, '');
};
