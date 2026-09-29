import { About, Booking, ComingSoon, Detail, Home, NowShowing, Timetable } from './components/pages';

export default function App() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('booknow')) return <Booking />;
  if (path.includes('movie-detail-coming-soon')) return <Detail comingSoon />;
  if (path.includes('movie-detail')) return <Detail />;
  if (path.includes('nowshowing')) return <NowShowing />;
  if (path.includes('comingsoon')) return <ComingSoon />;
  if (path.includes('timetable')) return <Timetable />;
  if (path.includes('about')) return <About />;
  return <Home />;
}
