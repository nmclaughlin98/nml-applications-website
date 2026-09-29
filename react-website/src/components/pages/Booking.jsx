import { useCallback, useMemo, useRef, useState } from 'react';
import { Layout, asset } from '../shared';
import { Toast } from '../shared/Toast';
import { useMovies } from './useMovies';

const ticketTypes = [
  { id: 'adult', title: 'Standard Adult', detail: 'Age 15+ · Full Admission', price: 9.5 },
  { id: 'child', title: 'Child Ticket', detail: 'Under 15 years · Standard Admission', price: 6 },
  { id: 'student', title: 'Student Ticket', detail: 'With valid Student ID', price: 7.5 },
  { id: 'oap', title: 'Senior / OAP', detail: 'Age 60+', price: 7 },
];

const steps = ['Tickets', 'Select Seats', 'Guest Info', 'Payment', 'Ticket Preview'];
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const bookedSeats = new Set(['B4', 'C2', 'C3', 'D7', 'D8', 'E3', 'E4', 'E9', 'F9', 'F10', 'G3', 'G4', 'G9']);
const accessibleSeats = new Set(['A1', 'A5', 'A6', 'A10']);

function createUpcomingDates() {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return { label: formatter.format(date).replace(/,/g, ''), weekday: weekdayNames[date.getDay()] };
  });
}

function findMovie(movies, identifier) {
  const query = identifier.trim().toLowerCase();
  return movies.find((movie) => [
    movie.title,
    movie.slug,
    movie.movieId == null ? '' : String(movie.movieId),
  ].some((value) => String(value).toLowerCase() === query));
}

function findDate(dates, dayParam) {
  const query = dayParam.trim().toLowerCase();
  return dates.find((date) => date.label.toLowerCase() === query)
    || dates.find((date) => date.weekday.toLowerCase() === query || date.weekday.slice(0, 3).toLowerCase() === query)
    || dates[0];
}

function ProgressBar({ currentStep }) {
  return (
    <ol id="progressbar" aria-label="Booking progress">
      {steps.map((label, index) => (
        <li className={`${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`} key={label}>
          {label}
        </li>
      ))}
    </ol>
  );
}

function StepHeader({ title, description }) {
  return <div className="step-header"><h2>{title}</h2><p>{description}</p></div>;
}

function StepActions({ onBack, onContinue, continueLabel }) {
  return (
    <div className="form-actions">
      <button className="form-button previous" type="button" onClick={onBack}>Back</button>
      <button className="form-button next" type="button" onClick={onContinue}>{continueLabel}</button>
    </div>
  );
}

function TicketSelection({
  movies, movie, date, time, tickets, totalTickets, totalPrice, dates, onMovieChange, onDateChange,
  onTimeChange, onTicketChange, onContinue, apiError,
}) {
  const movieShowtimes = movie?.showtimes?.[dates.find((item) => item.label === date)?.weekday] || [];

  return (
    <fieldset className="active" data-step="0">
      <StepHeader
        title="Step 1: Choose Film & Tickets"
        description="Select your movie, screening time, and quantity of tickets."
      />
      <div className="form-group">
        <label htmlFor="booking-movie">Select Film</label>
        <select id="booking-movie" className="form-control" value={movie?.title || ''} onChange={(event) => onMovieChange(event.target.value)} required>
          <option value="" disabled>-- Choose a Feature Film --</option>
          {movies.map((item) => <option value={item.title} key={item.movieId ?? item.slug ?? item.title}>{item.title}</option>)}
        </select>
        {apiError && <p className="form-notice" role="alert">Movie listings are unavailable right now. Please try again later.</p>}
      </div>
      <div className="date-time-group">
        <div className="form-group">
          <label htmlFor="booking-date">Day of Screening</label>
          <select id="booking-date" className="form-control" value={date} onChange={(event) => onDateChange(event.target.value)}>
            {dates.map((item) => <option value={item.label} key={item.label}>{item.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Select Showtime</label>
          <div className="showtime-chips" aria-label="Available showtimes">
            {!movie
              ? <span className="showtime-placeholder">Select a film to see available showtimes.</span>
              : movieShowtimes.length
                ? movieShowtimes.map((showtime) => (
                  <button
                    className={`time-chip ${time === showtime ? 'active' : ''}`}
                    type="button"
                    aria-pressed={time === showtime}
                    key={showtime}
                    onClick={() => onTimeChange(showtime)}
                  >
                    {showtime}
                  </button>
                ))
                : <span className="showtime-placeholder">No showtimes available for this film and day.</span>}
          </div>
        </div>
      </div>
      <div className="form-group ticket-type-list">
        <label>Select Ticket Types</label>
        {ticketTypes.map(({ id, title, detail, price }) => (
          <div className="ticket-row" key={id}>
            <div className="ticket-info"><h4>{title}</h4><span>{detail}</span></div>
            <div className="ticket-counter">
              <strong>£{price.toFixed(2)}</strong>
              <button className="counter-btn" type="button" aria-label={`Decrease ${title}`} onClick={() => onTicketChange(id, -1)}>−</button>
              <span className="counter-val" aria-live="polite">{tickets[id]}</span>
              <button className="counter-btn" type="button" aria-label={`Increase ${title}`} onClick={() => onTicketChange(id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="booking-subtotal-bar">
        <div className="subtotal-item booking-subtotal-values">
          <div className="subtotal-metric">
            <span>Selected</span>
            <strong>{totalTickets} Seat{totalTickets === 1 ? '' : 's'}</strong>
          </div>
          <div className="subtotal-metric">
            <span>Total</span>
            <strong>£{totalPrice.toFixed(2)}</strong>
          </div>
        </div>
        <div className="subtotal-item">
          <button type="button" className="form-button next" onClick={onContinue}>Select Seats</button>
        </div>
      </div>
    </fieldset>
  );
}

function SeatSelection({ selectedSeats, totalTickets, onToggleSeat, onBack, onContinue }) {
  return (
    <fieldset className="active" data-step="1">
      <StepHeader
        title="Step 2: Reserve Your Seats"
        description={`Please choose exactly ${totalTickets} seat${totalTickets === 1 ? '' : 's'} on the map below.`}
      />
      <div className="seating-plan">
        <div className="screen-container"><div className="screen" /><div className="screen-text">MAIN CINEMA SCREEN (CURVED)</div></div>
        <div className="seat-legend">
          <div className="legend-item"><div className="legend-seat" /><span>Available</span></div>
          <div className="legend-item"><div className="legend-seat booked-seat" /><span>Booked</span></div>
          <div className="legend-item"><div className="legend-seat selected-seat" /><span>Your Pick</span></div>
          <div className="legend-item"><div className="legend-seat seat-accessible" /><span>Accessible</span></div>
        </div>
        <div className="seat-grid" aria-label="Cinema seating plan">
          {Array.from({ length: 7 }, (_, rowIndex) => {
            const row = String.fromCharCode(65 + rowIndex);
            return (
              <div className="seat-row" key={row}>
                <span className="row-label">{row}</span>
                {Array.from({ length: 10 }, (_, seatIndex) => {
                  const seatId = `${row}${seatIndex + 1}`;
                  const isBooked = bookedSeats.has(seatId);
                  const isAccessible = accessibleSeats.has(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  return (
                    <span className="seat-cell" key={seatId}>
                      {seatIndex === 5 && <span className="seat seat-spacer" aria-hidden="true" />}
                      <button
                        className={`seat ${isAccessible ? 'seat-accessible' : ''} ${isBooked ? 'booked-seat' : ''} ${isSelected ? 'selected-seat' : ''}`}
                        type="button"
                        disabled={isBooked}
                        aria-label={`Seat ${seatId}${isAccessible ? ', accessible' : ''}${isBooked ? ', booked' : ''}${isSelected ? ', selected' : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => onToggleSeat(seatId)}
                      >
                        {isAccessible && <img src={asset('assets/images/icons/accessible.png')} alt="" className="seat-accessible-icon" />}
                      </button>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="selected-seats-badge">
          Selected Seats: <strong>{selectedSeats.length ? selectedSeats.join(', ') : 'None selected yet'}</strong>
        </div>
      </div>
      <StepActions onBack={onBack} onContinue={onContinue} continueLabel="Continue to Guest Details" />
    </fieldset>
  );
}

function GuestDetails({ customer, onChange, onBack, onContinue }) {
  return (
    <fieldset className="active" data-step="2">
      <StepHeader title="Step 3: Guest Details" description="Where should we send your digital cinema ticket preview?" />
      <div className="guest-name-grid">
        <div className="form-group"><label htmlFor="guest-first-name">First Name</label><input type="text" id="guest-first-name" value={customer.firstName} onChange={(event) => onChange('firstName', event.target.value)} autoComplete="given-name" required /></div>
        <div className="form-group"><label htmlFor="guest-surname">Surname</label><input type="text" id="guest-surname" value={customer.surname} onChange={(event) => onChange('surname', event.target.value)} autoComplete="family-name" required /></div>
      </div>
      <div className="form-group"><label htmlFor="guest-email">Email Address</label><input id="guest-email" type="email" value={customer.email} onChange={(event) => onChange('email', event.target.value)} autoComplete="email" required /></div>
      <div className="form-group"><label htmlFor="guest-phone">Phone Number (Optional)</label><input id="guest-phone" type="tel" value={customer.phone} onChange={(event) => onChange('phone', event.target.value)} autoComplete="tel" /></div>
      <StepActions onBack={onBack} onContinue={onContinue} continueLabel="Continue to Payment" />
    </fieldset>
  );
}

function DemoPayment({ onBack, onConfirm }) {
  return (
    <fieldset className="active" data-step="3">
      <StepHeader title="Step 4: Payment" description="Online payment is not connected in this demo." />
      <div className="demo-payment-notice" role="note">
        <h3>Demo checkout only</h3>
        <p>No payment will be taken and no reservation will be made. Do not enter or submit real payment details.</p>
      </div>
      <div className="form-actions">
        <button className="form-button previous" type="button" onClick={onBack}>Back</button>
        <button className="form-button next" type="button" onClick={onConfirm}>Create Demo Ticket</button>
      </div>
    </fieldset>
  );
}

function BookingConfirmation({ movie, date, time, selectedSeats, totalTickets, totalPrice, customer, bookingRef }) {
  return (
    <fieldset className="active" data-step="4">
      <StepHeader title="Demo Ticket Preview" description="This is a preview only. No payment was processed or seats reserved." />
      <div className="ticket-pass">
        <div className="ticket-pass-header">
          <div className="ticket-pass-brand">BLOCKBUSTER THEATRE</div>
          <div className="ticket-pass-status">DEMO PREVIEW</div>
        </div>
        <div className="ticket-pass-body">
          <div className="ticket-movie-title">{movie?.title || 'Movie'}</div>
          <div className="ticket-details-grid">
            <div className="ticket-detail-item"><span>Date & Showtime</span><strong>{date} at {time}</strong></div>
            <div className="ticket-detail-item"><span>Screen / Hall</span><strong>Screen 1 (Dolby Atmos)</strong></div>
            <div className="ticket-detail-item"><span>Seat Numbers</span><strong>{selectedSeats.join(', ')}</strong></div>
            <div className="ticket-detail-item"><span>Demo Total</span><strong>£{totalPrice.toFixed(2)}</strong></div>
            <div className="ticket-detail-item"><span>Guest Name</span><strong>{customer.firstName} {customer.surname}</strong></div>
            <div className="ticket-detail-item"><span>Ticket Breakdown</span><strong>{totalTickets} Ticket{totalTickets === 1 ? '' : 's'}</strong></div>
          </div>
          <div className="ticket-perforation"><div className="ticket-perforation-line" /></div>
          <div className="ticket-barcode-area"><div className="ticket-booking-ref">DEMO REF: {bookingRef}</div></div>
        </div>
      </div>
      <a className="form-button previous home" href="./index.html">Back to Home</a>
    </fieldset>
  );
}

export function Booking() {
  const { movies, loading, error } = useMovies();
  const [step, setStep] = useState(0);
  const [movieTitle, setMovieTitle] = useState('');
  const [dateOverride, setDateOverride] = useState('');
  const [selectedTime, setSelectedTime] = useState(() => new URLSearchParams(window.location.search).get('time') || '');
  const [screeningChanged, setScreeningChanged] = useState(false);
  const [tickets, setTickets] = useState({ adult: 1, child: 0, student: 0, oap: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customer, setCustomer] = useState({ firstName: '', surname: '', email: '', phone: '' });
  const [bookingRef, setBookingRef] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const formRef = useRef(null);
  const dates = useMemo(() => createUpcomingDates(), []);
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const selectedMovie = findMovie(movies, movieTitle || params.get('movie') || '');
  const requestedTime = params.get('time') || '';
  const matchingTimeDate = !params.get('day') && requestedTime
    ? dates.find((item) => selectedMovie?.showtimes?.[item.weekday]?.includes(requestedTime))
    : null;
  const date = dateOverride || matchingTimeDate?.label || findDate(dates, params.get('day') || '').label;
  const totalTickets = Object.values(tickets).reduce((total, count) => total + count, 0);
  const totalPrice = ticketTypes.reduce((total, type) => total + tickets[type.id] * type.price, 0);
  const sortedMovies = useMemo(() => movies
    .filter((movie) => movie.visible !== false && movie.isComingSoon !== true)
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })), [movies]);

  const currentDate = dates.find((item) => item.label === date);
  const movieTimes = selectedMovie?.showtimes?.[currentDate?.weekday] || [];
  const time = movieTimes.includes(selectedTime)
    ? selectedTime
    : !screeningChanged && movieTimes.includes(requestedTime) ? requestedTime : '';

  function changeMovie(title) {
    setMovieTitle(title);
    setSelectedTime('');
    setScreeningChanged(true);
    setSelectedSeats([]);
  }

  function changeDate(label) {
    setDateOverride(label);
    setSelectedTime('');
    setScreeningChanged(true);
    setSelectedSeats([]);
  }

  function changeTime(value) {
    setSelectedTime(value);
    setScreeningChanged(true);
    setSelectedSeats([]);
  }

  function changeTicketCount(type, amount) {
    if (amount > 0 && totalTickets >= 10) {
      setToastMessage('You can book a maximum of 10 tickets.');
      return;
    }
    if (amount < 0 && tickets[type] === 0) return;

    const nextTickets = { ...tickets, [type]: Math.max(0, tickets[type] + amount) };
    if (Object.values(nextTickets).every((count) => count === 0)) nextTickets.adult = 1;
    const nextTotal = Object.values(nextTickets).reduce((total, count) => total + count, 0);
    setTickets(nextTickets);
    setSelectedSeats((current) => current.slice(0, nextTotal));
  }

  function toggleSeat(seatId) {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((current) => current.filter((seat) => seat !== seatId));
      return;
    }
    if (selectedSeats.length >= totalTickets) {
      setToastMessage(`You can select up to ${totalTickets} seat${totalTickets === 1 ? '' : 's'}.`);
      return;
    }
    setSelectedSeats((current) => [...current, seatId]);
  }

  function updateCustomer(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function goToStep(nextStep) {
    setToastMessage('');
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      document.getElementById('progressbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function continueFromTickets() {
    if (!selectedMovie) {
      setToastMessage('Please select a movie to proceed.');
      return;
    }
    if (!time || !movieTimes.includes(time)) {
      setToastMessage('Please select an available showtime to proceed.');
      return;
    }
    goToStep(1);
  }

  function continueFromSeats() {
    if (selectedSeats.length !== totalTickets) {
      setToastMessage('Please pick all seats to continue.');
      return;
    }
    goToStep(2);
  }

  function continueFromGuestDetails() {
    const fieldset = formRef.current?.querySelector('[data-step="2"]');
    const requiredInputs = [...(fieldset?.querySelectorAll('input[required]') || [])];
    const invalidInput = requiredInputs.find((input) => !input.value.trim() || !input.checkValidity());
    if (invalidInput) {
      setToastMessage('Please fill in your name and email address with a valid email.');
      invalidInput.focus();
      return;
    }
    goToStep(3);
  }

  function createDemoTicket() {
    setBookingRef(`BBT-${Math.floor(100000 + Math.random() * 900000)}`);
    goToStep(4);
  }

  const dismissToast = useCallback(() => setToastMessage(''), []);

  return (
    <Layout current="booking">
      <section className="booking-section">
        <div className="booking-title-block">
          <h1>Book Your Tickets</h1>
          <p>Reserve the best seats in the house with our interactive seat picker.</p>
        </div>
        <ProgressBar currentStep={step} />
        <form className="booking-form" ref={formRef} onSubmit={(event) => event.preventDefault()}>
          {loading && <p role="status">Loading available movies...</p>}
          {step === 0 && (
            <TicketSelection
              movies={sortedMovies}
              movie={selectedMovie}
              date={date}
              time={time}
              tickets={tickets}
              totalTickets={totalTickets}
              totalPrice={totalPrice}
              dates={dates}
              onMovieChange={changeMovie}
              onDateChange={changeDate}
              onTimeChange={changeTime}
              onTicketChange={changeTicketCount}
              onContinue={continueFromTickets}
              apiError={Boolean(error)}
            />
          )}
          {step === 1 && (
            <SeatSelection
              selectedSeats={selectedSeats}
              totalTickets={totalTickets}
              onToggleSeat={toggleSeat}
              onBack={() => goToStep(0)}
              onContinue={continueFromSeats}
            />
          )}
          {step === 2 && (
            <GuestDetails
              customer={customer}
              onChange={updateCustomer}
              onBack={() => goToStep(1)}
              onContinue={continueFromGuestDetails}
            />
          )}
          {step === 3 && <DemoPayment onBack={() => goToStep(2)} onConfirm={createDemoTicket} />}
          {step === 4 && (
            <BookingConfirmation
              movie={selectedMovie}
              date={date}
              time={time}
              selectedSeats={selectedSeats}
              totalTickets={totalTickets}
              totalPrice={totalPrice}
              customer={customer}
              bookingRef={bookingRef}
            />
          )}
        </form>
        <Toast message={toastMessage} onDismiss={dismissToast} />
      </section>
    </Layout>
  );
}
