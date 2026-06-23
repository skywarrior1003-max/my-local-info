'use client';

import React from 'react';

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export default function SafeImage({ src, alt, className, ...props }: SafeImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || 'Image'}
      className={className || "rounded-xl object-cover"}
      {...props}
      onError={(e) => {
        // Fallback to a beautiful SVG placeholder in case of load failure
        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='100%25' height='100%25' fill='%23fee2e2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='20' fill='%23f87171'%3EImage Temporary Unavailable%3C/text%3E%3C/svg%3E";
        e.currentTarget.onerror = null; // Prevent infinite loop
      }}
    />
  );
}
