import { AudioPro, AudioProEventType } from 'react-native-audio-pro';
import { useAudioPlayerStore } from '@/store/audio-player';

// Set up event listeners outside React components!
AudioPro.addEventListener((event) => {
  console.log('AudioPro event:', event);
  if (event.type === AudioProEventType.TRACK_ENDED) {
    useAudioPlayerStore.getState().playNextTrack();
  }
  // TODO: Add error event handling once the correct event type is confirmed
});
