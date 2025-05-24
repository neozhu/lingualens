import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['zh', 'en', 'de', 'fr', 'es', 'nl', 'id', 'th', 'vi', 'my', 'ms','ja'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});