import { supabase } from './supabase';
export type ServerTrack = { title: string; url: string };
import { gqlFetch, edgesToArray } from "./gql";
const B2_PUBLIC_URL = 'https://f003.backblazeb2.com/file/l2p-kids-directus-test/';

type SongRow = { title: string; optimized_file: string | null };

export async function fetchTracks(): Promise<ServerTrack[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('title, optimized_file');

  if (error) throw error;
  return (data ?? [])
    .map((row: SongRow) => ({
      title: row.title,
      url: row.optimized_file ? `${B2_PUBLIC_URL}${row.optimized_file}.aac` : '',
    }))
    .filter(t => t.url);
}

export async function fetchTracksByTag(tagId: string): Promise<ServerTrack[]> {
  const query = `
    query SongsByTag($tagId: UUID!) {
      songs_tagsCollection(filter: { tag_id: { eq: $tagId } }) {
        edges {
          node {
            songs {
              id
              title
              optimized_file
            }
          }
        }
      }
    }
  `;

  type Resp = {
    songs_tagsCollection: {
      edges: { node: { songs: { id: string; title: string; optimized_file: string | null } } }[];
    };
  };

  const data = await gqlFetch<Resp>(query, { tagId });
  const songs = edgesToArray(data.songs_tagsCollection).map(n => n.songs);

  return songs
    .map(s => ({
      title: s.title,
      url: s.optimized_file ? `${B2_PUBLIC_URL}${s.optimized_file}.aac` : "",
    }))
    .filter(t => t.url);
}


