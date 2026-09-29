import { asset } from '../../shared';

const offers = [
  ['minions-and-monsters-poster.jpg', 'Kids Club', 'Every Tuesday • Morning & Matinee', 'Featuring: Minions & Monsters', '£2.50 per child — Adults go free!', 'Minions %26 Monsters'],
  ['spider-man-brand-new-day-poster.jpg', 'Student Night', 'Every Wednesday • Evening Screenings', 'Featuring: Spider-Man: Brand New Day', '£2.50 with valid Student ID', 'Spider-Man:%20Brand%20New%20Day'],
  ['inside-out-poster.jpg', 'Birthday Party Pack', 'Advance Booking Required • All Weekends', 'Includes Film, Popcorn & Soft Drink', '£6.00 per child package', 'Inside%20Out'],
];

export function Offers() {
  return (
    <section className="offers">
      <div className="section-header"><h1>Special Cinema Offers</h1></div>
      <div className="offers-grid">
        {offers.map(([image, title, line1, line2, line3, movie]) => (
          <div className="col" key={title}>
            <img className="poster icon" src={asset(`assets/images/special-offers/${image}`)} alt={title} />
            <h2>{title}</h2><p>{line1}</p><p>{line2}</p><p>{line3}</p>
            <a className="button" href={`./bookNow.html?movie=${movie}`}>Claim Offer</a>
          </div>
        ))}
      </div>
    </section>
  );
}
