"use client";

import { Button } from "@/components/ui/button";
import { Clapperboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from '@/i18n/navigation';
import { ModeToggle } from "./mode-toggle";
import { ThemeSelector } from "./theme-selector";
import { LanguageSwitcher } from "./language-switcher";
import { ChatHistory } from "./chat-history";
import { useTheme } from 'next-themes';
import Image from 'next/image'
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Header = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const githubUrl = 'https://github.com/neozhu/lingualens';
    const t = useTranslations();
    
    useEffect(() => {
        setIsMounted(true); // Set isMounted to true once the component is mounted on the client-side
    }, []);

    if (!isMounted) return null;
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row grid-cols-2 items-center px-4 sm:px-8 lg:px-16 py-4">
                <div className="justify-start items-center gap-4  flex  flex-row">                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={resolvedTheme === 'dark' ? '/logo_dark.png' : '/logo.png'}
                            alt="LinguaLens Logo"
                            className="w-10 h-10"
                            width={40}
                            height={40}
                        />
                        <span className="sm:grid hidden text-xl font-semibold motion motion-duration-500 motion-translate-x-in-[50%] motion-translate-y-in-[0%] motion-preset-blur-right" >{t('app.title')}</span>
                    </Link>
                </div>
                <div className="flex justify-end items-center w-full gap-2">
                    <LanguageSwitcher />
                    <ThemeSelector />
                    
                    <ChatHistory />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" asChild>
                                <Link
                                    href="/scene-manage"
                                    aria-label={t('sceneSelector.customScene')}
                                >
                                    <Clapperboard className="w-5 h-5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltip.sceneManage')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div><ModeToggle /></div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltip.toggleMode')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" asChild>
                                <Link
                                    href={githubUrl}
                                    target="_blank"
                                    aria-label="GitHub"
                                >
                                    <Image
                                        src={
                                            resolvedTheme === 'dark'
                                                ? '/github-mark-white.svg'
                                                : '/github-mark.svg'
                                        }
                                        alt="GitHub"
                                        className="w-5 h-5"
                                        width="40" height="40"
                                    />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltip.github')}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};