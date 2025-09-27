'use client';

import { Utensils, Soup, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvaLogo } from '@/components/icons/logo';

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

export default function WelcomePage() {
  const [icons, setIcons] = useState<{ id: number; style: React.CSSProperties, icon: (props: any) => JSX.Element }[]>([]);

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

  return (
    <main className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden bg-background">
      {icons.map(icon => (
        <FloatingIcon key={icon.id} style={icon.style} icon={icon.icon}/>
      ))}
      <div className="z-10 flex flex-col items-center gap-6 rounded-xl bg-background/50 p-8 text-center shadow-2xl backdrop-blur-md md:p-12">
        <div className="flex flex-col items-center gap-4">
          <AvaLogo className="h-20 w-20 text-primary" />
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent md:text-7xl">
            AVA AI
          </h1>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          Your personal dining assistant. Explore our menu, ask questions, and get recommendations instantly.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-100">
          <Link href="/chat">Start Discovering</Link>
        </Button>
      </div>
    </main>
  );
}
