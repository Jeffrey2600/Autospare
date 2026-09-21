"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useState } from "react";
import { saveCategoryAction, type CategoryFormState } from "@/lib/actions/categories";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: CategoryFormState = { error: null };

type CategoryOption = { id: string; name: string };

type CategoryDefaults = {
  id: string;
  name: string;
  description: string | null;
  vehicleType: string;
  parentId: string | null;
  position: number;
  isActive: boolean;
  image: string | null;
};

export function CategoryForm({
  parentOptions,
  category,
}: {
  parentOptions: CategoryOption[];
  category?: CategoryDefaults;
}) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);
  const [preview, setPreview] = useState<string | null>(category?.image ?? null);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 p-5">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" required defaultValue={category?.name} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="vehicleType">Applies To</Label>
          <Select id="vehicleType" name="vehicleType" defaultValue={category?.vehicleType ?? "UNIVERSAL"}>
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
            <option value="UNIVERSAL">Both / Universal</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="parentId">Parent Category (optional)</Label>
          <Select id="parentId" name="parentId" defaultValue={category?.parentId ?? ""}>
            <option value="">None (top-level)</option>
            {parentOptions
              .filter((p) => p.id !== category?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ""} />
      </div>

      <div>
        <Label htmlFor="position">Sort Order</Label>
        <Input id="position" name="position" type="number" defaultValue={category?.position ?? 0} className="max-w-32" />
      </div>

      <div>
        <Label htmlFor="image">Category Image (optional)</Label>
        {preview ? (
          <div className="relative mb-2 h-20 w-20 overflow-hidden rounded-md border border-ink-200">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
        ) : null}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={category?.isActive ?? true} className="accent-brand-600" />
        Active (visible on storefront)
      </label>

      {state.error ? <FieldError>{state.error}</FieldError> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : category ? "Save Changes" : "Create Category"}
      </Button>
    </form>
  );
}
