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

let allMoviesRequest;

async function fetchAllMovies() {
  if (!allMoviesRequest) {
    allMoviesRequest = fetch(window.APP_CONFIG.moviesApiUrl).then(async response => {
      if (!response.ok) throw new Error('Unable to load movie data');

      const data = await response.json();
      if (!Array.isArray(data.movies)) throw new Error('Invalid movie list response');

      return data.movies;
    });
  }

  return allMoviesRequest;
}

async function fetchMovies() {
  const movies = await fetchAllMovies();
  return movies.filter(movie => movie.visible !== false && movie.isComingSoon !== true);
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
        <img class="poster" src="${movie.poster || 'assets/Images/logo-hi-res.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="runtime">${movie.runtime || 0} mins</div>
          <a class="button" href="bookNow.html?movie=${safeTitle}">Book Now</a>
          <a class="button" href="templates/movie-detail.html?movie=${detailId}">More Info</a>
        </div>
      </div>
    `;
  }).join('');
}

function getCarouselDescription(movie) {
  if (!movie.synopsis) return '';
  return movie.synopsis.split('\n').find(paragraph => paragraph.trim()) || '';
}

function getCarouselShowtime(movie) {
  const showtimes = movie.showtimes || {};
  for (const day of Object.keys(showtimes)) {
    const times = showtimes[day];
    if (Array.isArray(times) && times.length) return times[0];
  }

  return null;
}

function renderHeroCarousel(carousel, movies) {
  const inner = carousel.querySelector('.carousel-inner');
  const indicators = carousel.querySelector('.carousel-indicators');
  if (!inner || !movies.length) return;

  inner.innerHTML = movies.map((movie, index) => {
    const detailId = encodeURIComponent(movie.movieId ?? movie.slug ?? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const image = movie.largeStill || movie.still || movie.poster || 'assets/images/logo-hi-res.png';
    const description = getCarouselDescription(movie);
    const showtime = getCarouselShowtime(movie);
    const bookHref = `bookNow.html?movie=${encodeURIComponent(movie.title)}${showtime ? `&time=${encodeURIComponent(showtime)}` : ''}`;
    const trailerButton = movie.trailer
      ? `<button class="button btn-secondary" data-trailer="${movie.trailer}">Watch Trailer</button>`
      : '';

    return `
      <div class="item ${index === 0 ? 'active' : ''}">
        <img src="${image}" alt="${movie.title}">
        <div class="carousel-caption">
          <h2>${movie.title}</h2>
          <p>${description}</p>
          <div class="hero-actions">
            <a class="button" href="${bookHref}">Book Tickets</a>
            ${trailerButton}
            <a class="button btn-glass" href="templates/movie-detail.html?movie=${detailId}">More Info</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (indicators) {
    indicators.innerHTML = movies.map((_, index) => `<li class="${index === 0 ? 'active' : ''}"></li>`).join('');
  }
}

async function loadHeroCarousel() {
  const carousel = document.getElementById('picturecarousel');
  if (!carousel) return;

  try {
    const allMovies = await fetchAllMovies();
    const carouselMovies = allMovies.filter(movie => movie.visible !== false && movie.isCarousel === true);

    if (!carouselMovies.length) return;

    renderHeroCarousel(carousel, carouselMovies);
  } catch (error) {
    console.error(error);
  } finally {
    window.initHeroCarousel?.();
    window.initTrailerModal?.();
  }
}

async function loadHomeSections() {
  await Promise.all([
    loadHeroCarousel(),
    loadMovieSection('newReleases', 'new-releases-list'),
    loadMovieSection('topPicks', 'top-picks-list')
  ]);
}

document.addEventListener('DOMContentLoaded', loadHomeSections);