import { useEffect, useState } from 'react';
import TrackPlayer, { Capability } from 'react-native-track-player';

export default function useSetupTrackPlayer() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);
  return ready;
}
