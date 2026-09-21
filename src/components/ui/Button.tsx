import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight " +
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "active:scale-[0.97] cursor-pointer select-none " +
  "disabled:opacity-45 disabled:pointer-events-none disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-500 hover:shadow-glow",
  secondary: "bg-ink-900 text-white shadow-sm hover:bg-ink-800 hover:shadow-md",
  outline: "border border-ink-200 bg-white text-ink-900 shadow-xs hover:border-ink-300 hover:shadow-sm",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-500 hover:shadow-md",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
  xl: "h-14 px-8 text-base",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string
) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
