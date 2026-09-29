import { MovieGrid } from '../../movies';

export function MovieSection({ title, movies }) {
  return (
    <section className="movie-poster">
      <div className="section-header">
        <h1>{title}</h1>
        <a className="btn-glass button button-no-gap" href="./nowShowing.html">View All Movies <span className="material-symbols-outlined">chevron_right</span></a>
      </div>
      <MovieGrid movies={movies} />
    </section>
  );
}
