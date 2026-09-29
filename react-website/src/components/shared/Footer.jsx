const links = [
    ['Home', './index.html'],
    ['Now Showing', './nowShowing.html'],
    ['Coming Soon', './comingSoon.html'],
    ['About', './about.html'],
];

export function Footer() {
    return (
        <footer>
            <nav className="nav secondary-nav">
                <ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
            </nav>
            <small>&copy; 2026 Blockbuster Theatre</small>
        </footer>
    );
}
