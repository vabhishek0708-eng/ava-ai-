import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MenuCard from './menu-card';
import { menuItems } from '@/lib/menu-data';
import type { MenuItem } from "@/lib/types";

interface MenuCarouselProps {
    onAddToOrder: (item: MenuItem) => void;
    onShowDetails: (item: MenuItem) => void;
}

export default function MenuCarousel({ onAddToOrder, onShowDetails }: MenuCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4 px-4 md:px-6">
        {menuItems.map((item) => (
          <CarouselItem key={item.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 pl-4">
            <MenuCard item={item} onAddToOrder={onAddToOrder} onShowDetails={onShowDetails} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 md:left-4" />
      <CarouselNext className="right-2 md:right-4" />
    </Carousel>
  );
}
