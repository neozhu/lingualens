export const seoConfig = {
  baseUrl: 'https://lingualens.blazorserver.com',
  siteName: 'LinguaLens',
  
  // Default fallbacks
  defaultTitle: 'LinguaLens AI Translation Assistant',
  defaultDescription: 'LinguaLens is an intelligent bidirectional translation assistant supporting multi-scenario style switching. Powered by AI for accurate and context-aware translations.',
  
  // Social media
  twitter: {
    creator: '@LinguaLens',
    site: '@LinguaLens',
  },
  
  // Organization info
  organization: {
    name: 'LinguaLens Team',
    logo: '/logo.png',
    email: 'contact@lingualens.com', // 更新为实际邮箱
  },
  
  // Images
  images: {
    defaultOg: '/screen.png',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  
  // Additional pages for sitemap (beyond main routes)
  additionalPages: [
    '/privacy',
    '/terms',
    '/features',
    '/support',
    '/faq',
    '/about',
    '/scenes',
  ],
  
  // Verification tokens (add these to your environment variables)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
    bing: process.env.BING_SITE_VERIFICATION,
  },
  
  // Structured data
  structuredData: {
    organization: {
      name: 'LinguaLens',
      description: 'AI-powered translation platform',
      url: 'https://lingualens.blazorserver.com',
      logo: 'https://lingualens.blazorserver.com/logo.png',
      sameAs: [
        'https://github.com/your-repo/lingualens', // 更新为实际GitHub链接
        // 'https://twitter.com/lingualens',
        // 'https://linkedin.com/company/lingualens',
      ],
    },
    
    website: {
      name: 'LinguaLens',
      alternateName: 'LinguaLens AI Translator',
      description: 'AI-powered translation assistant with multi-scenario support',
    },
    
    softwareApplication: {
      applicationCategory: 'TranslatorApplication',
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '1.0.0',
      releaseNotes: 'Initial release with multi-language support',
      features: [
        'AI-powered translation',
        'Multiple language support', 
        'Context-aware translation',
        'Real-time translation',
        'Multi-scenario style switching',
        'Custom scene management',
        'Chat history',
        'Theme customization',
      ],
    },
  },
  
  // SEO best practices
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Sitemap configuration
  sitemap: {
    changeFrequency: 'weekly' as const,
    priority: {
      home: 1.0,
      main: 0.8,
      secondary: 0.6,
    },
  },
}; 