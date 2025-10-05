/**
 * Card Component
 * Reusable card container
 */
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, subtitle, footer, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

export default Card;
