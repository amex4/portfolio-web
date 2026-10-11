/**
 * Identity, contact, and SEO facts.
 *
 * This file is imported by both the app and the Vite SEO plugin (vite-plugins/seo.ts),
 * so keep it dependency-free: plain values only.
 *
 * Values marked PLACEHOLDER need to be replaced before deploying (see README).
 */
export const profile = {
  name: 'Ameya Srivastava',
  firstName: 'Ameya',
  role: 'Frontend Engineer',
  location: 'Noida, India',
  email: 'amex4477@gmail.com',

  // PLACEHOLDER: your production URL, no trailing slash. Used for canonical, OG, sitemap.
  siteUrl: 'https://your-domain.example',
  linkedin: 'https://www.linkedin.com/in/ameya-srivastava-040997196',
  // PLACEHOLDER: the resume PDF lists "GitHub" but not the URL.
  github: 'https://github.com/YOUR-GITHUB-HANDLE',
  // PLACEHOLDER: drop your PDF at public/Ameya-Srivastava-Resume.pdf
  resumeUrl: '/Ameya-Srivastava-Resume.pdf',
  // PLACEHOLDER: 1200x630 PNG at public/og-image.png
  ogImage: '/og-image.png',

  seoTitle: 'Ameya Srivastava · Frontend Engineer for real-time trading interfaces',
  seoDescription:
    'Frontend engineer specializing in real-time, data-heavy fintech and trading UIs. React, TypeScript, WebSockets, and performance work that keeps live interfaces fast.',

  currentEmployer: 'SMC Global Securities',
  school: 'IMS Engineering College',
  knowsAbout: [
    'React',
    'TypeScript',
    'Next.js',
    'Redux Toolkit',
    'WebSockets',
    'Real-time trading interfaces',
    'Frontend performance optimization',
  ],
} as const;
