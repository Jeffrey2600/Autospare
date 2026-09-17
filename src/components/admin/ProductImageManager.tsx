"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, ArrowLeft, ArrowRight } from "lucide-react";

export type ExistingImage = { id: string; url: string; altText: string | null };

export function ProductImageManager({ initialImages }: { initialImages: ExistingImage[] }) {
  const [existing, setExisting] = useState(initialImages);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function syncInputFiles(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const merged = [...newFiles, ...Array.from(fileList)];
    setNewFiles(merged);
    syncInputFiles(merged);
  }

  function removeNewFile(index: number) {
    const merged = newFiles.filter((_, i) => i !== index);
    setNewFiles(merged);
    syncInputFiles(merged);
  }

  function removeExisting(id: string) {
    setExisting((prev) => prev.filter((img) => img.id !== id));
    setRemovedIds((prev) => [...prev, id]);
  }

  function moveExisting(index: number, direction: -1 | 1) {
    setExisting((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name="removedImageIds" value={JSON.stringify(removedIds)} />
      <input type="hidden" name="imageOrder" value={JSON.stringify(existing.map((img) => img.id))} />
      <input
        ref={fileInputRef}
        type="file"
        name="newImages"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <div className="flex flex-wrap gap-3">
        {existing.map((img, index) => (
          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-white">
            <Image src={img.url} alt={img.altText ?? "Product image"} fill className="object-contain p-1" />
            <button
              type="button"
              onClick={() => removeExisting(img.id)}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-600"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-white/90 py-0.5">
              <button type="button" disabled={index === 0} onClick={() => moveExisting(index, -1)} className="disabled:opacity-30">
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button type="button" disabled={index === existing.length - 1} onClick={() => moveExisting(index, 1)} className="disabled:opacity-30">
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {newFiles.map((file, index) => (
          <NewFilePreview key={`${file.name}-${index}`} file={file} onRemove={() => removeNewFile(index)} />
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-600"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs">Add Photos</span>
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">JPG, PNG or WEBP. Up to 5MB per image.</p>
    </div>
  );
}

function NewFilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));

  return (
    <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-brand-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className="h-full w-full object-contain p-1" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-600"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
      <span className="absolute inset-x-0 bottom-0 truncate bg-brand-600/90 px-1 text-center text-[10px] text-white">New</span>
    </div>
  );
}
