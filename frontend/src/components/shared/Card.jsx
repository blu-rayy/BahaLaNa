/**
 * Card Component
 * Reusable card container
 */
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, subtitle, footer, ...props }) => {
  return (
    <div
      className={cn(
        'backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-white/40',
        className
      )}
      style={{ background: 'linear-gradient(135deg, rgba(0, 30, 60, 0.95) 0%, rgba(0, 51, 102, 0.8) 100%)' }}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-white/30 bg-white/10">
          {title && <h3 className="text-lg font-nasa-heading font-bold text-white flex items-center gap-2">{title}</h3>}
          {subtitle && <p className="text-sm text-white/80 mt-1 font-nasa-body font-medium">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-white/10 border-t border-white/30">{footer}</div>
      )}
    </div>
  );
};

export default Card;
