import { MovieGrid } from '../movies';
import { Layout } from '../shared';
import { useMovies } from './useMovies';

export function ComingSoon() {
  const { movies, loading, error } = useMovies();
  const upcoming = movies
    .filter((movie) => movie.visible !== false && movie.isComingSoon === true)
    .sort((a, b) => new Date(a.countdownTarget || a.releaseDate || 0) - new Date(b.countdownTarget || b.releaseDate || 0));

  return (
    <Layout current="coming">
      <section className="movie-poster">
        <div className="section-header">
          <div>
            <h1>Coming Soon</h1>
            <p className="muted">
              Get a sneak peek at the most anticipated big-screen blockbusters arriving soon.
            </p>
          </div>
        </div>
        {loading
          ? <p>Loading movies...</p>
          : error
            ? <p>Coming soon movies are temporarily unavailable.</p>
            : <MovieGrid movies={upcoming} comingSoon />}
      </section>
    </Layout>
  );
}
