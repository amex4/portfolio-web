/**
 * All portfolio copy lives here. Edit text freely; components only read these shapes.
 * Facts come from the resume. Each metric appears once (in `metrics`).
 */
import { profile } from './profile';

export { profile };

export interface NavItem {
  id: string;
  label: string;
}

export interface Role {
  company: string;
  title: string;
  start: string;
  end: string;
  /** Machine-readable dates for <time>. */
  startISO: string;
  endISO?: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface Project {
  id: string;
  title: string;
  kicker: string;
  problem: string;
  built: string[];
  tech: string[];
  impact: string;
  /** Optional: only set real links. Omit rather than invent. */
  links?: { label: string; href: string }[];
  /** In-page anchor, e.g. for the live demo. */
  anchor?: { label: string; href: string };
}

export interface SkillGroup {
  title: string;
  blurb: string;
  items: string[];
}

export interface Metric {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  detail: string;
}

export const nav: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'demo', label: 'Live demo' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export const hero = {
  eyebrow: `${profile.role}, ${profile.location}`,
  headline: ['Interfaces that keep up', 'with the market.'],
  sub: 'I build real-time, data-heavy trading UIs in React and TypeScript: live charts, order flows, and dashboards that stay fast when the data never stops.',
  tickerNote: 'Simulated ticker',
};

export const about = {
  heading: 'Frontend is where latency becomes visible.',
  paragraphs: [
    "I'm a frontend engineer with 3+ years across enterprise web apps and, most recently, fintech. Today I work on trading platform interfaces at SMC Global Securities, where a chart that stutters or an order button that lags isn't cosmetic. It costs traders time.",
    'My work sits where product detail meets performance: streaming data into the UI without flooding React, shaping state so only the right pixels update, and building component systems that let a team move quickly without drifting apart.',
    "I use AI-assisted tools and agentic IDEs daily to explore unfamiliar code, draft tests, and clear boilerplate. They make me faster; they don't make decisions for me. Every generated line gets read, questioned, and checked for correctness, performance, and fit with the existing architecture before it ships.",
  ],
  facts: [
    { label: 'Based in', value: profile.location },
    { label: 'Focus', value: 'Real-time trading UIs' },
    { label: 'Core stack', value: 'React · TypeScript · Redux Toolkit' },
    { label: 'Currently', value: `${profile.currentEmployer}` },
  ],
};

export const experience: Role[] = [
  {
    company: 'SMC Global Securities',
    title: 'Member Technical Staff I',
    start: 'Sep 2024',
    end: 'Present',
    startISO: '2024-09',
    location: 'Noida, India',
    summary: 'Trading platform interfaces for enterprise-scale financial applications.',
    highlights: [
      'Build interactive trading charts and scalping workflows for watching the market and acting on it in seconds.',
      'Wire REST APIs and WebSocket streams into live market data, order execution, and dense dashboards that stay responsive under load.',
      'Ship the shared layer: reusable components, custom hooks, feature flags, and dark theme support used across trading modules.',
    ],
  },
  {
    company: 'Nagarro',
    title: 'Associate Software Engineer',
    start: 'Jul 2022',
    end: 'Oct 2023',
    startISO: '2022-07',
    endISO: '2023-10',
    location: 'India',
    summary: 'Enterprise web applications in React and Next.js.',
    highlights: [
      'Migrated enterprise React apps to Next.js with server-side rendering for better SEO and faster first paint.',
      'Integrated REST APIs with solid error handling, authentication flows, and leaner client-side rendering.',
      'Pushed for reusable components and modular folder structures so the codebase scaled with the team.',
    ],
  },
  {
    company: 'Qualitest',
    title: 'Associate Software Engineer',
    start: 'Jan 2022',
    end: 'Jun 2022',
    startISO: '2022-01',
    endISO: '2022-06',
    location: 'India',
    summary: 'Test automation for enterprise web applications.',
    highlights: [
      'Wrote Selenium WebDriver suites for regression and functional testing.',
      'Reproduced and verified UI defects with developers before release, which still shapes how I test my own code.',
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'trading-platform',
    title: 'Real-Time Trading Platform & Scalping Interface',
    kicker: 'Fintech · SMC Global Securities',
    problem:
      'Scalpers act in seconds. The interface has to render a constant stream of market data, charts, and order state without freezing, and without making them wait for the page to load.',
    built: [
      'Reusable chart, dashboard, order, and market-data components in React, TypeScript, and Redux Toolkit.',
      'WebSocket integration for live market updates, alongside REST APIs for account data and trading workflows.',
      'Lazy loading, code splitting, memoization, and state shaped so ticks re-render only what changed.',
      'Responsive dashboards, authentication flows, feature flags, and dark theme support.',
    ],
    tech: ['React', 'TypeScript', 'Redux Toolkit', 'WebSockets', 'REST APIs'],
    impact:
      'Faster page loads and fewer wasted renders on the screens traders use most. The numbers are in the Impact section below.',
  },
  {
    id: 'nextjs-migration',
    title: 'Enterprise React → Next.js Migration',
    kicker: 'Enterprise web · Nagarro',
    problem:
      'A client-rendered enterprise React app was slow on first load and hard for search engines to index, but it could not afford a big-bang rewrite.',
    built: [
      'Incremental move to Next.js with server-side rendering.',
      'Route-based code splitting and optimized asset loading.',
      'Shared reusable components so migrated and legacy screens stayed consistent.',
      'Close coordination with cross-functional teams to keep feature parity through each release.',
    ],
    tech: ['Next.js', 'React', 'SSR', 'SEO', 'JavaScript'],
    impact:
      'Better SEO, faster initial rendering, and improved Core Web Vitals, shipped without breaking production.',
  },
  {
    id: 'market-sim',
    title: 'Market Simulator (this site)',
    kicker: 'Open demo · Built for this portfolio',
    problem:
      "Trading work is confidential, so I can't show the real thing. I built a small, honest stand-in that shows the same techniques.",
    built: [
      'A simulated WebSocket feed pushing bursts of ticks at 20Hz, with a toggle for connect and disconnect.',
      'An external tick store read through useSyncExternalStore, so each watchlist row re-renders only when its own symbol moves.',
      'A canvas candlestick chart redrawn at most once per animation frame, never through React state.',
      'A code-split chunk that loads only when you scroll near it.',
    ],
    tech: ['React', 'TypeScript', 'Canvas', 'useSyncExternalStore'],
    impact: 'Runs at a steady 60fps on mid-range hardware. Open DevTools and profile it.',
    anchor: { label: 'Try the live demo', href: '#demo' },
  },
];

export const skills: SkillGroup[] = [
  {
    title: 'Real-time & trading',
    blurb: 'Where most of my recent work lives.',
    items: [
      'Trading charts',
      'Scalping workflows',
      'Live market data',
      'Order execution UIs',
      'Financial dashboards',
      'WebSockets',
    ],
  },
  {
    title: 'Frontend core',
    blurb: 'The daily toolkit.',
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript (ES6+)',
      'Redux Toolkit',
      'Context API',
      'HTML5',
      'CSS3',
    ],
  },
  {
    title: 'Performance',
    blurb: 'Measured, not guessed.',
    items: [
      'Code splitting',
      'Lazy loading',
      'Memoization',
      'Render profiling',
      'SSR',
      'Core Web Vitals',
      'SEO',
    ],
  },
  {
    title: 'Styling & UI systems',
    blurb: 'Consistent at scale.',
    items: [
      'Tailwind CSS',
      'CSS Modules',
      'Bootstrap',
      'Responsive design',
      'Component-driven development',
    ],
  },
  {
    title: 'Backend, testing & tooling',
    blurb: 'Enough to own the whole feature.',
    items: [
      'Node.js',
      'Express.js',
      'REST APIs',
      'Jest',
      'Selenium',
      'Git',
      'Webpack',
      'Babel',
      'CI/CD',
    ],
  },
  {
    title: 'Ways of working',
    blurb: 'How things actually ship.',
    items: [
      'Agile / Scrum',
      'Code reviews',
      'Clean, modular architecture',
      'AI-assisted development',
    ],
  },
];

export const metrics: Metric[] = [
  {
    value: 40,
    prefix: '~',
    suffix: '%',
    label: 'faster page loads',
    detail:
      'Lazy loading, code splitting, memoization, and leaner asset loading on a trading platform.',
  },
  {
    value: 30,
    prefix: '~',
    suffix: '%',
    label: 'better rendering efficiency',
    detail: 'Cut unnecessary React re-renders and tightened state updates.',
  },
  {
    value: 3,
    suffix: '+',
    label: 'years shipping frontend',
    detail: 'Across fintech and enterprise web, from test automation to trading UIs.',
  },
  {
    value: 3,
    suffix: '',
    label: 'engineering teams',
    detail: 'SMC Global Securities, Nagarro, Qualitest.',
  },
];

export const education = {
  school: 'IMS Engineering College',
  degree: 'Bachelor of Technology, Computer Science and Engineering',
  start: '2018',
  end: '2022',
  location: 'Ghaziabad, India',
};

export const contact = {
  heading: "Let's build something fast.",
  sub: "I'm open to frontend roles on real-time products, especially fintech and trading. Email is the quickest way to reach me.",
};
