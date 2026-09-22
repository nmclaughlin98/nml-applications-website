async function loadComingSoonMovies() {
  const container = document.getElementById('coming-soon-list');
  if (!container) return;

  try {
    const response = await fetch('assets/data/coming-soon.json');
    if (!response.ok) throw new Error('Unable to load coming soon data');

    const movies = await response.json();
    renderComingSoonMovies(container, movies);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Coming soon movies are temporarily unavailable.</p>';
  }
}

function renderComingSoonMovies(container, movies) {
  if (!movies || !movies.length) {
    container.innerHTML = '<p>No upcoming movies available.</p>';
    return;
  }

  container.innerHTML = movies.map((movie, index) => {
    const countdownId = `countdown-${index}`;
    return `
      <div class="poster-column">
        <img class="poster" src="${movie.poster}" alt="${movie.title}">
        <div class="overlay">
          <div class="overlay-text">${movie.title}</div>
          <div class="runtime">${movie.releaseLabel}</div>
          <img class="rating" src="${movie.ratingImage || 'assets/Images/Ratings/tbc.png'}" alt="TBC">
          <p id="${countdownId}" data-countdown="${movie.countdownTarget}">Loading countdown...</p>
          <button class="button btn-secondary" style="margin-top: 8px;" onclick="showToast('Reminder set for ${movie.title}! We will notify you when advance tickets drop.')">🔔 Remind Me</button>
          <button class="button" data-trailer="${movie.trailer}">▶ Teaser Trailer</button>
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

      el.textContent = `${days}d ${hours}h ${minutes}m remaining`;
    });
  };

  updateCountdowns();
  setInterval(updateCountdowns, 60000);
}

document.addEventListener('DOMContentLoaded', loadComingSoonMovies);
