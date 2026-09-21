import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 " +
  "shadow-xs transition-[border-color,box-shadow] duration-200 " +
  "placeholder:text-ink-400 " +
  "hover:border-ink-300 " +
  "focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12 " +
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-y", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "cursor-pointer", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-ink-700", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {children}
    </p>
  );
}
