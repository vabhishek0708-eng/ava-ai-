import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { MenuItem } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
  onShowDetails: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAddToOrder, onShowDetails }: MenuCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === item.imageId);
  
  return (
    <Card 
      className="flex h-full flex-col overflow-hidden transition-transform hover:scale-105 cursor-pointer bg-card/60 backdrop-blur-sm" 
      onClick={() => onShowDetails(item)}
    >
      <CardHeader className="relative h-32 w-full p-0">
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={placeholder.imageHint}
          />
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4 pb-2">
        <CardTitle className="mb-1 text-lg">{item.name}</CardTitle>
        <CardDescription className="text-xs h-10 line-clamp-2">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-2">
        <p className="font-semibold text-base">${item.price.toFixed(2)}</p>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToOrder(item);
          }} 
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground" 
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to plate
        </Button>
      </CardFooter>
    </Card>
  );
}
