import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StructuredData } from "@/components/structured-data";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Import the messages for the current locale
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const appMessages = messages.app;
  
  const baseUrl = 'https://lingualens.blazorserver.com';
  
  // Generate alternate language links for hreflang
  const alternateLanguages: Record<string, string> = {};
  routing.locales.forEach(altLocale => {
    alternateLanguages[altLocale] = `${baseUrl}/${altLocale}`;
  });
  // Add x-default for international targeting
  alternateLanguages['x-default'] = `${baseUrl}/en`;
  return {
    title: appMessages.metaTitle || appMessages.title,
    description: appMessages.metaDescription || appMessages.description,
    keywords: appMessages.keywords ? appMessages.keywords.split(', ') : [],
    authors: [{ name: 'LinguaLens Team' }],
    creator: 'LinguaLens',
    publisher: 'LinguaLens',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternateLanguages,
    },
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
    openGraph: {
      title: appMessages.metaTitle || appMessages.title,
      description: appMessages.metaDescription || appMessages.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'LinguaLens',
      type: 'website',
      locale: locale,
      images: [
        {
          url: '/screen.png',
          width: 1200,
          height: 630,
          alt: `${appMessages.metaTitle || appMessages.title} interface preview`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: appMessages.metaTitle || appMessages.title,
      description: appMessages.metaDescription || appMessages.description,
      images: ['/screen.png'],
      creator: '@LinguaLens',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION,
    },
    category: 'Technology',
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={(await import(`../../messages/${locale}.json`)).default}>
      <StructuredData type="SoftwareApplication" />
      <Header></Header>
      <main
        className="
            pt-20                          
            min-h-[calc(100vh-5rem)]      
            flex justify-center  items-center    
            px-4                         
          "
      >
        {children}
      </main>
      <Footer />
    </NextIntlClientProvider>
  );
}
