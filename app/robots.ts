import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // API routes
          '/_next/',        // Next.js internal files
          '/admin/',        // Admin area if exists
          '*.json$',        // JSON files
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',     // Prevent AI crawling if desired
      }
    ],
    sitemap: 'https://lingualens.blazorserver.com/sitemap.xml',
    host: 'https://lingualens.blazorserver.com'
  }
} 