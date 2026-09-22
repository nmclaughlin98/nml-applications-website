let timetableMovies = [];
let selectedDay = 'Monday';

function getMovieGenre(movie) {
    if (Array.isArray(movie.genres) && movie.genres.length) {
        return movie.genres.join(' / ');
    }

    return movie.genre || 'General';
}

function getMovieShowtimes(movie) {
    if (movie.showtimes && movie.showtimes[selectedDay]) {
        return movie.showtimes[selectedDay];
    }

    return [];
}

async function loadTimetableMovies() {
    const container = document.getElementById('timetableList');
    if (!container) return;

    try {
        const response = await fetch('assets/data/movies.json');
        if (!response.ok) throw new Error('Unable to load timetable data');

        timetableMovies = await response.json();
        renderTimetable();
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Movie timetable is temporarily unavailable.</p>';
    }
}

function renderTimetable() {
    const container = document.getElementById('timetableList');
    if (!container) return;

    const searchInput = document.getElementById('movieSearch');
    const searchVal = (searchInput?.value || '').toLowerCase().trim();
    container.innerHTML = '';

    const visibleMovies = Array.isArray(timetableMovies)
        ? timetableMovies.filter(movie => movie.visible !== false)
        : [];

    visibleMovies.forEach(movie => {
        const title = movie.title || 'Untitled movie';
        if (searchVal && !title.toLowerCase().includes(searchVal)) return;

        const times = getMovieShowtimes(movie);
        if (!times.length) return;

        const uniqueTimes = [...new Set(times)];

        const card = document.createElement('div');
        card.className = 'movie-card';

        const showtimesHTML = uniqueTimes.map((time, idx) => `
      <a href="bookNow.html?movie=${encodeURIComponent(title)}&time=${time}&day=${selectedDay}" class="showtime-btn">
        ${time}
        <span>Screen ${idx + 1}</span>
      </a>
    `).join('');

        card.innerHTML = `
      <div class="movie-info">
        <div class="movie-title">${title}</div>
        <div class="movie-meta">
          <span class="badge-genre">${getMovieGenre(movie)}</span>
          <span>2D / 4K Laser</span>
        </div>
      </div>
      <div class="showtimes-grid">
        ${showtimesHTML}
      </div>
    `;

        container.appendChild(card);
    });

    if (!container.innerHTML.trim()) {
        container.innerHTML = '<p>No movies available for this search.</p>';
    }
}

function filterDay(day) {
    selectedDay = day;
    document.querySelectorAll('.day-tab').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === day);
    });
    renderTimetable();
}

function filterMovies() {
    renderTimetable();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTimetableMovies();
});
