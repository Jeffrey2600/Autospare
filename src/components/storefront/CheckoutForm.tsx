"use client";

import { useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { placeOrderAction, type CheckoutFormState } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: CheckoutFormState = { error: null };

type Props = {
  defaultName?: string;
  defaultEmail?: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
};

export function CheckoutForm({ defaultName, defaultEmail, shippingFee, freeShippingThreshold }: Props) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);

  const { subtotal } = cartTotals(items);
  const finalShippingFee = freeShippingThreshold !== null && subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + finalShippingFee;

  const itemsJson = useMemo(
    () => JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity }))),
    [items]
  );

  useEffect(() => {
    if (state.orderNumber) {
      clear();
      router.push(`/order-confirmation/${state.orderNumber}`);
    }
  }, [state.orderNumber, clear, router]);

  if (!hasHydrated) {
    return <div className="py-20" />;
  }

  if (items.length === 0 && !state.orderNumber) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
        Your cart is empty. Add products before checking out.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="items" value={itemsJson} />

        <div>
          <h2 className="mb-3 font-semibold text-slate-900">Contact &amp; Shipping Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input id="customerName" name="customerName" required defaultValue={defaultName} />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" required />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="customerEmail">Email (optional)</Label>
            <Input id="customerEmail" name="customerEmail" type="email" defaultValue={defaultEmail} />
          </div>
          <div className="mt-4">
            <Label htmlFor="shippingLine1">Address Line 1</Label>
            <Input id="shippingLine1" name="shippingLine1" required />
          </div>
          <div className="mt-4">
            <Label htmlFor="shippingLine2">Address Line 2 (optional)</Label>
            <Input id="shippingLine2" name="shippingLine2" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input id="shippingCity" name="shippingCity" required />
            </div>
            <div>
              <Label htmlFor="shippingState">State</Label>
              <Input id="shippingState" name="shippingState" required />
            </div>
            <div>
              <Label htmlFor="shippingPostal">Postal Code</Label>
              <Input id="shippingPostal" name="shippingPostal" required />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-slate-900">Payment Method</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 rounded-md border border-slate-300 p-3 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
              <input type="radio" name="paymentMethod" value="COD" defaultChecked className="accent-brand-600" />
              Cash on Delivery / Pay at Store
            </label>
            <label className="flex items-center gap-2 rounded-md border border-slate-300 p-3 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
              <input type="radio" name="paymentMethod" value="BANK_TRANSFER" className="accent-brand-600" />
              Bank Transfer
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Order Notes (optional)</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Vehicle model, preferred delivery time, etc." />
        </div>

        {state.error ? <FieldError>{state.error}</FieldError> : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Placing Order..." : "Place Order"}
        </Button>
      </form>

      <div className="h-fit rounded-lg border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900">Order Summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="text-slate-600">
                {item.title} × {item.quantity}
              </span>
              <span className="font-medium text-slate-800">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{finalShippingFee === 0 ? "Free" : formatPrice(finalShippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
