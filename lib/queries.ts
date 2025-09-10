import { supabase } from './supabase';
export type ServerTrack = { title: string; url: string };
const B2_PUBLIC_URL = 'https://f003.backblazeb2.com/file/l2p-kids-directus-test/';

type SongRow = {
  title: string;
  optimized_file: string | null;
};

export async function fetchTracks(): Promise<ServerTrack[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('title, optimized_file');

  if (error) throw error;
  return (data ?? [])
    .map((row: SongRow) => ({
      title: row.title,
      url: row.optimized_file
        ? `${B2_PUBLIC_URL}${row.optimized_file}.aac`
        : '',
    }))
    .filter(t => t.url);
}
