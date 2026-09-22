const SECTION_CONFIG = {
  newReleases: {
    label: 'New Releases',
    limit: 5,
    getMovies: (movies, config) => movies
      .filter(movie => movie.visible !== false)
      .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
      .slice(0, config.limit)
  },
  topPicks: {
    label: 'Top Picks',
    limit: 5,
    getMovies: (movies, config) => movies
      .filter(movie => movie.visible !== false)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, config.limit)
  }
};

async function loadMovieSection(sectionKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('assets/data/movies.json');
    if (!response.ok) throw new Error(`Unable to load ${sectionKey} data`);

    const movies = await response.json();
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
    const detailSlug = encodeURIComponent(movie.slug || movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const ratingImage = movie.ratingImage || 'assets/Images/Ratings/tbc.png';

    return `
      <div class="poster-column">
        <img class="poster" src="${movie.poster || 'assets/Images/logo.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="runtime">${movie.runtime || 0} mins</div>
          <img class="rating" src="${ratingImage}" alt="${movie.rating || 'Rating'}">
          <a class="button" href="bookNow.html?movie=${safeTitle}">Book Now</a>
          <a class="button" href="templates/movie-detail.html?movie=${detailSlug}">More Info</a>
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