"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useState } from "react";
import { saveSettingsAction, type SettingsFormState } from "@/lib/actions/settings";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: SettingsFormState = { error: null };

type Settings = {
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  address: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  shippingFee: number;
  freeShippingThreshold: number | null;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);
  const [preview, setPreview] = useState<string | null>(settings.logoUrl);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Store Identity</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input id="storeName" name="storeName" required defaultValue={settings.storeName} />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} />
          </div>
          <div>
            <Label htmlFor="logo">Logo</Label>
            {preview ? (
              <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-md border border-slate-200 bg-white">
                <Image src={preview} alt="Logo preview" fill className="object-contain p-1" />
              </div>
            ) : null}
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Contact Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={settings.phone} />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="+91XXXXXXXXXX" defaultValue={settings.whatsapp ?? ""} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={settings.email} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" name="address" rows={2} defaultValue={settings.address} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Social Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Shipping</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shippingFee">Flat Shipping Fee (₹)</Label>
            <Input id="shippingFee" name="shippingFee" type="number" step="0.01" min="0" defaultValue={settings.shippingFee} />
          </div>
          <div>
            <Label htmlFor="freeShippingThreshold">Free Shipping Above (₹, optional)</Label>
            <Input
              id="freeShippingThreshold"
              name="freeShippingThreshold"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings.freeShippingThreshold ?? ""}
            />
          </div>
        </div>
      </div>

      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? <p className="text-sm text-green-600">Settings saved.</p> : null}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
