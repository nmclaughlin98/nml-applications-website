import { useEffect, useState } from 'react';
import { movieId } from '../../movies';

function withAutoplay(url) {
    if (/[?&]autoplay=1(?:&|$)/.test(url)) return url;
    const hashIndex = url.indexOf('#');
    const urlWithoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
    return `${urlWithoutHash}${urlWithoutHash.includes('?') ? '&' : '?'}autoplay=1${hash}`;
}

export function HeroCarousel({ movies }) {
    const [index, setIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(null);
    const [slideDirection, setSlideDirection] = useState('right');
    const [isPaused, setIsPaused] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState('');

    function changeSlide(nextIndex, direction) {
        if (nextIndex === index) return;
        setPreviousIndex(index);
        setSlideDirection(direction);
        setIndex(nextIndex);
    }

    useEffect(() => {
        if (!movies.length || isPaused || trailerUrl) return undefined;
        const timer = setInterval(() => changeSlide((index + 1) % movies.length, 'right'), 6000);
        return () => clearInterval(timer);
    }, [movies.length, index, isPaused, trailerUrl]);

    useEffect(() => {
        if (!trailerUrl) return undefined;

        function closeOnEscape(event) {
            if (event.key === 'Escape') setTrailerUrl('');
        }

        document.body.classList.add('noScroll');
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.classList.remove('noScroll');
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [trailerUrl]);

    if (!movies.length) return null;
    const trailerEmbedUrl = trailerUrl ? withAutoplay(trailerUrl) : '';

    return (
        <>
            <div
                id="picturecarousel"
                className="carousel slide"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <ol className="carousel-indicators">
                    {movies.map((item, itemIndex) => <li key={movieId(item)}
                        className={itemIndex === index ? 'active' : ''}
                        onClick={() => changeSlide(itemIndex, itemIndex > index ? 'right' : 'left')} />)}
                </ol>
                <div className="carousel-inner" role="listbox">
                    {movies.map((movie, itemIndex) => (
                        <div
                            key={movieId(movie)}
                            className={[
                                'item',
                                itemIndex === index && 'active',
                                previousIndex !== null && itemIndex === index && `slide-in-${slideDirection}`,
                                previousIndex !== null && itemIndex === previousIndex && `slide-out-${slideDirection === 'right' ? 'left' : 'right'}`,
                            ].filter(Boolean).join(' ')}
                            aria-hidden={itemIndex !== index}
                        >
                            <img src={movie.largeStill || movie.still || movie.poster} alt={movie.title} />
                            <div className="hero-caption">
                                <h2>{movie.title}</h2>
                                <p>{movie.tagline}</p>
                                <div className="hero-actions">
                                    <a className="button"
                                        href={`./bookNow.html?movie=${encodeURIComponent(movie.title)}`}>Book Tickets</a>
                                    {movie.trailer && <button type="button" className="button btn-secondary"
                                        onClick={() => setTrailerUrl(movie.trailer)}>Watch
                                        Trailer</button>}
                                    <a className="button btn-glass"
                                        href={`./templates/movie-detail.html?movie=${movieId(movie)}`}>More Info</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control left" aria-label="Previous slide"
                    onClick={() => changeSlide((index - 1 + movies.length) % movies.length, 'left')}><span
                        className="material-symbols-outlined">chevron_left</span></button>
                <button className="carousel-control right" aria-label="Next slide"
                    onClick={() => changeSlide((index + 1) % movies.length, 'right')}><span
                        className="material-symbols-outlined">chevron_right</span></button>
            </div>
            <div
                id="trailer-modal"
                className={`modal-backdrop ${trailerUrl ? 'open' : ''}`}
                aria-hidden={!trailerUrl}
                inert={!trailerUrl}
                onClick={(event) => {
                    if (event.target === event.currentTarget) setTrailerUrl('');
                }}
            >
                <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Movie trailer">
                    <button type="button" className="modal-close-btn" aria-label="Close trailer"
                        onClick={() => setTrailerUrl('')}>&times;</button>
                    <iframe
                        id="trailer-iframe"
                        src={trailerEmbedUrl || null}
                        title="Movie trailer"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </>
    );
}
