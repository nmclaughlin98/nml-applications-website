async function loadComingSoonMovies() {
  const container = document.getElementById('coming-soon-list');
  if (!container) return;

  try {
    const response = await fetch(window.APP_CONFIG.moviesApiUrl);
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
        <img class="poster" src="${movie.poster || 'assets/Images/logo-hi-res.png'}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="overlay-text coming-soon-release-date">${getComingSoonReleaseLabel(movie)}</div>
          <div id="${countdownId}" class="countdown-timer" data-countdown="${countdownTarget || ''}" role="timer" aria-label="Time until release">
            <span class="countdown-unit"><span class="countdown-value" data-countdown-days>--</span><span class="countdown-label">Days</span></span>
            <span class="countdown-unit"><span class="countdown-value" data-countdown-hours>--</span><span class="countdown-label">Hours</span></span>
            <span class="countdown-unit"><span class="countdown-value" data-countdown-minutes>--</span><span class="countdown-label">Minutes</span></span>
            <span class="countdown-unit"><span class="countdown-value" data-countdown-seconds>--</span><span class="countdown-label">Seconds</span></span>
          </div>
          <a class="button" href="templates/movie-detail-coming-soon.html?movie=${detailId}">More Info</a>
        </div>
      </div>
    `;
  }).join('');

  initComingSoonCountdowns();
}

function initComingSoonCountdowns() {
  const countdownEls = document.querySelectorAll('.countdown-timer[data-countdown]');
  if (!countdownEls.length) return;

  const updateCountdowns = () => {
    let hasFutureCountdown = false;

    countdownEls.forEach(el => {
      const target = new Date(el.getAttribute('data-countdown'));
      if (Number.isNaN(target.getTime())) {
        el.classList.add('is-unavailable');
        el.setAttribute('aria-label', 'Release date coming soon');
        el.textContent = 'Release date coming soon';
        return;
      }

      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        el.classList.add('is-live');
        el.setAttribute('aria-label', 'Now showing');
        el.textContent = 'Now showing';
        return;
      }

      hasFutureCountdown = true;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      el.querySelector('[data-countdown-days]').textContent = String(days);
      el.querySelector('[data-countdown-hours]').textContent = String(hours).padStart(2, '0');
      el.querySelector('[data-countdown-minutes]').textContent = String(minutes).padStart(2, '0');
      el.querySelector('[data-countdown-seconds]').textContent = String(seconds).padStart(2, '0');
    });

    return hasFutureCountdown;
  };

  if (updateCountdowns()) {
    const intervalId = setInterval(() => {
      if (!updateCountdowns()) clearInterval(intervalId);
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', loadComingSoonMovies);
