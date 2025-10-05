/**
 * Card Component
 * Reusable card container
 */
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, subtitle, footer, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-slate-300/80',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-blue-50/80">
          {title && <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-600 mt-1 font-medium">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-t border-slate-200/60">{footer}</div>
      )}
    </div>
  );
};

export default Card;
