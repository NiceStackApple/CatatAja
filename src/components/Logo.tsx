import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  // Determine dimensions based on size prop
  const dimensions = {
    sm: { container: 'w-6 h-6', svg: 'w-4 h-4' },
    md: { container: 'w-8 h-8', svg: 'w-6 h-6' },
    lg: { container: 'w-20 h-20', svg: 'w-16 h-16' }
  }[size];

  return (
    <div 
      className={`
        flex items-center justify-center rounded-2xl
        bg-white border border-neutral-200/80 shadow-xs shrink-0 select-none 
        ${dimensions.container} ${className}
      `}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`${dimensions.svg} text-neutral-900`}
      >
        {/* Left vertical Spine bar (the binder loop/spine of the notebook) */}
        <path 
          d="M7 20 V80" 
          strokeWidth="7" 
          strokeLinecap="round" 
        />
        
        {/* Outer Squircle Cover of the Notebook */}
        <rect 
          x="18" 
          y="10" 
          width="74" 
          height="80" 
          rx="20" 
          ry="20" 
          strokeWidth="7" 
          stroke="currentColor" 
          fill="none" 
        />
        
        {/* Wiggle/Squiggle written line at the bottom */}
        <path 
          d="M36 78 C 45 71, 54 81, 63 74 C 70 69, 76 72, 83 70" 
          strokeWidth="6.5" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Diagonal Pencil body and tip */}
        <path 
          d="M27 79 L34 69 L68 35 C 70 33, 77 40, 75 42 L41 76 Z" 
          strokeWidth="6" 
          strokeLinejoin="round" 
          fill="white"
        />
        
        {/* Cone/collar line of the pencil */}
        <path 
          d="M34 69 L41 76" 
          strokeWidth="4" 
        />
        
        {/* Filled lead tip */}
        <path 
          d="M27 79 L31 74 L33 76 Z" 
          fill="currentColor" 
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
