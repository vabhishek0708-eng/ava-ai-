'use client';

import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { todaysSpecials } from '@/lib/specials-data';

type TodaysSpecialsProps = {
  onSpecialSelect: (question: string) => void;
};

export default function TodaysSpecials({ onSpecialSelect }: TodaysSpecialsProps) {
  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="mb-4 flex w-max items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Today's Specials:</p>
            {todaysSpecials.map((special) => (
            <Button
              key={special}
              variant="outline"
              size="sm"
              onClick={() => onSpecialSelect(`Tell me more about the ${special}`)}
              className="rounded-full"
            >
              {special}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
