import type { HtmlTagDescriptor, Plugin } from 'vite';
import { profile } from '../src/data/profile';

/**
 * Injects SEO meta tags, Open Graph/Twitter cards, and JSON-LD into index.html,
 * and emits robots.txt + sitemap.xml at build time. Everything is derived from
 * src/data/profile.ts so there is one source of truth.
 */
export function seo(): Plugin {
  const url = profile.siteUrl.replace(/\/$/, '');
  const ogImage = `${url}${profile.ogImage}`;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Noida', addressCountry: 'IN' },
    worksFor: { '@type': 'Organization', name: profile.currentEmployer },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.school },
    knowsAbout: profile.knowsAbout,
    sameAs: [profile.linkedin, profile.github],
  };

  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({
    tag: 'meta',
    attrs,
    injectTo: 'head',
  });

  return {
    name: 'portfolio-seo',
    transformIndexHtml() {
      return [
        { tag: 'title', children: profile.seoTitle, injectTo: 'head-prepend' },
        meta({ name: 'description', content: profile.seoDescription }),
        meta({ name: 'author', content: profile.name }),
        { tag: 'link', attrs: { rel: 'canonical', href: `${url}/` }, injectTo: 'head' },
        meta({ property: 'og:type', content: 'profile' }),
        meta({ property: 'og:site_name', content: profile.name }),
        meta({ property: 'og:title', content: profile.seoTitle }),
        meta({ property: 'og:description', content: profile.seoDescription }),
        meta({ property: 'og:url', content: `${url}/` }),
        meta({ property: 'og:image', content: ogImage }),
        meta({ property: 'og:image:width', content: '1200' }),
        meta({ property: 'og:image:height', content: '630' }),
        meta({ property: 'profile:first_name', content: profile.firstName }),
        meta({ property: 'profile:last_name', content: 'Srivastava' }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        meta({ name: 'twitter:title', content: profile.seoTitle }),
        meta({ name: 'twitter:description', content: profile.seoDescription }),
        meta({ name: 'twitter:image', content: ogImage }),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // Escape "<" so the JSON can never close the script tag.
          children: JSON.stringify(person).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ];
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      });
    },
  };
}
