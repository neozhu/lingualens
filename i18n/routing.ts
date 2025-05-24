import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['zh','en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});