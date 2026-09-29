export function movieId(movie) {
  return encodeURIComponent(
    movie.movieId
      ?? movie.slug
      ?? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  );
}
