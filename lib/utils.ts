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

export const formatDuration = (milliseconds: number): string => {
  if (!milliseconds) return '0:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
