import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2 } from "lucide-react";
import type { OrderItem } from "@/lib/types";

interface OrderSheetProps {
  order: OrderItem[];
  onRemoveFromOrder: (itemId: string) => void;
  onCheckout: () => void;
  checkoutDisabled: boolean;
}

export default function OrderSheet({ order, onRemoveFromOrder, onCheckout, checkoutDisabled }: OrderSheetProps) {
  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5 flex-shrink-0" />
          {order.length > 0 && (
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0">
              {order.reduce((total, item) => total + item.quantity, 0)}
            </Badge>
          )}
          <span className="sr-only">View your plate</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Plate</SheetTitle>
          <SheetDescription>
            Review the items you've added. Ready to order?
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1">
        {order.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {order.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
                    <p className="text-sm text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveFromOrder(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Your plate is empty.</p>
          </div>
        )}
        </div>
        <SheetFooter className="mt-auto border-t pt-4">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <SheetClose asChild>
              <Button 
                onClick={onCheckout}
                disabled={checkoutDisabled}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                Request Checkout
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
