# Blockbuster Theatre Website

This project is a front-end cinema website prototype for a fictional theatre brand, Blockbuster Theatre. It is a static website built with HTML, CSS, and JavaScript and uses local JSON data to populate movie listings and detail content.

> Important: This project is a placeholder/demo website. The current functionality is intended for UI and front-end demonstration purposes only, not for a live production cinema booking system.

## Project Overview

The site presents a modern cinema experience with:

- A home page with hero carousel and featured movies
- A now-showing page with movie cards and genre filtering
- A coming-soon page with countdown-style release timers
- An about page with theatre information and branding
- A booking page with a multi-step ticket selection flow
- Movie detail views for individual titles
- Responsive navigation for desktop and mobile layouts

## Current Functionality

The website currently includes the following interactive elements:

- Hero banner carousel on the homepage and other pages
- Movie poster grids populated from local JSON data
- Genre-based filtering on the now-showing page
- Countdown timers for upcoming releases
- Booking form with ticket quantity selection, movie choice, showtime selection, and seat/guest flow mockups
- Trailer modal/button interactions
- Mobile hamburger navigation and scroll behaviours

## Placeholder Status

This website is not connected to a real backend or payment system. Several sections are intentionally demo-only, including:

- Booking and payment flow are front-end placeholders
- Displayed movie information is sample/demo data
- Ticketing and seat reservation are not live or persisted
- No authentication, database, or real commerce integration is implemented
- Content reflects a concept site rather than an actual commercial theatre platform

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON data files for content
- Static assets such as posters, stills, icons, and branding images

## Project Structure

```text
nml-applications-website/
├── README.md
├── qodana.yaml
└── website/
    ├── about.html
    ├── bookNow.html
    ├── comingSoon.html
    ├── index.html
    ├── nowShowing.html
    ├── timetable.html
    ├── assets/
    │   ├── bootstrap/
    │   ├── data/
    │   ├── Images/
    │   ├── js/
    │   └── stylesheets/
    └── templates/
        └── movie-detail.html
```

## How to Run

Because this is a static website, you can open the HTML files directly in a browser, or serve the project locally using a simple web server.

Example:

```bash
cd website
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Notes for Development

- Movie data is stored in local JSON files under the assets/data folder.
- JavaScript files in assets/js control page interactions and rendering.
- Styling is managed in assets/stylesheets.
- The current implementation is suitable for coursework, mockups, or front-end practice rather than production deployment.

## License

This project is intended for educational/demo usage and may be adapted for coursework or portfolio purposes.
