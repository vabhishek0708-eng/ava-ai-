import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AvaLogo } from '../icons/logo';
import { User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <AvaLogo className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] space-y-2",
        isUser ? 'items-end' : 'items-start'
      )}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-foreground',
            isUser
              ? 'rounded-br-none bg-primary text-primary-foreground'
              : 'rounded-bl-none bg-muted'
          )}
        >
          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
        </div>
        {message.component && <div>{message.component}</div>}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
