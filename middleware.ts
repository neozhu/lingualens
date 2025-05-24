import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware({
  // 支持的语言
  locales: ['zh', 'en', 'de'],
  
  // 默认语言
  defaultLocale: 'zh',
  
  // 语言自动检测（基于浏览器设置）
  localeDetection: true,
  
  // 重定向到默认语言时的状态码
  localePrefix: 'always'
});
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/']
};