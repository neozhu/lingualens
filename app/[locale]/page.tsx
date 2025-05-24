'use client';

import ChatDemo from "@/components/chat-demo";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
 
  return (
    <div className="w-full max-w-[80ch] mb-4">
      <ChatDemo />
    </div>
  );
}
