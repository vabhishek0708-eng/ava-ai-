
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/chat/chat-interface';
import { Loader2 } from 'lucide-react';

function ChatPageContent() {
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

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-svh w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>}>
      <ChatPageContent />
    </Suspense>
  );
}
