export const SEARCHABLE_TAGS = `
query SearchableTags {
  tagsCollection(
    filter: { is_searchable: { eq: true } }
    orderBy: [{ sort_order: AscNullsLast }]
  ) {
    edges {
      node {
        id
        name
        gradient_1
        gradient_2
        sort_order
      }
    }
  }
}
`;

export const MENU_TAGS = `
query MenuTags {
  tagsCollection(
    filter: { is_menu: { eq: true } }
    orderBy: [{ sort_order: AscNullsLast }]
  ) {
    edges {
      node {
        id
        name
        gradient_1
        gradient_2
        sort_order
      }
    }
  }
}
`;

export const SONGS_BY_TAG_ID = `
query SongsByTagId($tagId: UUID!) {
  songs_tagsCollection(filter: { tag_id: { eq: $tagId } }) {
    edges { node { songs { id title optimized_file cover_file } } }
  }
}
`;

export const SEARCH_SONGS = `
query SearchSongs($q: String!) {
  songsCollection(
    filter: {
      or: [
        { title: { ilike: $q } }
        { lyrics: { ilike: $q } }
      ]
    }
    first: 50
  ) {
    edges {
      node {
        id
        title
        lyrics
        optimized_file
        cover_file
      }
    }
  }
}
`;
