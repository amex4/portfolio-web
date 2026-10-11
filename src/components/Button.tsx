import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg hover:brightness-110 shadow-[0_0_0_1px_rgb(255_178_36/0.4),0_8px_24px_-8px_rgb(255_178_36/0.5)]',
  ghost: 'border border-line-strong text-fg hover:bg-surface-strong hover:border-fg-subtle',
};

/** Anchor styled as a button: all CTAs here navigate, so they stay real links. */
export function ButtonLink({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[filter,background-color,border-color,transform] duration-200 active:scale-[0.98] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </a>
  );
}
