const MOVIES_API_URL = 'https://x0gtvekr3d.execute-api.eu-west-2.amazonaws.com/movies';

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
  const upcomingMovies = Array.isArray(movies) ? movies.filter(movie => movie.visible !== false) : [];

  if (!upcomingMovies.length) {
    container.innerHTML = '<p>No upcoming movies available.</p>';
    return;
  }

  container.innerHTML = upcomingMovies.map((movie, index) => {
    const countdownId = `countdown-${index}`;
    const countdownTarget = getComingSoonCountdownTarget(movie);

    return `
      <div class="poster-column">
        <img class="poster" src="${movie.poster || 'assets/Images/logo.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="release-date">${getComingSoonReleaseLabel(movie)}</div>
          <div class="overlay-text"></div>
          <p id="${countdownId}" data-countdown="${countdownTarget || ''}">Loading countdown...</p>
          <button class="button btn-secondary" style="margin-top: 8px;" onclick="showToast('Reminder set for ${movie.title}! We will notify you when advance tickets drop.')">Remind Me</button>
          <button class="button" data-trailer="${movie.trailer || ''}" type="button">Teaser Trailer</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('#coming-soon-list [data-trailer]').forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const url = trigger.getAttribute('data-trailer');
      if (!url) return;

      if (typeof openTrailer === 'function') {
        openTrailer(url);
        return;
      }

      const modal = document.getElementById('trailer-modal');
      const iframe = document.getElementById('trailer-iframe');
      if (!modal || !iframe) return;

      const embedUrl = url.includes('autoplay=1') ? url : (url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`);
      iframe.src = embedUrl;
      modal.classList.add('open');
      document.body.classList.add('noScroll');
    });
  });

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

      el.textContent = `${days}d ${hours}h ${minutes}m remaining`;
    });
  };

  updateCountdowns();
  setInterval(updateCountdowns, 60000);
}

document.addEventListener('DOMContentLoaded', loadComingSoonMovies);
