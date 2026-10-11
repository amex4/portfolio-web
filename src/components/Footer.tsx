import { profile } from '../data/content';

export function Footer() {
  return (
    <footer className="border-line border-t">
      <div className="container-page text-fg-subtle flex flex-col gap-2 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs">
          Built with React, TypeScript, and Tailwind. Market data on this site is simulated.
        </p>
      </div>
    </footer>
  );
}
