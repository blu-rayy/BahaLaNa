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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-3 border rounded-xl shadow-sm bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 hover:shadow-md',
          error
            ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-slate-600">{helperText}</p>}
    </div>
  );
};

export default Input;
