/**
 * Button Component
 * Reusable button with variants
 */
import { cn } from '../../utils/cn';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-nasa-body font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

  const variants = {
    primary: 'bg-nasa-electric-blue hover:bg-nasa-light-blue text-white focus:ring-nasa-electric-blue shadow-lg hover:shadow-xl border border-nasa-electric-blue/50',
    secondary: 'bg-nasa-deep-blue hover:bg-nasa-electric-blue text-white focus:ring-nasa-deep-blue shadow-md hover:shadow-lg border border-nasa-electric-blue/30',
    danger: 'bg-nasa-rocket-red hover:bg-nasa-rocket-red/80 text-white focus:ring-nasa-rocket-red shadow-lg hover:shadow-xl border border-nasa-rocket-red/50',
    success: 'bg-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-nasa-electric-blue text-nasa-electric-blue hover:bg-nasa-electric-blue/10 hover:border-nasa-light-blue focus:ring-nasa-electric-blue backdrop-blur-sm',
    accent: 'bg-nasa-neon-yellow hover:bg-nasa-neon-yellow/90 text-black font-black focus:ring-nasa-neon-yellow shadow-lg hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
