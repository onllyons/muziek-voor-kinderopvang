import TrackPlayer, { Event } from 'react-native-track-player';

export default async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    try { await TrackPlayer.play(); } catch (e) { console.warn('RemotePlay', e); }
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    try { await TrackPlayer.pause(); } catch (e) { console.warn('RemotePause', e); }
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try { await TrackPlayer.skipToNext(); } catch (e) { }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try {
      const pos = await TrackPlayer.getPosition();
      if (pos > 3) {
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (e) { }
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (e) => {
    try { await TrackPlayer.seekTo(e.position); } catch (err) { console.warn('RemoteSeek', err); }
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    try { await TrackPlayer.pause(); } catch {}
  });
}
