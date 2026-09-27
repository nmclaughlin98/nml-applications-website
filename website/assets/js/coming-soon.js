const MOVIES_API_URL = 'https://y02g06phsb.execute-api.eu-west-2.amazonaws.com';

async function loadComingSoonMovies() {
  const container = document.getElementById('coming-soon-list');
  if (!container) return;

  try {
    const response = await fetch(MOVIES_API_URL);
    if (!response.ok) throw new Error('Unable to load upcoming movie data');

    const data = await response.json();
    if (!Array.isArray(data.movies)) throw new Error('Invalid movie list response');

    const movies = data.movies.filter(movie => movie.isComingSoon === true);
    renderComingSoonMovies(container, movies);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Coming soon movies are temporarily unavailable.</p>';
  }
}

function getComingSoonCountdownTarget(movie) {
  return movie.countdownTarget || movie.releaseDate || null;
}

function getComingSoonReleaseLabel(movie) {
  if (movie.releaseLabel) return movie.releaseLabel;

  if (!movie.releaseDate) return 'Release date coming soon';

  const releaseDate = new Date(movie.releaseDate);
  if (Number.isNaN(releaseDate.getTime())) return 'Release date coming soon';

  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return releaseDate.toLocaleDateString('en-GB', dateOptions);
}

function renderComingSoonMovies(container, movies) {
  const upcomingMovies = Array.isArray(movies)
    ? movies
      .filter(movie => movie.visible !== false)
      .sort((a, b) => {
        const aDate = getComingSoonCountdownTarget(a);
        const bDate = getComingSoonCountdownTarget(b);
        const aTarget = aDate ? new Date(aDate).getTime() : NaN;
        const bTarget = bDate ? new Date(bDate).getTime() : NaN;
        return (Number.isNaN(aTarget) ? Infinity : aTarget) - (Number.isNaN(bTarget) ? Infinity : bTarget);
      })
    : [];

  if (!upcomingMovies.length) {
    container.innerHTML = '<p>No upcoming movies available.</p>';
    return;
  }

  container.innerHTML = upcomingMovies.map((movie, index) => {
    const countdownId = `countdown-${index}`;
    const countdownTarget = getComingSoonCountdownTarget(movie);
    const detailId = encodeURIComponent(movie.movieId ?? movie.slug ?? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));


    return `
      <div class="poster-column">
        <img class="poster" src="${movie.poster || 'assets/Images/logo.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="overlay-text coming-soon-release-date">${getComingSoonReleaseLabel(movie)}</div>
          <p id="${countdownId}" data-countdown="${countdownTarget || ''}">Loading countdown...</p>
          <a class="button" href="templates/movie-detail-coming-soon.html?movie=${detailId}">More Info</a>
        </div>
      </div>
    `;
  }).join('');

  initComingSoonCountdowns();
}

function initComingSoonCountdowns() {
  const countdownEls = document.querySelectorAll('[data-countdown]');
  if (!countdownEls.length) return;

  const updateCountdowns = () => {
    countdownEls.forEach(el => {
      const target = new Date(el.getAttribute('data-countdown'));
      if (Number.isNaN(target.getTime())) {
        el.textContent = 'Release date coming soon';
        return;
      }

      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        el.textContent = 'Now showing';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
  };

  updateCountdowns();
  setInterval(updateCountdowns, 1000);
}

document.addEventListener('DOMContentLoaded', loadComingSoonMovies);
