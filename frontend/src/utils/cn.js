/**
 * Utility function for conditional className merging
 * Combines clsx and tailwind-merge for optimal Tailwind class handling
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with proper Tailwind CSS conflict resolution
 * @param  {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
