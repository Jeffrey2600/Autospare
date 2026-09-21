"use client";

import { useActionState, useRef } from "react";
import { saveBrandAction, type BrandFormState } from "@/lib/actions/brands";
import { Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: BrandFormState = { error: null };

export function BrandForm() {
  const [state, formAction, pending] = useActionState(saveBrandAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700" htmlFor="name">
          Brand Name
        </label>
        <Input id="name" name="name" required placeholder="e.g. Bosch" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700" htmlFor="logo">
          Logo (optional)
        </label>
        <input id="logo" name="logo" type="file" accept="image/*" className="text-sm" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add Brand"}
      </Button>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
    </form>
  );
}
