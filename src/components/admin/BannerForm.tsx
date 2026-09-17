"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { saveBannerAction, type BannerFormState } from "@/lib/actions/banners";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: BannerFormState = { error: null };

type BannerDefaults = {
  id: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  position: number;
  isActive: boolean;
  image: string;
};

export function BannerForm({ banner }: { banner?: BannerDefaults }) {
  const [state, formAction, pending] = useActionState(saveBannerAction, initialState);
  const [preview, setPreview] = useState<string | null>(banner?.image ?? null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}

      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" name="title" defaultValue={banner?.title ?? ""} />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle (optional)</Label>
        <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} />
      </div>
      <div>
        <Label htmlFor="linkUrl">Link URL (optional)</Label>
        <Input id="linkUrl" name="linkUrl" placeholder="/products?category=brakes" defaultValue={banner?.linkUrl ?? ""} />
      </div>
      <div>
        <Label htmlFor="position">Sort Order</Label>
        <Input id="position" name="position" type="number" defaultValue={banner?.position ?? 0} className="max-w-32" />
      </div>
      <div>
        <Label htmlFor="image">Banner Image {banner ? "(leave empty to keep current)" : ""}</Label>
        {preview ? (
          <div className="relative mb-2 h-32 w-full max-w-md overflow-hidden rounded-md border border-slate-200">
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
        <input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} className="accent-brand-600" />
        Active
      </label>

      {state.error ? <FieldError>{state.error}</FieldError> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : banner ? "Save Changes" : "Add Banner"}
      </Button>
    </form>
  );
}
