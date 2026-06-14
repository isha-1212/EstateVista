import { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/**
 * Adds top spacing for a fixed/sticky navbar without page-specific hacks.
 *
 * Root cause: Navbar uses `position: fixed; top: 0;` and App does not add equivalent padding/margin to the page content.
 */
const LayoutWithNavbarSpacing = ({ children }: PropsWithChildren) => {
  const [navHeight, setNavHeight] = useState(0);
  const rafRef = useRef<number | null>(null);

  const navSelector = useMemo(() => '[data-role="navbar"]', []);

  useLayoutEffect(() => {
    const measure = () => {
      const nav = document.querySelector<HTMLElement>(navSelector);
      if (!nav) return;

      const height = nav.getBoundingClientRect().height;
      setNavHeight(Math.ceil(height));
    };

    measure();

    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [navSelector]);

  // Also react to dynamic font/layout changes.
  useEffect(() => {
    if (!('ResizeObserver' in window)) return;
    const nav = document.querySelector<HTMLElement>(navSelector);
    if (!nav) return;

    const ro = new ResizeObserver(() => {
      const height = nav.getBoundingClientRect().height;
      setNavHeight(Math.ceil(height));
    });

    ro.observe(nav);
    return () => ro.disconnect();
  }, [navSelector]);

  return (
    <div style={{ paddingTop: navHeight }} data-role="layout-content" className="min-h-screen">
      {children}
    </div>
  );
};

export default LayoutWithNavbarSpacing;

