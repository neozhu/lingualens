import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Define supported languages
const languages = [
  { code: 'zh', name: '简体中文' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'my', name: 'မြန်မာ' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'ja', name: '日本語' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Current language
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];
  // Language switching function
  const switchLanguage = (code: string) => {
    // Use next-intl navigation to keep the same path but switch language
    router.replace(pathname, { locale: code });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={locale === language.code ? 'bg-secondary' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
