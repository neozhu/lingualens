import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { seoConfig } from '@/lib/seo-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const { baseUrl, additionalPages, sitemap: sitemapConfig } = seoConfig
  
  // Get all supported locales
  const locales = routing.locales
  
  // Define your main pages/routes here
  const pages = [
    { path: '', priority: sitemapConfig.priority.home },
    ...additionalPages.map(page => ({ 
      path: page, 
      priority: sitemapConfig.priority.main 
    })),
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // Generate sitemap entries for each locale and page
  locales.forEach(locale => {
    pages.forEach(({ path, priority }) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: sitemapConfig.changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(altLocale => [
              altLocale === 'en' ? 'x-default' : altLocale,
              `${baseUrl}/${altLocale}${path}`
            ])
          )
        }
      })
    })
  })
  
  return sitemapEntries
} 