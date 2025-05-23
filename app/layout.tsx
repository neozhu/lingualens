import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider"
import { ActiveThemeProvider } from "@/components/active-theme"
import { cookies } from "next/headers";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "LinguaLens 翻译助手",
  description: "LinguaLens 智能双向翻译助手，支持多场景风格切换",
  keywords: ['LinguaLens', '翻译', 'AI 翻译', '多场景翻译'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'LinguaLens 翻译助手',
    description: 'LinguaLens 智能双向翻译助手，支持多场景风格切换',
    url: 'https://lingualens.blazorserver.com',
    siteName: 'LinguaLens',
    type: 'website',
    images: [
      {
        url: '/screen.png',
        width: 1200,
        height: 630,
        alt: 'LinguaLens 翻译助手界面预览',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinguaLens 翻译助手',
    description: '智能双向翻译助手，支持多场景风格切换',
    images: ['/screen.png'],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const activeThemeValue = cookieStore.get("active_theme")?.value
  const isScaled = activeThemeValue?.endsWith("-scaled")
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable}`,
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
          fontVariables
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
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
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
            <Toaster />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
