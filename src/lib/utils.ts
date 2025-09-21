import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// RTL-aware spacing utilities - use gap instead of space-x for better RTL support
export const rtlSpacing = {
  // Gap utilities (recommended for RTL)
  gap: (size: string, isRTL: boolean) => isRTL ? `rtl-gap-${size}` : `gap-${size}`,
  
  // Margins (fallback)
  ml: (size: string, isRTL: boolean) => isRTL ? `mr-${size}` : `ml-${size}`,
  mr: (size: string, isRTL: boolean) => isRTL ? `ml-${size}` : `mr-${size}`,
  
  // Padding
  pl: (size: string, isRTL: boolean) => isRTL ? `pr-${size}` : `pl-${size}`,
  pr: (size: string, isRTL: boolean) => isRTL ? `pl-${size}` : `pr-${size}`,
  
  // Positioning
  left: (size: string, isRTL: boolean) => isRTL ? `right-${size}` : `left-${size}`,
  right: (size: string, isRTL: boolean) => isRTL ? `left-${size}` : `right-${size}`,
  
  // Flex
  justifyStart: (isRTL: boolean) => isRTL ? 'justify-end' : 'justify-start',
  justifyEnd: (isRTL: boolean) => isRTL ? 'justify-start' : 'justify-end',
  
  // Space utilities for RTL
  spaceX: (size: string, isRTL: boolean) => isRTL ? `rtl-gap-${size}` : `space-x-${size}`,
  spaceY: (size: string, isRTL: boolean) => `space-y-${size}`, // Y spacing is the same in RTL
};

// RTL-aware icon rotation
export const rtlIcon = (isRTL: boolean) => isRTL ? 'rtl-flip' : '';

// RTL-aware text alignment
export const rtlText = {
  left: (isRTL: boolean) => isRTL ? 'text-right' : 'text-left',
  right: (isRTL: boolean) => isRTL ? 'text-left' : 'text-right',