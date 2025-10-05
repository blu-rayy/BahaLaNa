/**
 * Input Component
 * Reusable input field
 */
import { cn } from '../../utils/cn';

const Input = ({
  label,
  error,
  helperText,
  className,
  type = 'text',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-nasa-body font-bold text-white mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-3 border rounded-xl shadow-sm bg-white/10 backdrop-blur-sm text-white placeholder-white/60 font-nasa-body focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all duration-200 hover:shadow-md',
          error
            ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400'
            : 'border-white/30 hover:border-white/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-400 font-nasa-body font-bold">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-white/70 font-nasa-body">{helperText}</p>}
    </div>
  );
};

export default Input;
