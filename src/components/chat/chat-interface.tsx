
'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message, MenuItem, OrderItem } from '@/lib/types';
import { handleCheckoutAction, sendMessageAction, speechToTextAction } from '@/app/chat/actions';
import { menuItems } from '@/lib/menu-data';
import Link from 'next/link';

import ChatMessage from './chat-message';
import ChatInput from './chat-input';
import StarterQuestions from './starter-questions';
import TodaysSpecials from './todays-specials';
import MenuCarousel from '../menu/menu-carousel';
import OrderSheet from './order-sheet';
import { AvaLogo } from '../icons/logo';
import { Button } from '../ui/button';
import { ShoppingCart, Loader2, Utensils, Soup, UtensilsCrossed } from 'lucide-react';
import { Badge } from '../ui/badge';
import DishDetailModal from '../menu/dish-detail-modal';
import type { DishDetails } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';


const initialMessages: Message[] = [
  {
    id: 'init-1',
    role: 'bot',
    content: "Hello! I'm AVA, your personal dining assistant. How can I help you today?",
  },
];

const iconsList = [
    (props: any) => <Utensils {...props} />,
    (props: any) => <Soup {...props} />,
    (props: any) => <UtensilsCrossed {...props} />,
];

function FloatingIcon({ style, icon: Icon }: { style: React.CSSProperties, icon: (props: any) => JSX.Element }) {
  return (
    <div
      className="absolute text-foreground/10"
      style={style}
    >
      <Icon className="h-full w-full" />
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isPending, setIsPending] = useState(false);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [checkoutAttempts, setCheckoutAttempts] = useState(0);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing]  = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [icons, setIcons] = useState<{ id: number; style: React.CSSProperties, icon: (props: any) => JSX.Element }[]>([]);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutModalMessage, setCheckoutModalMessage] = useState('');
  
  const [checkoutOrderState, setCheckoutOrderState] = useState<string>('');


  useEffect(() => {
    const generateIcons = () => {
      if (typeof window !== 'undefined') {
        const newIcons = Array.from({ length: 15 }).map((_, i) => {
          const duration = Math.random() * 5 + 5; // 5 to 10 seconds
          const delay = Math.random() * 5; // 0 to 5 seconds
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const size = Math.random() * 40 + 20; // 20px to 60px
          const Icon = iconsList[Math.floor(Math.random() * iconsList.length)];
          return {
            id: i,
            icon: Icon,
            style: {
              left: `${left}%`,
              top: `${top}%`,
              animation: `float ${duration}s ${delay}s ease-in-out infinite`,
              width: `${size}px`,
              height: `${size}px`,
            },
          };
        });
        setIcons(newIcons);
      }
    };
    generateIcons();
  }, []);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 150;
      if (isScrolledToBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isPending]);

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = handleProcessAudio;
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        const errorMsg: Message = {
            id: Date.now().toString() + 'err',
            role: 'system',
            content: 'Could not access microphone. Please check your browser permissions.',
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleProcessAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsTranscribing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const formData = new FormData();
      formData.append('audio', base64Audio);
      
      const result = await speechToTextAction(formData);
      setIsTranscribing(false);
      
      if (result.transcript) {
        await handleSendMessage(result.transcript);
      } else {
        const errorMsg: Message = {
            id: Date.now().toString() + 'err',
            role: 'system',
            content: result.error || 'Failed to transcribe audio. Please try again.',
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    };
  };

  const handleSendMessage = async (messageContent: string) => {
    if (isPending || !messageContent.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setIsPending(true);

    const formData = new FormData();
    formData.append('message', messageContent);

    const result = await sendMessageAction(formData);

    let botResponse: Message;

    if (result.type === 'menu_carousel') {
      botResponse = {
        id: Date.now().toString() + 'm',
        role: 'bot',
        content: "Here are some of our popular dishes!",
        component: <MenuCarousel onAddToOrder={handleAddToOrder} onShowDetails={setSelectedDish} />
      };
    } else if (result.type === 'text' && result.data) {
      botResponse = {
        id: Date.now().toString() + 't',
        role: 'bot',
        content: result.data,
      };
    } else {
      botResponse = {
        id: Date.now().toString() + 'e',
        role: 'system',
        content: result.data || 'Sorry, something went wrong. Please try again.',
      };
    }

    setMessages(prev => [...prev, botResponse]);
    setIsPending(false);
  };
  
  const handleAddToOrder = (item: MenuItem) => {
    setOrder(prev => {
        const existingItem = prev.find(orderItem => orderItem.id === item.id);
        if (existingItem) {
            return prev.map(orderItem =>
                orderItem.id === item.id
                    ? { ...orderItem, quantity: orderItem.quantity + 1 }
                    : orderItem
            );
        } else {
            return [...prev, { ...item, quantity: 1 }];
        }
    });
    const addedMessage: Message = {
        id: Date.now().toString() + 'order',
        role: 'system',
        content: `${item.name} has been added to your plate.`,
    };
    setMessages(prev => [...prev, addedMessage]);
  };
  
  const handleRemoveFromOrder = (itemId: string) => {
    setOrder(prev => prev.filter((item) => item.id !== itemId));
  };
  
  const handleDecreaseQuantity = (itemId: string) => {
    setOrder(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(orderItem =>
          orderItem.id === itemId
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        );
      } else {
        return prev.filter(orderItem => orderItem.id !== itemId);
      }
    });
  };

  const handleCheckout = async () => {
    const currentOrderState = JSON.stringify(order);
    const attempts = checkoutAttempts + 1;
    setCheckoutAttempts(attempts);

    if (attempts === 1 || currentOrderState !== checkoutOrderState) {
        setCheckoutOrderState(currentOrderState);
        setCheckoutAttempts(1); // Reset attempts if order has changed
        setCheckoutModalMessage('Thank you! We\'ve received your checkout request. A waiter will be with you shortly to finalize your order.');
        setIsCheckoutModalOpen(true);
    } else {
        const formData = new FormData();
        formData.append('attempts', attempts.toString());
        const result = await handleCheckoutAction(formData);
        setCheckoutModalMessage(result.data || 'We have received your request. Due to high demand, a waiter will be with you as soon as possible. We appreciate your patience.');
        setIsCheckoutModalOpen(true);
    }
  };

  return (
    <div className="relative flex h-svh flex-col bg-background overflow-hidden">
        {icons.map(icon => (
            <FloatingIcon key={icon.id} style={icon.style} icon={icon.icon}/>
        ))}
        <div className="z-10 flex h-full flex-col bg-background/50 backdrop-blur-sm">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 px-4 md:px-6">
                <Link href="/" className="flex items-center gap-3">
                    <AvaLogo className="h-8 w-8 text-primary" />
                    <div>
                        <h2 className="font-headline text-xl font-bold text-foreground">AVA AI</h2>
                        <p className="text-xs text-muted-foreground">Your personal culinary guide</p>
                    </div>
                </Link>
                <OrderSheet 
                order={order} 
                onRemoveFromOrder={handleRemoveFromOrder} 
                onCheckout={handleCheckout}
                checkoutDisabled={order.length === 0}
                onIncreaseQuantity={(itemId) => handleAddToOrder(order.find(item => item.id === itemId)!)}
                onDecreaseQuantity={handleDecreaseQuantity}
                />
            </header>

            <main ref={messagesContainerRef} className="flex-1 overflow-y-auto">
                <div className="py-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold mb-2 px-4 md:px-6">Popular Dishes</h3>
                  <MenuCarousel onAddToOrder={handleAddToOrder} onShowDetails={setSelectedDish} />
                </div>
                <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
                {messages.length > 1 && messages.length < 3 &&(
                  <div className="space-y-4">
                    <TodaysSpecials onSpecialSelect={handleSendMessage} />
                  </div>
                )}
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
                {isPending && (
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <AvaLogo className="h-5 w-5 animate-pulse text-muted-foreground" />
                        </div>
                        <div className="rounded-2xl rounded-bl-none bg-muted px-4 py-3 text-foreground">
                           <div className="flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                             <span className="text-sm italic">AVA is thinking...</span>
                           </div>
                        </div>
                    </div>
                )}
                <div />
                </div>
            </main>

            <footer className="sticky bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto max-w-3xl p-4 space-y-2">
                    {messages.length < 3 && <StarterQuestions onQuestionSelect={handleSendMessage} />}
                    <ChatInput 
                        onSubmit={handleSendMessage} 
                        isPending={isPending}
                        isRecording={isRecording}
                        onStartRecording={handleStartRecording}
                        onStopRecording={handleStopRecording}
                        isTranscribing={isTranscribing}
                    />
                </div>
            </footer>
        </div>
        {selectedDish && (
            <DishDetailModal 
                dish={selectedDish} 
                onClose={() => setSelectedDish(null)}
                onAddToOrder={(item) => {
                    handleAddToOrder(item);
                    setSelectedDish(null);
                }}
            />
        )}
        <AlertDialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Checkout Request Received</AlertDialogTitle>
                    <AlertDialogDescription>
                        {checkoutModalMessage}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsCheckoutModalOpen(false)}>Okay</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
