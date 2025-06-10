import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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

  return {
    title: appMessages.metaTitle || appMessages.title,
    description: appMessages.metaDescription || appMessages.description,
    keywords: appMessages.keywords ? appMessages.keywords.split(', ') : [],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: appMessages.metaTitle || appMessages.title,
      description: appMessages.metaDescription || appMessages.description,
      url: 'https://lingualens.blazorserver.com',
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
    }
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
