import React from 'react';
import { PageType } from '../types';

interface PageIconProps {
  type: PageType;
  className?: string;
  size?: number | string;
}

/**
 * Renders beautiful, clean Google Fonts Symbol/Icon SVGs instead of standard emojis.
 * Designs follow Google Material Symbols outlines perfectly.
 */
export default function PageIcon({ type, className = 'w-5 h-5', size }: PageIconProps) {
  const style = size ? { width: size, height: size } : undefined;

  switch (type) {
    case 'tracker':
      // checklist icon from Google Material Symbols
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M222-200 80-342l56-56 85 85 170-170 56 57-225 226Zm0-320L80-662l56-56 85 85 170-170 56 57-225 226Zm298 240v-80h360v80H520Zm0-320v-80h360v80H520Z" />
        </svg>
      );

    case 'calendar':
      // calendar_month icon from Google Material Symbols
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" />
        </svg>
      );

    case 'analytics':
      // bar_chart icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M120-120v-320h160v320H120Zm280 0v-720h160v720H400Zm280 0v-480h160v480H680Z" />
        </svg>
      );

    case 'database':
      // folder icon from Google Material Symbols
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z" />
        </svg>
      );

    case 'blank':
      // dashboard_customize / auto_awesome icon from Google Material Symbols
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M160-120v-320h240v320H160Zm400 0v-240h240v240H560Zm-400-400v-240h240v240H160Zm400 0v-320h240v320H560Z" />
        </svg>
      );

    case 'recap':
      return (
        <span
          className={`material-symbols-outlined shrink-0 select-none ${className}`}
          style={{
            ...style,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: className.includes('w-8') || className.includes('w-10') ? '36px' : className.includes('w-3.5') ? '14px' : '20px',
            lineHeight: 1,
          }}
        >
          fast_rewind
        </span>
      );

    case 'telegram':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );

    case 'notes':
    default:
      // description / note outline icon from Google Material Symbols
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
          className={className}
          style={style}
        >
          <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
        </svg>
      );
  }
}

/**
 * Returns beautiful solid Tailwind CSS background configurations for each page type indicator.
 */
export function getPageIconAccentColor(type: PageType): string {
  switch (type) {
    case 'tracker':
      return 'text-[#0D7A5E] bg-[#E7F3EF] border-[#0D7A5E]/15';
    case 'calendar':
      return 'text-[#2383E2] bg-[#E5F2FF] border-[#2383E2]/15';
    case 'analytics':
      return 'text-[#6931E3] bg-[#F2EBFF] border-[#6931E3]/15';
    case 'database':
      return 'text-[#D97706] bg-[#FFFBEB] border-[#D97706]/15';
    case 'blank':
      return 'text-[#EC4899] bg-[#FDF2F8] border-[#EC4899]/15';
    case 'recap':
      return 'text-[#10B981] bg-[#ECFDF5] border-[#10B981]/15';
    case 'telegram':
      return 'text-[#0284C7] bg-[#F0F9FF] border-[#0284C7]/15';
    case 'notes':
    default:
      return 'text-[#4F4F4F] bg-[#F1F1F0] border-[#4F4F4F]/15';
  }
}
