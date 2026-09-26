const SECTION_CONFIG = {
  newReleases: {
    label: 'New Releases',
    limit: 6,
    getMovies: (movies, config) => movies
      .filter(movie => movie.visible !== false)
      .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
      .slice(0, config.limit)
  },
  topPicks: {
    label: 'Top Picks',
    limit: 6,
    getMovies: (movies, config) => movies
      .filter(movie => movie.visible !== false)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, config.limit)
  }
};

const MOVIES_API_URL = 'https://x0gtvekr3d.execute-api.eu-west-2.amazonaws.com/movies';
let moviesRequest;

async function fetchMovies() {
  if (!moviesRequest) {
    moviesRequest = fetch(MOVIES_API_URL).then(async response => {
      if (!response.ok) throw new Error('Unable to load movie data');

      const data = await response.json();
      if (!Array.isArray(data.movies)) throw new Error('Invalid movie list response');

      return data.movies.filter(movie => movie.visible !== false && movie.isComingSoon !== true);
    });
  }

  return moviesRequest;
}

async function loadMovieSection(sectionKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const movies = await fetchMovies();
    const config = SECTION_CONFIG[sectionKey];
    const sectionMovies = config ? config.getMovies(movies, config) : [];

    renderMovieSection(container, sectionMovies);
  } catch (error) {
    console.error(error);
    const sectionLabel = SECTION_CONFIG[sectionKey]?.label || 'This section';
    container.innerHTML = `<p>${sectionLabel} are temporarily unavailable.</p>`;
  }
}

function renderMovieSection(container, movies) {
  container.innerHTML = movies.map(movie => {
    const safeTitle = encodeURIComponent(movie.title);
    const detailId = encodeURIComponent(movie.movieId ?? movie.slug ?? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const ratingImage = `assets/images/ratings/${movie.rating}.png` || 'assets/images/ratings/tbc.png';


    return `
      <div class="poster-column">
        <img class="poster" src="${movie.poster || 'assets/Images/logo.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="runtime">${movie.runtime || 0} mins</div>
          <img class="rating" src="${ratingImage}" alt="${movie.rating || 'Rating'}">
          <a class="button" href="bookNow.html?movie=${safeTitle}">Book Now</a>
          <a class="button" href="templates/movie-detail.html?movie=${detailId}">More Info</a>
        </div>
      </div>
    `;
  }).join('');
}

async function loadHomeSections() {
  await Promise.all([
    loadMovieSection('newReleases', 'new-releases-list'),
    loadMovieSection('topPicks', 'top-picks-list')
  ]);
}

document.addEventListener('DOMContentLoaded', loadHomeSections);