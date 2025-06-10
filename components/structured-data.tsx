import { useLocale, useTranslations } from 'next-intl';

interface StructuredDataProps {
  type?: 'WebSite' | 'Organization' | 'SoftwareApplication';
}

export function StructuredData({ type = 'WebSite' }: StructuredDataProps) {
  const locale = useLocale();
  const t = useTranslations('app');
  
  const baseUrl = 'https://lingualens.blazorserver.com';
  
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: t('metaTitle'),
      description: t('metaDescription'),
      url: `${baseUrl}/${locale}`,
      image: `${baseUrl}/screen.png`,
      inLanguage: locale,
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          '@type': 'WebSite',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/${locale}?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          },
          sameAs: [
            'https://github.com/your-repo/lingualens', // 更新为实际的GitHub链接
          ]
        };
        
      case 'SoftwareApplication':
        return {
          ...baseData,
          '@type': 'SoftwareApplication',
          applicationCategory: 'TranslatorApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          featureList: [
            'AI-powered translation',
            'Multiple language support',
            'Context-aware translation',
            'Real-time translation',
            'Multi-scenario style switching'
          ]
        };
        
      case 'Organization':
        return {
          ...baseData,
          '@type': 'Organization',
          logo: `${baseUrl}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: `${baseUrl}/${locale}/contact`
          }
        };
        
      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
} 