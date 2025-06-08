import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware({
  // Supported locales
  locales: ['zh', 'en', 'de', 'fr', 'es', 'nl', 'id', 'th', 'vi', 'my', 'ms','ja'],
  
  // Default locale
  defaultLocale: 'en',
  
  // Automatic locale detection (based on browser settings)
  localeDetection: true,
  
  // Status code when redirecting to default locale
  localePrefix: 'always'
});
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/']
};