// components/Footer.tsx
"use client";
import React from 'react';
import Image from 'next/image'
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

interface MenuItem {
  title: string;
  links: { text: string; url: string }[];
}

interface FooterProps {
  logo?: { url: string; src: string; alt: string; title: string };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: { text: string; url: string }[];
}

export const Footer: React.FC<FooterProps> = ({
  logo = {
    src: '/github-mark.svg',
    alt: 'LinguaLens Logo',
    title: 'LinguaLens',
    url: '/',
  },
  tagline,
  menuItems,
  copyright,
  bottomLinks,
}: FooterProps) => {
  // 使用 next-intl 的 useTranslations 钩子获取翻译内容
  const t = useTranslations();
  const { theme } = useTheme();
  
  // 根据主题动态设置 logo
  logo.src = theme === 'dark' ? '/github-mark-white.svg' : '/github-mark.svg';
  // 使用翻译内容设置默认值
  tagline = tagline || t('app.description');
  copyright = copyright || `© ${new Date().getFullYear()} LinguaLens. ${t('footer.rights')}`;
  
  // 设置菜单项及其翻译
  menuItems = menuItems || [
    {
      title: t('nav.features'),
      links: [
        { text: t('nav.translation'), url: '/features' },
        { text: t('nav.instructions'), url: '/instructions' },
        { text: t('nav.scenes'), url: '//scene-manage' },
      ],
    },
    {
      title: t('nav.support'),
      links: [
        { text: t('nav.faq'), url: 'https://github.com/neozhu/lingualens/issues/new' },
        { text: t('nav.contact'), url: 'https://github.com/neozhu/lingualens/issues/new' },
      ],
    },
    {
      title: t('nav.about'),
      links: [
        { text: t('nav.privacy'), url: '/privacy' },
        { text: t('nav.terms'), url: '/terms' },
      ],
    },
  ];
  
  // 设置底部链接及其翻译
  bottomLinks = bottomLinks || [
    { text: t('nav.privacy'), url: '/privacy' },
    { text: t('nav.terms'), url: '/terms' },
  ];
  return (
    <footer className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          <div className="col-span-2 mb-8 lg:mb-0">
            <Link href={logo.url} className="flex items-center gap-2">
              <Image src={logo.src} alt={logo.alt} className="h-10" width="40" height="40" />
              <span className="text-xl font-semibold">{logo.title}</span>
            </Link>
            <p className="mt-4 text-muted-foreground">{tagline}</p>
          </div>

          {menuItems.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-4 font-bold">{section.title}</h3>
              <ul className="space-y-2 text-muted-foreground">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx} className="hover:text-primary">
                    <Link href={link.url}>{link.text}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-muted-foreground flex flex-col md:flex-row md:justify-between items-center gap-4">
          <p>{copyright}</p>
          <ul className="flex gap-4">
            {bottomLinks.map((link, idx) => (
              <li key={idx} className="underline hover:text-primary">
                <Link href={link.url}>{link.text}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
