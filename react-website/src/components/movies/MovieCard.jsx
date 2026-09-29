import {asset} from '../shared';
import {Countdown} from './Countdown';
import {movieId} from './movieId';

export function MovieCard({movie, comingSoon = false}) {
    return (
        <div className="poster-column">
            <img className="poster" src={movie.poster || asset('assets/images/logo/png/logo-full.png')}
                 alt={movie.title}/>
            <div className="overlay">
                <div className="overlay-text">{movie.title}</div>
                {comingSoon ? <Countdown movie={movie}/> : <div className="runtime">{movie.runtime || 0} mins</div>}
                {!comingSoon &&
                    <a className="button" href={`./bookNow.html?movie=${encodeURIComponent(movie.title)}`}>Book Now</a>}
                <a className="button"
                   href={`${comingSoon ? 'movie-detail-coming-soon' : 'movie-detail'}.html?movie=${movieId(movie)}`}>More
                    Info</a>
            </div>
        </div>
    );
}
