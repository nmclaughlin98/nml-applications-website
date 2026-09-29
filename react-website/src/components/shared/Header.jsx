import { useState } from 'react';
import { asset } from './asset';

const links = [
  ['Home', './index.html', 'home'],
  ['Now Showing', './nowShowing.html', 'now'],
  ['Coming Soon', './comingSoon.html', 'coming'],
  ['About', './about.html', 'about'],
];

function Brand({ onClick }) {
  return (
    <a className="header-box" href="./index.html" onClick={onClick}>
      <picture>
        <source
          srcSet={`${asset('assets/images/logo/logo-60.webp')} 1x, ${asset('assets/images/logo/logo-120.webp')} 2x, ${asset('assets/images/logo/logo-180.webp')} 3x`}
          type="image/webp"
        />
        <img src={asset('assets/images/logo/png/logo-120.png')} alt="Blockbuster Theatre" className="logo" />
      </picture>
      <span className="header-text">BLOCKBUSTER<br />THEATRE</span>
    </a>
  );
}

function Navigation({ current, open, onNavigate }) {
  return (
    <nav className={`nav primary-nav ${open ? 'open' : ''}`}>
      <ul className="menu">
        {links.map(([label, href, key]) => (
          <li key={key}>
            <a className={current === key ? 'current' : ''} href={href} onClick={onNavigate}>{label}</a>
          </li>
        ))}
        <li><a className={`nav-cta-btn ${current === 'booking' ? 'current' : ''}`} href="./bookNow.html" onClick={onNavigate}>Book Tickets</a></li>
      </ul>
    </nav>
  );
}

function MenuButton({ open, onClick }) {
  return (
    <button className="hamburger" aria-label="Toggle navigation" onClick={onClick}>
      <span className={`line ${open ? 'transition' : ''}`} />
      <span className={`line ${open ? 'transition' : ''}`} />
      <span className={`line ${open ? 'transition' : ''}`} />
    </button>
  );
}

export function Header({ current }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <>
      <header>
        <Brand onClick={closeMenu} />
        <Navigation current={current} open={open} onNavigate={closeMenu} />
        <MenuButton open={open} onClick={() => setOpen((value) => !value)} />
      </header>
      {open && <div className="ham-overlay show" onClick={closeMenu} />}
    </>
  );
}
