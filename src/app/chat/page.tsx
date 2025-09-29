'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/chat/chat-interface';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('from') !== 'welcome') {
      router.replace('/');
    }
  }, [searchParams, router]);

  if (searchParams.get('from') !== 'welcome') {
    return null; // Render nothing while redirecting
  }

  return <ChatInterface />;
}
