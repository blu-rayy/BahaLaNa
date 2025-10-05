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
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

  const variants = {
    primary: 'text-white hover:opacity-90 focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl border border-white/30',
    secondary: 'backdrop-blur-xl text-white hover:bg-opacity-80 focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl border border-white/30',
    accent: 'text-black hover:opacity-90 focus:ring-2 focus:ring-yellow-500 shadow-lg hover:shadow-xl font-bold',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl border border-white/30',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl border border-white/30',
    outline: 'border-2 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#3b82f6' };
      case 'secondary':
        return { background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' };
      case 'accent':
        return { background: 'linear-gradient(to right, #FFFF00, #FFFF33)' };
      case 'outline':
        return { borderColor: '#0099FF', color: '#0099FF' };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={getButtonStyle()}
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
