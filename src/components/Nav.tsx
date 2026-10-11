import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { nav, profile } from '../data/content';
import { useActiveSection } from '../hooks/useActiveSection';
import type { Theme } from '../hooks/useTheme';
import { Close, Menu } from './Icons';
import { ThemeToggle } from './ThemeToggle';

const sectionIds = nav.map((n) => n.id);

interface NavProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Nav({ theme, onToggleTheme }: NavProps) {
  const active = useActiveSection(sectionIds);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? 'border-line bg-bg/75 border-b backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
          aria-label={`${profile.name}, back to top`}
        >
          <span
            aria-hidden="true"
            className="bg-accent text-accent-fg grid size-8 place-items-center rounded-lg font-mono text-xs font-bold"
          >
            AS
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`block rounded-full border px-3.5 py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-surface-strong border-line text-fg'
                      : 'text-fg-muted hover:text-fg border-transparent'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            className="text-fg-muted hover:text-fg grid size-11 place-items-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="container-page flex flex-col pt-2 pb-5">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? 'location' : undefined}
                    className={`border-line flex items-center justify-between border-b py-3.5 text-lg ${
                      active === item.id ? 'text-accent-text' : 'text-fg'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
