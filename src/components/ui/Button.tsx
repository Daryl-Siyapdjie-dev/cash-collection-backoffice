import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ComponentType<{ className?: string; size?: number | string }>;
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', icon: Icon, loading, children, ...props }, ref) => {
    const actualVariant = variant === 'primary' ? 'default' : variant;

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': actualVariant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': actualVariant === 'destructive',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground': actualVariant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': actualVariant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': actualVariant === 'ghost',
            'text-primary underline-offset-4 hover:underline': actualVariant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && Icon && <Icon className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
