import { supabase } from './supabase';
export type ServerTrack = { title: string; url: string; coverUrl: string | number };
import { gqlFetch, edgesToArray } from "./gql";
export const B2_PUBLIC_URL = 'https://f003.backblazeb2.com/file/l2p-kids-directus-test/';
export const DEFAULT_COVER = require("../assets/images/player.png");

type SongRow = { title: string; optimized_file: string | null; cover_file?: string | null };

export function buildMediaUrl(key?: string | null, ext?: string) {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const suffix = ext && !key.includes(".") ? ext : "";
  return `${B2_PUBLIC_URL}${key}${suffix}`;
}

export async function fetchTracks(): Promise<ServerTrack[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('title, optimized_file, cover_file');

  if (error) throw error;
  return (data ?? [])
    .map((row: SongRow) => ({
      title: row.title,
      url: buildMediaUrl(row.optimized_file, ".aac"),
      coverUrl: buildMediaUrl(row.cover_file, ".png") || DEFAULT_COVER,
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
              cover_file
            }
          }
        }
      }
    }
  `;

  type Resp = {
    songs_tagsCollection: {
      edges: { node: { songs: { id: string; title: string; optimized_file: string | null; cover_file?: string | null } } }[];
    };
  };

  const data = await gqlFetch<Resp>(query, { tagId });
  const songs = edgesToArray(data.songs_tagsCollection).map(n => n.songs);

  return songs
    .map(s => ({
      title: s.title,
      url: buildMediaUrl(s.optimized_file, ".aac"),
      coverUrl: buildMediaUrl(s.cover_file, ".png") || DEFAULT_COVER,
    }))
    .filter(t => t.url);
}
