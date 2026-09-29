import { BackToTop } from './BackToTop';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout({ current, children }) {
  return <><Header current={current} /><main>{children}</main><BackToTop /><Footer /></>;
}
