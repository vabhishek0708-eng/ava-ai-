'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Mic, Square } from 'lucide-react';

type ChatInputProps = {
  onSubmit: (message: string) => void;
  isPending: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isTranscribing: boolean;
};

export default function ChatInput({ 
  onSubmit, 
  isPending, 
  isRecording, 
  onStartRecording, 
  onStopRecording,
  isTranscribing,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isPending || isRecording) return;
    onSubmit(message);
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isProcessing = isPending || isTranscribing;

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      {isRecording ? (
        <>
          <div className="flex-1 flex items-center justify-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            Listening... <Mic className="h-4 w-4 ml-2 animate-pulse" />
          </div>
          <Button type="button" size="icon" onClick={onStopRecording} variant="destructive">
            <Square className="h-5 w-5 flex-shrink-0" />
            <span className="sr-only">Stop recording</span>
          </Button>
        </>
      ) : (
        <>
          <div className="relative flex-1">
            <Textarea
              placeholder="You can ask me about menu items."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="flex-1 resize-none pr-12"
              rows={1}
            />
            <Button 
              type="button" 
              size="icon" 
              variant="ghost"
              onClick={onStartRecording} 
              disabled={isProcessing}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="sr-only">Start recording</span>
            </Button>
          </div>
          <Button type="submit" size="icon" disabled={isProcessing || !message.trim()}>
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 flex-shrink-0" />}
            <span className="sr-only">Send message</span>
          </Button>
        </>
      )}
    </form>
  );
}
