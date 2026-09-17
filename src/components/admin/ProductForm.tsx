"use client";

import { useActionState } from "react";
import { saveProductAction, type ProductFormState } from "@/lib/actions/products";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ProductImageManager, type ExistingImage } from "@/components/admin/ProductImageManager";

const initialState: ProductFormState = { error: null };

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type ProductDefaults = {
  id: string;
  title: string;
  sku: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  vehicleType: string;
  categoryId: string;
  brandId: string | null;
  compatibility: string | null;
  isFeatured: boolean;
  isActive: boolean;
  images: ExistingImage[];
};

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Category[];
  brands: Brand[];
  product?: ProductDefaults;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Photos</h2>
        <ProductImageManager initialImages={product?.images ?? []} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Product Title</Label>
            <Input id="title" name="title" required defaultValue={product?.title} placeholder="e.g. Front Brake Pad Set" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" required defaultValue={product?.sku} placeholder="e.g. BRK-1023" />
          </div>
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select id="vehicleType" name="vehicleType" defaultValue={product?.vehicleType ?? "UNIVERSAL"}>
              <option value="CAR">Car</option>
              <option value="BIKE">Bike</option>
              <option value="UNIVERSAL">Universal</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" required defaultValue={product?.categoryId}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="brandId">Brand (optional)</Label>
            <Select id="brandId" name="brandId" defaultValue={product?.brandId ?? ""}>
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Pricing &amp; Stock</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Selling Price (₹)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price} />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">MRP / Compare-at Price (₹)</Label>
            <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product?.compareAtPrice ?? ""} />
          </div>
          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Description</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shortDescription">Short Description (shown in listings)</Label>
            <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
          </div>
          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea id="description" name="description" rows={5} required defaultValue={product?.description} />
          </div>
          <div>
            <Label htmlFor="compatibility">Compatible Vehicles (optional)</Label>
            <Input
              id="compatibility"
              name="compatibility"
              defaultValue={product?.compatibility ?? ""}
              placeholder="e.g. Honda Activa 3G/4G/5G, Honda Dio"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Visibility</h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="accent-brand-600" />
            Active (visible on storefront)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="accent-brand-600" />
            Featured (shown on homepage)
          </label>
        </div>
      </div>

      {state.error ? <FieldError>{state.error}</FieldError> : null}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving..." : product ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
