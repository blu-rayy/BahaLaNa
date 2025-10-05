/**
 * Card Component
 * Reusable card container
 */
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, subtitle, footer, ...props }) => {
  return (
    <div
      className={cn(
        'bg-nasa-gradient-subtle backdrop-blur-sm rounded-2xl shadow-lg border border-nasa-electric-blue/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-nasa-electric-blue/50',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-nasa-electric-blue/30 bg-nasa-deep-blue/50">
          {title && <h3 className="text-lg font-nasa-heading font-bold text-white flex items-center gap-2">{title}</h3>}
          {subtitle && <p className="text-sm text-nasa-light-gray mt-1 font-nasa-body font-bold">{subtitle}</p>}
        </div>
      )}
      <div className="p-6 text-white">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-nasa-deep-blue/50 border-t border-nasa-electric-blue/30 text-white">{footer}</div>
      )}
    </div>
  );
};

export default Card;
