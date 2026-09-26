async function loadMovieDetail() {
  const params = new URLSearchParams(window.location.search);
  const requestedMovie = params.get('movie') || 'deadpool-2';

  let movie;
  try {
    movie = await fetchMovieData(requestedMovie);
  } catch (error) {
    console.error(error);
    document.getElementById('movie-title').textContent = 'Movie details are temporarily unavailable';
    return;
  }

  if (!movie) {
    document.getElementById('movie-title').textContent = 'Movie not found';
    return;
  }

  const releaseDate = new Date(movie.releaseDate);

  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedReleaseDate = releaseDate.toLocaleDateString('en-GB', dateOptions);

  const movieTitle = document.getElementById('movie-title');
  const movieStill = document.getElementById('movie-still');
  const movieRating = document.getElementById('movie-rating');
  const movieRuntime = document.getElementById('movie-runtime');
  const movieCast = document.getElementById('movie-cast');
  const movieDirector = document.getElementById('movie-director');
  const movieReleaseDate = document.getElementById('movie-release-date');
  const synopsisContainer = document.getElementById('movie-synopsis');
  const trailerFrame = document.getElementById('movie-trailer');
  const showtimeContainer = document.getElementById('movie-showtimes');
  const bookLink = document.getElementById('movie-book-link');

  document.title = `Blockbuster Theatre - ${movie.title}`;
  movieTitle.textContent = movie.title;
  movieStill.src = `${movie.still}` || 'assets/Images/logo.png';
  movieStill.alt = movie.title;
  movieRating.src = `../assets/images/ratings/${movie.rating}.png`;
  movieRating.alt = movie.rating;
  movieRuntime.textContent = `Run Time: ${movie.runtime} mins`;
  movieCast.innerHTML = `<strong>Starring:</strong> ${movie.starring.join(', ')}`;
  movieDirector.textContent = `Director: ${movie.director}`;
  movieReleaseDate.textContent = `Release Date: ${formattedReleaseDate}`;
  synopsisContainer.innerHTML = movie.synopsis
    .split('\n')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');

  if (movie.trailer) {
    trailerFrame.src = movie.trailer;
  } else {
    trailerFrame.style.display = 'none';
  }

  const selectedTime = new URLSearchParams(window.location.search).get('time');

  showtimeContainer.innerHTML = Object.entries(movie.showtimes || {})
    .map(([day, times]) => {
      const list = times.map(time => {
        const isSelected = selectedTime && time === selectedTime;
        return `<li class="show-time ${isSelected ? 'active' : ''}" data-time="${time}">${time}</li>`;
      }).join('');
      return `
        <li class="day-of-week">${day} </li>
        <div class="show-time-list">${list}</div><br>
        <hr>
      `;
    })
    .join('');

  const showTimeItems = document.querySelectorAll('.show-time');
  showTimeItems.forEach(item => {
    item.addEventListener('click', () => {
      const time = item.getAttribute('data-time');
      showTimeItems.forEach(link => link.classList.toggle('active', link === item));
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('time', time);
      window.history.replaceState({}, '', currentUrl);
      bookLink.href = `../bookNow.html?movie=${encodeURIComponent(movie.title)}&time=${encodeURIComponent(time)}`;
    });
  });

  bookLink.href = selectedTime
    ? `../bookNow.html?movie=${encodeURIComponent(movie.title)}&time=${encodeURIComponent(selectedTime)}`
    : `../bookNow.html?movie=${encodeURIComponent(movie.title)}`;
}

async function fetchMovieData(identifier) {
  const movieId = /^\d+$/.test(identifier)
    ? identifier
    : await findMovieIdBySlug(identifier);
  if (!movieId) return null;

  const response = await fetch(`https://x0gtvekr3d.execute-api.eu-west-2.amazonaws.com/movies/${encodeURIComponent(movieId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load movie data');

  return response.json();
}

async function findMovieIdBySlug(slug) {
  const response = await fetch('https://x0gtvekr3d.execute-api.eu-west-2.amazonaws.com/movies');
  if (!response.ok) throw new Error('Unable to load movie data');

  const data = await response.json();
  if (!Array.isArray(data.movies)) throw new Error('Invalid movie list response');

  const movie = data.movies.find(item => item.slug === slug);
  return movie?.movieId ? String(movie.movieId) : null;
}

document.addEventListener('DOMContentLoaded', loadMovieDetail);
