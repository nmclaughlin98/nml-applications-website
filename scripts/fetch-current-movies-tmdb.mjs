import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Paths relative to project root
const INPUT_FILE = path.resolve('./website/assets/data/current-movie-ids.json');
const OUTPUT_FILE = path.resolve('./website/assets/data/movies.json');

async function fetchMovieData(item) {
    const movieId = typeof item === 'number' ? item : item.id;
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,release_dates`;

    const res = await fetch(url);
    if (!res.ok) {
        console.error(`Failed to fetch TMDB movie ID ${movieId}: ${res.statusText}`);
        return null;
    }
    const data = await res.json();

    // Extract Director
    const directorObj = data.credits?.crew?.find(person => person.job === 'Director');

    // Extract YouTube Trailer Key
    const trailerObj = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');

    // Extract UK (or US) Content Rating
    const ukRelease = data.release_dates?.results?.find(r => r.iso_3166_1 === 'GB');
    const rating = ukRelease?.release_dates?.[0]?.certification || 'PG';

    // Fallback showtimes if not explicitly set in movie-ids.json
    const defaultShowtimes = {
        "Monday": ["11:00", "13:00", "15:00", "19:00"],
        "Tuesday": ["11:00", "13:00", "15:00", "19:00"],
        "Wednesday": ["11:00", "13:00", "15:00", "19:00"],
        "Thursday": ["11:00", "13:00", "15:00", "19:00"],
        "Friday": ["11:00", "13:00", "15:00", "19:00"],
        "Saturday": ["11:00", "13:00", "15:00", "19:00"],
        "Sunday": ["11:00", "13:00", "15:00", "19:00"]
    };

    return {
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: data.title,
        genres: (data.genres || []).slice(0, 3).map(genre => genre.name),
        genre: (data.genres || [])[0]?.name || 'Action',
        rating: rating,
        score: parseFloat(data.vote_average.toFixed(1)),
        runtime: data.runtime,
        releaseDate: ukRelease?.release_dates?.[ukRelease.release_dates.length - 1]?.release_date || data.release_date,
        visible: item.visible ?? true,
        topPick: item.topPick ?? false,
        starring: data.credits?.cast?.slice(0, 5).map(actor => actor.name) || [],
        director: directorObj ? directorObj.name : 'Unknown',
        synopsis: data.overview,
        still: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
        trailer: trailerObj ? `https://www.youtube-nocookie.com/embed/${trailerObj.key}?rel=0` : null,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        showtimes: item.showtimes || defaultShowtimes
    };
}

async function run() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found at ${INPUT_FILE}`);
        process.exit(1);
    }

    const rawInput = fs.readFileSync(INPUT_FILE, 'utf-8');
    const movieEntries = JSON.parse(rawInput);

    console.log(`Processing ${movieEntries.length} movie entries from current-movie-ids.json...`);

    const results = await Promise.all(movieEntries.map(fetchMovieData));
    const validMovies = results.filter(Boolean);

    // Optional: Keep entries sorted alphabetically by title
    validMovies.sort((a, b) => a.title.localeCompare(b.title));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(validMovies, null, 2));
    console.log(`Successfully updated ${OUTPUT_FILE}`);
}

run();