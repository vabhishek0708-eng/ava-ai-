'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { MenuItem, DishDetails } from '@/lib/types';
import { getDishDetailsAction } from '@/app/chat/actions';
import { Loader2, PlusCircle, X } from 'lucide-react';

interface DishDetailModalProps {
  dish: MenuItem;
  onClose: () => void;
  onAddToOrder: (item: MenuItem) => void;
}

export default function DishDetailModal({ dish, onClose, onAddToOrder }: DishDetailModalProps) {
  const [details, setDetails] = useState<DishDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const placeholder = PlaceHolderImages.find(p => p.id === dish.imageId);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', dish.name);
      formData.append('description', dish.description);
      const result = await getDishDetailsAction(formData);
      if (result.details) {
        setDetails(result.details);
      } else {
        // Handle error case by providing mock data
        console.error(result.error);
        setDetails({
            ingredients: ['Fresh, high-quality ingredients', 'Secret house blend of spices', 'Love'],
            cookingProcess: [`Expertly prepared by our chefs to bring out the best flavors in our ${dish.name}.`, 'Cooked to perfection and served fresh.'],
        });
      }
      setLoading(false);
    };
    fetchDetails();
  }, [dish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl rounded-xl bg-card/60 backdrop-blur-sm text-card-foreground shadow-2xl m-4">
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute right-3 top-3 z-10">
          <X className="flex-shrink-0" />
        </Button>

        <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-[200px] rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
            {placeholder && (
                <Image
                    src={placeholder.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover"
                />
            )}
            </div>
            <div className="p-6 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">{dish.name}</h2>
                <p className="text-muted-foreground mb-4">{dish.description}</p>
                
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin"/>
                    </div>
                ): details ? (
                    <div className="flex-1 space-y-4 text-sm overflow-y-auto max-h-[40vh]">
                        <div>
                            <h3 className="font-semibold mb-1">Ingredients</h3>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {details.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Cooking Process</h3>
                            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                                {details.cookingProcess.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    </div>
                ) : (
                    <p className="text-destructive">Could not load details.</p>
                )}
                
                <div className="mt-6 flex items-center justify-between">
                    <p className="font-semibold text-xl">${dish.price.toFixed(2)}</p>
                    <Button onClick={() => onAddToOrder(dish)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0"/>
                        Add to plate
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
