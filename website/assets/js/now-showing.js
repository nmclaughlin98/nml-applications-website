let allMovies = [];

function sortMovies(movies, sortValue) {
  const sorted = [...movies];

  switch (sortValue) {
    case 'title-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      break;
    case 'title-desc':
      sorted.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }));
      break;
    case 'release-desc':
      sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case 'release-asc':
      sorted.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
      break;
    case 'score-desc':
      sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      break;
    case 'score-asc':
      sorted.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
      break;
    default:
      return movies;
  }

  return sorted;
}

function inferGenreKey(movie) {
  const genre = (movie.genre || '').toLowerCase();

  if (genre.includes('action')) return 'action';
  if (genre.includes('comedy')) return 'comedy';
  if (genre.includes('horror')) return 'horror';
  if (genre.includes('biographical')) return 'biographical';
  if (genre.includes('family') || genre.includes('kids')) return 'kids';
  if (genre.includes('classic')) return 'classics';

  return 'all';
}

function getActiveGenre() {
  return document.querySelector('.genre-tab.active')?.getAttribute('data-genre') || 'all';
}

function getFilteredMovies() {
  const searchInput = document.getElementById('movie-search-input');
  const searchTerm = (searchInput?.value || '').toLowerCase().trim();
  const activeGenre = getActiveGenre();

  return allMovies.filter(movie => {
    const title = (movie.title || '').toLowerCase();
    const matchesSearch = !searchTerm || title.includes(searchTerm);
    const matchesGenre = activeGenre === 'all' || inferGenreKey(movie) === activeGenre;
    return matchesSearch && matchesGenre;
  });
}

function renderMovies(container, movies) {
  container.innerHTML = movies.map(movie => {
    const genreKey = inferGenreKey(movie);
    const safeTitle = encodeURIComponent(movie.title);
    const detailSlug = encodeURIComponent(movie.slug || movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const ratingImage = `../assets/Images/Ratings/${movie.rating}.png` || 'assets/Images/Ratings/tbc.png';

    return `
      <div class="poster-column" data-genre="${genreKey}">
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

function applySortAndFilters(container) {
  const sortSelect = document.getElementById('movie-sort-select');
  const selectedSort = sortSelect?.value || 'title-asc';
  const filteredMovies = getFilteredMovies();
  const sortedMovies = sortMovies(filteredMovies, selectedSort);
  renderMovies(container, sortedMovies);
}

function setupNowShowingControls(container) {
  const sortSelect = document.getElementById('movie-sort-select');
  const searchInput = document.getElementById('movie-search-input');
  const genreTabs = document.querySelectorAll('.genre-tab');

  sortSelect?.addEventListener('change', () => applySortAndFilters(container));
  searchInput?.addEventListener('input', () => applySortAndFilters(container));

  genreTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      genreTabs.forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
      applySortAndFilters(container);
    });
  });
}

function renderNowShowingMovies(container, movies) {
  allMovies = movies.filter(movie => movie.visible !== false);
  setupNowShowingControls(container);
  applySortAndFilters(container);
}

async function loadNowShowingMovies() {
  const container = document.getElementById('now-showing-list');
  if (!container) return;

  try {
    const response = await fetch('assets/data/movies.json');
    if (!response.ok) throw new Error('Unable to load now showing data');

    const movies = await response.json();
    renderNowShowingMovies(container, movies);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Movie listings are temporarily unavailable.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadNowShowingMovies);